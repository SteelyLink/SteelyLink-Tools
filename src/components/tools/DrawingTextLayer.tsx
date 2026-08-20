'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Editable text layer for the drawing canvas.
 *
 * Text used to be baked straight into the bitmap with fillText, which made it
 * impossible to re-edit, recolour, move or delete afterwards — and put the edit
 * box on a different coordinate origin than the committed glyphs, so text jumped
 * on commit. Here text lives as objects rendered in DOM above the canvas: it
 * stays editable forever, and being vector DOM it is crisp at any canvas scale.
 *
 * Editing goes through a real contentEditable rather than a hand-rolled caret
 * because the site serves Chinese and Japanese users and IME composition has to
 * keep working.
 */

export const CANVAS_W = 800;
export const CANVAS_H = 500;

/** A stretch of characters sharing one colour. Several runs = one line, many colours. */
export interface TextRun {
  text: string;
  color: string;
}

export interface TextItem {
  id: string;
  /** Canvas-space coordinates of the text box's top-left corner. */
  x: number;
  y: number;
  runs: TextRun[];
  fontSize: number;
  fontFamily: string;
}

/**
 * Zero-width space. Parked inside a freshly coloured span so the browser keeps a
 * caret there; without a character the span collapses and typing escapes it.
 * Stripped again on serialise so it never reaches the exported image.
 */
const ZWSP = '​';

let idCounter = 0;
export function newTextItem(x: number, y: number, fontSize: number, fontFamily: string): TextItem {
  idCounter += 1;
  return { id: `t${idCounter}`, x, y, runs: [], fontSize, fontFamily };
}

export function itemPlainText(item: TextItem): string {
  return item.runs.map((r) => r.text).join('');
}

// ─── runs ⇄ DOM ───────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function runsToHtml(runs: TextRun[]): string {
  return runs
    .map((r) => `<span data-c="${escapeHtml(r.color)}" style="color:${escapeHtml(r.color)}">${escapeHtml(r.text)}</span>`)
    .join('');
}

/** Nearest ancestor carrying an explicit colour, so nested spans resolve correctly. */
function colorOf(node: Node, fallback: string): string {
  let el: HTMLElement | null = node.parentElement;
  while (el) {
    const c = el.dataset?.c;
    if (c) return c;
    el = el.parentElement;
  }
  return fallback;
}

/** Walks the editor DOM back into runs, merging neighbours that share a colour. */
export function serializeEditor(root: HTMLElement, fallbackColor: string): TextRun[] {
  const runs: TextRun[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = (node.textContent ?? '').split(ZWSP).join('');
    if (!text) continue;
    const color = colorOf(node, fallbackColor);
    const last = runs[runs.length - 1];
    if (last && last.color === color) last.text += text;
    else runs.push({ text, color });
  }
  return runs;
}

/**
 * Recolours the current selection. Nested colours inside the selection are
 * stripped first, otherwise their inline style would out-specify the new wrapper.
 * Returns false when there is nothing selected, so the caller can fall back to
 * arming the colour for subsequently typed characters instead.
 */
export function applyColorToSelection(root: HTMLElement, color: string): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  if (range.collapsed || !root.contains(range.commonAncestorContainer)) return false;

  // The picker fires change continuously while it is dragged, and each pass lands
  // on the selection the previous one left behind. When that selection is exactly
  // one coloured span, recolour it in place — otherwise every tick would wrap it
  // in yet another span.
  const anchor = range.commonAncestorContainer;
  const host = (anchor.nodeType === Node.ELEMENT_NODE ? anchor : anchor.parentNode) as HTMLElement | null;
  if (host && host !== root && host.dataset?.c) {
    const whole = document.createRange();
    whole.selectNodeContents(host);
    if (
      range.compareBoundaryPoints(Range.START_TO_START, whole) === 0 &&
      range.compareBoundaryPoints(Range.END_TO_END, whole) === 0
    ) {
      host.dataset.c = color;
      host.style.color = color;
      host.querySelectorAll<HTMLElement>('[data-c]').forEach((el) => {
        el.removeAttribute('data-c');
        el.style.removeProperty('color');
      });
      return true;
    }
  }

  const frag = range.extractContents();
  frag.querySelectorAll<HTMLElement>('[data-c]').forEach((el) => {
    el.removeAttribute('data-c');
    el.style.removeProperty('color');
  });

  const span = document.createElement('span');
  span.dataset.c = color;
  span.style.color = color;
  span.appendChild(frag);
  range.insertNode(span);

  sel.removeAllRanges();
  const after = document.createRange();
  after.selectNodeContents(span);
  sel.addRange(after);
  return true;
}

/**
 * Opens a new coloured span at a collapsed caret so the *next* characters take
 * the colour while everything already typed keeps its own.
 */
export function startColorAtCaret(root: HTMLElement, color: string): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return;

  // Dragging through the OS colour picker fires change over and over. Recolour the
  // span already opened here rather than nesting a fresh one on every tick.
  const host = range.startContainer.nodeType === Node.TEXT_NODE
    ? range.startContainer.parentElement
    : (range.startContainer as HTMLElement);
  if (host && host !== root && host.dataset?.c && host.textContent === ZWSP) {
    host.dataset.c = color;
    host.style.color = color;
    return;
  }

  const span = document.createElement('span');
  span.dataset.c = color;
  span.style.color = color;
  span.textContent = ZWSP;
  range.deleteContents();
  range.insertNode(span);

  const caret = document.createRange();
  caret.setStart(span.firstChild!, 1);
  caret.collapse(true);
  sel.removeAllRanges();
  sel.addRange(caret);
}

/**
 * Last selection seen inside the editor. Touching a colour swatch in the toolbar
 * blurs the contentEditable and the live selection goes with it, so we keep our
 * own copy and put it back before recolouring.
 */
let savedRange: Range | null = null;

function trackSelection(root: HTMLElement): () => void {
  const onChange = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (root.contains(range.commonAncestorContainer)) savedRange = range.cloneRange();
  };
  document.addEventListener('selectionchange', onChange);
  return () => {
    document.removeEventListener('selectionchange', onChange);
    savedRange = null;
  };
}

/**
 * Applies a colour to the open editor: to the selected characters if there are
 * any, otherwise to whatever gets typed next — which is what lets one line carry
 * several colours without disturbing the characters already there.
 */
export function applyColorToEditor(root: HTMLElement, color: string): void {
  root.focus();
  const sel = window.getSelection();
  if (savedRange && root.contains(savedRange.commonAncestorContainer)) {
    sel?.removeAllRanges();
    sel?.addRange(savedRange);
  }
  if (!applyColorToSelection(root, color)) startColorAtCaret(root, color);
  const after = window.getSelection();
  if (after && after.rangeCount) savedRange = after.getRangeAt(0).cloneRange();
}

// ─── Export rendering ─────────────────────────────────────────────────────────

/**
 * Paints the text objects onto an export canvas at `scale`. Text is re-rendered
 * vectorially rather than upscaled from the bitmap, which is what keeps exported
 * type sharp.
 */
export async function drawTextItems(
  ctx: CanvasRenderingContext2D,
  items: TextItem[],
  scale: number,
): Promise<void> {
  ctx.textBaseline = 'top';
  ctx.globalCompositeOperation = 'source-over';
  for (const item of items) {
    if (!item.runs.length) continue;
    const font = `${item.fontSize * scale}px "${item.fontFamily}", sans-serif`;
    // Without this the first export after a font switch paints the fallback face.
    try { await document.fonts.load(font); } catch { /* fallback is acceptable */ }
    ctx.font = font;
    let penX = item.x * scale;
    const y = item.y * scale;
    for (const run of item.runs) {
      ctx.fillStyle = run.color;
      ctx.fillText(run.text, penX, y);
      penX += ctx.measureText(run.text).width;
    }
  }
}

// ─── Scale tracking ───────────────────────────────────────────────────────────

/**
 * Ratio between the canvas's on-screen width and its 800px backing store. The
 * DOM text has to scale by the same factor or it would drift out of proportion
 * with the strokes underneath.
 */
export function useCanvasScale(ref: React.RefObject<HTMLCanvasElement | null>): number {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setScale(w / CANVAS_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return scale;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TextItemViewProps {
  item: TextItem;
  scale: number;
  isEditing: boolean;
  isSelected: boolean;
  interactive: boolean;
  fallbackColor: string;
  onStartEdit: (id: string) => void;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onMoveEnd: () => void;
  onCommit: (id: string, runs: TextRun[]) => void;
  registerEditor: (el: HTMLDivElement | null) => void;
}

function TextItemView({
  item, scale, isEditing, isSelected, interactive, fallbackColor,
  onStartEdit, onSelect, onMove, onMoveEnd, onCommit, registerEditor,
}: TextItemViewProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number; startY: number;
    origX: number; origY: number;
    moved: boolean; allowed: boolean;
    timer: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  // Read once when editing opens (see the effect below), never during a render.
  const fallbackColorRef = useRef(fallbackColor);
  useEffect(() => { fallbackColorRef.current = fallbackColor; }, [fallbackColor]);

  /**
   * Seeds the editor and hands its DOM to the browser for the rest of the session.
   *
   * The content must NOT go through dangerouslySetInnerHTML: React 19 diffs that
   * prop by object identity, and `{__html: …}` is a fresh literal on every render,
   * so React re-ran setInnerHTML on every re-render. Picking a colour calls
   * setTextColor first, which re-renders — and the editor was reset to its opening
   * HTML, discarding text typed since and dropping the caret back to the start.
   */
  useEffect(() => {
    if (!isEditing) return;
    const el = elRef.current;
    if (!el) return;
    el.innerHTML = runsToHtml(item.runs);
    registerEditor(el);
    // Tracking starts before the caret is placed, so even a colour picked without
    // typing anything first has a saved range to come back to.
    const stopTracking = trackSelection(el);
    el.focus();
    // Caret to the end so typing continues rather than prepends.
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
    // A fresh box has no span to type into, so open one at the current colour.
    // Without it the first characters are bare text nodes that take whatever the
    // colour picker holds at commit time — retro-colouring text already typed.
    if (!item.runs.length) startColorAtCaret(el, fallbackColorRef.current);
    return () => { stopTracking(); registerEditor(null); };
    // runs and the colour are deliberately read only at open: re-running this
    // would reset the DOM out from under the caret mid-typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, registerEditor]);

  const commit = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    onCommit(item.id, serializeEditor(el, fallbackColor));
  }, [item.id, fallbackColor, onCommit]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditing) return; // let the browser place the caret
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const touch = e.pointerType === 'touch';
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      origX: item.x, origY: item.y,
      moved: false,
      allowed: !touch, // a mouse drags immediately; touch waits for a long press
      timer: touch
        ? setTimeout(() => { if (dragRef.current) dragRef.current.allowed = true; }, 300)
        : null,
    };
    onSelect(item.id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > 4) {
      if (!d.allowed) {
        // Touch moved before the long press landed — treat it as a scroll, not a drag.
        if (d.timer) clearTimeout(d.timer);
        dragRef.current = null;
        return;
      }
      d.moved = true;
    }
    if (!d.moved) return;
    e.preventDefault();
    onMove(item.id, d.origX + dx / scale, d.origY + dy / scale);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.timer) clearTimeout(d.timer);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (d.moved) onMoveEnd();
    else onStartEdit(item.id);
  };

  const style: React.CSSProperties = {
    left: `${(item.x / CANVAS_W) * 100}%`,
    top: `${(item.y / CANVAS_H) * 100}%`,
    fontSize: `${item.fontSize * scale}px`,
    fontFamily: `"${item.fontFamily}", sans-serif`,
    lineHeight: 1,
    padding: 0,
    margin: 0,
    whiteSpace: 'pre',
    touchAction: 'none',
    color: fallbackColor,
    // The layer wrapper stays click-through so the canvas keeps receiving strokes;
    // only the glyph boxes themselves opt back in, and only for the text tool.
    pointerEvents: interactive ? 'auto' : 'none',
  };

  if (isEditing) {
    return (
      <div
        ref={elRef}
        contentEditable
        suppressContentEditableWarning
        // No children and no dangerouslySetInnerHTML on purpose — the effect above
        // owns this element's content. React must never touch it again.
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          else if (e.key === 'Escape') { e.preventDefault(); commit(); }
          e.stopPropagation();
        }}
        // Deliberately no onBlur commit: reaching for the colour swatch blurs the
        // editor, and committing there would close it before the colour applied.
        // The canvas, a tool switch and Enter/Escape all end editing instead.
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute origin-top-left outline-none ring-1 ring-indigo-500 ring-offset-0 min-w-[1ch]"
        // An empty block has no line box, so a brand-new box would collapse to zero
        // height and hide its own caret until the first character lands.
        style={{ ...style, minHeight: '1em' }}
      />
    );
  }

  return (
    <div
      ref={elRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute origin-top-left cursor-move select-none ${
        isSelected ? 'ring-1 ring-indigo-500' : ''
      }`}
      style={style}
    >
      {item.runs.map((run, i) => (
        <span key={i} style={{ color: run.color }}>{run.text}</span>
      ))}
    </div>
  );
}

export interface DrawingTextLayerProps {
  items: TextItem[];
  scale: number;
  /** Only the text tool may interact; otherwise clicks fall through to the canvas. */
  interactive: boolean;
  editingId: string | null;
  selectedId: string | null;
  fallbackColor: string;
  onStartEdit: (id: string) => void;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onMoveEnd: () => void;
  onCommit: (id: string, runs: TextRun[]) => void;
  onDelete: (id: string) => void;
  registerEditor: (el: HTMLDivElement | null) => void;
  deleteLabel: string;
}

export function DrawingTextLayer({
  items, scale, interactive, editingId, selectedId, fallbackColor,
  onStartEdit, onSelect, onMove, onMoveEnd, onCommit, onDelete, registerEditor, deleteLabel,
}: DrawingTextLayerProps) {
  const selected = items.find((i) => i.id === selectedId) ?? null;

  // Delete/Backspace removes the selected item, but not while it is being edited —
  // there those keys belong to the text.
  useEffect(() => {
    if (!selectedId || editingId) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete(selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, editingId, onDelete]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {items.map((item) => (
        <TextItemView
          key={item.id}
          item={item}
          scale={scale}
          isEditing={editingId === item.id}
          isSelected={selectedId === item.id && editingId !== item.id}
          interactive={interactive}
          fallbackColor={fallbackColor}
          onStartEdit={onStartEdit}
          onSelect={onSelect}
          onMove={onMove}
          onMoveEnd={onMoveEnd}
          onCommit={onCommit}
          registerEditor={registerEditor}
        />
      ))}

      {interactive && selected && !editingId && (
        <div
          className="absolute z-10 flex items-center gap-1 -translate-y-full pointer-events-auto"
          style={{
            left: `${(selected.x / CANVAS_W) * 100}%`,
            top: `${(selected.y / CANVAS_H) * 100}%`,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onDelete(selected.id)}
            title={deleteLabel}
            aria-label={deleteLabel}
            className="flex items-center justify-center w-7 h-7 mb-1 rounded-lg bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-red-400 hover:border-red-500 transition-colors"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

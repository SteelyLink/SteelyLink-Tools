'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'notepad-content-html';
const DEBOUNCE_MS = 500;

// Fonts organized by group; optgroup renders them in the select dropdown
const FONT_GROUPS = [
  {
    group: 'General',
    fonts: [
      { label: 'Default',         value: '' },
      { label: 'Arial',           value: 'Arial' },
      { label: 'Arial Black',     value: 'Arial Black' },
      { label: 'Comic Sans MS',   value: 'Comic Sans MS' },
      { label: 'Courier New',     value: 'Courier New' },
      { label: 'Garamond',        value: 'Garamond' },
      { label: 'Georgia',         value: 'Georgia' },
      { label: 'Helvetica Neue',  value: 'Helvetica Neue' },
      { label: 'Impact',          value: 'Impact' },
      { label: 'Palatino',        value: 'Palatino Linotype' },
      { label: 'Tahoma',          value: 'Tahoma' },
      { label: 'Times New Roman', value: 'Times New Roman' },
      { label: 'Trebuchet MS',    value: 'Trebuchet MS' },
      { label: 'Verdana',         value: 'Verdana' },
    ],
  },
  {
    group: '中文字体',
    fonts: [
      { label: '微软雅黑',  value: 'Microsoft YaHei' },
      { label: '苹方-简',   value: 'PingFang SC' },
      { label: '黑体',      value: 'SimHei' },
      { label: '宋体',      value: 'SimSun' },
      { label: '楷体',      value: 'KaiTi' },
      { label: '仿宋',      value: 'FangSong' },
      { label: '思源黑体',  value: 'Noto Sans SC' },
      { label: '思源宋体',  value: 'Noto Serif SC' },
    ],
  },
];

const FONT_SIZES = ['10', '11', '12', '13', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64', '72'];

function ToolbarBtn({
  icon, title, active, onClick,
}: {
  icon: string; title: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded transition-colors flex-shrink-0 ${
        active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-slate-700 mx-0.5 flex-shrink-0 self-center" />;
}

export function NotepadCore() {
  const t = useTranslations('Tool');
  const editorRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [fontFamily, setFontFamily] = useState('');
  const [fontSize, setFontSize] = useState('16');
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!editorRef.current) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        editorRef.current.innerHTML = stored;
        updateCounts(editorRef.current.innerText);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreen) setFullscreen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [fullscreen]);

  const updateCounts = (text: string) => {
    const trimmed = text.trim();
    setCharCount(text.length);
    setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
  };

  const save = useCallback((html: string, text: string) => {
    setSaving(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, html); } catch { /* ignore */ }
      finally { setSaving(false); }
    }, DEBOUNCE_MS);
    updateCounts(text);
  }, []);

  const updateActiveFormats = () => {
    try {
      const formats = new Set<string>();
      if (document.queryCommandState('bold')) formats.add('bold');
      if (document.queryCommandState('italic')) formats.add('italic');
      if (document.queryCommandState('underline')) formats.add('underline');
      if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough');
      if (document.queryCommandState('justifyLeft')) formats.add('justifyLeft');
      if (document.queryCommandState('justifyCenter')) formats.add('justifyCenter');
      if (document.queryCommandState('justifyRight')) formats.add('justifyRight');
      if (document.queryCommandState('justifyFull')) formats.add('justifyFull');
      if (document.queryCommandState('insertUnorderedList')) formats.add('insertUnorderedList');
      if (document.queryCommandState('insertOrderedList')) formats.add('insertOrderedList');
      setActiveFormats(formats);
    } catch { /* ignore */ }
  };

  // Ensure a cursor position exists inside the editor before executing commands.
  // Do NOT call focus() when selection is already inside the editor — it collapses multi-line selections.
  const ensureSelectionInEditor = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      return; // selection already valid inside editor, don't touch it
    }
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const exec = useCallback((cmd: string, value?: string) => {
    ensureSelectionInEditor();
    document.execCommand(cmd, false, value ?? undefined);
    updateActiveFormats();
    const editor = editorRef.current;
    if (editor) save(editor.innerHTML, editor.innerText);
  }, [save]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save current selection before color picker opens (it steals browser focus).
  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const applyColor = (cmd: string, value: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(savedRangeRef.current); }
    }
    document.execCommand(cmd, false, value);
    if (editor) save(editor.innerHTML, editor.innerText);
  };

  const applyFontFamily = (val: string) => {
    setFontFamily(val);
    if (val) exec('fontName', val);
  };

  const applyFontSize = (val: string) => {
    setFontSize(val);
    ensureSelectionInEditor();
    document.execCommand('fontSize', false, '7');
    editorRef.current?.querySelectorAll('font[size="7"]').forEach((el) => {
      (el as HTMLElement).removeAttribute('size');
      (el as HTMLElement).style.fontSize = `${val}px`;
    });
    const editor = editorRef.current;
    if (editor) save(editor.innerHTML, editor.innerText);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    save(editorRef.current.innerHTML, editorRef.current.innerText);
    updateActiveFormats();
  };

  const newDocument = () => {
    if (!editorRef.current) return;
    if (editorRef.current.innerText.trim()) { setConfirmNew(true); return; }
    doNewDocument();
  };

  const doNewDocument = () => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = '';
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    updateCounts('');
    setConfirmNew(false);
  };

  const openFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      // Convert plain text to HTML that preserves all whitespace.
      // Each line → <div>; runs of spaces → (n-1) &nbsp; + 1 regular space so word-wrap still works;
      // tabs → 4 &nbsp;; empty lines → <div><br></div> (contenteditable empty-line convention).
      const html = text.split('\n').map(line => {
        const escaped = line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
          .replace(/ {2,}/g, m => '&nbsp;'.repeat(m.length - 1) + ' ');
        return `<div>${escaped || '<br>'}</div>`;
      }).join('');
      editorRef.current!.innerHTML = html;
      save(editorRef.current!.innerHTML, text);
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  // Print using current page with a temporary overlay — avoids "about:blank" in browser header.
  const printDoc = () => {
    const content = editorRef.current?.innerHTML ?? '';
    const OVERLAY_ID = '__np_print_overlay__';
    const STYLE_ID  = '__np_print_style__';

    document.getElementById(OVERLAY_ID)?.remove();
    document.getElementById(STYLE_ID)?.remove();

    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = content;
    document.body.appendChild(overlay);

    const style = document.createElement('style');
    style.id = STYLE_ID;
    // @page must be a top-level rule (cannot be nested in @media print).
    // margin: 0 eliminates the browser-generated headers/footers (date, title, URL, page number)
    // which Chrome renders inside the page margin area.
    style.textContent = `
      @media print {
        html, body { margin: 0 !important; padding: 0 !important; }
        body > *:not(#${OVERLAY_ID}) { display: none !important; }
        #${OVERLAY_ID} {
          display: block !important;
          position: absolute;
          top: 0; left: 0; right: 0;
          padding: 0 1.5cm 1.5cm;
          box-sizing: border-box;
          font-size: 12pt;
          color: #000 !important;
          background: #fff !important;
        }
        #${OVERLAY_ID} ul { list-style-type: disc;    padding-left: 2em; }
        #${OVERLAY_ID} ol { list-style-type: decimal; padding-left: 2em; }
      }
      @page { margin: 0; }
    `;
    document.head.appendChild(style);

    window.print();

    setTimeout(() => {
      document.getElementById(OVERLAY_ID)?.remove();
      document.getElementById(STYLE_ID)?.remove();
    }, 1500);
  };

  const exportTxt = () => {
    const text = editorRef.current?.innerText ?? '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'notepad.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    const text = editorRef.current?.innerText ?? '';
    if (!text.trim()) return;
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fz = 11, lh = fz * 1.4, mx = 50, my = 50, pw = 595, ph = 842, maxW = pw - mx * 2;
    const lines: string[] = [];
    for (const line of text.split('\n')) {
      if (!line.trim()) { lines.push(''); continue; }
      let cur = '';
      for (const word of line.split(/\s+/)) {
        const test = cur ? `${cur} ${word}` : word;
        if (font.widthOfTextAtSize(test, fz) <= maxW) { cur = test; }
        else { if (cur) lines.push(cur); cur = word; }
      }
      if (cur) lines.push(cur);
    }
    let page = doc.addPage([pw, ph]); let y = ph - my;
    for (const line of lines) {
      if (y < my + lh) { page = doc.addPage([pw, ph]); y = ph - my; }
      if (line) page.drawText(line, { x: mx, y, font, size: fz, color: rgb(0.1, 0.1, 0.1) });
      y -= lh;
    }
    const bytes = await doc.save();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'notepad.pdf'; a.click();
    URL.revokeObjectURL(url);
  };

  const wrapperCls = fullscreen
    ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col'
    : 'border border-slate-700 rounded-xl overflow-hidden flex flex-col';

  const tbCls = 'bg-slate-900 border-b border-slate-700 px-2 py-1 flex items-center gap-0.5 flex-wrap';

  return (
    <div className={wrapperCls}>

      {/* Hidden file input for open-file */}
      <input ref={fileInputRef} type="file" accept=".txt,text/plain" className="hidden" onChange={openFile} />

      {/* ── Row 1: file · undo · font ── */}
      <div className={tbCls}>
        <ToolbarBtn icon="draft"          title={t('notepadNew')}       onClick={newDocument} />
        <ToolbarBtn icon="folder_open"    title={t('notepadOpen')}      onClick={() => fileInputRef.current?.click()} />
        <ToolbarBtn icon="print"          title={t('notepadPrint')}     onClick={printDoc} />
        <ToolbarBtn icon="download"       title={t('notepadExportTxt')} onClick={exportTxt} />
        <ToolbarBtn icon="picture_as_pdf" title={t('notepadExportPdf')} onClick={exportPdf} />
        <ToolbarDivider />
        <ToolbarBtn icon="undo" title={t('notepadUndo')} onClick={() => exec('undo')} />
        <ToolbarBtn icon="redo" title={t('notepadRedo')} onClick={() => exec('redo')} />
        <ToolbarDivider />

        {/* Font family with optgroup */}
        <select
          value={fontFamily}
          onChange={(e) => applyFontFamily(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 bg-slate-800 border border-slate-700 rounded text-slate-300 text-xs px-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-shrink-0 max-w-[145px]"
        >
          {FONT_GROUPS.map(group => (
            <optgroup key={group.group} label={group.group}>
              {group.fonts.map(f => (
                <option key={f.value || '__default'} value={f.value}>{f.label}</option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Font size */}
        <select
          value={fontSize}
          onChange={(e) => applyFontSize(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 bg-slate-800 border border-slate-700 rounded text-slate-300 text-xs px-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-shrink-0 w-[62px] ml-1"
        >
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
        </select>
        <ToolbarDivider />

        {/* Text color */}
        <label
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer text-slate-300 hover:bg-slate-700 relative flex-shrink-0"
          title={t('notepadTextColor')}
          onMouseDown={saveRange}
        >
          <span className="material-symbols-outlined pointer-events-none" style={{ fontSize: '18px' }}>format_color_text</span>
          <input type="color" defaultValue="#f8fafc"
            onChange={(e) => applyColor('foreColor', e.target.value)}
            className="absolute opacity-0 w-full h-full cursor-pointer" />
        </label>

        {/* Highlight */}
        <label
          className="w-8 h-8 flex items-center justify-center rounded cursor-pointer text-slate-300 hover:bg-slate-700 relative flex-shrink-0"
          title={t('notepadHighlight')}
          onMouseDown={saveRange}
        >
          <span className="material-symbols-outlined pointer-events-none" style={{ fontSize: '18px' }}>format_color_fill</span>
          <input type="color" defaultValue="#fde047"
            onChange={(e) => applyColor('backColor', e.target.value)}
            className="absolute opacity-0 w-full h-full cursor-pointer" />
        </label>

        <div className="ml-auto">
          <ToolbarBtn
            icon={fullscreen ? 'fullscreen_exit' : 'fullscreen'}
            title={fullscreen ? t('notepadExitFullscreen') : t('notepadFullscreen')}
            onClick={() => setFullscreen(v => !v)}
          />
        </div>
      </div>

      {/* ── Row 2: formatting ── */}
      <div className={tbCls}>
        <ToolbarBtn icon="format_bold"       title={t('notepadBold')}       active={activeFormats.has('bold')}               onClick={() => exec('bold')} />
        <ToolbarBtn icon="format_italic"     title={t('notepadItalic')}     active={activeFormats.has('italic')}             onClick={() => exec('italic')} />
        <ToolbarBtn icon="format_underlined" title={t('notepadUnderline')}  active={activeFormats.has('underline')}          onClick={() => exec('underline')} />
        <ToolbarBtn icon="strikethrough_s"   title={t('notepadStrike')}     active={activeFormats.has('strikeThrough')}      onClick={() => exec('strikeThrough')} />
        <ToolbarDivider />
        <ToolbarBtn icon="format_align_left"    title={t('notepadAlignLeft')}    active={activeFormats.has('justifyLeft')}    onClick={() => exec('justifyLeft')} />
        <ToolbarBtn icon="format_align_center"  title={t('notepadAlignCenter')}  active={activeFormats.has('justifyCenter')}  onClick={() => exec('justifyCenter')} />
        <ToolbarBtn icon="format_align_right"   title={t('notepadAlignRight')}   active={activeFormats.has('justifyRight')}   onClick={() => exec('justifyRight')} />
        <ToolbarBtn icon="format_align_justify" title={t('notepadAlignJustify')} active={activeFormats.has('justifyFull')}    onClick={() => exec('justifyFull')} />
        <ToolbarDivider />
        <ToolbarBtn icon="format_list_bulleted"   title={t('notepadBulletList')} active={activeFormats.has('insertUnorderedList')} onClick={() => exec('insertUnorderedList')} />
        <ToolbarBtn icon="format_list_numbered"   title={t('notepadNumberList')} active={activeFormats.has('insertOrderedList')}   onClick={() => exec('insertOrderedList')} />
        <ToolbarBtn icon="format_indent_increase" title={t('notepadIndent')}     onClick={() => exec('indent')} />
        <ToolbarBtn icon="format_indent_decrease" title={t('notepadOutdent')}    onClick={() => exec('outdent')} />
        <ToolbarDivider />
        <ToolbarBtn icon="horizontal_rule" title={t('notepadHRule')}       onClick={() => exec('insertHorizontalRule')} />
        <ToolbarBtn icon="format_clear"    title={t('notepadClearFormat')} onClick={() => exec('removeFormat')} />
      </div>

      {/* ── Editor ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onSelect={updateActiveFormats}
        data-placeholder={t('notepadPlaceholder')}
        className={`outline-none px-6 py-4 text-slate-100 leading-relaxed overflow-y-auto bg-slate-950 ${
          fullscreen ? 'flex-1' : 'min-h-[420px]'
        }`}
        style={{ caretColor: '#818cf8' }}
      />

      {/* ── Status bar ── */}
      <div className="bg-slate-900 border-t border-slate-700 px-4 py-1.5 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
        <span className="flex items-center gap-3">
          <span>{wordCount} {t('notepadWordCount')}</span>
          <span>{charCount} {t('notepadCharCount')}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">{saving ? 'sync' : 'cloud_done'}</span>
          {saving ? t('notepadSaving') : t('notepadSaved')}
        </span>
      </div>

      {confirmNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-5">
              <span className="material-symbols-outlined text-amber-400 mt-0.5">warning</span>
              <div>
                <p className="text-slate-100 font-semibold text-sm mb-1">SteelyLink Tools</p>
                <p className="text-slate-400 text-sm">{t('notepadConfirmNew')}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmNew(false)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
                {t('notepadCancel')}
              </button>
              <button onClick={doNewDocument}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
                {t('notepadConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable][data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #475569;
          pointer-events: none;
        }
        [contenteditable] ul { list-style-type: disc;    padding-left: 1.5em; }
        [contenteditable] ol { list-style-type: decimal; padding-left: 1.5em; }
        [contenteditable] li { display: list-item; }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { downloadBlob } from '@/lib/tools/image-processor';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import { ImageToPDFCore } from '@/components/tools/ImageToPDFCore';
import type { PdfMode } from '@/types/tools';

function clipboardWrite(text: string): Promise<void> {
  const cb = navigator.clipboard as Clipboard | undefined;
  if (cb?.writeText) return cb.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

interface Props {
  mode: PdfMode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FilePill({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg">
      <span className="material-symbols-outlined text-red-400 text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
      <span className="text-slate-200 text-sm truncate max-w-[160px]">{file.name}</span>
      <button onClick={onRemove} className="text-slate-500 hover:text-red-400 transition-colors ml-auto flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function Spinner() {
  return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;
}

function DropZone({ onFile, accept = '.pdf,application/pdf', label, sublabel }: {
  onFile: (f: File) => void;
  accept?: string;
  label?: string;
  sublabel?: string;
}) {
  const t = useTranslations('Tool');
  const resolvedLabel = label ?? t('uploadPdfFiles');
  const resolvedSublabel = sublabel ?? t('maxFileSize', { size: 50 });
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="drop-zone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      <span className="material-symbols-outlined text-slate-600 text-4xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
      <p className="text-slate-300 font-medium mb-1">{resolvedLabel}</p>
      <p className="text-slate-500 text-sm">{resolvedSublabel}</p>
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-xl flex items-center gap-2">
      <span className="material-symbols-outlined text-base">check_circle</span>
      {message}
    </p>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{message}</p>
  );
}

function FileHeader({ file, pageCount, onRemove }: { file: File; pageCount?: number; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
        <div>
          <p className="text-slate-200 text-sm font-medium">{file.name}</p>
          <p className="text-slate-500 text-xs">
            {(file.size / 1024).toFixed(1)} KB{pageCount ? ` · ${pageCount} pages` : ''}
          </p>
        </div>
      </div>
      <button onClick={onRemove} className="text-slate-500 hover:text-slate-300">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

// pdfjs-dist is itself a webpack bundle. Importing it via the normal webpack
// path causes "Object.defineProperty called on non-object" because webpack
// overwrites the module's internal __webpack_exports__ variable. Loading it
// from /public via new Function bypasses webpack entirely.
// eslint-disable-next-line no-new-func
const _dynamicImport = new Function('u', 'return import(u)') as (u: string) => Promise<any>;

async function renderPDFThumbnails(file: File, scale = 0.25): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsLib: any = await _dynamicImport('/pdfjs/pdf.min.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const thumbs: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: canvas.getContext('2d') as any, viewport }).promise;
    thumbs.push(canvas.toDataURL('image/jpeg', 0.78));
    canvas.width = 0;
  }
  return thumbs;
}

async function compressPDFToBlob(
  file: File,
  level: 'low' | 'medium' | 'high',
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const cfgs = { low: { scale: 0.85, q: 0.45 }, medium: { scale: 1.3, q: 0.72 }, high: { scale: 1.8, q: 0.88 } };
  const { scale, q } = cfgs[level];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsLib: any = await _dynamicImport('/pdfjs/pdf.min.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const { PDFDocument } = await import('pdf-lib');
  const out = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(i, pdf.numPages);
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: canvas.getContext('2d') as any, viewport: vp }).promise;
    const b64 = canvas.toDataURL('image/jpeg', q).split(',')[1];
    canvas.width = 0;
    const jpg = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const img = await out.embedJpg(jpg);
    const pg = out.addPage([vp.width, vp.height]);
    pg.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
  }
  const bytes = await out.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

interface MergeEntry { file: File; pageCount: number; thumbnail: string; thumbnails: string[]; loading: boolean; }
interface PageThumb  { fileIdx: number; pageIdx: number; thumbnail: string; }
const PDF_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6'];

// ─── PDF Merger ───────────────────────────────────────────────────────────────

function PDFMerger() {
  const t = useTranslations('Tool');
  const [entries, setEntries]           = useState<MergeEntry[]>([]);
  const [allPages, setAllPages]         = useState<PageThumb[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [processing, setProcessing]     = useState(false);
  const [error, setError]               = useState('');
  const [done, setDone]                 = useState(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);
  const advGridRef = useRef<HTMLDivElement>(null);
  const dragIdx       = useRef<number|null>(null);
  const advDragIdx    = useRef<number|null>(null);
  const dropIdxRef    = useRef<number|null>(null);
  const advDropIdxRef = useRef<number|null>(null);
  const [dropIdx,    setDropIdx]    = useState<number|null>(null);
  const [advDropIdx, setAdvDropIdx] = useState<number|null>(null);

  const buildPages = (ents: MergeEntry[]): PageThumb[] =>
    ents.flatMap((e, fi) => e.thumbnails.map((thumb, pi) => ({ fileIdx: fi, pageIdx: pi, thumbnail: thumb })));

  const addFiles = async (fl: FileList | null) => {
    if (!fl) return;
    const pdfs = Array.from(fl).filter(f => f.type === 'application/pdf');
    if (!pdfs.length) return;
    const startIdx = entries.length;
    setEntries(prev => [...prev, ...pdfs.map(f => ({ file: f, pageCount: 0, thumbnail: '', thumbnails: [], loading: true }))]);
    setDone(false); setLoadingPages(true);
    for (let i = 0; i < pdfs.length; i++) {
      try {
        const thumbs = await renderPDFThumbnails(pdfs[i], 0.22);
        setEntries(prev => {
          const next = [...prev];
          if (next[startIdx + i]) next[startIdx + i] = { file: pdfs[i], pageCount: thumbs.length, thumbnail: thumbs[0] || '', thumbnails: thumbs, loading: false };
          setAllPages(buildPages(next));
          return next;
        });
      } catch {
        setEntries(prev => { const next = [...prev]; if (next[startIdx + i]) next[startIdx + i] = { ...next[startIdx + i], loading: false }; return next; });
      }
    }
    setLoadingPages(false);
  };

  const removeEntry = (i: number) => {
    setEntries(prev => {
      const next = prev.filter((_, j) => j !== i);
      setAllPages(buildPages(next));
      return next;
    });
    setDone(false);
  };

  const handleMerge = async () => {
    if (!checkRateLimit('pdf-merge', 5, 60000)) { setError('Too many requests. Please wait a minute.'); return; }
    setProcessing(true); setError('');
    try {
      if (allPages.length > 0) {
        const { mergePDFsFromPages } = await import('@/lib/tools/pdf-processor');
        const buffers = await Promise.all(entries.map(e => e.file.arrayBuffer()));
        const blob = await mergePDFsFromPages(buffers, allPages.map(p => ({ fileIdx: p.fileIdx, pageIdx: p.pageIdx })));
        downloadBlob(blob, 'merged.pdf');
      } else {
        const { mergePDFs } = await import('@/lib/tools/pdf-processor');
        const blob = await mergePDFs(entries.map(e => e.file));
        downloadBlob(blob, 'merged.pdf');
      }
      setDone(true);
    } catch (e) { setError((e as Error).message || 'Merge failed.'); }
    finally { setProcessing(false); }
  };

  // File list drag-to-reorder — rebuilds page grid to match new file order
  const onFilePD = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    dragIdx.current = i;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onFilePM = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragIdx.current === null || !listRef.current) return;
    const rows = listRef.current.querySelectorAll<HTMLElement>('[data-rowindex]');
    let drop = rows.length;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) { drop = i; break; }
    }
    dropIdxRef.current = drop;
    setDropIdx(drop);
  };
  const onFilePU = () => {
    const latestDrop = dropIdxRef.current;
    if (dragIdx.current !== null && latestDrop !== null && dragIdx.current !== latestDrop) {
      const from = dragIdx.current;
      const to = latestDrop > from ? latestDrop - 1 : latestDrop;
      setEntries(prev => {
        const a = [...prev];
        const [item] = a.splice(from, 1);
        a.splice(to, 0, item);
        setAllPages(buildPages(a));
        return a;
      });
    }
    dragIdx.current = null; dropIdxRef.current = null; setDropIdx(null);
  };

  // Page grid drag-to-reorder
  const onAdvPD = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    advDragIdx.current = i;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onAdvPM = (e: React.PointerEvent<HTMLDivElement>) => {
    if (advDragIdx.current === null || !advGridRef.current) return;
    const pages = advGridRef.current.querySelectorAll<HTMLElement>('[data-pageindex]');
    let drop = pages.length;
    for (let i = 0; i < pages.length; i++) {
      const r = pages[i].getBoundingClientRect();
      if (e.clientY < r.top) { drop = i; break; }
      if (e.clientY <= r.bottom && e.clientX < r.left + r.width / 2) { drop = i; break; }
    }
    advDropIdxRef.current = drop;
    setAdvDropIdx(drop);
  };
  const onAdvPU = () => {
    const latestDrop = advDropIdxRef.current;
    if (advDragIdx.current !== null && latestDrop !== null && advDragIdx.current !== latestDrop) {
      const from = advDragIdx.current;
      const to = latestDrop > from ? latestDrop - 1 : latestDrop;
      setAllPages(prev => {
        const a = [...prev];
        const [item] = a.splice(from, 1);
        a.splice(to, 0, item);
        return a;
      });
    }
    advDragIdx.current = null; advDropIdxRef.current = null; setAdvDropIdx(null);
  };

  const anyLoading = entries.some(e => e.loading);
  const totalPageCount = allPages.length || entries.reduce((s, e) => s + e.pageCount, 0);

  return (
    <div className="space-y-5">
      <div className="drop-zone" onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept="application/pdf" multiple className="hidden"
          onChange={e => addFiles(e.target.files)} />
        <span className="material-symbols-outlined text-slate-600 text-4xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
        <p className="text-slate-300 font-medium mb-1">{entries.length > 0 ? t('addMorePdfs') : t('uploadPdfFiles')}</p>
        <p className="text-slate-500 text-sm">{t('dragDropMultiplePdf')}</p>
      </div>

      {entries.length > 0 && (
        <>
          {/* File list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{entries.length} file{entries.length !== 1 ? 's' : ''} · {t('dragToReorder')}</p>
              <button onClick={() => { setEntries([]); setAllPages([]); setDone(false); }} className="text-slate-500 text-xs hover:text-slate-300 transition-colors">{t('removeAll')}</button>
            </div>
            <div ref={listRef} className="space-y-1">
              {entries.map((entry, i) => (
                <div key={`${entry.file.name}-${i}`}>
                  {dropIdx === i && <div className="h-0.5 bg-indigo-500 rounded-full mb-1" />}
                  <div data-rowindex={i}
                    onPointerDown={e => onFilePD(e, i)}
                    onPointerMove={onFilePM}
                    onPointerUp={onFilePU}
                    onDragStart={e => e.preventDefault()}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all select-none cursor-grab ${
                      dragIdx.current === i ? 'opacity-40 scale-95' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}>
                    <div className="w-8 h-11 flex-shrink-0 bg-slate-800 rounded overflow-hidden flex items-center justify-center border border-slate-700">
                      {entry.loading ? <Spinner /> :
                       entry.thumbnail ? <img src={entry.thumbnail} draggable={false} alt="" className="w-full h-full object-contain" loading="lazy" decoding="async" /> :
                       <span className="material-symbols-outlined text-slate-600 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>}
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PDF_COLORS[i % PDF_COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm truncate">{entry.file.name}</p>
                      <p className="text-slate-500 text-xs">{formatBytes(entry.file.size)}{entry.pageCount > 0 ? ` · ${entry.pageCount} page${entry.pageCount !== 1 ? 's' : ''}` : entry.loading ? ' · loading…' : ''}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-600 text-base flex-shrink-0">drag_indicator</span>
                    <button onClick={ev => { ev.stopPropagation(); removeEntry(i); }} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 p-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {dropIdx === entries.length && <div className="h-0.5 bg-indigo-500 rounded-full mt-1" />}
            </div>
          </div>

          {/* Page arrangement grid — always shown once thumbnails load */}
          {(allPages.length > 0 || loadingPages) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-200 text-sm font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-indigo-400 text-[18px]">grid_view</span>
                  {loadingPages ? t('loadingPreviews') : t('arrangePages')}
                </p>
                <div className="flex items-center gap-3">
                  {entries.map((e, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-slate-500">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PDF_COLORS[i % PDF_COLORS.length] }} />
                      <span className="truncate max-w-[72px]">{e.file.name.replace(/\.pdf$/i, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
              {loadingPages ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center bg-slate-950 border border-slate-800 rounded-xl">
                  <Spinner /> {t('loadingPreviews')}
                </div>
              ) : (
                <div ref={advGridRef}
                  className="flex flex-wrap gap-2.5 p-3 bg-slate-950 border border-slate-800 rounded-xl min-h-[100px]">
                  {allPages.map((pg, i) => (
                    <div key={i} className="relative flex-shrink-0 flex items-stretch">
                      {advDropIdx === i && <div className="absolute -left-1.5 inset-y-0 w-0.5 bg-indigo-400 rounded z-10" />}
                      <div data-pageindex={i}
                        onPointerDown={e => onAdvPD(e, i)}
                        onPointerMove={onAdvPM}
                        onPointerUp={onAdvPU}
                        onDragStart={e => e.preventDefault()}
                        className={`cursor-grab active:cursor-grabbing select-none transition-opacity ${advDragIdx.current === i ? 'opacity-20' : ''}`}>
                        <div className="w-[70px] overflow-hidden rounded-lg border bg-slate-900 relative transition-colors border-slate-700 hover:border-indigo-500 hover:shadow-[0_0_0_2px_rgba(99,102,241,0.25)]">
                          <img src={pg.thumbnail} alt={`p${pg.pageIdx+1}`} draggable={false} className="w-full block pointer-events-none" loading="lazy" decoding="async" />
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-black/40 shadow-sm"
                            style={{ background: PDF_COLORS[pg.fileIdx % PDF_COLORS.length] }} />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent h-6" />
                          <p className="absolute bottom-0.5 inset-x-0 text-center text-[9px] text-white/80 font-medium">{pg.pageIdx + 1}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {advDropIdx === allPages.length && <div className="self-stretch w-0.5 bg-indigo-400 rounded" />}
                </div>
              )}
              {!loadingPages && allPages.length > 0 && (
                <p className="text-slate-600 text-xs mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  {t('reorderFilesResets')}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {error && <ErrorBanner message={error} />}
      {done && <SuccessBanner message={t('mergedPdfDownloaded')} />}

      <button onClick={handleMerge} disabled={entries.length < 2 || processing || anyLoading}
        className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {processing ? <><Spinner /> {t('merging')}</> : (
          <><span className="material-symbols-outlined text-lg">merge</span>
          {t('mergePdfsBtn')} ({totalPageCount > 0 ? `${totalPageCount} pages` : `${entries.length} PDFs`})</>
        )}
      </button>
    </div>
  );
}

// ─── PDF Splitter ─────────────────────────────────────────────────────────────

interface SplitPage { thumb: string; origIdx: number; }

function PDFSplitter() {
  const t = useTranslations('Tool');
  const [file, setFile]             = useState<File|null>(null);
  const [pages, setPages]           = useState<SplitPage[]>([]);
  const [loading, setLoading]       = useState(false);
  const [splitAfter, setSplitAfter] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState('');
  const [done, setDone]             = useState(false);
  const stripRef    = useRef<HTMLDivElement>(null);
  const pageDragIdx = useRef<number|null>(null);
  const pageDropRef = useRef<number|null>(null);
  const [pageDrop,  setPageDrop]  = useState<number|null>(null);
  const [pageDragI, setPageDragI] = useState<number|null>(null);

  const handleFile = async (f: File) => {
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    setFile(f); setError(''); setDone(false); setSplitAfter(new Set()); setPages([]);
    setLoading(true);
    try {
      const thumbs = await renderPDFThumbnails(f, 0.25);
      setPages(thumbs.map((thumb, i) => ({ thumb, origIdx: i })));
    } catch { setError('Failed to render PDF previews.'); }
    finally { setLoading(false); }
  };

  const toggleSplit = (afterIdx: number) => {
    setSplitAfter(prev => { const next = new Set(prev); if (next.has(afterIdx)) next.delete(afterIdx); else next.add(afterIdx); return next; });
  };

  // Page drag-to-reorder (split points stay at same display positions)
  const onPagePD = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    pageDragIdx.current = i; setPageDragI(i);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPagePM = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pageDragIdx.current === null || !stripRef.current) return;
    const els = stripRef.current.querySelectorAll<HTMLElement>('[data-thumbindex]');
    let drop = els.length;
    for (let i = 0; i < els.length; i++) {
      const r = els[i].getBoundingClientRect();
      if (e.clientX < r.left + r.width / 2) { drop = i; break; }
    }
    pageDropRef.current = drop;
    setPageDrop(drop);
  };
  const onPagePU = () => {
    const latestDrop = pageDropRef.current;
    const from = pageDragIdx.current;
    if (from !== null && latestDrop !== null && from !== latestDrop) {
      const to = latestDrop > from ? latestDrop - 1 : latestDrop;
      setPages(prev => {
        const a = [...prev];
        const [item] = a.splice(from, 1);
        a.splice(to, 0, item);
        return a;
      });
    }
    pageDragIdx.current = null; pageDropRef.current = null;
    setPageDrop(null); setPageDragI(null);
  };

  const sortedSplits = Array.from(splitAfter).sort((a, b) => a - b);
  const boundaries   = [0, ...sortedSplits.map(p => p + 1), pages.length];
  const segments     = Array.from({ length: boundaries.length - 1 }, (_, i) => ({ start: boundaries[i] + 1, end: boundaries[i + 1] }));

  const handleSplit = async () => {
    if (!file || splitAfter.size === 0) return;
    if (!checkRateLimit('pdf-split', 5, 60000)) { setError('Too many requests. Please wait a minute.'); return; }
    setProcessing(true); setError('');
    try {
      const { mergePDFsFromPages } = await import('@/lib/tools/pdf-processor');
      const buffer = await file.arrayBuffer();
      for (let s = 0; s < segments.length; s++) {
        const segPages = pages.slice(boundaries[s], boundaries[s + 1]);
        const order = segPages.map(p => ({ fileIdx: 0, pageIdx: p.origIdx }));
        const blob = await mergePDFsFromPages([buffer], order);
        const idx = s;
        setTimeout(() => downloadBlob(blob, `${file.name.replace(/\.pdf$/i, '')}_part${idx + 1}.pdf`), s * 200);
      }
      setDone(true);
    } catch (e) { setError((e as Error).message || 'Split failed.'); }
    finally { setProcessing(false); }
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <DropZone onFile={handleFile} />
      ) : (
        <FileHeader file={file} pageCount={pages.length} onRemove={() => { setFile(null); setPages([]); setSplitAfter(new Set()); setDone(false); }} />
      )}

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
          <Spinner /> {t('loadingPreviews')}
        </div>
      )}

      {pages.length > 0 && (
        <div>
          <p className="text-slate-400 text-sm font-medium mb-3">
            {t('dragReorderClickSplit')}
            {splitAfter.size > 0 && <span className="text-orange-400 ml-2">· creates {segments.length} file{segments.length !== 1 ? 's' : ''}</span>}
          </p>
          <div className="overflow-x-auto pb-3">
            <div ref={stripRef} className="flex items-end gap-0 min-w-max">
              {pages.map((pg, i) => (
                <div key={`${pg.origIdx}-${i}`} className="flex items-stretch">
                  {/* Drop indicator before this page */}
                  <div className={`flex-shrink-0 w-0.5 rounded transition-colors self-stretch ${
                    pageDrop === i && pageDragI !== null && pageDragI !== i ? 'bg-indigo-400' : 'bg-transparent'
                  }`} style={{ minHeight: '90px' }} />

                  <div data-thumbindex={i}
                    onPointerDown={e => onPagePD(e, i)}
                    onPointerMove={onPagePM}
                    onPointerUp={onPagePU}
                    onDragStart={e => e.preventDefault()}
                    className={`flex-shrink-0 select-none cursor-grab active:cursor-grabbing transition-all ${
                      splitAfter.has(i - 1) ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-950 rounded' : ''
                    } ${pageDragI === i ? 'opacity-25' : ''}`}>
                    <img src={pg.thumb} draggable={false} alt={`Page ${i + 1}`}
                      className="w-[72px] object-contain block rounded pointer-events-none" style={{ height: 'auto' }} loading="lazy" decoding="async" />
                    <p className="text-center text-[10px] text-slate-600 mt-0.5">{i + 1}</p>
                  </div>

                  {i < pages.length - 1 && (
                    <button onClick={() => toggleSplit(i)} title={splitAfter.has(i) ? 'Remove split' : 'Split here'}
                      className={`w-7 pb-5 flex flex-col items-center justify-center relative group transition-all ${
                        splitAfter.has(i) ? 'text-orange-400' : 'text-slate-700 hover:text-orange-300'
                      }`}>
                      <div className={`w-px flex-1 min-h-[55px] transition-colors ${splitAfter.has(i) ? 'bg-orange-400' : 'bg-slate-700 group-hover:bg-orange-300'}`} />
                      <span className="absolute text-lg leading-none top-1/2 -translate-y-1/2">{splitAfter.has(i) ? '✂' : '·'}</span>
                    </button>
                  )}
                </div>
              ))}
              {/* Drop indicator after last page */}
              <div className={`flex-shrink-0 w-0.5 rounded transition-colors self-stretch ${
                pageDrop === pages.length && pageDragI !== null ? 'bg-indigo-400' : 'bg-transparent'
              }`} style={{ minHeight: '90px' }} />
            </div>
          </div>
          {segments.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {segments.map((seg, i) => (
                <div key={i} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300">
                  Part {i+1}: p.{seg.start}–{seg.end}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <ErrorBanner message={error} />}
      {done && <SuccessBanner message={`${segments.length} ${t('splitPdfsDownloaded')}`} />}

      <button onClick={handleSplit} disabled={!file || processing || splitAfter.size === 0 || loading}
        className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {processing ? <><Spinner /> {t('splitting')}</> : (
          <><span className="material-symbols-outlined text-lg">call_split</span>
          {splitAfter.size === 0 ? t('selectSplitPoints') : `Split into ${segments.length} file${segments.length !== 1 ? 's' : ''}`}</>
        )}
      </button>
    </div>
  );
}

// ─── PDF Compressor ───────────────────────────────────────────────────────────

function PDFCompressor() {
  const t = useTranslations('Tool');
  const [file, setFile]         = useState<File|null>(null);
  const [level, setLevel]       = useState<'low'|'medium'|'high'>('medium');
  const [processing, setPr]     = useState(false);
  const [progress, setProgress] = useState({ c: 0, t: 0 });
  const [result, setResult]     = useState<{ original: number; compressed: number }|null>(null);
  const [error, setError]       = useState('');

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    setFile(f); setError(''); setResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    if (!checkRateLimit('pdf-compress', 5, 60000)) { setError('Too many requests. Please wait a minute.'); return; }
    setPr(true); setError(''); setProgress({ c: 0, t: 0 });
    try {
      const blob = await compressPDFToBlob(file, level, (c, t) => setProgress({ c, t }));
      downloadBlob(blob, `compressed_${file.name}`);
      setResult({ original: file.size, compressed: blob.size });
    } catch (e) { setError((e as Error).message || 'Compression failed.'); }
    finally { setPr(false); }
  };

  return (
    <div className="space-y-5">
      {!file ? <DropZone onFile={handleFile} /> : (
        <FileHeader file={file} onRemove={() => { setFile(null); setResult(null); }} />
      )}

      {file && (
        <div>
          <p className="text-slate-400 text-sm font-medium mb-3">{t('compressionLevel')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              { v: 'low',    label: t('compressMaximum'),  sub: t('compressSmallestFile'),  color: 'text-amber-400' },
              { v: 'medium', label: t('compressBalanced'),  sub: t('compressRecommended'),   color: 'text-indigo-400' },
              { v: 'high',   label: t('compressMinimal'),   sub: t('compressBestQuality'),  color: 'text-emerald-400' },
            ] as const).map(({ v, label, sub, color }) => (
              <button key={v} onClick={() => setLevel(v)}
                className={`p-3 border rounded-xl text-center transition-all ${level === v ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-600'}`}>
                <p className={`text-sm font-semibold ${level === v ? 'text-white' : 'text-slate-300'}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${color}`}>{sub}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span>
            {t('compressRasterNote')}
          </p>
        </div>
      )}

      {processing && progress.t > 0 && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{t('compressingPages')}</span>
            <span>{progress.c} / {progress.t}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(progress.c / progress.t) * 100}%` }} />
          </div>
        </div>
      )}

      {error && <ErrorBanner message={error} />}
      {result && (
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          {[
            { label: t('originalSize'),    value: formatBytes(result.original) },
            { label: t('compressedLabel'), value: formatBytes(result.compressed) },
            { label: t('savedLabel'),      value: `${Math.max(0, Math.round((1 - result.compressed / result.original) * 100))}%`, highlight: result.compressed < result.original },
          ].map(item => (
            <div key={item.label} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <p className="text-slate-500 text-xs mb-1">{item.label}</p>
              <p className={`text-lg font-semibold ${item.highlight ? 'text-emerald-400' : 'text-slate-200'}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleCompress} disabled={!file || processing}
        className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {processing ? <><Spinner /> {t('processingDots')}</> : <><span className="material-symbols-outlined text-lg">compress</span> {t('compressPdf')}</>}
      </button>
    </div>
  );
}

// ─── PDF Encryptor ────────────────────────────────────────────────────────────

function PDFEncryptor() {
  const t = useTranslations('Tool');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { setError(t('errors.invalidType', { types: 'PDF' })); return; }
    setFile(f); setError(''); setDone(false);
  };

  const handleEncrypt = async () => {
    if (!file || !password) return;
    if (password !== confirm) { setError(t('passwordMismatch')); return; }
    if (password.length < 4) { setError(t('passwordTooShort', { min: 4 })); return; }
    if (!checkRateLimit('pdf-encrypt', 5, 60000)) { setError(t('errors.rateLimitExceeded')); return; }
    setProcessing(true); setError('');
    try {
      const { encryptPDF } = await import('@/lib/tools/pdf-processor');
      const blob = await encryptPDF(file, password);
      downloadBlob(blob, `${file.name.replace('.pdf', '')}.enc`);
      setDone(true);
    } catch (e) {
      setError((e as Error).message || 'Encryption failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm text-indigo-300">
        <p className="font-medium mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">info</span>
          {t('aes256Title')}
        </p>
        <p className="text-indigo-400 text-xs">{t('encryptNoteText')}</p>
      </div>
      {!file ? <DropZone onFile={handleFile} /> : (
        <FileHeader file={file} onRemove={() => { setFile(null); setDone(false); }} />
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="relative">
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('password')}</label>
          <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="input-field w-full px-4 py-3 pr-10 text-sm" />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-300">
            <span className="material-symbols-outlined text-base">{showPw ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('confirmPassword')}</label>
          <input type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="input-field w-full px-4 py-3 text-sm" />
        </div>
      </div>
      {error && <ErrorBanner message={error} />}
      {done && <SuccessBanner message={t('encryptedDownloaded')} />}
      <button onClick={handleEncrypt} disabled={!file || !password || !confirm || processing}
        className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {processing ? <><Spinner /> {t('encrypting')}</> : <><span className="material-symbols-outlined text-lg">lock</span> {t('encryptPdf')}</>}
      </button>
    </div>
  );
}

// ─── PDF Decryptor ────────────────────────────────────────────────────────────

function PDFDecryptor() {
  const t = useTranslations('Tool');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleFile = (f: File) => {
    const ok = f.type === 'application/pdf' || f.name.endsWith('.enc') || f.name.endsWith('.pdf');
    if (!ok) { setError('Please select a PDF or .enc file.'); return; }
    setFile(f); setError(''); setDone(false);
  };

  const handleDecrypt = async () => {
    if (!file || !password) return;
    if (!checkRateLimit('pdf-decrypt', 5, 60000)) { setError(t('errors.rateLimitExceeded')); return; }
    setProcessing(true); setError('');
    try {
      const { decryptPDF } = await import('@/lib/tools/pdf-processor');
      const blob = await decryptPDF(file, password);
      const outName = file.name.replace('.enc', '') + (file.name.endsWith('.enc') ? '' : '_decrypted');
      downloadBlob(blob, outName.endsWith('.pdf') ? outName : `${outName}.pdf`);
      setDone(true);
    } catch (e) {
      setError((e as Error).message || t('wrongPassword'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-400">
        <p className="font-medium text-slate-300 mb-1">{t('supportedFormat')}</p>
        <p className="text-xs">{t('decryptFormatNote')}</p>
      </div>
      {!file ? (
        <DropZone onFile={handleFile} accept=".pdf,.enc,application/pdf" label={t('uploadPdfOrEnc')} />
      ) : (
        <FileHeader file={file} onRemove={() => { setFile(null); setDone(false); }} />
      )}
      <div className="relative">
        <label className="text-slate-400 text-sm font-medium mb-2 block">{t('password')}</label>
        <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder={t('enterDecryptPassword')}
          className="input-field w-full px-4 py-3 pr-10 text-sm" />
        <button type="button" onClick={() => setShowPw(!showPw)}
          className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-300">
          <span className="material-symbols-outlined text-base">{showPw ? 'visibility_off' : 'visibility'}</span>
        </button>
      </div>
      {error && <ErrorBanner message={error} />}
      {done && <SuccessBanner message={t('decryptedDownloaded')} />}
      <button onClick={handleDecrypt} disabled={!file || !password || processing}
        className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {processing ? <><Spinner /> {t('decrypting')}</> : <><span className="material-symbols-outlined text-lg">lock_open</span> {t('decryptPdf')}</>}
      </button>
    </div>
  );
}

// ─── PDF Watermark ────────────────────────────────────────────────────────────

function PDFWatermarker() {
  const t = useTranslations('Tool');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [fontSize, setFontSize] = useState(60);
  const [position, setPosition] = useState<'center' | 'diagonal'>('diagonal');
  const [color, setColor] = useState<[number, number, number]>([0.5, 0.5, 0.5]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { setError(t('errors.invalidType', { types: 'PDF' })); return; }
    setFile(f); setError(''); setDone(false);
  };

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    if (!checkRateLimit('pdf-watermark', 5, 60000)) { setError(t('errors.rateLimitExceeded')); return; }
    setProcessing(true); setError('');
    try {
      const { watermarkPDF } = await import('@/lib/tools/pdf-processor');
      const blob = await watermarkPDF(file, { text, opacity, rotation, fontSize, color, position });
      downloadBlob(blob, `watermarked_${file.name}`);
      setDone(true);
    } catch (e) {
      setError((e as Error).message || 'Watermark failed.');
    } finally {
      setProcessing(false);
    }
  };

  const colorOptions: { label: string; value: [number, number, number] }[] = [
    { label: 'Gray', value: [0.5, 0.5, 0.5] },
    { label: 'Red', value: [0.8, 0.1, 0.1] },
    { label: 'Blue', value: [0.1, 0.3, 0.8] },
    { label: 'Black', value: [0, 0, 0] },
  ];

  return (
    <div className="space-y-5">
      {!file ? <DropZone onFile={handleFile} /> : (
        <FileHeader file={file} onRemove={() => { setFile(null); setDone(false); }} />
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('watermarkText')}</label>
          <input value={text} onChange={(e) => setText(e.target.value)}
            placeholder="e.g. CONFIDENTIAL"
            className="input-field w-full px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('watermarkPosition')}</label>
          <div className="flex gap-2">
            {(['center', 'diagonal'] as const).map((p) => (
              <button key={p} onClick={() => setPosition(p)}
                className={`flex-1 py-2.5 text-sm rounded-xl border capitalize transition-all ${position === p ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {p === 'center' ? t('watermarkCenter') : t('watermarkDiagonal')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('watermarkOpacity')}: {Math.round(opacity * 100)}%</label>
          <input type="range" min={0.05} max={1} step={0.05} value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-indigo-500" />
        </div>
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('watermarkFontSize')}: {fontSize}pt</label>
          <input type="range" min={20} max={120} step={5} value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-indigo-500" />
        </div>
        {position === 'diagonal' && (
          <div>
            <label className="text-slate-400 text-sm font-medium mb-2 block">{t('watermarkRotation')}: {rotation}°</label>
            <input type="range" min={0} max={90} step={5} value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full accent-indigo-500" />
          </div>
        )}
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('watermarkColor')}</label>
          <div className="flex gap-2">
            {colorOptions.map((c) => (
              <button key={c.label} onClick={() => setColor(c.value)}
                title={c.label}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${JSON.stringify(color) === JSON.stringify(c.value) ? 'border-indigo-400 scale-110' : 'border-transparent'}`}
                style={{ background: `rgb(${c.value.map((v) => Math.round(v * 255)).join(',')})` }} />
            ))}
          </div>
        </div>
      </div>
      {error && <ErrorBanner message={error} />}
      {done && <SuccessBanner message={t('watermarkedDownloaded')} />}
      <button onClick={handleWatermark} disabled={!file || !text.trim() || processing}
        className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {processing ? <><Spinner /> {t('addingWatermark')}</> : <><span className="material-symbols-outlined text-lg">branding_watermark</span> {t('addWatermark')}</>}
      </button>
    </div>
  );
}

// ─── PDF to Text ──────────────────────────────────────────────────────────────

function PDFToText() {
  const t = useTranslations('Tool');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { setError(t('errors.invalidType', { types: 'PDF' })); return; }
    setFile(f); setError(''); setText('');
  };

  const handleExtract = async () => {
    if (!file) return;
    if (!checkRateLimit('pdf-to-txt', 5, 60000)) { setError(t('errors.rateLimitExceeded')); return; }
    setProcessing(true); setError('');
    try {
      const { extractTextFromPDF } = await import('@/lib/tools/pdf-processor');
      const bytes = await file.arrayBuffer();
      const result = await extractTextFromPDF(bytes);
      if (!result.trim()) {
        setError(t('noTextFound'));
        return;
      }
      setText(result);
    } catch (e) {
      setError((e as Error).message || 'Extraction failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    downloadBlob(blob, `${file!.name.replace('.pdf', '')}.txt`);
  };

  const copyText = () => clipboardWrite(text);

  return (
    <div className="space-y-5">
      {!file ? <DropZone onFile={handleFile} /> : (
        <FileHeader file={file} onRemove={() => { setFile(null); setText(''); }} />
      )}
      {error && <ErrorBanner message={error} />}
      {text && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">{text.split(/\s+/).filter(Boolean).length} words extracted</p>
            <div className="flex gap-2">
              <button onClick={copyText}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
                <span className="material-symbols-outlined text-sm">content_copy</span>
                {t('copy')}
              </button>
              <button onClick={downloadTxt}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
                <span className="material-symbols-outlined text-sm">download</span>
                {t('downloadTxt')}
              </button>
            </div>
          </div>
          <textarea value={text} readOnly
            className="input-field w-full px-4 py-3 text-sm font-mono min-h-[320px] resize-none block bg-slate-950/50" />
        </div>
      )}
      <button onClick={handleExtract} disabled={!file || processing}
        className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {processing ? <><Spinner /> {t('extracting')}</> : <><span className="material-symbols-outlined text-lg">text_fields</span> {t('extractText')}</>}
      </button>
    </div>
  );
}

// ─── PDF to CSV ───────────────────────────────────────────────────────────────

function PDFToCSV() {
  const t = useTranslations('Tool');
  const [file, setFile] = useState<File | null>(null);
  const [csv, setCSV] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { setError(t('errors.invalidType', { types: 'PDF' })); return; }
    setFile(f); setError(''); setCSV('');
  };

  const handleExtract = async () => {
    if (!file) return;
    if (!checkRateLimit('pdf-to-csv', 5, 60000)) { setError(t('errors.rateLimitExceeded')); return; }
    setProcessing(true); setError('');
    try {
      const { extractTextFromPDF } = await import('@/lib/tools/pdf-processor');
      const bytes = await file.arrayBuffer();
      const rawText = await extractTextFromPDF(bytes);
      if (!rawText.trim()) {
        setError(t('noTextFoundCsv'));
        return;
      }
      // Convert lines to CSV (each line = one row, words = columns)
      const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
      const csvLines = lines.map((line) => {
        // Quote fields that contain commas or quotes
        const fields = line.trim().split(/\s{2,}|\t/);
        return fields.map((f) => {
          const trimmed = f.trim();
          if (trimmed.includes(',') || trimmed.includes('"')) {
            return `"${trimmed.replace(/"/g, '""')}"`;
          }
          return trimmed;
        }).join(',');
      });
      setCSV(csvLines.join('\n'));
    } catch (e) {
      setError((e as Error).message || 'Extraction failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadCSV = () => {
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `${file!.name.replace('.pdf', '')}.csv`);
  };

  const previewRows = csv ? csv.split('\n').slice(0, 10).map((r) => r.split(',')) : [];

  return (
    <div className="space-y-5">
      {!file ? <DropZone onFile={handleFile} /> : (
        <FileHeader file={file} onRemove={() => { setFile(null); setCSV(''); }} />
      )}
      {error && <ErrorBanner message={error} />}
      {csv && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs">{csv.split('\n').length} rows extracted</p>
            <button onClick={downloadCSV}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              {t('downloadCsv')}
            </button>
          </div>
          {previewRows.length > 0 && (
            <div className="overflow-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs">
                <tbody>
                  {previewRows.map((row, ri) => (
                    <tr key={ri} className="border-b border-slate-900 hover:bg-slate-900/50">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-slate-300 whitespace-nowrap max-w-[200px] truncate">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {csv.split('\n').length > 10 && (
            <p className="text-slate-600 text-xs">Showing first 10 rows of {csv.split('\n').length}</p>
          )}
        </div>
      )}
      <button onClick={handleExtract} disabled={!file || processing}
        className="btn-primary flex items-center gap-2 disabled:opacity-60">
        {processing ? <><Spinner /> {t('extracting')}</> : <><span className="material-symbols-outlined text-lg">table_chart</span> {t('extractToCsv')}</>}
      </button>
    </div>
  );
}

// ─── PDF to Word ──────────────────────────────────────────────────────────────

function PDFToWord() {
  const t = useTranslations('Tool');
  const [file, setFile]         = useState<File | null>(null);
  const [processing, setProc]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  const handleConvert = useCallback(async () => {
    if (!file) return;
    if (!checkRateLimit('pdf-to-word', 5, 60000)) { setError(t('errors.rateLimitExceeded')); return; }
    setProc(true); setError(''); setSuccess('');
    try {
      // Dynamically load pdfjs — use _dynamicImport to bypass webpack bundling conflict
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjsLib: any = await _dynamicImport('/pdfjs/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const paragraphs: string[] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const pageText = content.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (pageText) paragraphs.push(pageText);
      }

      // Build DOCX from extracted text
      const { Document, Paragraph, TextRun, Packer, HeadingLevel } = await import('docx');
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: file.name.replace(/\.pdf$/i, ''), heading: HeadingLevel.HEADING_1 }),
            ...paragraphs.map((text, i) =>
              new Paragraph({
                children: [new TextRun({ text, size: 24 })],
                spacing: { after: i === paragraphs.length - 1 ? 0 : 200 },
              })
            ),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, file.name.replace(/\.pdf$/i, '.docx'));
      setSuccess(`Converted ${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''} to Word document.`);
    } catch (e) {
      setError(`Conversion failed: ${(e as Error).message}`);
    } finally {
      setProc(false);
    }
  }, [file]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-950/30 border border-amber-500/20 rounded-xl">
        <span className="material-symbols-outlined text-amber-400 text-base flex-shrink-0 mt-0.5">info</span>
        <p className="text-sm text-amber-200">{t('pdfToWordNote')}</p>
      </div>
      {!file ? (
        <DropZone onFile={setFile} label={t('uploadPdfFiles')} sublabel={t('maxPdfHint')} />
      ) : (
        <>
          <FileHeader file={file} onRemove={() => { setFile(null); setSuccess(''); setError(''); }} />
          {error   && <ErrorBanner message={error} />}
          {success && <SuccessBanner message={success} />}
          <button onClick={handleConvert} disabled={processing}
            className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {processing ? <><Spinner /> {t('convertingDots')}</> : <><span className="material-symbols-outlined text-lg">description</span> {t('convertToWord')}</>}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Word to PDF ──────────────────────────────────────────────────────────────

function WordToPDF() {
  const t = useTranslations('Tool');
  const [file, setFile]         = useState<File | null>(null);
  const [processing, setProc]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [error, setError]       = useState('');

  const handleConvert = useCallback(async () => {
    if (!file) return;
    if (!checkRateLimit('word-to-pdf', 5, 60000)) { setError(t('errors.rateLimitExceeded')); return; }
    setProc(true); setError(''); setSuccess('');
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Validate it's actually a DOCX (ZIP) file — magic bytes: 50 4B 03 04
      const hdr = new Uint8Array(arrayBuffer.slice(0, 4));
      if (hdr[0] !== 0x50 || hdr[1] !== 0x4B || hdr[2] !== 0x03 || hdr[3] !== 0x04) {
        throw new Error('Invalid file. Please upload a .docx Word document — PDFs and images are not supported here.');
      }

      // Extract text from DOCX using mammoth
      const mammoth = await import('mammoth');
      let mammothResult;
      try {
        mammothResult = await mammoth.extractRawText({ arrayBuffer });
      } catch {
        throw new Error('Could not read the document. Make sure it is a valid .docx Word file.');
      }
      const text = mammothResult.value;
      if (!text.trim()) throw new Error('No text found. The document may be empty or contain only images.');

      // Build PDF using pdf-lib
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin = 60;
      const lineH = fontSize * 1.5;
      const pageW = 595;
      const pageH = 842;
      const maxW = pageW - margin * 2;

      // Word-wrap text into lines
      const words = text.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let current = '';
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, fontSize) <= maxW) {
          current = candidate;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      }
      if (current) lines.push(current);

      // Split lines across pages
      const linesPerPage = Math.floor((pageH - margin * 2) / lineH);
      for (let i = 0; i < lines.length; i += linesPerPage) {
        const page = pdfDoc.addPage([pageW, pageH]);
        const chunk = lines.slice(i, i + linesPerPage);
        chunk.forEach((line, j) => {
          page.drawText(line, {
            x: margin,
            y: pageH - margin - j * lineH,
            size: fontSize,
            font,
            color: rgb(0.1, 0.1, 0.1),
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }), file.name.replace(/\.docx?$/i, '.pdf'));
      setSuccess(t('convertedToPdf'));
    } catch (e) {
      setError(`Conversion failed: ${(e as Error).message}`);
    } finally {
      setProc(false);
    }
  }, [file]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 px-4 py-3 bg-amber-950/30 border border-amber-500/20 rounded-xl">
        <span className="material-symbols-outlined text-amber-400 text-base flex-shrink-0 mt-0.5">info</span>
        <p className="text-sm text-amber-200">{t('wordToPdfNote')}</p>
      </div>
      {!file ? (
        <DropZone
          onFile={setFile}
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          label={t('uploadWordDoc')}
          sublabel={t('maxDocxHint')}
        />
      ) : (
        <>
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <div>
                <p className="text-slate-200 text-sm font-medium">{file.name}</p>
                <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setSuccess(''); setError(''); }}
              className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none">&times;</button>
          </div>
          {error   && <ErrorBanner message={error} />}
          {success && <SuccessBanner message={success} />}
          <button onClick={handleConvert} disabled={processing}
            className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {processing ? <><Spinner /> {t('convertingDots')}</> : <><span className="material-symbols-outlined text-lg">picture_as_pdf</span> {t('convertToPdf')}</>}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Root Switch ─────────────────────────────────────────────────────────────

export function PDFToolCore({ mode }: Props) {
  const t = useTranslations('Tool');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const PDF_TABS: { mode: PdfMode; label: string; icon: string }[] = [
    { mode: 'image-to-pdf',  label: t('tabImgToPdf'),   icon: 'image' },
    { mode: 'merge-pdf',     label: t('tabMerge'),       icon: 'merge' },
    { mode: 'split-pdf',     label: t('tabSplit'),       icon: 'call_split' },
    { mode: 'pdf-compress',  label: t('tabCompress'),    icon: 'compress' },
    { mode: 'pdf-encrypt',   label: t('tabEncrypt'),     icon: 'lock' },
    { mode: 'pdf-decrypt',   label: t('tabDecrypt'),     icon: 'lock_open' },
    { mode: 'pdf-watermark', label: t('tabWatermark'),   icon: 'water_drop' },
    { mode: 'pdf-to-txt',    label: t('tabToText'),      icon: 'text_snippet' },
    { mode: 'pdf-to-csv',    label: t('tabToCsv'),       icon: 'table_view' },
    { mode: 'pdf-to-word',   label: t('tabToWord'),      icon: 'description' },
    { mode: 'word-to-pdf',   label: t('tabWordToPdf'),   icon: 'picture_as_pdf' },
  ];
  let content: React.ReactNode;
  switch (mode) {
    case 'image-to-pdf': content = <ImageToPDFCore />; break;
    case 'merge-pdf':    content = <PDFMerger />; break;
    case 'split-pdf':   content = <PDFSplitter />; break;
    case 'pdf-compress': content = <PDFCompressor />; break;
    case 'pdf-encrypt':  content = <PDFEncryptor />; break;
    case 'pdf-decrypt':  content = <PDFDecryptor />; break;
    case 'pdf-watermark': content = <PDFWatermarker />; break;
    case 'pdf-to-txt':   content = <PDFToText />; break;
    case 'pdf-to-csv':   content = <PDFToCSV />; break;
    case 'pdf-to-word':  content = <PDFToWord />; break;
    case 'word-to-pdf':  content = <WordToPDF />; break;
    default:             content = null;
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {PDF_TABS.map(tab => (
          <Link
            key={tab.mode}
            href={`/${locale}/tools/${tab.mode}`}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === tab.mode
                ? 'bg-indigo-600 text-white shadow-md pointer-events-none'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </div>
      {content}
    </div>
  );
}

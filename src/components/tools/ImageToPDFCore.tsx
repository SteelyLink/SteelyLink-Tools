'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILES = 20;
const MAX_PER_FILE_MB = 5;
const MAX_TOTAL_MB = 50;
const ACCEPTED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const PAGE_DIMS: Record<string, { w: number; h: number }> = {
  A4:     { w: 595.28, h: 841.89 },
  Letter: { w: 612,    h: 792    },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImageEntry {
  id: string;
  file: File;
  previewUrl: string;
  naturalW: number;
  naturalH: number;
}

type PageSizeKey = 'A4' | 'Letter' | 'fit';
type Orientation = 'portrait' | 'landscape';

// ─── Security helpers ─────────────────────────────────────────────────────────

async function checkMagicBytes(file: File): Promise<boolean> {
  const buf = await file.slice(0, 12).arrayBuffer();
  const b = new Uint8Array(buf);
  // JPEG: FF D8 FF
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return true;
  // PNG: 89 50 4E 47
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return true;
  // WebP: RIFF....WEBP
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return true;
  return false;
}

async function validateFile(file: File): Promise<string | null> {
  if (!ACCEPTED_MIME.has(file.type)) return `${file.name}: unsupported type (JPG / PNG / WebP only)`;
  if (file.size > MAX_PER_FILE_MB * 1024 * 1024) return `${file.name}: exceeds ${MAX_PER_FILE_MB} MB limit`;
  const ok = await checkMagicBytes(file);
  if (!ok) return `${file.name}: file header mismatch — not a valid image`;
  return null;
}

function getImageDims(url: string): Promise<{ w: number; h: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => rej(new Error('Cannot load image'));
    img.src = url;
  });
}

// Convert any accepted image to bytes embeddable in pdf-lib (JPEG/PNG only)
async function toEmbeddable(file: File): Promise<{ bytes: Uint8Array; kind: 'jpg' | 'png' }> {
  if (file.type === 'image/jpeg') {
    return { bytes: new Uint8Array(await file.arrayBuffer()), kind: 'jpg' };
  }
  if (file.type === 'image/png') {
    return { bytes: new Uint8Array(await file.arrayBuffer()), kind: 'png' };
  }
  // WebP: convert via OffscreenCanvas / regular canvas → JPEG
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0);
  bmp.close();
  const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/jpeg', 0.92));
  canvas.width = 0; // release GPU memory
  return { bytes: new Uint8Array(await blob.arrayBuffer()), kind: 'jpg' };
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ImageToPDFCore() {
  const t = useTranslations('Tool');
  const [images, setImages]         = useState<ImageEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pageSize, setPageSize]     = useState<PageSizeKey>('A4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin]         = useState(20);   // points
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState('');

  // Drag-to-reorder
  const [dragIdx, setDragIdx]       = useState<number | null>(null);
  const [dropIdx, setDropIdx]       = useState<number | null>(null);
  const listRef                     = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke all preview URLs on unmount
  useEffect(() => {
    return () => {
      setImages(prev => {
        prev.forEach(e => URL.revokeObjectURL(e.previewUrl));
        return [];
      });
    };
  }, []);

  // ── File ingestion ──────────────────────────────────────────────────────────

  const addFiles = useCallback(async (rawFiles: FileList | File[]) => {
    const incoming = Array.from(rawFiles);
    setError('');

    if (images.length + incoming.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }
    const totalBytes = images.reduce((s, e) => s + e.file.size, 0)
                     + incoming.reduce((s, f) => s + f.size, 0);
    if (totalBytes > MAX_TOTAL_MB * 1024 * 1024) {
      setError(`Total size exceeds ${MAX_TOTAL_MB} MB`);
      return;
    }

    const entries: ImageEntry[] = [];
    for (const file of incoming) {
      const err = await validateFile(file);
      if (err) { setError(err); continue; }

      const previewUrl = URL.createObjectURL(file);
      let naturalW = 0, naturalH = 0;
      try {
        const d = await getImageDims(previewUrl);
        naturalW = d.w; naturalH = d.h;
      } catch {
        URL.revokeObjectURL(previewUrl);
        continue;
      }

      entries.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl,
        naturalW,
        naturalH,
      });
    }

    setImages(prev => [...prev, ...entries]);
  }, [images]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter(e => e.id !== id);
    });
  }, []);

  // ── Drag-to-reorder (pointer events — works on touch too) ──────────────────

  const onHandleDown = useCallback((e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragIdx(idx);
    setDropIdx(idx);
  }, []);

  const onHandleMove = useCallback((e: React.PointerEvent) => {
    if (dragIdx === null || !listRef.current) return;
    const rows = listRef.current.querySelectorAll<HTMLElement>('[data-rowindex]');
    let newDrop = rows.length; // default: after last
    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        newDrop = i;
        break;
      }
    }
    setDropIdx(Math.max(0, Math.min(newDrop, images.length)));
  }, [dragIdx, images.length]);

  const onHandleUp = useCallback(() => {
    if (dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx) {
      setImages(prev => {
        const next = [...prev];
        const item = next.splice(dragIdx, 1)[0];
        const insertAt = dropIdx > dragIdx ? dropIdx - 1 : dropIdx;
        next.splice(insertAt, 0, item);
        return next;
      });
    }
    setDragIdx(null);
    setDropIdx(null);
  }, [dragIdx, dropIdx]);

  // ── PDF generation ──────────────────────────────────────────────────────────

  const generatePDF = useCallback(async () => {
    if (images.length === 0) return;
    setGenerating(true);
    setProgress(0);
    setError('');

    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < images.length; i++) {
        setProgress(Math.round((i / images.length) * 88) + 2);
        const entry = images[i];
        const { bytes, kind } = await toEmbeddable(entry.file);
        const pdfImg = kind === 'jpg'
          ? await pdfDoc.embedJpg(bytes)
          : await pdfDoc.embedPng(bytes);

        let pgW: number, pgH: number;
        if (pageSize === 'fit') {
          pgW = pdfImg.width; pgH = pdfImg.height;
        } else {
          const base = PAGE_DIMS[pageSize];
          pgW = orientation === 'portrait' ? base.w : base.h;
          pgH = orientation === 'portrait' ? base.h : base.w;
        }

        const page = pdfDoc.addPage([pgW, pgH]);
        const contentW = pgW - margin * 2;
        const contentH = pgH - margin * 2;

        const imgAspect = pdfImg.width / pdfImg.height;
        const contentAspect = contentW / contentH;
        let drawW = contentW, drawH = contentH;
        if (imgAspect > contentAspect) {
          drawH = contentW / imgAspect;
        } else {
          drawW = contentH * imgAspect;
        }

        page.drawImage(pdfImg, {
          x: (pgW - drawW) / 2,
          y: (pgH - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }

      setProgress(96);
      const pdfBytes = await pdfDoc.save();
      setProgress(100);

      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `images-to-pdf.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to generate PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 800);
    }
  }, [images, pageSize, orientation, margin]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const totalSize = images.reduce((s, e) => s + e.file.size, 0);
  const canGenerate = images.length > 0 && !generating;

  return (
    <div className="space-y-5">

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/30 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => { addFiles(e.target.files ?? []); e.target.value = ''; }}
        />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
          <span className="material-symbols-outlined text-3xl text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>
            add_photo_alternate
          </span>
        </div>
        <div className="text-center">
          <p className="text-slate-200 font-semibold text-sm">
            {images.length === 0 ? t('dropImagesHere') : t('addMoreImages')}
          </p>
          <p className="text-slate-500 text-xs mt-1">{t('imgFormatHint', { maxMB: MAX_PER_FILE_MB, maxFiles: MAX_FILES })}</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Image list with drag-to-reorder */}
      {images.length > 0 && (
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-slate-200 text-sm font-semibold">{images.length} image{images.length > 1 ? 's' : ''}</span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-slate-500 text-xs">{formatBytes(totalSize)} total</span>
            </div>
            <button
              onClick={() => {
                images.forEach(e => URL.revokeObjectURL(e.previewUrl));
                setImages([]);
                setError('');
              }}
              className="text-slate-600 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              {t('clearAll')}
            </button>
          </div>

          {/* Sortable list */}
          <div ref={listRef} className="space-y-1.5">
            {images.map((img, i) => (
              <React.Fragment key={img.id}>
                {/* Drop indicator line — shown ABOVE card at dropIdx */}
                {dragIdx !== null && dropIdx === i && dropIdx !== dragIdx && (
                  <div className="h-0.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] mx-1 transition-all" />
                )}

                {/* Image card */}
                <div
                  data-rowindex={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    dragIdx === i
                      ? 'opacity-40 bg-slate-900 border-slate-700 scale-[0.98]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Drag handle */}
                  <button
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none p-1 text-slate-600 hover:text-slate-300 transition-colors rounded"
                    onPointerDown={e => onHandleDown(e, i)}
                    onPointerMove={onHandleMove}
                    onPointerUp={onHandleUp}
                    onPointerCancel={onHandleUp}
                    aria-label={`Reorder image ${i + 1}`}
                  >
                    <span className="material-symbols-outlined text-xl leading-none">drag_indicator</span>
                  </button>

                  {/* Page number badge */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                    <span className="text-indigo-300 text-[10px] font-bold leading-none">{i + 1}</span>
                  </div>

                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="w-16 h-12 object-cover rounded-lg flex-shrink-0 bg-slate-800"
                    loading="lazy"
                    draggable={false}
                  />

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{img.file.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {img.naturalW} × {img.naturalH}px · {formatBytes(img.file.size)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeImage(img.id)}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    aria-label="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </React.Fragment>
            ))}

            {/* Drop indicator after last card */}
            {dragIdx !== null && dropIdx === images.length && dropIdx !== dragIdx && (
              <div className="h-0.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] mx-1" />
            )}
          </div>

          <p className="text-slate-600 text-xs flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">drag_indicator</span>
            {t('dragHandleHint')}
          </p>
        </div>
      )}

      {/* Options */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
          {/* Page size */}
          <div>
            <label className="text-slate-500 text-xs mb-1.5 block font-medium">{t('pageSizeLabel')}</label>
            <div className="flex gap-1">
              {(['A4', 'Letter', 'fit'] as PageSizeKey[]).map(s => (
                <button
                  key={s}
                  onClick={() => setPageSize(s)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${pageSize === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'}`}
                >
                  {s === 'fit' ? 'Fit' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label className="text-slate-500 text-xs mb-1.5 block font-medium">{t('orientationLabel')}</label>
            <div className="flex gap-1">
              {(['portrait', 'landscape'] as Orientation[]).map(o => (
                <button
                  key={o}
                  onClick={() => setOrientation(o)}
                  disabled={pageSize === 'fit'}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize disabled:opacity-40 disabled:cursor-not-allowed ${orientation === o && pageSize !== 'fit' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'}`}
                >
                  {o === 'portrait' ? '↕' : '↔'} {o.slice(0, 4)}.
                </button>
              ))}
            </div>
          </div>

          {/* Margin */}
          <div className="col-span-2">
            <label className="text-slate-500 text-xs mb-1.5 flex items-center justify-between font-medium">
              <span>{t('marginLabel')}</span>
              <span className="text-slate-300 font-semibold">{margin} pt</span>
            </label>
            <input
              type="range"
              min={0}
              max={40}
              step={2}
              value={margin}
              onChange={e => setMargin(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5"
            />
          </div>
        </div>
      )}

      {/* Progress bar */}
      {generating && (
        <div className="space-y-2">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-slate-400 text-xs text-center">
            {t('generatingPdf')} {progress}%
          </p>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={generatePDF}
        disabled={!canGenerate}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm shadow-lg shadow-indigo-500/20"
      >
        {generating ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('generatingPdf')}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
            {images.length === 0
              ? t('uploadImagesFirst')
              : `${t('generatePdfBtn')} (${images.length} page${images.length > 1 ? 's' : ''})`}
          </>
        )}
      </button>

      {images.length > 0 && !generating && (
        <p className="text-slate-600 text-xs text-center">
          All processing happens in your browser — nothing is uploaded to any server.
        </p>
      )}
    </div>
  );
}

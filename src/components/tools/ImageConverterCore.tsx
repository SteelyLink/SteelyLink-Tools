'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { downloadBlob, formatBytes } from '@/lib/tools/image-processor';
import { svgToPng, svgToJpg } from '@/lib/tools/image-effects';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import { ImageTabBar } from './ImageTabBar';

// ── Format catalogue ──────────────────────────────────────────────────────────

type ImageFormat = 'png' | 'jpg' | 'webp' | 'svg' | 'avif' | 'heic';

const FMT_LABEL: Record<ImageFormat, string> = {
  png: 'PNG', jpg: 'JPG', webp: 'WebP', svg: 'SVG', avif: 'AVIF', heic: 'HEIC',
};
const FMT_MIME: Record<ImageFormat, string> = {
  png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp',
  svg: 'image/svg+xml', avif: 'image/avif', heic: 'image/heic',
};
const FMT_EXT: Record<ImageFormat, string> = {
  png: 'png', jpg: 'jpg', webp: 'webp', svg: 'svg', avif: 'avif', heic: 'heic',
};

// Output formats each input can produce
const INPUT_FORMATS: ImageFormat[] = ['png', 'jpg', 'webp', 'svg', 'avif', 'heic'];
const OUTPUT_FORMATS: ImageFormat[] = ['jpg', 'png', 'webp', 'avif'];

// Which outputs are valid for each input format
const COMPAT: Record<ImageFormat, ImageFormat[]> = {
  png:  ['jpg', 'webp', 'avif'],
  jpg:  ['png', 'webp', 'avif'],
  webp: ['png', 'jpg', 'avif'],
  svg:  ['png', 'jpg', 'webp', 'avif'],
  avif: ['png', 'jpg', 'webp'],
  heic: ['png', 'jpg', 'webp', 'avif'],
};

const LOSSY = new Set<ImageFormat>(['jpg', 'webp', 'avif']);
const ALL_ACCEPT = '.png,.jpg,.jpeg,.webp,.svg,.avif,.heic,.heif,image/*';
const MAX_MB = 200;

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectFormat(file: File): ImageFormat {
  const n = file.name.toLowerCase(), t = file.type.toLowerCase();
  if (t === 'image/png'      || n.endsWith('.png'))                         return 'png';
  if (t === 'image/jpeg'     || n.endsWith('.jpg') || n.endsWith('.jpeg'))  return 'jpg';
  if (t === 'image/webp'     || n.endsWith('.webp'))                        return 'webp';
  if (t === 'image/svg+xml'  || n.endsWith('.svg'))                         return 'svg';
  if (t === 'image/avif'     || n.endsWith('.avif'))                        return 'avif';
  if (t.includes('heic') || t.includes('heif') ||
      n.endsWith('.heic') || n.endsWith('.heif'))                           return 'heic';
  return 'jpg';
}

// ── Core conversion ───────────────────────────────────────────────────────────

async function convertImage(file: File, from: ImageFormat, to: ImageFormat, quality: number): Promise<Blob> {
  // SVG: rasterise via dedicated helpers
  if (from === 'svg') {
    if (to === 'png') return svgToPng(file);
    if (to === 'jpg') return svgToJpg(file, quality / 100);
    const pngBlob = await svgToPng(file);
    return convertImage(new File([pngBlob], 'tmp.png', { type: 'image/png' }), 'png', to, quality);
  }

  // HEIC: decode to PNG first via heic2any
  let sourceBlob: Blob = file;
  if (from === 'heic') {
    const heic2any = (await import('heic2any')).default;
    const decoded = await heic2any({ blob: file, toType: 'image/png' });
    sourceBlob = Array.isArray(decoded) ? decoded[0] : decoded;
  }

  // Decode: draw source image onto a canvas to get raw ImageData
  const url = URL.createObjectURL(sourceBlob);
  let imageData: ImageData;
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = () => rej(new Error('Failed to load image. The format may not be supported in your browser.'));
      el.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    if (to === 'jpg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }

  // Encode: all formats via @jsquash (Google Squoosh) WASM — cross-browser, no canvas fallback
  switch (to) {
    case 'jpg': {
      const { encode } = await import('@jsquash/jpeg');
      const buf = await encode(imageData, { quality });
      return new Blob([buf], { type: 'image/jpeg' });
    }
    case 'png': {
      const canvas2 = document.createElement('canvas');
      canvas2.width = imageData.width;
      canvas2.height = imageData.height;
      canvas2.getContext('2d')!.putImageData(imageData, 0, 0);
      return new Promise<Blob>((res, rej) =>
        canvas2.toBlob(b => b ? res(b) : rej(new Error('PNG export failed')), 'image/png')
      );
    }
    case 'webp': {
      const { encode } = await import('@jsquash/webp');
      const buf = await encode(imageData, { quality });
      return new Blob([buf], { type: 'image/webp' });
    }
    case 'avif': {
      const { encode } = await import('@/lib/wasm/avif-encode-st');
      // @jsquash/avif quality 0-100 where 100 ≈ lossless — cap at 75 to avoid huge files
      const buf = await encode(imageData, { quality: Math.min(quality, 75) });
      return new Blob([buf], { type: 'image/avif' });
    }
    default:
      throw new Error(`Unsupported output format: ${to}`);
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  defaultFrom: string;
  defaultTo: string;
}

export function ImageConverterCore({ defaultFrom, defaultTo }: Props) {
  const t = useTranslations('Tool');
  const safeFrom = (INPUT_FORMATS.includes(defaultFrom as ImageFormat)
    ? defaultFrom : 'png') as ImageFormat;
  const initTo = (OUTPUT_FORMATS.includes(defaultTo as ImageFormat) && defaultTo !== safeFrom
    ? defaultTo : (COMPAT[safeFrom][0] ?? OUTPUT_FORMATS[0])) as ImageFormat;

  const [from,       setFrom]       = useState<ImageFormat>(safeFrom);
  const [to,         setTo]         = useState<ImageFormat>(initTo);
  const [file,       setFile]       = useState<File | null>(null);
  const [originUrl,  setOriginUrl]  = useState<string | null>(null);
  const [result,     setResult]     = useState<{ blob: Blob; url: string } | null>(null);
  const [converting, setConverting] = useState(false);
  const [quality,    setQuality]    = useState(92);
  const [error,      setError]      = useState('');
  const [dragOver,   setDragOver]   = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const runIdRef = useRef(0);
  const originUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => { originUrlRef.current = originUrl; }, [originUrl]);
  useEffect(() => { resultUrlRef.current = result?.url ?? null; }, [result]);

  useEffect(() => () => {
    if (originUrlRef.current) URL.revokeObjectURL(originUrlRef.current);
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
  }, []);

  const clearResult = useCallback(() =>
    setResult(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return null; }), []);

  // ── Conversion runner ──────────────────────────────────────────────────────

  const runConvert = useCallback(async (f: File, fromFmt: ImageFormat, toFmt: ImageFormat, q: number) => {
    if (!checkRateLimit('img-convert', 8, 10000)) {
      setError(t('tooManyConversions'));
      return;
    }
    const id = ++runIdRef.current;
    setConverting(true);
    setError('');
    try {
      const blob = await convertImage(f, fromFmt, toFmt, q);
      if (id !== runIdRef.current) return; // superseded by a newer run — discard
      setResult(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return { blob, url: URL.createObjectURL(blob) }; });
    } catch (e) {
      if (id !== runIdRef.current) return;
      setError(e instanceof Error ? e.message : t('conversionFailed'));
    } finally {
      if (id === runIdRef.current) setConverting(false);
    }
  }, []);

  // New file → convert immediately
  useEffect(() => {
    if (file) runConvert(file, from, to, quality);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Format change → debounce 300 ms so rapid tapping doesn't stack WASM inits
  useEffect(() => {
    if (!file) return;
    const timer = setTimeout(() => runConvert(file, from, to, quality), 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  // Quality change → debounce 700 ms (slider drag)
  useEffect(() => {
    if (!file) return;
    const timer = setTimeout(() => runConvert(file, from, to, quality), 700);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    if (f.size > MAX_MB * 1024 * 1024) { setError(t('fileTooLargeSimple', { size: MAX_MB })); return; }
    const detected = detectFormat(f);
    setFrom(detected);
    const compat = COMPAT[detected];
    if (!compat.includes(to)) setTo(compat[0]);
    setError('');
    clearResult();
    setOriginUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(f); });
    setFile(f);
  }, [to, clearResult]);

  const handleToSelect = useCallback((newTo: ImageFormat) => {
    setTo(newTo);
    clearResult();
  }, [clearResult]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, [handleFile]);

  const handleReset = useCallback(() => {
    setFile(null); clearResult();
    setOriginUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setError(''); setFrom(safeFrom); setTo(initTo);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [clearResult, safeFrom, initTo]);

  const handleDownload = useCallback(() => {
    if (!result || !file) return;
    downloadBlob(result.blob, `${file.name.replace(/\.[^.]+$/, '')}.${FMT_EXT[to]}`);
  }, [result, file, to]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const compatOutputs = file ? COMPAT[from] : OUTPUT_FORMATS;
  const showQuality   = LOSSY.has(to);
  const sizeDiff      = result && file ? ((result.blob.size - file.size) / file.size * 100) : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <ImageTabBar mode={`${from}-to-${to}`} />

      {/* ── Convert To selector ── always visible at top ────────────────────── */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('convertTo')}</p>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_FORMATS.map(f => {
            const disabled = file && !compatOutputs.includes(f);
            const incompatNote = file && disabled
              ? `${FMT_LABEL[from]} cannot be converted to ${FMT_LABEL[f]}`
              : null;
            return (
              <div key={f} className="relative group">
                <button
                  onClick={() => !disabled && handleToSelect(f)}
                  disabled={!!disabled}
                  className={`px-5 py-2.5 text-sm font-bold rounded-xl border transition-all ${
                    to === f && !disabled
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : disabled
                      ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-white cursor-pointer'
                  }`}
                >
                  {FMT_LABEL[f]}
                </button>
                {incompatNote && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {incompatNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {file && (
          <p className="text-xs text-slate-600 mt-2">
            {t('detected')} <span className="text-slate-400 font-medium">{FMT_LABEL[from]}</span>
            {' · '}{t('canConvertTo')} {compatOutputs.map(f => FMT_LABEL[f]).join(', ')}
          </p>
        )}
      </div>

      {/* ── All-formats notice ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
        <span className="material-symbols-outlined text-indigo-400 text-base flex-shrink-0 mt-0.5">info</span>
        <p className="text-sm text-indigo-200">
          <span className="font-semibold">{t('anyFormatTitle')} —</span> {t('anyFormatDesc')}
        </p>
      </div>


      {/* ── Upload zone ─────────────────────────────────────────────────────── */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-all duration-200 select-none ${
            dragOver
              ? 'border-indigo-400 bg-indigo-900/20 scale-[1.01]'
              : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/20'
          }`}
        >
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-slate-400">upload_file</span>
            </div>
            <div>
              <p className="text-slate-100 font-semibold text-lg">{t('dropImageHere')}</p>
              <p className="text-slate-500 text-sm mt-1">{t('formatAutoDetected')}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {INPUT_FORMATS.map(f => (
                <span key={f} className="text-xs px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 font-medium">
                  {FMT_LABEL[f]}
                </span>
              ))}
            </div>
            <p className="text-slate-600 text-xs">{t('processedLocally', { size: MAX_MB })}</p>
          </div>
          <input ref={fileInputRef} type="file" accept={ALL_ACCEPT}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            className="hidden" />
        </div>
      ) : (

        /* ── After upload ────────────────────────────────────────────────── */
        <div className="space-y-5">
          {/* File info bar */}
          <div className="flex items-center justify-between py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-slate-400 text-lg flex-shrink-0">image</span>
              <span className="text-slate-200 text-sm font-medium truncate">{file.name}</span>
              <span className="text-slate-500 text-xs hidden sm:inline flex-shrink-0">{formatBytes(file.size)}</span>
              <span className="text-xs px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-slate-400 font-bold flex-shrink-0">
                {FMT_LABEL[from]}
              </span>
            </div>
            <button onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 ml-3">
              <span className="material-symbols-outlined text-sm">close</span>{t('remove')}
            </button>
          </div>

          {/* Side-by-side preview */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('original')} · {FMT_LABEL[from]}</p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {originUrl && <img src={originUrl} alt="Original" className="w-full block" loading="lazy" decoding="async" />}
              </div>
              <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
            </div>

            {/* Converted */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('converted')} · <span className="text-indigo-400">{FMT_LABEL[to]}</span>
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                {converting ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="w-7 h-7 border-2 border-slate-700 border-t-indigo-400 rounded-full animate-spin" />
                    <span className="text-xs text-slate-500">{t('converting')}</span>
                  </div>
                ) : result ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={result.url} alt="Converted" className="w-full block" loading="lazy" decoding="async" />
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-slate-700 text-xs">{t('ready')}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 h-4">
                {result && (
                  <>
                    <p className="text-xs text-slate-500">{formatBytes(result.blob.size)}</p>
                    {sizeDiff !== null && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        sizeDiff <= 0 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'
                      }`}>
                        {sizeDiff > 0 ? '+' : ''}{sizeDiff.toFixed(0)}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quality slider */}
          {showQuality && (
            <div className="flex items-center gap-4 py-1">
              <label className="text-sm text-slate-400 w-16 flex-shrink-0">{t('quality')}</label>
              <input type="range" min={1} max={100} value={quality}
                onChange={(e) => { setQuality(Number(e.target.value)); clearResult(); }}
                style={{ touchAction: 'pan-y' }}
                className="flex-1 accent-indigo-500 cursor-pointer" />
              <span className="text-sm text-slate-300 w-10 text-right font-mono tabular-nums">{quality}%</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 text-sm text-red-300 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => file && !converting && runConvert(file, from, to, quality)}
              disabled={converting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {converting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('converting')}</>
                : <><span className="material-symbols-outlined text-base">sync</span>{result ? t('reconvertTo', { format: FMT_LABEL[to] }) : t('convertToFormat', { format: FMT_LABEL[to] })}</>
              }
            </button>
            {result && (
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors">
                <span className="material-symbols-outlined text-base">download</span>
                {t('downloadFormat', { format: FMT_LABEL[to] })}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

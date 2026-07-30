'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cropImage, resizeImage, downloadBlob, formatBytes } from '@/lib/tools/image-processor';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import { ImageTabBar } from './ImageTabBar';
import type { ProcessOptions } from '@/types/tools';

// ── Types ─────────────────────────────────────────────────────────────────────

export type EditorMode = 'crop' | 'resize';

interface CropRect { x: number; y: number; w: number; h: number; }
type DragHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se';

interface Props { defaultMode: EditorMode; }

const MAX_MB = 50;
const ALL_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

const RESIZE_PRESETS = [
  { groupKey: 'groupShortVideo', items: [
    { labelKey: 'presetTiktok',           sub: '9:16',      w: 1080, h: 1920 },
    { labelKey: 'presetXhsPortraitCover', sub: '3:4',       w: 1242, h: 1660 },
    { labelKey: 'presetXhsVideoPortrait', sub: '3:4',       w: 1080, h: 1440 },
    { labelKey: 'presetInstagramPortrait',sub: '4:5',       w: 1080, h: 1350 },
  ]},
  { groupKey: 'groupLandscape', items: [
    { labelKey: 'presetYtBilibili',       sub: '16:9 HD',   w: 1280, h:  720 },
    { labelKey: 'presetBilibiliFullHd',   sub: '16:9 1080p',w: 1920, h: 1080 },
    { labelKey: 'presetBilibiliUpload',   sub: '16:10',     w: 1146, h:  717 },
    { labelKey: 'presetBilibiliHome',     sub: '4:3',       w:  960, h:  720 },
    { labelKey: 'presetXhsLandscape',     sub: '4:3',       w: 1200, h:  900 },
  ]},
  { groupKey: 'groupSquare', items: [
    { labelKey: 'presetXhsSquare',        sub: '1:1',       w: 1080, h: 1080 },
    { labelKey: 'presetWechatOa',         sub: '16:9',      w:  900, h:  500 },
    { labelKey: 'presetTwitterShare',     sub: '16:9',      w: 1200, h:  675 },
    { labelKey: 'presetWallpaper4k',      sub: '16:9',      w: 3840, h: 2160 },
  ]},
  { groupKey: 'groupId', items: [
    { labelKey: 'presetIdPhoto1',         sub: '25×35 mm',  w: 295, h: 413 },
    { labelKey: 'presetIdPhoto2',         sub: '35×49 mm',  w: 413, h: 579 },
    { labelKey: 'presetPassport',         sub: '33×48 mm',  w: 390, h: 567 },
    { labelKey: 'presetDriverLicense',    sub: '22×32 mm',  w: 260, h: 378 },
  ]},
] as const;

// ── Live preview helper ───────────────────────────────────────────────────────

function drawCropPreview(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  crop: CropRect,
) {
  const { x, y, w, h } = crop;
  if (w <= 0 || h <= 0) return;
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
}

function drawResizePreview(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
) {
  if (targetW <= 0 || targetH <= 0) return;
  canvas.width  = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);
}

// ── Visual Crop Editor sub-component ─────────────────────────────────────────

function CropEditor({
  src, naturalW, naturalH, crop, onChange,
}: {
  src: string;
  naturalW: number;
  naturalH: number;
  crop: CropRect;
  onChange: (r: CropRect) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const syncSize = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) setImgSize({ w: r.width, h: r.height });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', syncSize);
    return () => window.removeEventListener('resize', syncSize);
  }, [syncSize]);

  const sx = imgSize.w > 0 ? imgSize.w / naturalW : 0;
  const sy = imgSize.h > 0 ? imgSize.h / naturalH : 0;
  const cx = crop.x * sx, cy = crop.y * sy;
  const cw = crop.w * sx, ch = crop.h * sy;

  const startDrag = useCallback((e: React.PointerEvent, type: DragHandle) => {
    e.preventDefault(); e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    syncSize();
    const scaleX = naturalW / (imgRef.current?.getBoundingClientRect().width ?? 1);
    const scaleY = naturalH / (imgRef.current?.getBoundingClientRect().height ?? 1);
    const startX = e.clientX, startY = e.clientY;
    const sr = { ...crop };
    const minPx = 20;

    const onMove = (me: PointerEvent) => {
      const dx = (me.clientX - startX) * scaleX;
      const dy = (me.clientY - startY) * scaleY;
      let { x, y, w, h } = sr;
      if (type === 'move') {
        x = Math.max(0, Math.min(naturalW - w, sr.x + dx));
        y = Math.max(0, Math.min(naturalH - h, sr.y + dy));
      } else {
        if (type === 'nw' || type === 'sw') { const nx = Math.max(0, Math.min(sr.x + sr.w - minPx, sr.x + dx)); w = Math.max(minPx, sr.w - (nx - sr.x)); x = nx; }
        if (type === 'ne' || type === 'se') { w = Math.max(minPx, Math.min(naturalW - sr.x, sr.w + dx)); }
        if (type === 'nw' || type === 'ne') { const ny = Math.max(0, Math.min(sr.y + sr.h - minPx, sr.y + dy)); h = Math.max(minPx, sr.h - (ny - sr.y)); y = ny; }
        if (type === 'sw' || type === 'se') { h = Math.max(minPx, Math.min(naturalH - sr.y, sr.h + dy)); }
      }
      onChange({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
    };
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [crop, naturalW, naturalH, onChange, syncSize]);

  const handles: { type: DragHandle; cursor: string }[] = [
    { type: 'nw', cursor: 'nw-resize' }, { type: 'ne', cursor: 'ne-resize' },
    { type: 'sw', cursor: 'sw-resize' }, { type: 'se', cursor: 'se-resize' },
  ];

  return (
    <div className="relative select-none touch-none rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef} src={src} alt="crop editor"
        className="block w-full"
        onLoad={syncSize} draggable={false}
      />
      {imgSize.w > 0 && (
        <>
          <div className="absolute left-0 right-0 bg-black/60 pointer-events-none" style={{ top: 0, height: cy }} />
          <div className="absolute left-0 right-0 bg-black/60 pointer-events-none" style={{ top: cy + ch, bottom: 0 }} />
          <div className="absolute bg-black/60 pointer-events-none" style={{ top: cy, left: 0, width: cx, height: ch }} />
          <div className="absolute bg-black/60 pointer-events-none" style={{ top: cy, left: cx + cw, right: 0, height: ch }} />
          <div
            className="absolute border-2 border-white"
            style={{ left: cx, top: cy, width: cw, height: ch, cursor: 'move', boxSizing: 'border-box' }}
            onPointerDown={(e) => startDrag(e, 'move')}
          >
            {[33.33, 66.66].map(p => (
              <div key={p}>
                <div className="absolute top-0 bottom-0 border-r border-white/25 pointer-events-none" style={{ left: `${p}%` }} />
                <div className="absolute left-0 right-0 border-b border-white/25 pointer-events-none" style={{ top: `${p}%` }} />
              </div>
            ))}
          </div>
          {handles.map(h => {
            const centerX = (h.type === 'nw' || h.type === 'sw') ? cx : cx + cw;
            const centerY = (h.type === 'nw' || h.type === 'ne') ? cy : cy + ch;
            return (
              <div key={h.type}
                className="absolute z-10 flex items-center justify-center"
                style={{ left: centerX - 22, top: centerY - 22, width: 44, height: 44, cursor: h.cursor, touchAction: 'none' }}
                onPointerDown={(e) => startDrag(e, h.type)}
              >
                <div className="w-4 h-4 bg-white border-2 border-slate-400 rounded-sm shadow-md pointer-events-none" />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ImageCropResizeCore({ defaultMode }: Props) {
  const t = useTranslations('Tool');
  const [mode,       setMode]       = useState<EditorMode>(defaultMode);
  const [file,       setFile]       = useState<File | null>(null);
  const [originUrl,  setOriginUrl]  = useState<string | null>(null);
  const [naturalW,   setNaturalW]   = useState(0);
  const [naturalH,   setNaturalH]   = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error,      setError]      = useState('');
  const [dragOver,   setDragOver]   = useState(false);
  const [result,     setResult]     = useState<{ blob: Blob; url: string; filename: string } | null>(null);

  // Crop state
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  // Resize state
  const [resizeW,    setResizeW]    = useState('');
  const [resizeH,    setResizeH]    = useState('');
  const [maintainAR, setMaintainAR] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<{ w: number; h: number } | null>(null);

  // Quality
  const [quality, setQuality] = useState(92);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => () => {
    if (originUrl) URL.revokeObjectURL(originUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Live preview canvas ────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const img = imgElRef.current;
    if (!canvas || !img || naturalW === 0) return;

    if (mode === 'crop') {
      drawCropPreview(canvas, img, crop);
    } else {
      const tw = parseInt(resizeW) || naturalW;
      const th = parseInt(resizeH) || naturalH;
      drawResizePreview(canvas, img, tw, th);
    }
  }, [mode, crop, resizeW, resizeH, naturalW, naturalH, result]);

  // ── Aspect ratio lock for resize ───────────────────────────────────────────

  const handleResizeW = (val: string) => {
    setResizeW(val);
    if (maintainAR && naturalW > 0 && naturalH > 0 && val) {
      const w = parseInt(val);
      if (!isNaN(w)) setResizeH(String(Math.round(w * naturalH / naturalW)));
    }
  };
  const handleResizeH = (val: string) => {
    setResizeH(val);
    if (maintainAR && naturalW > 0 && naturalH > 0 && val) {
      const h = parseInt(val);
      if (!isNaN(h)) setResizeW(String(Math.round(h * naturalW / naturalH)));
    }
  };

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) { setError(t('errors.invalidType', { types: 'JPG, PNG, WebP' })); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(t('fileTooLargeSimple', { size: MAX_MB })); return; }

    setError('');
    setResult(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return null; });
    setOriginUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });

    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      setNaturalW(w); setNaturalH(h);
      setCrop({ x: 0, y: 0, w, h });
      setSelectedPreset(prev => {
        if (prev) { setResizeW(String(prev.w)); setResizeH(String(prev.h)); return prev; }
        setResizeW(String(w)); setResizeH(String(h)); return null;
      });
      imgElRef.current = img;
      setOriginUrl(url);
      setFile(f);
    };
    img.onerror = () => { URL.revokeObjectURL(url); setError(t('errors.processingFailed')); };
    img.src = url;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, [handleFile]);

  const handleReset = useCallback(() => {
    setFile(null); setNaturalW(0); setNaturalH(0);
    setResult(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return null; });
    setOriginUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setError('');
    imgElRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ── Process ────────────────────────────────────────────────────────────────

  const handleProcess = useCallback(async () => {
    if (!file) return;
    if (!checkRateLimit('crop-resize', 15, 60000)) { setError(t('tooManyRequests')); return; }

    setProcessing(true);
    setError('');
    try {
      const opts: ProcessOptions = { quality };
      let blob: Blob, filename: string;
      const base = file.name.replace(/\.[^.]+$/, '');
      const ext = file.type.includes('png') ? 'png' : 'jpg';

      if (mode === 'crop') {
        const res = await cropImage(file, {
          ...opts,
          cropX: crop.x, cropY: crop.y,
          cropWidth:  crop.w || naturalW,
          cropHeight: crop.h || naturalH,
        });
        blob = res.blob; filename = `${base}_cropped.${ext}`;
      } else {
        const tw = parseInt(resizeW) || naturalW;
        const th = parseInt(resizeH) || naturalH;
        const res = await resizeImage(file, { ...opts, width: tw, height: th, maintainAspectRatio: false });
        blob = res.blob; filename = `${base}_${tw}x${th}.${ext}`;
      }

      setResult(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return { blob, url: URL.createObjectURL(blob), filename }; });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.processingFailed'));
    } finally {
      setProcessing(false);
    }
  }, [file, mode, crop, resizeW, resizeH, naturalW, naturalH, quality]);

  // Keep a fresh ref so the quality-change debounce always calls the latest version
  const handleProcessRef = useRef(handleProcess);
  useEffect(() => { handleProcessRef.current = handleProcess; });

  const qualityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!file || !result) return;
    if (qualityTimerRef.current) clearTimeout(qualityTimerRef.current);
    qualityTimerRef.current = setTimeout(() => handleProcessRef.current(), 400);
    return () => { if (qualityTimerRef.current) clearTimeout(qualityTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality]);

  // ── Preview dimensions ─────────────────────────────────────────────────────

  const previewW = mode === 'crop' ? (crop.w || naturalW) : (parseInt(resizeW) || naturalW);
  const previewH = mode === 'crop' ? (crop.h || naturalH) : (parseInt(resizeH) || naturalH);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <ImageTabBar mode={mode === 'crop' ? 'crop-image' : 'resize-image'} />

      {/* Upload zone */}
      {!file ? (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-all select-none ${
              dragOver
                ? 'border-indigo-400 bg-indigo-900/20 scale-[1.01]'
                : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'
            }`}
          >
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-slate-400">
                  {mode === 'crop' ? 'crop' : 'photo_size_select_large'}
                </span>
              </div>
              <div>
                <p className="text-slate-200 font-semibold">{t('dropImageHere')}</p>
                <p className="text-slate-500 text-sm mt-1">
                  {mode === 'crop' ? t('cropEditorWillOpen') : t('setCustomDimensions')}
                </p>
              </div>
              {mode === 'resize' && selectedPreset && (
                <p className="text-indigo-400 text-sm font-medium">
                  {t('presetTargetSize', { w: selectedPreset.w, h: selectedPreset.h })}
                </p>
              )}
              <p className="text-slate-600 text-xs">{t('maxFileSizeFormats', { size: MAX_MB })}</p>
            </div>
            <input ref={fileInputRef} type="file" accept={ALL_ACCEPT}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              className="hidden" />
          </div>

          {/* Pre-upload resize presets */}
          {mode === 'resize' && (
            <div className="space-y-3 mt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('presetQuickPresets')} — {t('presetQuickPresetsHint')}
              </p>
              {RESIZE_PRESETS.map(group => (
                <div key={group.groupKey}>
                  <p className="text-[11px] text-slate-600 font-medium uppercase tracking-wider mb-1.5">{t(group.groupKey)}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(item => {
                      const active = selectedPreset?.w === item.w && selectedPreset?.h === item.h;
                      return (
                        <button
                          key={`${item.w}x${item.h}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedPreset({ w: item.w, h: item.h }); setResizeW(String(item.w)); setResizeH(String(item.h)); setMaintainAR(false); }}
                          className={`flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-all ${
                            active
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-600 text-slate-300'
                          }`}
                        >
                          <span className="text-xs font-medium leading-tight">{t(item.labelKey)}</span>
                          <span className={`text-[10px] font-mono mt-0.5 ${active ? 'text-indigo-400' : 'text-slate-600'}`}>
                            {item.sub} · {item.w}×{item.h}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-slate-400 text-lg flex-shrink-0">image</span>
              <span className="text-slate-200 text-sm font-medium truncate">{file.name}</span>
              <span className="text-slate-500 text-xs hidden sm:inline">
                {naturalW}×{naturalH}px · {formatBytes(file.size)}
              </span>
            </div>
            <button onClick={handleReset} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0 ml-3">
              <span className="material-symbols-outlined text-sm">close</span>{t('changeFile')}
            </button>
          </div>

          {/* Left-right split: editor | preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* ── Left: editor + controls ── */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {mode === 'crop' ? t('dragCornersToCrop') : t('original')}
              </p>

              {mode === 'crop' && originUrl && naturalW > 0 ? (
                <CropEditor
                  src={originUrl}
                  naturalW={naturalW} naturalH={naturalH}
                  crop={crop}
                  onChange={setCrop}
                />
              ) : (
                originUrl && (
                  <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={originUrl} alt="Original" className="w-full block" />
                  </div>
                )
              )}

              {/* Crop info */}
              {mode === 'crop' && naturalW > 0 && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-200 font-semibold">{crop.w} × {crop.h} px</span>
                  <span className="text-slate-600">at ({crop.x}, {crop.y})</span>
                  <button
                    className="ml-auto text-indigo-400 hover:text-indigo-300 transition-colors font-sans"
                    onClick={() => setCrop({ x: 0, y: 0, w: naturalW, h: naturalH })}
                  >{t('resetLabel')}</button>
                </div>
              )}

              {/* Resize inputs */}
              {mode === 'resize' && (
                <div className="space-y-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                  {/* Compact presets */}
                  <div className="space-y-2">
                    {RESIZE_PRESETS.map(group => (
                      <div key={group.groupKey}>
                        <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider mb-1">{t(group.groupKey)}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.items.map(item => {
                            const active = resizeW === String(item.w) && resizeH === String(item.h);
                            return (
                              <button
                                key={`${item.w}x${item.h}`}
                                onClick={() => { setSelectedPreset({ w: item.w, h: item.h }); setResizeW(String(item.w)); setResizeH(String(item.h)); setMaintainAR(false); setResult(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return null; }); }}
                                className={`px-2 py-1 rounded text-[10.5px] font-medium border transition-all ${
                                  active
                                    ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300'
                                    : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-400'
                                }`}
                              >
                                {t(item.labelKey)} <span className="opacity-60">{item.w}×{item.h}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">{t('width')}</label>
                      <input type="number" value={resizeW} onChange={(e) => handleResizeW(e.target.value)}
                        className="input-field px-3 py-2.5 text-sm w-full" placeholder={t('width')} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1.5 block">{t('height')}</label>
                      <input type="number" value={resizeH} onChange={(e) => handleResizeH(e.target.value)}
                        className="input-field px-3 py-2.5 text-sm w-full" placeholder={t('height')} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={maintainAR} onChange={(e) => setMaintainAR(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500" />
                    <span className="text-slate-400 text-sm">{t('maintainAspectRatio')}</span>
                  </label>
                  <p className="text-xs text-slate-600 font-mono">{t('original')}: {naturalW} × {naturalH} px</p>
                </div>
              )}

              {/* Quality */}
              <div className="flex items-center gap-4 py-1">
                <label className="text-sm text-slate-400 w-16 flex-shrink-0">{t('quality')}</label>
                <input type="range" min={10} max={100} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ touchAction: 'pan-y' }}
                  className="flex-1 accent-indigo-500 cursor-pointer" />
                <span className="text-sm text-slate-300 w-10 text-right font-mono">{quality}%</span>
              </div>
              {file?.type.includes('jpeg') && quality > 85 && (
                <p className="text-amber-400/80 text-xs -mt-1">{t('jpegHighQualityWarning')}</p>
              )}
            </div>

            {/* ── Right: live preview + actions ── */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between flex-shrink-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {result ? t('result') : t('livePreview')}
                </p>
                <span className="text-xs text-slate-600 font-mono">{previewW} × {previewH} px</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                {result ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={result.url} alt="Result" className="w-full block" />
                ) : (
                  <canvas ref={previewCanvasRef} className="w-full block" style={{ imageRendering: 'auto' }} />
                )}
              </div>

              {result && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">{formatBytes(result.blob.size)}</span>
                  {file && (
                    <span className={`font-semibold px-1.5 py-0.5 rounded ${
                      result.blob.size <= file.size ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'
                    }`}>
                      {result.blob.size <= file.size ? '-' : '+'}
                      {Math.abs(Math.round((result.blob.size - file.size) / file.size * 100))}%
                    </span>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-300 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
                  {error}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                {!result ? (
                  <button onClick={handleProcess} disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
                    {processing
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('processing')}</>
                      : <><span className="material-symbols-outlined text-base">{mode === 'crop' ? 'crop' : 'photo_size_select_large'}</span>
                          {mode === 'crop' ? t('cropToSize', { w: crop.w, h: crop.h }) : t('resizeToSize', { w: resizeW, h: resizeH })}</>
                    }
                  </button>
                ) : (
                  <>
                    <button onClick={() => downloadBlob(result.blob, result.filename)}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors">
                      <span className="material-symbols-outlined text-base">download</span>{t('download')}
                    </button>
                    <button onClick={() => setResult(prev => { if (prev?.url) URL.revokeObjectURL(prev.url); return null; })}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors">
                      <span className="material-symbols-outlined text-base">refresh</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

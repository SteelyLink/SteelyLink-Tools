'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ImageTabBar } from './ImageTabBar';
import { useTranslations } from 'next-intl';
import {
  rotateImage, compressImage,
  downloadBlob, formatBytes,
} from '@/lib/tools/image-processor';
import { applyFilters } from '@/lib/tools/image-effects';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import type { ImageMode, ProcessOptions, ProcessResult, CompressFormat } from '@/types/tools';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  mode: ImageMode;
  maxFileSizeMB: number;
  acceptedFormats: string[];
}

interface CropRect { x: number; y: number; w: number; h: number; }
type DragHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se';

// ─── Resize presets ───────────────────────────────────────────────────────────
const RESIZE_PRESETS = [
  {
    group: '短视频 & 竖版',
    items: [
      { label: 'TikTok · 抖音 · IG Story', sub: '9:16', w: 1080, h: 1920 },
      { label: '小红书 竖版图文封面',       sub: '3:4',  w: 1242, h: 1660 },
      { label: '小红书 视频竖版封面',       sub: '3:4',  w: 1080, h: 1440 },
      { label: 'Instagram Portrait',        sub: '4:5',  w: 1080, h: 1350 },
    ],
  },
  {
    group: '横版封面',
    items: [
      { label: 'YouTube · B站 视频封面',   sub: '16:9 HD',    w: 1280, h: 720  },
      { label: 'Full HD · B站个人空间头图', sub: '16:9 1080p', w: 1920, h: 1080 },
      { label: 'B站 投稿封面',             sub: '16:10',      w: 1146, h: 717  },
      { label: 'B站 首页推荐封面',         sub: '4:3',        w: 960,  h: 720  },
      { label: '小红书 横版封面',          sub: '4:3',        w: 1200, h: 900  },
    ],
  },
  {
    group: '方形 & 其他平台',
    items: [
      { label: '小红书 · Instagram 方形', sub: '1:1',  w: 1080, h: 1080 },
      { label: '微信公众号首图',           sub: '16:9', w: 900,  h: 500  },
      { label: 'Twitter · X 分享图',      sub: '16:9', w: 1200, h: 675  },
      { label: '4K 壁纸',                 sub: '16:9', w: 3840, h: 2160 },
    ],
  },
  {
    group: '证件照 (300 dpi)',
    items: [
      { label: '1寸证件照', sub: '25×35 mm', w: 295, h: 413 },
      { label: '2寸证件照', sub: '35×49 mm', w: 413, h: 579 },
      { label: '护照照片',  sub: '33×48 mm', w: 390, h: 567 },
      { label: '驾照照片',  sub: '22×32 mm', w: 260, h: 378 },
    ],
  },
] as const;

// ─── Output format alternatives for each converter page ───────────────────────
const conversionOutputs: Partial<Record<ImageMode, { mode: ImageMode; label: string }[]>> = {
  'png-to-jpg':  [{ mode: 'png-to-jpg',  label: 'JPG' }, { mode: 'png-to-webp', label: 'WebP' }],
  'png-to-webp': [{ mode: 'png-to-webp', label: 'WebP' }, { mode: 'png-to-jpg', label: 'JPG' }],
  'jpg-to-png':  [{ mode: 'jpg-to-png',  label: 'PNG' }, { mode: 'jpg-to-webp', label: 'WebP' }],
  'jpg-to-webp': [{ mode: 'jpg-to-webp', label: 'WebP' }, { mode: 'jpg-to-png', label: 'PNG' }],
  'webp-to-jpg': [{ mode: 'webp-to-jpg', label: 'JPG' }, { mode: 'webp-to-png', label: 'PNG' }],
  'webp-to-png': [{ mode: 'webp-to-png', label: 'PNG' }, { mode: 'webp-to-jpg', label: 'JPG' }],
  'heic-to-jpg': [{ mode: 'heic-to-jpg', label: 'JPG' }, { mode: 'heic-to-png', label: 'PNG' }],
  'heic-to-png': [{ mode: 'heic-to-png', label: 'PNG' }, { mode: 'heic-to-jpg', label: 'JPG' }],
  'avif-to-jpg': [{ mode: 'avif-to-jpg', label: 'JPG' }, { mode: 'avif-to-png', label: 'PNG' }],
  'avif-to-png': [{ mode: 'avif-to-png', label: 'PNG' }, { mode: 'avif-to-jpg', label: 'JPG' }],
  'svg-to-png':  [{ mode: 'svg-to-png',  label: 'PNG' }, { mode: 'svg-to-jpg', label: 'JPG' }],
  'svg-to-jpg':  [{ mode: 'svg-to-jpg',  label: 'JPG' }, { mode: 'svg-to-png', label: 'PNG' }],
};

// Modes where output is always lossless (PNG) — no quality applies
const alwaysLosslessModes = new Set<ImageMode>([
  'jpg-to-png', 'webp-to-png', 'heic-to-png', 'avif-to-png', 'svg-to-png',
]);

// ─── modeConfig ───────────────────────────────────────────────────────────────
const modeConfig: Record<ImageMode, { accept: string; label: string }> = {
  'png-to-jpg':   { accept: 'image/png', label: 'PNG' },
  'jpg-to-png':   { accept: 'image/jpeg,image/jpg', label: 'JPG / JPEG' },
  'webp-to-jpg':  { accept: 'image/webp', label: 'WebP' },
  'jpg-to-webp':  { accept: 'image/jpeg,image/jpg,image/png', label: 'JPG / PNG' },
  'compress-image': { accept: 'image/jpeg,image/jpg,image/png,image/webp,image/avif', label: 'JPG / PNG / WebP / AVIF' },
  'resize-image': { accept: 'image/jpeg,image/jpg,image/png,image/webp', label: 'JPG / PNG / WebP' },
  'crop-image':   { accept: 'image/jpeg,image/jpg,image/png,image/webp', label: 'JPG / PNG / WebP' },
  'rotate-image': { accept: 'image/jpeg,image/jpg,image/png,image/webp', label: 'JPG / PNG / WebP' },
  'webp-to-png':  { accept: 'image/webp', label: 'WebP' },
  'png-to-webp':  { accept: 'image/png', label: 'PNG' },
  'heic-to-jpg':  { accept: '.heic,.heif,image/heic,image/heif', label: 'HEIC / HEIF' },
  'heic-to-png':  { accept: '.heic,.heif,image/heic,image/heif', label: 'HEIC / HEIF' },
  'avif-to-jpg':  { accept: 'image/avif', label: 'AVIF' },
  'avif-to-png':  { accept: 'image/avif', label: 'AVIF' },
  'svg-to-png':   { accept: 'image/svg+xml,.svg', label: 'SVG' },
  'svg-to-jpg':   { accept: 'image/svg+xml,.svg', label: 'SVG' },
  'image-filter': { accept: 'image/jpeg,image/jpg,image/png,image/webp', label: 'JPG / PNG / WebP' },
  // Handled by VideoGifCore — included here only for type completeness
  'video-to-gif': { accept: 'video/mp4,video/webm,video/quicktime', label: 'MP4 / WebM / MOV' },
  'mp4-to-gif':   { accept: 'video/mp4', label: 'MP4' },
};

// ─── processFile ──────────────────────────────────────────────────────────────
async function processFile(file: File, mode: ImageMode, options: ProcessOptions): Promise<ProcessResult> {
  const name = file.name.replace(/\.[^/.]+$/, '');
  switch (mode) {
    case 'rotate-image':  return rotateImage(file, options);
    case 'image-filter': {
      const blob = await applyFilters(file, {
        brightness: options.brightness,
        contrast: options.contrast,
        saturation: options.saturation,
        hue: options.hue,
        blur: options.blur,
        grayscale: options.grayscale,
        sepia: options.sepia,
        invert: options.invert,
      });
      const ext = file.type.includes('png') ? 'png' : 'jpg';
      return { blob, filename: `${name}_filtered.${ext}`, originalSize: file.size, newSize: blob.size };
    }
    default:
      throw new Error(`Unsupported mode: ${mode}`);
  }
}

// ─── CropEditor ───────────────────────────────────────────────────────────────
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
  const scaleRef = useRef({ x: 1, y: 1 });

  const updateScale = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      scaleRef.current = { x: naturalW / rect.width, y: naturalH / rect.height };
      setImgSize({ w: rect.width, h: rect.height });
    }
  }, [naturalW, naturalH]);

  useEffect(() => {
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  // Display-space crop coordinates
  const sx = imgSize.w > 0 ? imgSize.w / naturalW : 0;
  const sy = imgSize.h > 0 ? imgSize.h / naturalH : 0;
  const cx = crop.x * sx;
  const cy = crop.y * sy;
  const cw = crop.w * sx;
  const ch = crop.h * sy;

  const startDrag = useCallback((e: React.PointerEvent, type: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateScale();
    const { x: scaleX, y: scaleY } = scaleRef.current;
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
        if (type === 'nw' || type === 'sw') {
          const nx = Math.max(0, Math.min(sr.x + sr.w - minPx, sr.x + dx));
          w = Math.max(minPx, sr.w - (nx - sr.x));
          x = nx;
        }
        if (type === 'ne' || type === 'se') {
          w = Math.max(minPx, Math.min(naturalW - sr.x, sr.w + dx));
        }
        if (type === 'nw' || type === 'ne') {
          const ny = Math.max(0, Math.min(sr.y + sr.h - minPx, sr.y + dy));
          h = Math.max(minPx, sr.h - (ny - sr.y));
          y = ny;
        }
        if (type === 'sw' || type === 'se') {
          h = Math.max(minPx, Math.min(naturalH - sr.y, sr.h + dy));
        }
      }
      onChange({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [crop, naturalW, naturalH, onChange, updateScale]);

  const handles: { type: DragHandle; cursor: string }[] = [
    { type: 'nw', cursor: 'nw-resize' },
    { type: 'ne', cursor: 'ne-resize' },
    { type: 'sw', cursor: 'sw-resize' },
    { type: 'se', cursor: 'se-resize' },
  ];

  return (
    <div className="space-y-3">
      {/* Image with crop overlay */}
      <div className="relative select-none touch-none rounded-xl overflow-hidden bg-slate-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt="crop editor"
          className="block w-full"
          style={{ maxHeight: 600, objectFit: 'contain' }}
          onLoad={updateScale}
          draggable={false}
        />
        {imgSize.w > 0 && (
          <>
            {/* 4 overlay panels (no overflow:hidden clipping needed) */}
            {/* Top */}
            <div className="absolute left-0 right-0 bg-black/55 pointer-events-none" style={{ top: 0, height: cy }} />
            {/* Bottom */}
            <div className="absolute left-0 right-0 bg-black/55 pointer-events-none" style={{ top: cy + ch, bottom: 0 }} />
            {/* Left */}
            <div className="absolute bg-black/55 pointer-events-none" style={{ top: cy, left: 0, width: cx, height: ch }} />
            {/* Right */}
            <div className="absolute bg-black/55 pointer-events-none" style={{ top: cy, left: cx + cw, right: 0, height: ch }} />

            {/* Crop box */}
            <div
              className="absolute border-2 border-white"
              style={{ left: cx, top: cy, width: cw, height: ch, cursor: 'move', boxSizing: 'border-box', touchAction: 'none' }}
              onPointerDown={(e) => startDrag(e, 'move')}
            >
              {/* Rule-of-thirds grid */}
              {[33.33, 66.66].map(pct => (
                <div key={pct}>
                  <div className="absolute top-0 bottom-0 border-r border-white/25 pointer-events-none" style={{ left: `${pct}%` }} />
                  <div className="absolute left-0 right-0 border-b border-white/25 pointer-events-none" style={{ top: `${pct}%` }} />
                </div>
              ))}
            </div>

            {/* Corner handles */}
            {handles.map(h => {
              const hLeft = (h.type === 'nw' || h.type === 'sw') ? cx - 8 : cx + cw - 8;
              const hTop  = (h.type === 'nw' || h.type === 'ne') ? cy - 8 : cy + ch - 8;
              return (
                <div
                  key={h.type}
                  className="absolute w-4 h-4 bg-white border-2 border-slate-700 rounded-sm z-10"
                  style={{ left: hLeft, top: hTop, cursor: h.cursor }}
                  onPointerDown={(e) => startDrag(e, h.type)}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Crop dimensions display */}
      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
        <span className="text-slate-300 font-medium">{crop.w} × {crop.h} px</span>
        <span className="text-slate-600">offset ({crop.x}, {crop.y})</span>
        <button
          className="ml-auto text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
          onClick={() => onChange({ x: 0, y: 0, w: naturalW, h: naturalH })}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ImageEditorCore({ mode, maxFileSizeMB }: Props) {
  const t = useTranslations('Tool');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Output format (can differ from page mode on converter pages)
  const [outputMode, setOutputMode] = useState<ImageMode>(mode);

  // Quality / lossless
  const [lossless, setLossless] = useState(false);
  const [quality, setQuality] = useState(85);

  // Resize options
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maintainAR, setMaintainAR] = useState(true);

  // Crop state (visual editor)
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  // Rotate
  const [degrees, setDegrees] = useState<90 | 180 | 270>(90);

  // Filter options
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);
  const [invert, setInvert] = useState(false);

  // Compress live-preview state
  const [compressFormat, setCompressFormat]             = useState<CompressFormat | 'auto'>('auto');
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize]             = useState<number>(0);
  const [splitX, setSplitX]                             = useState(50);
  const [compareMode, setCompareMode]                   = useState<'split' | 'side'>('split');
  const [liveCompressing, setLiveCompressing]           = useState(false);
  const compressedUrlRef     = useRef<string | null>(null);
  const compressedBlobRef    = useRef<{ blob: Blob; filename: string } | null>(null);
  const compressTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewUrlRef       = useRef<string | null>(null);
  const resultPreviewUrlRef = useRef<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rotateCanvasRef = useRef<HTMLCanvasElement>(null);
  const config = modeConfig[mode];

  // Derived flags
  const outputOptions = conversionOutputs[mode];
  const isLosslessOutput = alwaysLosslessModes.has(outputMode);
  const showQualityToggle = !!outputOptions && !isLosslessOutput;
  const showQualitySlider = (showQualityToggle && !lossless)
    || mode === 'crop-image' || mode === 'rotate-image' || mode === 'resize-image' || mode === 'compress-image';
  const showResize = mode === 'resize-image';
  const showCrop = mode === 'crop-image';
  const showRotate = mode === 'rotate-image';
  const showFilter = mode === 'image-filter';
  const hasOptions = showQualityToggle || showQualitySlider || showResize || showCrop || showRotate || showFilter;

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && !selectedFile.name.match(/\.(heic|heif|avif|svg)$/i)) {
      setError('Please select a valid image file.');
      return;
    }
    if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
      setError(t('errors.fileTooLarge', { maxSize: maxFileSizeMB }));
      return;
    }
    setError(null);
    setResult(null);
    setResultPreview(null);
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    setOutputMode(mode); // reset to page default on new file

    if (mode === 'resize-image' || mode === 'crop-image') {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth, h = img.naturalHeight;
        setWidth(String(w));
        setHeight(String(h));
        setNaturalW(w);
        setNaturalH(h);
        setCrop({ x: 0, y: 0, w, h });
        // Don't revoke: the same URL is used by the crop editor preview
      };
      img.src = url; // reuse the same object URL (already set as preview)
    }
  }, [maxFileSizeMB, mode, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleProcess = async () => {
    if (!file) { setError(t('errors.noFile')); return; }
    if (!checkRateLimit(`image-${mode}`, 20, 60000)) {
      setError(t('errors.rateLimitExceeded'));
      return;
    }

    const effectiveQuality = lossless ? 100 : quality;
    const options: ProcessOptions = {
      quality: effectiveQuality,
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      maintainAspectRatio: maintainAR,
      cropX: crop.x,
      cropY: crop.y,
      cropWidth: crop.w || undefined,
      cropHeight: crop.h || undefined,
      degrees,
      brightness, contrast, saturation, blur, grayscale, sepia, invert,
    };

    setProcessing(true);
    setError(null);
    try {
      const res = await processFile(file, outputMode, options);
      setResult(res);
      const url = URL.createObjectURL(res.blob);
      setResultPreview(url);
    } catch (e) {
      setError((e as Error).message || t('errors.processingFailed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) downloadBlob(result.blob, result.filename);
  };

  const handleReset = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    if (resultPreview) URL.revokeObjectURL(resultPreview);
    setPreview(null);
    setResult(null);
    setResultPreview(null);
    setError(null);
    setOutputMode(mode);
    setLossless(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Live rotate preview
  useEffect(() => {
    if (!showRotate || !preview || result) return;
    const canvas = rotateCanvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const swapped = degrees === 90 || degrees === 270;
      canvas.width  = swapped ? h : w;
      canvas.height = swapped ? w : h;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2);
      ctx.restore();
    };
    img.src = preview;
  }, [showRotate, preview, degrees, result]);

  // Auto-detect original format when file changes
  useEffect(() => {
    if (mode !== 'compress-image' || !file) return;
    const mime = file.type;
    if (mime === 'image/png') setCompressFormat('png');
    else if (mime === 'image/webp') setCompressFormat('webp');
    else if (mime === 'image/avif') setCompressFormat('avif');
    else setCompressFormat('jpg');
  }, [file, mode]);

  // Debounced live compression preview — uses WASM (WebP/JPEG best-of) for accurate size display
  useEffect(() => {
    if (mode !== 'compress-image' || !file) return;
    let aborted = false;
    if (compressTimerRef.current) clearTimeout(compressTimerRef.current);
    setLiveCompressing(true);
    compressTimerRef.current = setTimeout(async () => {
      if (aborted) return;
      try {
        const fmt = compressFormat === 'auto' ? undefined : compressFormat;
        const res = await compressImage(file, { quality, format: fmt });
        if (aborted) return;
        if (compressedUrlRef.current) URL.revokeObjectURL(compressedUrlRef.current);
        const url = URL.createObjectURL(res.blob);
        compressedUrlRef.current = url;
        compressedBlobRef.current = { blob: res.blob, filename: res.filename };
        setCompressedPreviewUrl(url);
        setCompressedSize(res.blob.size);
      } catch { /* ignore */ }
      if (!aborted) setLiveCompressing(false);
    }, 1000);
    return () => {
      aborted = true;
      if (compressTimerRef.current) clearTimeout(compressTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, quality, mode, compressFormat]);

  useEffect(() => { previewUrlRef.current = preview; }, [preview]);
  useEffect(() => { resultPreviewUrlRef.current = resultPreview; }, [resultPreview]);

  // Cleanup all Object URLs on unmount
  useEffect(() => {
    return () => {
      if (compressTimerRef.current) clearTimeout(compressTimerRef.current);
      if (compressedUrlRef.current) { URL.revokeObjectURL(compressedUrlRef.current); compressedUrlRef.current = null; }
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (resultPreviewUrlRef.current) URL.revokeObjectURL(resultPreviewUrlRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <ImageTabBar mode={mode} />

      {/* Resize presets — shown before upload */}
      {mode === 'resize-image' && !file && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Common presets — click to pre-select, then upload your image
          </p>
          {RESIZE_PRESETS.map(group => (
            <div key={group.group}>
              <p className="text-[11px] text-slate-600 mb-1.5 font-medium">{group.group}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map(item => {
                  const active = width === String(item.w) && height === String(item.h);
                  return (
                    <button key={item.label} onClick={() => { setWidth(String(item.w)); setHeight(String(item.h)); setMaintainAR(false); }}
                      className={`flex flex-col items-start px-2.5 py-1.5 text-left border rounded-lg transition-all ${
                        active ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}>
                      <span className="text-[11px] font-medium leading-tight whitespace-nowrap">{item.label}</span>
                      <span className={`font-mono text-[10px] ${active ? 'text-indigo-300' : 'text-slate-600'}`}>
                        {item.w}×{item.h} · {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {!file ? (
        <div
          className={`drop-zone ${dragging ? 'drop-zone-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={config.accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <span className="material-symbols-outlined text-slate-600 text-5xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>
            upload_file
          </span>
          <p className="text-slate-300 font-medium mb-1">{t('dragDrop')}</p>
          <p className="text-slate-500 text-sm">{t('supportedFormats', { formats: config.label })} · {t('maxFileSize', { size: maxFileSizeMB })}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File info */}
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-indigo-400 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
              <div className="min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{file.name}</p>
                <p className="text-slate-500 text-xs">{formatBytes(file.size)}</p>
              </div>
            </div>
            <button onClick={handleReset} className="text-slate-500 hover:text-slate-300 transition-colors ml-4 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Output format selector (converter pages only) */}
          {outputOptions && !result && (
            <div className="flex items-center gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400 text-sm flex-shrink-0">Convert to:</span>
              <div className="flex gap-2 flex-wrap">
                {outputOptions.map(opt => (
                  <button
                    key={opt.mode}
                    onClick={() => { setOutputMode(opt.mode); setLossless(false); }}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg border transition-all ${
                      outputMode === opt.mode
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {isLosslessOutput && (
                <span className="ml-auto text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full flex-shrink-0">
                  Lossless
                </span>
              )}
            </div>
          )}

          {/* Visual crop editor */}
          {showCrop && !result && preview && naturalW > 0 && (
            <CropEditor
              src={preview}
              naturalW={naturalW}
              naturalH={naturalH}
              crop={crop}
              onChange={setCrop}
            />
          )}

          {/* Resize preview — show original image before processing */}
          {showResize && !result && preview && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Preview</p>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Original" className="w-full object-contain p-3" style={{ maxHeight: 600 }} />
              </div>
              {naturalW > 0 && (
                <p className="text-slate-600 text-xs text-center">Original: {naturalW} × {naturalH} px</p>
              )}
            </div>
          )}

          {/* Rotate live preview */}
          {showRotate && !result && preview && (
            <div className="space-y-2">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t('livePreviewRotation', { degrees })}</p>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <canvas ref={rotateCanvasRef} className="w-full block" style={{ imageRendering: 'auto' }} />
              </div>
            </div>
          )}

          {/* Options panel */}
          {hasOptions && !result && !showCrop && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-slate-200 font-semibold text-sm">{t('settings')}</h3>

              {/* Lossless / Compress toggle */}
              {showQualityToggle && (
                <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 text-sm flex-shrink-0">Quality mode:</span>
                  <div className="flex gap-1.5">
                    {[
                      { val: false, label: 'Compress', desc: 'Smaller file' },
                      { val: true,  label: 'Best Quality', desc: 'No quality loss' },
                    ].map(opt => (
                      <button
                        key={String(opt.val)}
                        onClick={() => setLossless(opt.val)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                          lossless === opt.val
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}
                        title={opt.desc}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {lossless && (
                    <span className="ml-auto text-xs text-emerald-400">Quality: 100%</span>
                  )}
                </div>
              )}

              {/* Quality slider */}
              {showQualitySlider && !lossless && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-400 text-sm">{t('quality')}</label>
                    <span className="text-indigo-400 text-sm font-medium">{quality}%</span>
                  </div>
                  <input
                    type="range" min={10} max={100} value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    style={{ touchAction: 'pan-y' }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  {(mode === 'rotate-image' || mode === 'resize-image') && file?.type.includes('jpeg') && quality > 85 && (
                    <p className="text-amber-400/80 text-xs mt-1.5">
                      {t('jpegHighQualityWarning')}
                    </p>
                  )}
                </div>
              )}

              {/* Format selector — compress-image only */}
              {mode === 'compress-image' && file && (
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('compressOutputFormat')}</label>
                  <div className="flex gap-1.5">
                    {(['png', 'jpg', 'webp', 'avif'] as const).map(f => (
                      <button key={f} onClick={() => setCompressFormat(f)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          compressFormat === f
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                        }`}>
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {compressFormat === 'png' && (
                    <p className="text-slate-600 text-xs mt-1.5">{t('compressPngNote')}</p>
                  )}
                </div>
              )}

              {/* Resize presets — shown after upload too */}
              {showResize && (
                <div className="space-y-2.5">
                  {RESIZE_PRESETS.map(group => (
                    <div key={group.group}>
                      <p className="text-[10px] text-slate-700 mb-1.5 font-medium uppercase tracking-wide">{group.group}</p>
                      <div className="flex flex-wrap gap-1">
                        {group.items.map(item => {
                          const active = width === String(item.w) && height === String(item.h);
                          return (
                            <button key={item.label} onClick={() => { setWidth(String(item.w)); setHeight(String(item.h)); setMaintainAR(false); }}
                              className={`flex flex-col items-start px-2 py-1 text-left border rounded-md transition-all ${
                                active ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                              }`}>
                              <span className="text-[10px] font-medium leading-tight whitespace-nowrap">{item.label}</span>
                              <span className={`font-mono text-[9px] ${active ? 'text-indigo-300' : 'text-slate-700'}`}>{item.w}×{item.h}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resize */}
              {showResize && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">{t('width')}</label>
                    <input type="number" value={width} onChange={(e) => setWidth(e.target.value)}
                      className="input-field px-3 py-2 text-sm" placeholder={t('width')} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1.5 block">{t('height')}</label>
                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                      className="input-field px-3 py-2 text-sm" placeholder={t('height')} />
                  </div>
                  <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={maintainAR} onChange={(e) => setMaintainAR(e.target.checked)}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer" />
                    <span className="text-slate-400 text-sm">{t('maintainAspectRatio')}</span>
                  </label>
                </div>
              )}

              {/* Rotate */}
              {showRotate && (
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">{t('degrees')}</label>
                  <div className="flex gap-2">
                    {([90, 180, 270] as const).map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setDegrees(deg)}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                          degrees === deg
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters */}
              {showFilter && (() => {
                const presets: { labelKey: string; icon: string; b: number; c: number; s: number; bl: number; gs: boolean; sp: boolean; iv: boolean }[] = [
                  { labelKey: 'filterOriginal',  icon: '○',  b: 0,    c: 0,    s: 0,    bl: 0,  gs: false, sp: false, iv: false },
                  { labelKey: 'filterVivid',     icon: '◈',  b: 10,   c: 25,   s: 50,   bl: 0,  gs: false, sp: false, iv: false },
                  { labelKey: 'filterVintage',   icon: '◫',  b: -5,   c: -10,  s: -30,  bl: 0,  gs: false, sp: true,  iv: false },
                  { labelKey: 'filterGrayscale', icon: '◐',  b: 0,    c: 10,   s: 0,    bl: 0,  gs: true,  sp: false, iv: false },
                  { labelKey: 'filterNoir',      icon: '◼',  b: -20,  c: 40,   s: 0,    bl: 0,  gs: true,  sp: false, iv: false },
                  { labelKey: 'filterCool',      icon: '❄',  b: 5,    c: 5,    s: -15,  bl: 0,  gs: false, sp: false, iv: false },
                  { labelKey: 'filterWarm',      icon: '☀',  b: 10,   c: 10,   s: 20,   bl: 0,  gs: false, sp: false, iv: false },
                  { labelKey: 'filterFade',      icon: '◎',  b: 20,   c: -30,  s: -20,  bl: 0,  gs: false, sp: false, iv: false },
                  { labelKey: 'filterInvert',    icon: '⊕',  b: 0,    c: 0,    s: 0,    bl: 0,  gs: false, sp: false, iv: true },
                  { labelKey: 'filterSoft',      icon: '✦',  b: 15,   c: -15,  s: 5,    bl: 1,  gs: false, sp: false, iv: false },
                ];

                const applyPreset = (p: typeof presets[0]) => {
                  setBrightness(p.b); setContrast(p.c); setSaturation(p.s); setBlur(p.bl);
                  setGrayscale(p.gs); setSepia(p.sp); setInvert(p.iv);
                };

                return (
                  <div className="space-y-4">
                    {/* Preset buttons */}
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">{t('filterPresetsLabel')}</p>
                      <div className="flex flex-wrap gap-2">
                        {presets.map(p => {
                          const active = brightness === p.b && contrast === p.c && saturation === p.s && blur === p.bl
                            && grayscale === p.gs && sepia === p.sp && invert === p.iv;
                          return (
                            <button key={p.labelKey} onClick={() => applyPreset(p)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                active
                                  ? 'bg-indigo-600 border-indigo-500 text-white'
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-white'
                              }`}>
                              {p.icon} {t(p.labelKey as Parameters<typeof t>[0])}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Manual sliders */}
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{t('filterManualAdjust')}</p>
                      {([
                        { labelKey: 'filterBrightness', value: brightness, setter: setBrightness, min: -100, max: 100, step: 1 },
                        { labelKey: 'filterContrast',   value: contrast,   setter: setContrast,   min: -100, max: 100, step: 1 },
                        { labelKey: 'filterSaturation', value: saturation, setter: setSaturation, min: -100, max: 100, step: 1 },
                        { labelKey: 'filterBlur',       value: blur,       setter: setBlur,       min: 0,    max: 10,  step: 0.5 },
                      ] as { labelKey: string; value: number; setter: (v: number) => void; min: number; max: number; step: number }[]).map((f) => (
                        <div key={f.labelKey}>
                          <div className="flex justify-between mb-1">
                            <label className="text-slate-400 text-sm">{t(f.labelKey as Parameters<typeof t>[0])}</label>
                            <span className="text-indigo-400 text-sm font-medium tabular-nums">{f.value}</span>
                          </div>
                          <input type="range" min={f.min} max={f.max} step={f.step} value={f.value}
                            onChange={(e) => f.setter(Number(e.target.value))}
                            style={{ touchAction: 'pan-y' }}
                            className="w-full accent-indigo-500 cursor-pointer" />
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-3 pt-1">
                        {([
                          { labelKey: 'filterGrayscale', value: grayscale, setter: setGrayscale },
                          { labelKey: 'filterSepia',     value: sepia,     setter: setSepia },
                          { labelKey: 'filterInvert',    value: invert,    setter: setInvert },
                        ] as { labelKey: string; value: boolean; setter: (v: boolean) => void }[]).map((f) => (
                          <label key={f.labelKey} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={f.value} onChange={(e) => f.setter(e.target.checked)}
                              className="w-4 h-4 accent-indigo-500 cursor-pointer" />
                            <span className="text-slate-400 text-sm">{t(f.labelKey as Parameters<typeof t>[0])}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Live filter preview */}
          {showFilter && !result && preview && (() => {
            const cssFilters: string[] = [];
            if (brightness !== 0) cssFilters.push(`brightness(${1 + brightness / 100})`);
            if (contrast !== 0)   cssFilters.push(`contrast(${1 + contrast / 100})`);
            if (saturation !== 0) cssFilters.push(`saturate(${1 + saturation / 100})`);
            if (blur > 0)         cssFilters.push(`blur(${blur}px)`);
            if (grayscale)        cssFilters.push('grayscale(1)');
            if (sepia)            cssFilters.push('sepia(1)');
            if (invert)           cssFilters.push('invert(1)');
            const cssFilter = cssFilters.join(' ') || 'none';
            return (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('livePreview')}</p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Filter preview"
                    className="w-full object-contain"
                    style={{ filter: cssFilter, maxHeight: 600 }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Crop quality slider (shown separately, below the crop editor) */}
          {showCrop && !result && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div className="flex justify-between">
                <label className="text-slate-400 text-sm">{t('quality')}</label>
                <span className="text-indigo-400 text-sm font-medium">{quality}%</span>
              </div>
              <input type="range" min={10} max={100} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={{ touchAction: 'pan-y' }}
                className="w-full accent-indigo-500 cursor-pointer" />
              {file?.type.includes('jpeg') && quality > 85 && (
                <p className="text-amber-400/80 text-xs">
                  {t('jpegHighQualityWarning')}
                </p>
              )}
            </div>
          )}

          {/* ── Compress-image: live split-view comparison ── */}
          {mode === 'compress-image' && file && preview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('compareImages')}
                  {liveCompressing && <span className="text-indigo-400 font-normal ml-1">· {t('updating')}</span>}
                </p>
                <div className="flex gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                  {(['split', 'side'] as const).map(m => (
                    <button key={m} onClick={() => setCompareMode(m)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${compareMode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                      {m === 'split' ? t('splitView') : t('sideBySide')}
                    </button>
                  ))}
                </div>
              </div>

              {compareMode === 'split' ? (
                <div className="relative overflow-hidden rounded-xl cursor-col-resize select-none"
                  style={{ touchAction: 'none' }}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    const r = e.currentTarget.getBoundingClientRect();
                    setSplitX(Math.max(5, Math.min(95, (e.clientX - r.left) / r.width * 100)));
                  }}
                  onPointerMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setSplitX(Math.max(5, Math.min(95, (e.clientX - r.left) / r.width * 100)));
                  }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Original" className="w-full block" style={{ maxHeight: 480 }} />
                  {compressedPreviewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={compressedPreviewUrl} alt="Compressed"
                      className="absolute inset-0 w-full block"
                      style={{ clipPath: `inset(0 0 0 ${splitX}%)`, maxHeight: 480 }} />
                  )}
                  <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] pointer-events-none"
                    style={{ left: `${splitX}%`, transform: 'translateX(-50%)' }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M6 4L2 9l4 5M12 4l4 5-4 5" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-3 text-xs font-semibold bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded">
                    {t('original')} · {formatBytes(file.size)}
                  </span>
                  <span className="absolute bottom-3 right-3 text-xs font-semibold bg-indigo-900/80 text-indigo-300 px-2 py-0.5 rounded">
                    {t('compressedLabel')} · {formatBytes(compressedSize)}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs mb-2 font-medium">{t('original')} · {formatBytes(file.size)}</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} className="w-full block rounded-xl" alt="Original" style={{ maxHeight: 400 }} />
                  </div>
                  <div>
                    {(() => {
                      const savings = compressedSize && file.size ? Math.round((1 - compressedSize / file.size) * 100) : 0;
                      return (
                        <>
                          <p className="text-xs mb-2 font-medium">
                            <span className="text-indigo-400">{t('compressedLabel')} · {formatBytes(compressedSize)}</span>
                            {savings > 0 && <span className="text-emerald-400 ml-1">({t('xPercentSmaller', { pct: savings })})</span>}
                          </p>
                          {compressedPreviewUrl
                            ? /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={compressedPreviewUrl} className="w-full block rounded-xl" alt="Compressed" style={{ maxHeight: 400 }} />
                            : <div className="w-full aspect-[4/3] bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-sm">Processing…</div>
                          }
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {compressedPreviewUrl && (
                <button
                  onClick={() => {
                    const saved = compressedBlobRef.current;
                    if (saved) downloadBlob(saved.blob, saved.filename);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
                  <span className="material-symbols-outlined text-lg">download</span>
                  {t('downloadCompressed', { size: formatBytes(compressedSize) })}
                  {compressedSize < file.size && (
                    <span className="text-indigo-200 text-sm ml-1">· {t('xPercentSmaller', { pct: Math.round((1 - compressedSize / file.size) * 100) })}</span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Before/after previews */}
          {result && mode !== 'compress-image' && (
            showFilter ? (
              <div className="space-y-3">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {preview && (
                    <div className="space-y-2">
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t('originalFile')}</p>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt={t('originalFile')} className="w-full object-contain" style={{ maxHeight: 400 }} />
                      </div>
                    </div>
                  )}
                  {resultPreview && (
                    <div className="space-y-2">
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t('processedFile')}</p>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resultPreview} alt={t('processedFile')} className="w-full object-contain" style={{ maxHeight: 400 }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {preview && (
                  <div className="space-y-2">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t('originalFile')}</p>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={t('originalFile')} className="w-full object-contain p-3" style={{ maxHeight: 520 }} />
                    </div>
                  </div>
                )}
                {resultPreview && (
                  <div className="space-y-2">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t('processedFile')}</p>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resultPreview} alt={t('processedFile')} className="w-full object-contain p-3" style={{ maxHeight: 520 }} />
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Size comparison (non-compress modes only) */}
          {result && mode !== 'compress-image' && (() => {
            const savings = Math.round((1 - result.newSize / result.originalSize) * 100);
            const larger = result.newSize >= result.originalSize;
            return (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t('originalFile'), value: formatBytes(result.originalSize), color: 'text-slate-400' },
                    { label: t('newSize'),       value: formatBytes(result.newSize),      color: larger ? 'text-amber-400' : 'text-emerald-400' },
                    { label: larger ? t('increase') : t('reduction'), value: `${Math.abs(savings)}%`, color: larger ? 'text-amber-400' : 'text-emerald-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                      <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
                {larger && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-300">
                    <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">info</span>
                    <span>{t('alreadyOptimized')}</span>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <span className="material-symbols-outlined text-red-400 text-lg flex-shrink-0">error</span>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      {file && mode !== 'compress-image' && (
        <div className="flex gap-3">
          {!result ? (
            <button
              onClick={handleProcess}
              disabled={processing}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('processing')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                  {t('convert')}
                </>
              )}
            </button>
          ) : (
            <>
              <button onClick={handleDownload} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">download</span>
                {t('download')}
              </button>
              <button onClick={handleReset} className="btn-secondary px-4">
                <span className="material-symbols-outlined text-lg">refresh</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

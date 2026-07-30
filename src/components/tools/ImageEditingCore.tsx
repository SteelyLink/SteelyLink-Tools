'use client';

import React, { useState, useRef, useCallback, useEffect, useReducer } from 'react';
import { useTranslations } from 'next-intl';
import { ImageTabBar } from './ImageTabBar';
import type { CompressFormat } from '@/types/tools';

export type ImageEditMode = 'remove-bg' | 'add-watermark' | 'drawing-canvas' | 'image-batch';

interface Props {
  mode: ImageEditMode;
}

const MAX_IMG_EDIT_MB = 50;

// ─── Shared Utilities ─────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

const RESIZE_PRESETS = [
  { groupKey: 'groupShortVideo', items: [
    { labelKey: 'presetTiktok',           sub: '9:16',       w: 1080, h: 1920 },
    { labelKey: 'presetXhsPortraitCover', sub: '3:4',        w: 1242, h: 1660 },
    { labelKey: 'presetXhsVideoPortrait', sub: '3:4',        w: 1080, h: 1440 },
    { labelKey: 'presetInstagramPortrait',sub: '4:5',        w: 1080, h: 1350 },
  ]},
  { groupKey: 'groupLandscape', items: [
    { labelKey: 'presetYtBilibili',       sub: '16:9 HD',    w: 1280, h:  720 },
    { labelKey: 'presetBilibiliFullHd',   sub: '16:9 1080p', w: 1920, h: 1080 },
    { labelKey: 'presetBilibiliUpload',   sub: '16:10',      w: 1146, h:  717 },
    { labelKey: 'presetBilibiliHome',     sub: '4:3',        w:  960, h:  720 },
    { labelKey: 'presetXhsLandscape',     sub: '4:3',        w: 1200, h:  900 },
  ]},
  { groupKey: 'groupSquare', items: [
    { labelKey: 'presetXhsSquare',        sub: '1:1',        w: 1080, h: 1080 },
    { labelKey: 'presetWechatOa',         sub: '16:9',       w:  900, h:  500 },
    { labelKey: 'presetTwitterShare',     sub: '16:9',       w: 1200, h:  675 },
    { labelKey: 'presetWallpaper4k',      sub: '16:9',       w: 3840, h: 2160 },
  ]},
  { groupKey: 'groupId', items: [
    { labelKey: 'presetIdPhoto1',         sub: '25×35 mm',   w: 295, h: 413 },
    { labelKey: 'presetIdPhoto2',         sub: '35×49 mm',   w: 413, h: 579 },
    { labelKey: 'presetPassport',         sub: '33×48 mm',   w: 390, h: 567 },
    { labelKey: 'presetDriverLicense',    sub: '22×32 mm',   w: 260, h: 378 },
  ]},
] as const;

function ImageDropZone({ onFile, accept = 'image/*', label = 'JPG / PNG / WebP', hint }: {
  onFile: (f: File) => void;
  accept?: string;
  label?: string;
  hint?: string;
}) {
  const t = useTranslations('Tool');
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => ref.current?.click()}
    >
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      <span className="material-symbols-outlined text-slate-600 text-5xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
      <p className="text-slate-300 font-medium mb-1">{t('dragDrop')}</p>
      <p className="text-slate-500 text-sm">{t('supportedFormats', { formats: label })}</p>
      {hint && <p className="text-slate-600 text-xs mt-1">{hint}</p>}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
      <span className="material-symbols-outlined text-red-400 text-lg flex-shrink-0">error</span>
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm py-1">
      <svg className="animate-spin w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label}
    </div>
  );
}

// ─── Remove Background ────────────────────────────────────────────────────────

const CHECKERBOARD = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMzM0MTU1Ii8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMzMzQxNTUiLz48cmVjdCB4PSIwIiB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMjEyOTNiIi8+PHJlY3QgeD0iMTAiIHk9IjAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzIxMjkzYiIvPjwvc3ZnPg==')";

function RemoveBgMode() {
  const t = useTranslations('Tool');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dlProgress, setDlProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const segmenterRef = useRef<any>(null);

  const loadFile = useCallback((f: File) => {
    setError(null); setResultUrl(null); setResultBlob(null);
    if (!f.type.startsWith('image/')) { setError(t('noImageSelected')); return; }
    if (f.size > MAX_IMG_EDIT_MB * 1024 * 1024) { setError(t('fileTooLargeSimple', { size: MAX_IMG_EDIT_MB })); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, [t]);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    setDownloading(false); setDlProgress(0);
    try {
      if (!segmenterRef.current) {
        setDownloading(true);
        const hf = await import('@huggingface/transformers');
        const { AutoModel, AutoProcessor, RawImage, env } = hf;

        // Detect if huggingface.co is reachable; fall back to ModelScope China CDN
        const hfOk = await fetch('https://huggingface.co/briaai/RMBG-1.4/resolve/main/config.json', {
          method: 'HEAD', signal: AbortSignal.timeout(4000),
        }).then(r => r.ok).catch(() => false);
        if (!hfOk) env.remoteHost = 'https://modelscope.cn/models/';

        const filesTotal = new Map<string, { loaded: number; total: number }>();
        const progressCb = (p: { status: string; file?: string; loaded?: number; total?: number }) => {
          if (p.status === 'progress' && p.file && p.total && p.total > 1024 * 1024) {
            filesTotal.set(p.file, { loaded: p.loaded ?? 0, total: p.total });
            let sumLoaded = 0, sumTotal = 0;
            filesTotal.forEach(v => { sumLoaded += v.loaded; sumTotal += v.total; });
            setDlProgress(sumTotal > 0 ? Math.round((sumLoaded / sumTotal) * 100) : 0);
          }
        };
        const hasWebGPU = !!(navigator as any).gpu && await (navigator as any).gpu.requestAdapter().catch(() => null);
        const device = hasWebGPU ? 'webgpu' : 'wasm';
        const [model, processor] = await Promise.all([
          AutoModel.from_pretrained('briaai/RMBG-1.4', { device, dtype: 'q8', progress_callback: progressCb }),
          AutoProcessor.from_pretrained('briaai/RMBG-1.4', { progress_callback: progressCb }),
        ]);
        segmenterRef.current = { model, processor, RawImage };
        setDownloading(false);
      }

      const { model, processor, RawImage } = segmenterRef.current;
      const rawImg = await RawImage.fromURL(URL.createObjectURL(file));
      const inputs = await processor(rawImg);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const session = (model as any).sessions?.['model'];
      if (session) {
        const inputNames: string[] = session.inputNames;
        if (!inputNames.includes('pixel_values') && inputNames.length === 1) {
          inputs[inputNames[0]] = inputs.pixel_values;
        }
      }

      const modelResult = await model(inputs);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const outputName = session?.outputNames?.[0] ?? 'output';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const outputTensor = (modelResult as any)[outputName];

      // outputTensor shape: [batch, num_classes, H, W] — get first batch item
      const item = outputTensor[0]; // [num_classes, H, W]

      // Apply sigmoid if model outputs raw logits
      const epsilon = 1e-5;
      if (item.data.some((x: number) => x < -epsilon || x > 1 + epsilon)) {
        item.sigmoid_();
      }

      // Min-max normalization (required by RMBG-1.4 — stretches to full [0, 1])
      const d: Float32Array = item.data;
      let mi = Infinity, ma = -Infinity;
      for (let i = 0; i < d.length; i++) { if (d[i] < mi) mi = d[i]; if (d[i] > ma) ma = d[i]; }
      const range = ma - mi || 1;
      for (let i = 0; i < d.length; i++) { d[i] = (d[i] - mi) / range; }

      // Convert to 1-channel uint8 RawImage and resize to original dimensions
      const maskRaw = RawImage.fromTensor(item.mul_(255).to('uint8'));
      const mask = await maskRaw.resize(rawImg.width, rawImg.height);

      // Apply mask as alpha channel (handles RGB→RGBA conversion internally)
      const cloned = rawImg.clone();
      cloned.putAlpha(mask);

      // Convert RGBA RawImage to PNG blob
      const canvas = document.createElement('canvas');
      canvas.width = cloned.width;
      canvas.height = cloned.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(new ImageData(new Uint8ClampedArray(cloned.data), cloned.width, cloned.height), 0, 0);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')
      );
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProcessing(false); setDownloading(false);
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setPreview(null); setResultUrl(null); setResultBlob(null); setError(null);
  };

  return (
    <div className="space-y-5">
      {!file ? <ImageDropZone onFile={loadFile} label="JPG / PNG / WebP" hint={t('processedLocally', { size: MAX_IMG_EDIT_MB })} /> : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t('removeBgOriginal')}</p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview!} alt="Original" className="w-full max-h-72 object-contain p-3" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t('removeBgResult')}</p>
              <div className="border border-slate-800 rounded-xl overflow-hidden" style={{ background: CHECKERBOARD }}>
                {resultUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl} alt="Result" className="w-full max-h-72 object-contain p-3" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-72 gap-3">
                    {processing ? (
                      downloading ? (
                        <div className="w-3/4 space-y-3">
                          <p className="text-slate-300 text-sm text-center">{t('removeBgDownloadingModel')}</p>
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${dlProgress}%` }} />
                          </div>
                          <p className="text-slate-400 text-xs text-center">{dlProgress}%</p>
                        </div>
                      ) : (
                        <Spinner label={t('removeBgProcessingLabel')} />
                      )
                    ) : (
                      <p className="text-slate-700 text-sm">{t('removeBgResultHere')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300/80">
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '16px' }}>auto_awesome</span>
            <span>{t('removeBgPoweredBy')}</span>
          </div>
        </>
      )}

      {error && <ErrorBanner message={error} />}

      {file && (
        <div className="flex gap-3">
          {!resultBlob ? (
            <button onClick={handleProcess} disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
              {processing ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t('removeBgProcessingLabel')}</>
              ) : (
                <><span className="material-symbols-outlined text-lg">auto_fix_high</span>{t('removeBgButton')}</>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => downloadBlob(resultBlob, file.name.replace(/\.[^/.]+$/, '') + '_nobg.png')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
                <span className="material-symbols-outlined text-lg">download</span>
                {t('removeBgDownload')}
              </button>
              <button onClick={reset} className="flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700">
                <span className="material-symbols-outlined text-lg">refresh</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Watermark ────────────────────────────────────────────────────────────

const WM_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const;

const WATERMARK_FONTS = [
  { label: 'Roboto',           css: 'Roboto' },
  { label: 'Open Sans',        css: 'Open Sans' },
  { label: 'Lato',             css: 'Lato' },
  { label: 'Montserrat',       css: 'Montserrat' },
  { label: 'Oswald',           css: 'Oswald' },
  { label: 'Raleway',          css: 'Raleway' },
  { label: 'Playfair Display', css: 'Playfair Display' },
  { label: 'Dancing Script',   css: 'Dancing Script' },
  { label: 'Pacifico',         css: 'Pacifico' },
  { label: 'Bebas Neue',       css: 'Bebas Neue' },
];

const GF_URL = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Oswald:wght@400;700&family=Raleway:wght@400;700&family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@400;700&family=Pacifico&family=Bebas+Neue&display=swap';

function WatermarkMode() {
  const t = useTranslations('Tool');
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);
  const [tab, setTab]               = useState<'text' | 'image'>('text');
  const [wmText, setWmText]         = useState('© Watermark');
  const [fontSize, setFontSize]     = useState(48);
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [textColor, setTextColor]   = useState('#ffffff');
  const [opacity, setOpacity]       = useState(0.7);
  const [position, setPosition]     = useState<typeof WM_POSITIONS[number]>('bottom-right');
  const [rotation, setRotation]       = useState(0);
  const [editingRotation, setEditingRotation] = useState(false);
  const [tile, setTile]             = useState(false);
  const [wmImageFile, setWmImageFile]       = useState<File | null>(null);
  const [wmImageScale, setWmImageScale]     = useState(0.2);
  const [wmImageOpacity, setWmImageOpacity] = useState(0.5);
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [imgVersion, setImgVersion]     = useState(0);
  const [wmImgVersion, setWmImgVersion] = useState(0);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgElRef         = useRef<HTMLImageElement | null>(null);
  const wmImgElRef       = useRef<HTMLImageElement | null>(null);
  const wmFileInputRef   = useRef<HTMLInputElement>(null);

  // Load all Google Fonts once
  useEffect(() => {
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = GF_URL;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  // Live canvas draw whenever any setting or image changes
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const img = imgElRef.current;
    if (!canvas || !img || img.naturalWidth === 0) return;

    const MAX_W = 2400;
    const scale = img.naturalWidth > MAX_W ? MAX_W / img.naturalWidth : 1;
    canvas.width  = Math.round(img.naturalWidth  * scale);
    canvas.height = Math.round(img.naturalHeight * scale);

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const draw = async () => {
      if (tab === 'text' && wmText.trim()) {
        const scaledSize = Math.max(8, Math.round(fontSize * scale));
        try { await document.fonts.load(`bold ${scaledSize}px "${fontFamily}"`); } catch { /* fallback ok */ }

        ctx.save();
        ctx.font = `bold ${scaledSize}px "${fontFamily}", sans-serif`;
        ctx.fillStyle = textColor;
        ctx.globalAlpha = opacity;
        ctx.textBaseline = 'top';

        const tw = ctx.measureText(wmText).width;
        const th = scaledSize * 1.2;
        const pad = Math.round(24 * scale);

        const getXY = (): [number, number] => {
          switch (position) {
            case 'top-left':    return [pad, pad];
            case 'top-right':   return [canvas.width - tw - pad, pad];
            case 'bottom-left': return [pad, canvas.height - th - pad];
            case 'center':      return [(canvas.width - tw) / 2, (canvas.height - th) / 2];
            default:            return [canvas.width - tw - pad, canvas.height - th - pad];
          }
        };

        if (tile) {
          const stepX = tw + Math.round(100 * scale);
          const stepY = th + Math.round(60  * scale);
          for (let ty = -th; ty < canvas.height + th; ty += stepY) {
            for (let tx = -tw; tx < canvas.width + tw; tx += stepX) {
              ctx.save();
              ctx.translate(tx + tw / 2, ty + th / 2);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.fillText(wmText, -tw / 2, -th / 2);
              ctx.restore();
            }
          }
        } else {
          const [x, y] = getXY();
          ctx.save();
          ctx.translate(x + tw / 2, y + th / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(wmText, -tw / 2, -th / 2);
          ctx.restore();
        }
        ctx.restore();
      } else if (tab === 'image' && wmImgElRef.current && wmImgElRef.current.naturalWidth > 0) {
        const wm = wmImgElRef.current;
        const wmW = canvas.width * wmImageScale;
        const wmH = (wm.naturalHeight / wm.naturalWidth) * wmW;
        const pad = Math.round(24 * scale);

        const getXY = (): [number, number] => {
          switch (position) {
            case 'top-left':    return [pad, pad];
            case 'top-right':   return [canvas.width - wmW - pad, pad];
            case 'bottom-left': return [pad, canvas.height - wmH - pad];
            case 'center':      return [(canvas.width - wmW) / 2, (canvas.height - wmH) / 2];
            default:            return [canvas.width - wmW - pad, canvas.height - wmH - pad];
          }
        };

        ctx.save();
        ctx.globalAlpha = wmImageOpacity;
        if (tile) {
          const stepX = wmW + Math.round(60 * scale);
          const stepY = wmH + Math.round(40 * scale);
          for (let ty = -wmH; ty < canvas.height + wmH; ty += stepY) {
            for (let tx = -wmW; tx < canvas.width + wmW; tx += stepX) {
              ctx.save();
              ctx.translate(tx + wmW / 2, ty + wmH / 2);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.drawImage(wm, -wmW / 2, -wmH / 2, wmW, wmH);
              ctx.restore();
            }
          }
        } else {
          const [x, y] = getXY();
          ctx.save();
          ctx.translate(x + wmW / 2, y + wmH / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(wm, -wmW / 2, -wmH / 2, wmW, wmH);
          ctx.restore();
        }
        ctx.restore();
      }
    };

    draw();
  }, [imgVersion, wmImgVersion, tab, wmText, fontSize, fontFamily, textColor, opacity, position, rotation, tile, wmImageScale, wmImageOpacity]);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) { setError(t('noImageSelected')); return; }
    if (f.size > MAX_IMG_EDIT_MB * 1024 * 1024) { setError(t('fileTooLargeSimple', { size: MAX_IMG_EDIT_MB })); return; }
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(f);
    setFile(f); setPreview(url);
    const img = new Image();
    img.onload = () => { imgElRef.current = img; setImgVersion(v => v + 1); };
    img.src = url;
  }, [preview, t]);

  const loadWmImage = useCallback((f: File) => {
    setWmImageFile(f);
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => { URL.revokeObjectURL(url); wmImgElRef.current = img; setWmImgVersion(v => v + 1); };
    img.src = url;
  }, []);

  const handleDownload = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !file) return;
    setProcessing(true);
    canvas.toBlob((blob) => {
      if (blob) {
        const ext = file.type.includes('png') ? '.png' : '.jpg';
        downloadBlob(blob, file.name.replace(/\.[^/.]+$/, '') + '_watermarked' + ext);
      }
      setProcessing(false);
    }, file.type.includes('png') ? 'image/png' : 'image/jpeg', 0.92);
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setError(null);
    imgElRef.current = null; wmImgElRef.current = null;
    setWmImageFile(null); setImgVersion(0); setWmImgVersion(0);
  };

  const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500';

  // Canvas drag-to-rotate (pointer capture for smooth off-canvas tracking)
  const canvasDrag = useRef({ x: 0, rot: 0 });
  const [canvasCursor, setCanvasCursor] = useState<'grab' | 'grabbing'>('grab');

  const onCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!imgElRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    canvasDrag.current = { x: e.clientX, rot: rotation };
    setCanvasCursor('grabbing');
  };
  const onCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0) return;
    const delta = (e.clientX - canvasDrag.current.x) * 0.5;
    setRotation(Math.max(-180, Math.min(180, Math.round(canvasDrag.current.rot + delta))));
  };
  const onCanvasPointerUp = () => {
    setCanvasCursor('grab');
  };

  return (
    <div className="space-y-5">
      {!file ? <ImageDropZone onFile={loadFile} label="JPG / PNG / WebP" hint={t('processedLocally', { size: MAX_IMG_EDIT_MB })} /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Left: settings */}
          <div className="space-y-4">
            {/* File bar */}
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-300 text-sm font-medium truncate">{file.name}</span>
              <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 ml-3 flex-shrink-0">
                <span className="material-symbols-outlined text-sm">close</span>{t('wmChange')}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {(['text', 'image'] as const).map((tab_) => (
                <button key={tab_} onClick={() => setTab(tab_)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === tab_ ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}>
                  {tab_ === 'text' ? t('wmTabText') : t('wmTabImage')}
                </button>
              ))}
            </div>

            <div key={tab} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              {tab === 'text' ? (
                <>
                  <div>
                    <label className="text-slate-400 text-sm mb-1.5 block">{t('watermarkText')}</label>
                    <input type="text" value={wmText} onChange={(e) => setWmText(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-1.5 block">{t('wmFont')}</label>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={inputCls}
                      style={{ fontFamily: `"${fontFamily}", sans-serif` }}>
                      {WATERMARK_FONTS.map(f => (
                        <option key={f.css} value={f.css}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-sm mb-1.5 block">{t('wmColor')}</label>
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-slate-400 text-sm">{t('wmSize')}</label>
                        <span className="text-indigo-400 text-sm">{fontSize}px</span>
                      </div>
                      <input type="range" min={12} max={200} value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-indigo-500 mt-3 cursor-pointer" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-slate-400 text-sm">{t('wmOpacity')}</label>
                      <span className="text-indigo-400 text-sm">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input type="range" min={5} max={100} value={Math.round(opacity * 100)}
                      onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                      className="w-full accent-indigo-500 cursor-pointer" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-slate-400 text-sm mb-1.5 block">{t('wmLogoImage')}</label>
                    <input ref={wmFileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) loadWmImage(f); e.target.value = ''; }} />
                    <button onClick={() => wmFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">upload</span>
                      {wmImageFile ? wmImageFile.name : t('wmUploadLogo')}
                    </button>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-slate-400 text-sm">{t('wmScale')}</label>
                      <span className="text-indigo-400 text-sm">{Math.round(wmImageScale * 100)}%</span>
                    </div>
                    <input type="range" min={5} max={80} value={Math.round(wmImageScale * 100)}
                      onChange={(e) => setWmImageScale(Number(e.target.value) / 100)}
                      className="w-full accent-indigo-500 cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-slate-400 text-sm">{t('wmOpacity')}</label>
                      <span className="text-indigo-400 text-sm">{Math.round(wmImageOpacity * 100)}%</span>
                    </div>
                    <input type="range" min={5} max={100} value={Math.round(wmImageOpacity * 100)}
                      onChange={(e) => setWmImageOpacity(Number(e.target.value) / 100)}
                      className="w-full accent-indigo-500 cursor-pointer" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">{t('wmPosition')}</label>
                  <select value={tile ? 'tile' : position}
                    onChange={(e) => {
                      if (e.target.value === 'tile') setTile(true);
                      else { setTile(false); setPosition(e.target.value as typeof position); }
                    }}
                    className={inputCls}>
                    <option value="top-left">{t('wmPosTopLeft')}</option>
                    <option value="top-right">{t('wmPosTopRight')}</option>
                    <option value="bottom-left">{t('wmPosBottomLeft')}</option>
                    <option value="bottom-right">{t('wmPosBottomRight')}</option>
                    <option value="center">{t('wmPosCenter')}</option>
                    <option value="tile">{t('wmPosTile')}</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-slate-400 text-sm">{t('degrees')}</label>
                    {editingRotation ? (
                      <input
                        type="number" min={-180} max={180} value={rotation} autoFocus
                        onChange={(e) => setRotation(Math.max(-180, Math.min(180, Number(e.target.value) || 0)))}
                        onBlur={() => setEditingRotation(false)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditingRotation(false); }}
                        className="w-16 text-right text-indigo-400 text-sm bg-slate-800 border border-indigo-500 rounded px-1.5 py-0.5 focus:outline-none"
                      />
                    ) : (
                      <button onClick={() => setEditingRotation(true)} title="Click to type angle"
                        className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors cursor-text tabular-nums">
                        {rotation}°
                      </button>
                    )}
                  </div>
                  <input type="range" min={-180} max={180} value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-indigo-500 mt-1.5 cursor-pointer" />
                </div>
              </div>
            </div>

            {error && <ErrorBanner message={error} />}

            <button onClick={handleDownload} disabled={processing || !imgElRef.current}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
              {processing ? <Spinner label={t('wmPreparingDownload')} /> : (
                <><span className="material-symbols-outlined text-lg">download</span>{t('wmDownloadBtn')}</>
              )}
            </button>
          </div>

          {/* Right: live canvas preview */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('wmLivePreview')}</p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <canvas
                ref={previewCanvasRef}
                className="w-full block select-none touch-none"
                style={{ cursor: canvasCursor }}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
              />
            </div>
            {imgElRef.current === null && (
              <div className="flex items-center justify-center h-48 text-slate-600 text-sm">{t('wmLoadingPreview')}</div>
            )}
            <p className="text-[11px] text-slate-600 text-center">
              {t('wmDragHint')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drawing Canvas ───────────────────────────────────────────────────────────

type DrawTool = 'pen' | 'eraser' | 'rect' | 'circle' | 'line' | 'text' | 'fill';

interface DrawState {
  history: ImageData[];
  historyIdx: number;
}

type DrawAction =
  | { type: 'push'; snapshot: ImageData }
  | { type: 'undo' }
  | { type: 'redo' };

function drawReducer(state: DrawState, action: DrawAction): DrawState {
  switch (action.type) {
    case 'push': {
      const trimmed = state.history.slice(0, state.historyIdx + 1);
      const next = [...trimmed, action.snapshot].slice(-50); // keep last 50
      return { history: next, historyIdx: next.length - 1 };
    }
    case 'undo':
      return { ...state, historyIdx: Math.max(0, state.historyIdx - 1) };
    case 'redo':
      return { ...state, historyIdx: Math.min(state.history.length - 1, state.historyIdx + 1) };
    default:
      return state;
  }
}

function DrawingCanvasMode() {
  const t = useTranslations('Tool');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null); // for shape preview
  const [tool, setTool] = useState<DrawTool>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#6366f1');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(24);

  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawState, dispatch] = useReducer(drawReducer, { history: [], historyIdx: -1 });

  const drawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const baseSnapshot = useRef<ImageData | null>(null); // snapshot before shape draw starts

  // Initialise canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    dispatch({ type: 'push', snapshot });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Sync isFullscreen state with the browser Fullscreen API
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX;
      clientY = e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    dispatch({ type: 'push', snapshot });
  }, []);

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    drawing.current = true;
    startPos.current = pos;

    if (tool === 'text') {
      setTextPos(pos);
      setShowTextInput(true);
      drawing.current = false;
      return;
    }

    if (tool === 'fill') {
      // Flood fill
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const x = Math.floor(pos.x);
      const y = Math.floor(pos.y);
      const idx = (y * width + x) * 4;
      const [targetR, targetG, targetB, targetA] = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];

      const fillRgb = parseInt(fillColor.slice(1), 16);
      const fillR = (fillRgb >> 16) & 255;
      const fillG = (fillRgb >> 8) & 255;
      const fillB = fillRgb & 255;

      if (targetR === fillR && targetG === fillG && targetB === fillB) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const stack = [x + y * width];
      const visited = new Uint8Array(width * height);

      function match(i: number) {
        return pixels[i] === targetR && pixels[i + 1] === targetG && pixels[i + 2] === targetB && pixels[i + 3] === targetA;
      }

      while (stack.length) {
        const curr = stack.pop()!;
        if (visited[curr]) continue;
        visited[curr] = 1;
        const pi = curr * 4;
        if (!match(pi)) continue;
        pixels[pi] = fillR; pixels[pi + 1] = fillG; pixels[pi + 2] = fillB; pixels[pi + 3] = 255;
        const cx = curr % width;
        const cy = Math.floor(curr / width);
        if (cx > 0) stack.push(curr - 1);
        if (cx < width - 1) stack.push(curr + 1);
        if (cy > 0) stack.push(curr - width);
        if (cy < height - 1) stack.push(curr + width);
      }
      ctx.putImageData(imageData, 0, 0);
      saveSnapshot();
      drawing.current = false;
      return;
    }

    // Save snapshot before shape draw
    if (['rect', 'circle', 'line'].includes(tool)) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      baseSnapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }, [tool, fillColor, saveSnapshot]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : strokeColor;
      ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.beginPath();
      ctx.moveTo(startPos.current.x, startPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      startPos.current = pos;
    } else if (['rect', 'circle', 'line'].includes(tool) && baseSnapshot.current) {
      // Restore base and draw preview
      ctx.putImageData(baseSnapshot.current, 0, 0);
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = fillColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'source-over';
      const { x: sx, y: sy } = startPos.current;
      ctx.beginPath();
      if (tool === 'rect') {
        ctx.strokeRect(sx, sy, pos.x - sx, pos.y - sy);
        ctx.fillRect(sx, sy, pos.x - sx, pos.y - sy);
      } else if (tool === 'circle') {
        const rx = Math.abs(pos.x - sx) / 2;
        const ry = Math.abs(pos.y - sy) / 2;
        const cx = sx + (pos.x - sx) / 2;
        const cy = sy + (pos.y - sy) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.moveTo(sx, sy);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  }, [tool, strokeColor, fillColor, strokeWidth]);

  const handlePointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;
    baseSnapshot.current = null;
    if (tool !== 'fill') saveSnapshot();
  }, [tool, saveSnapshot]);

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim()) { setShowTextInput(false); return; }
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = strokeColor;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillText(textInput, textPos.x, textPos.y);
    setShowTextInput(false);
    setTextInput('');
    saveSnapshot();
  }, [textInput, textPos, fontSize, strokeColor, saveSnapshot]);

  // Undo/Redo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || drawState.historyIdx < 0) return;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(drawState.history[drawState.historyIdx], 0, 0);
  }, [drawState]);

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  };

  const [baseImageFile, setBaseImageFile] = useState<File | null>(null);
  const loadBaseImage = useCallback((f: File) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      setBaseImageFile(f);
      saveSnapshot();
    };
    img.src = url;
  }, [saveSnapshot]);

  const downloadAs = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current!;
    if (format === 'jpeg') {
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const ctx = offscreen.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, offscreen.width, offscreen.height);
      ctx.drawImage(canvas, 0, 0);
      offscreen.toBlob((b) => { if (b) downloadBlob(b, 'drawing.jpg'); }, 'image/jpeg', 0.92);
    } else {
      canvas.toBlob((b) => { if (b) downloadBlob(b, 'drawing.png'); }, 'image/png');
    }
  };

  const TOOLS: { id: DrawTool; icon: string; label: string }[] = [
    { id: 'pen', icon: 'edit', label: t('drawToolPen') },
    { id: 'eraser', icon: 'ink_eraser', label: t('drawToolEraser') },
    { id: 'line', icon: 'horizontal_rule', label: t('drawToolLine') },
    { id: 'rect', icon: 'crop_square', label: t('drawToolRect') },
    { id: 'circle', icon: 'circle', label: t('drawToolCircle') },
    { id: 'text', icon: 'title', label: t('drawToolText') },
    { id: 'fill', icon: 'format_color_fill', label: t('drawToolFill') },
  ];

  return (
    <div ref={containerRef} className={isFullscreen ? 'flex flex-col h-full bg-slate-950 p-3 gap-3' : 'space-y-4'}>
      {/* Toolbar */}
      <div className={`p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3${isFullscreen ? ' flex-shrink-0' : ''}`}>
        {/* Tool row */}
        <div className="flex flex-wrap gap-2">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                tool === t.id
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button onClick={() => dispatch({ type: 'undo' })} disabled={drawState.historyIdx <= 0} title="Undo"
              className="flex items-center px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-300 disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-base">undo</span>
            </button>
            <button onClick={() => dispatch({ type: 'redo' })} disabled={drawState.historyIdx >= drawState.history.length - 1} title="Redo"
              className="flex items-center px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-300 disabled:opacity-30 transition-colors">
              <span className="material-symbols-outlined text-base">redo</span>
            </button>
            <button onClick={clearCanvas} title="Clear"
              className="flex items-center px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors">
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
            <button onClick={toggleFullscreen} title={isFullscreen ? t('drawExitFullscreen') : t('drawFullscreen')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:text-indigo-400 transition-colors">
              <span className="material-symbols-outlined text-base">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
              <span className="hidden sm:inline">{isFullscreen ? t('drawExitFullscreen') : t('drawFullscreen')}</span>
            </button>
          </div>
        </div>
        {/* Options row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-slate-500 text-xs">{t('drawStroke')}</label>
            <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 bg-transparent border-0 cursor-pointer rounded" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-500 text-xs">{t('drawFillColor')}</label>
            <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)}
              className="w-8 h-8 bg-transparent border-0 cursor-pointer rounded" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-500 text-xs">{t('drawWidth')}</label>
            <input type="range" min={1} max={30} value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer" />
            <span className="text-slate-500 text-xs">{strokeWidth}px</span>
          </div>
          {tool === 'text' && (
            <div className="flex items-center gap-2">
              <label className="text-slate-500 text-xs">{t('drawFontSize')}</label>
              <input type="range" min={10} max={80} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20 accent-indigo-500 cursor-pointer" />
              <span className="text-slate-500 text-xs">{fontSize}px</span>
            </div>
          )}
        </div>
      </div>

      {/* Canvas area */}
      <div className={`relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950${isFullscreen ? ' flex-1 min-h-0' : ''}`}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className={`${isFullscreen ? 'absolute inset-0 h-full' : ''} w-full block touch-none`}
          style={{ background: '#ffffff', cursor: tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
        {/* Text input overlay */}
        {showTextInput && (
          <div className="absolute inset-0 flex items-start justify-start pointer-events-none">
            <div className="pointer-events-auto absolute" style={{
              left: `${(textPos.x / 800) * 100}%`,
              top: `${(textPos.y / 500) * 100}%`,
            }}>
              <input
                autoFocus
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); if (e.key === 'Escape') { setShowTextInput(false); setTextInput(''); } }}
                className="bg-white/10 border border-indigo-500 text-white px-2 py-1 text-sm rounded focus:outline-none"
                placeholder={t('drawTypePlaceholder')}
                style={{ fontSize: `${fontSize}px`, lineHeight: 1 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className={`flex flex-wrap gap-3${isFullscreen ? ' flex-shrink-0' : ''}`}>
        <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm rounded-xl cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
          {t('drawLoadBaseImage')}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) loadBaseImage(f); e.target.value = ''; }} />
        </label>
        <button onClick={() => downloadAs('png')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
          <span className="material-symbols-outlined text-lg">download</span>
          {t('drawDownloadPng')}
        </button>
        <button onClick={() => downloadAs('jpeg')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm rounded-xl transition-colors">
          <span className="material-symbols-outlined text-lg">download</span>
          {t('drawDownloadJpg')}
        </button>
      </div>
      {error && <div className={isFullscreen ? 'flex-shrink-0' : undefined}><ErrorBanner message={error} /></div>}
    </div>
  );
}

// ─── Image Batch ──────────────────────────────────────────────────────────────

type BatchOp = 'compress' | 'resize' | 'convert' | 'watermark';

interface BatchFile {
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  resultBlob?: Blob;
  resultName?: string;
  resultSize?: number;
  errorMsg?: string;
}

function ImageBatchMode() {
  const t = useTranslations('Tool');
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [op, setOp] = useState<BatchOp>('compress');
  const [quality, setQuality] = useState(80);
  const [resizeW, setResizeW] = useState(800);
  const [resizeH, setResizeH] = useState(600);
  const [resizePreviewUrl, setResizePreviewUrl] = useState<string | null>(null);
  const [resizePreviewLoading, setResizePreviewLoading] = useState(false);
  const resizePreviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizePreviewUrlRef = useRef<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpg' | 'webp' | 'avif'>('jpg');
  const [compressFormat, setCompressFormat] = useState<CompressFormat | 'auto'>('auto');
  const [wmText, setWmText] = useState('© Watermark');
  const [wmFontFamily, setWmFontFamily] = useState('Roboto');
  const [wmColor, setWmColor] = useState('#ffffff');
  const [wmPosition, setWmPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tile'>('bottom-right');
  const [wmOpacity, setWmOpacity] = useState(0.7);
  const [wmFontSize, setWmFontSize] = useState(48);
  const [wmRotation, setWmRotation] = useState(0);
  const [convertQuality, setConvertQuality] = useState(85);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOrigSize, setPreviewOrigSize] = useState<number | null>(null);
  const [previewNewSize, setPreviewNewSize] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const wmCanvasRef = useRef<HTMLCanvasElement>(null);
  const wmImgRef = useRef<HTMLImageElement | null>(null);
  const wmPreviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    setError(null);
    const limited = newFiles.slice(0, 20 - files.length);
    setFiles((prev) => [...prev, ...limited.map((f) => ({ file: f, status: 'pending' as const }))]);
  }, [files.length]);

  // Clamp previewIdx when files change
  useEffect(() => {
    if (files.length === 0) setPreviewIdx(0);
    else if (previewIdx >= files.length) setPreviewIdx(files.length - 1);
  }, [files.length, previewIdx]);

  const previewFile = files[previewIdx]?.file ?? null;

  // Resize live preview — cap to 600px max side
  useEffect(() => {
    if (op !== 'resize' || !previewFile) { setResizePreviewUrl(null); setResizePreviewLoading(false); return; }
    if (resizePreviewTimerRef.current) clearTimeout(resizePreviewTimerRef.current);
    setResizePreviewLoading(true);
    resizePreviewTimerRef.current = setTimeout(async () => {
      try {
        const { resizeImage } = await import('@/lib/tools/image-processor');
        const MAX_SIDE = 600;
        const ratio = Math.min(MAX_SIDE / resizeW, MAX_SIDE / resizeH, 1);
        const pw = Math.max(1, Math.round(resizeW * ratio));
        const ph = Math.max(1, Math.round(resizeH * ratio));
        const r = await resizeImage(previewFile, { width: pw, height: ph, maintainAspectRatio: false });
        if (resizePreviewUrlRef.current) URL.revokeObjectURL(resizePreviewUrlRef.current);
        const url = URL.createObjectURL(r.blob);
        resizePreviewUrlRef.current = url;
        setResizePreviewUrl(url);
      } catch { /* ignore */ }
      setResizePreviewLoading(false);
    }, 200);
    return () => { if (resizePreviewTimerRef.current) clearTimeout(resizePreviewTimerRef.current); };
  }, [op, previewFile, resizeW, resizeH]);

  // Compress / Convert preview
  useEffect(() => {
    if ((op !== 'compress' && op !== 'convert') || !previewFile) {
      setPreviewUrl(null); setPreviewOrigSize(null); setPreviewNewSize(null); setPreviewLoading(false);
      return;
    }
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setPreviewLoading(true);
    previewTimerRef.current = setTimeout(async () => {
      try {
        const { compressImage, pngToJpg, jpgToPng, jpgToWebp } = await import('@/lib/tools/image-processor');
        let blob: Blob;
        if (op === 'compress') {
          const fmt = compressFormat === 'auto' ? undefined : compressFormat;
          const r = await compressImage(previewFile, { quality, format: fmt });
          blob = r.blob;
        } else {
          if (targetFormat === 'avif') {
            const r = await compressImage(previewFile, { quality: convertQuality, format: 'avif' });
            blob = r.blob;
          } else if (targetFormat === 'webp') {
            const r = await jpgToWebp(previewFile, { quality: convertQuality });
            blob = r.blob;
          } else if (targetFormat === 'png') {
            const r = await jpgToPng(previewFile);
            blob = r.blob;
          } else {
            const r = await pngToJpg(previewFile, { quality: convertQuality });
            blob = r.blob;
          }
        }
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setPreviewOrigSize(previewFile.size);
        setPreviewNewSize(blob.size);
      } catch { /* ignore */ }
      setPreviewLoading(false);
    }, 500);
    return () => { if (previewTimerRef.current) clearTimeout(previewTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [op, previewFile, quality, compressFormat, targetFormat, convertQuality]);

  // Watermark live canvas preview
  useEffect(() => {
    if (op !== 'watermark' || !previewFile) return;
    if (wmPreviewTimerRef.current) clearTimeout(wmPreviewTimerRef.current);
    wmPreviewTimerRef.current = setTimeout(async () => {
      const canvas = wmCanvasRef.current;
      if (!canvas) return;
      const img = wmImgRef.current ?? new Image();
      if (!wmImgRef.current) {
        wmImgRef.current = img;
        const url = URL.createObjectURL(previewFile);
        await new Promise<void>((resolve) => { img.onload = () => { URL.revokeObjectURL(url); resolve(); }; img.onerror = () => { URL.revokeObjectURL(url); resolve(); }; img.src = url; });
      }
      if (img.naturalWidth === 0) return;
      const MAX_W = 1200;
      const scale = img.naturalWidth > MAX_W ? MAX_W / img.naturalWidth : 1;
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (!wmText.trim()) return;
      const scaledSize = Math.max(8, Math.round(wmFontSize * scale));
      try { await document.fonts.load(`bold ${scaledSize}px "${wmFontFamily}"`); } catch { /* ok */ }
      ctx.save();
      ctx.font = `bold ${scaledSize}px "${wmFontFamily}", sans-serif`;
      ctx.fillStyle = wmColor;
      ctx.globalAlpha = wmOpacity;
      ctx.textBaseline = 'top';
      const tw = ctx.measureText(wmText).width;
      const th = scaledSize * 1.2;
      const pad = Math.round(24 * scale);
      const getXY = (): [number, number] => {
        switch (wmPosition) {
          case 'top-left': return [pad, pad];
          case 'top-right': return [canvas.width - tw - pad, pad];
          case 'bottom-left': return [pad, canvas.height - th - pad];
          case 'center': return [(canvas.width - tw) / 2, (canvas.height - th) / 2];
          default: return [canvas.width - tw - pad, canvas.height - th - pad];
        }
      };
      if (wmPosition === 'tile') {
        const stepX = tw + Math.round(100 * scale);
        const stepY = th + Math.round(60 * scale);
        for (let ty = -th; ty < canvas.height + th; ty += stepY) {
          for (let tx = -tw; tx < canvas.width + tw; tx += stepX) {
            ctx.save();
            ctx.translate(tx + tw / 2, ty + th / 2);
            ctx.rotate((wmRotation * Math.PI) / 180);
            ctx.fillText(wmText, -tw / 2, -th / 2);
            ctx.restore();
          }
        }
      } else {
        const [x, y] = getXY();
        ctx.save();
        ctx.translate(x + tw / 2, y + th / 2);
        ctx.rotate((wmRotation * Math.PI) / 180);
        ctx.fillText(wmText, -tw / 2, -th / 2);
        ctx.restore();
      }
      ctx.restore();
    }, 200);
    return () => { if (wmPreviewTimerRef.current) clearTimeout(wmPreviewTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [op, previewFile, wmText, wmFontFamily, wmColor, wmPosition, wmOpacity, wmFontSize, wmRotation]);

  // Reload watermark preview image when preview file changes
  useEffect(() => {
    if (op !== 'watermark') return;
    wmImgRef.current = null;
  }, [op, previewFile]);

  // Load Google Fonts when watermark op is active
  useEffect(() => {
    if (op !== 'watermark') return;
    const el = document.createElement('link');
    el.rel = 'stylesheet'; el.href = GF_URL;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, [op]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      if (wmPreviewTimerRef.current) clearTimeout(wmPreviewTimerRef.current);
    };
  }, []);

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const reset = () => { setFiles([]); setProgress(0); setError(null); setPreviewIdx(0); };

  const processAll = async () => {
    if (files.length === 0) return;
    setProcessing(true); setError(null); setProgress(0);

    const { compressImage, resizeImage, pngToJpg, jpgToPng, jpgToWebp } = await import('@/lib/tools/image-processor');
    const { addWatermark } = await import('@/lib/tools/image-effects');

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'processing' };
      setFiles([...updated]);
      try {
        const f = updated[i].file;
        let blob: Blob;
        let ext: string = targetFormat;

        if (op === 'compress') {
          const fmt = compressFormat === 'auto' ? undefined : compressFormat;
          const r = await compressImage(f, { quality, format: fmt });
          blob = r.blob;
          ext = r.filename.split('.').pop() as string ?? 'jpg';
        } else if (op === 'resize') {
          const r = await resizeImage(f, { width: resizeW, height: resizeH, maintainAspectRatio: true });
          blob = r.blob;
          ext = r.filename.split('.').pop() as typeof ext ?? 'jpg';
        } else if (op === 'convert') {
          if (targetFormat === 'avif') {
            const r = await compressImage(f, { quality: convertQuality, format: 'avif' });
            blob = r.blob;
          } else if (targetFormat === 'webp') {
            const r = await jpgToWebp(f, { quality: convertQuality });
            blob = r.blob;
          } else if (targetFormat === 'png') {
            const r = await jpgToPng(f);
            blob = r.blob;
          } else {
            const r = await pngToJpg(f, { quality: convertQuality });
            blob = r.blob;
          }
          ext = targetFormat;
        } else {
          try { await document.fonts.load(`bold ${wmFontSize}px "${wmFontFamily}"`); } catch { /* fallback ok */ }
          blob = await addWatermark(f, {
            text: wmText, fontFamily: `"${wmFontFamily}", sans-serif`, textColor: wmColor,
            opacity: wmOpacity, position: wmPosition, fontSize: wmFontSize, rotation: wmRotation,
          });
          ext = f.name.split('.').pop() as typeof ext ?? 'jpg';
        }

        const base = f.name.replace(/\.[^/.]+$/, '');
        updated[i] = { ...updated[i], status: 'done', resultBlob: blob, resultName: `${base}_${op}.${ext}`, resultSize: blob.size };
      } catch (e) {
        updated[i] = { ...updated[i], status: 'error', errorMsg: (e as Error).message };
      }
      setFiles([...updated]);
      setProgress(Math.round(((i + 1) / updated.length) * 100));
    }
    setProcessing(false);
  };

  const doneFiles = files.filter((f) => f.status === 'done');
  const downloadAll = () => {
    doneFiles.forEach((f) => {
      if (f.resultBlob && f.resultName) downloadBlob(f.resultBlob, f.resultName);
    });
  };

  return (
    <div className="space-y-5">
      <div
        className="border-2 border-dashed border-slate-700 hover:border-slate-600 bg-slate-900/40 rounded-xl p-8 text-center cursor-pointer transition-colors"
        onClick={() => {
          const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
          inp.onchange = () => { if (inp.files) addFiles(Array.from(inp.files)); };
          inp.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))); }}
      >
        <span className="material-symbols-outlined text-slate-600 text-4xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
        <p className="text-slate-300 font-medium mb-1">{t('batchDropHint')}</p>
        <p className="text-slate-500 text-sm">{t('batchHint')}</p>
      </div>

      {files.length > 0 && (
        <>
          {/* Operation Selector */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h3 className="text-slate-200 font-semibold text-sm">{t('batchOperation')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { id: 'compress', label: t('compress'), icon: 'compress' },
                { id: 'resize', label: t('resize'), icon: 'photo_size_select_large' },
                { id: 'convert', label: t('convert'), icon: 'sync' },
                { id: 'watermark', label: t('watermark'), icon: 'branding_watermark' },
              ] as const).map((o) => (
                <button key={o.id} onClick={() => setOp(o.id)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-medium transition-colors ${
                    op === o.id ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}>
                  <span className="material-symbols-outlined text-xl">{o.icon}</span>
                  {o.label}
                </button>
              ))}
            </div>

            {/* Op-specific settings */}
            {op === 'compress' && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-slate-400 text-sm">Quality</label>
                    <span className="text-indigo-400 text-sm">{quality}%</span>
                  </div>
                  <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer" />
                </div>
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
                {(previewUrl || previewLoading) && op === 'compress' && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1.5">
                      {t('batchPreviewCaption', { name: previewFile?.name ?? '' })}
                      {previewLoading && <span className="text-indigo-400 ml-1">· {t('batchUpdating')}</span>}
                    </p>
                    {previewLoading && !previewUrl ? (
                      <div className="h-40 w-56 mx-auto bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
                    ) : previewUrl ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewUrl} alt="Compress preview"
                            className="block rounded-lg bg-slate-950 border border-slate-800 max-h-64 max-w-full w-auto" />
                        </div>
                        {previewOrigSize != null && previewNewSize != null && (
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="text-slate-500">{formatBytes(previewOrigSize)}</span>
                            <span className="text-slate-600">→</span>
                            <span className="text-slate-300">{formatBytes(previewNewSize)}</span>
                            {previewNewSize < previewOrigSize && (
                              <span className="text-emerald-400 font-medium">-{Math.round((1 - previewNewSize / previewOrigSize) * 100)}%</span>
                            )}
                            {previewNewSize > previewOrigSize && (
                              <span className="text-amber-400 font-medium">+{Math.round((previewNewSize / previewOrigSize - 1) * 100)}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
            {op === 'resize' && (
              <div className="space-y-3">
                {/* Presets */}
                <div className="space-y-2">
                  {RESIZE_PRESETS.map(group => (
                    <div key={group.groupKey}>
                      <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider mb-1">{t(group.groupKey)}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map(item => {
                          const active = resizeW === item.w && resizeH === item.h;
                          return (
                            <button
                              key={`${item.w}x${item.h}`}
                              onClick={() => { setResizeW(item.w); setResizeH(item.h); }}
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
                    <label className="text-slate-400 text-xs mb-1 block">{t('width')}</label>
                    <input type="number" value={resizeW} onChange={(e) => setResizeW(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">{t('height')}</label>
                    <input type="number" value={resizeH} onChange={(e) => setResizeH(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                {(resizePreviewUrl || resizePreviewLoading) && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1.5">
                      {t('batchPreviewCaption', { name: previewFile?.name ?? '' })} <span className="text-slate-600">{resizeW}×{resizeH}</span>
                      {resizePreviewLoading && <span className="text-indigo-400 ml-1">· {t('batchUpdating')}</span>}
                    </p>
                    {resizePreviewLoading && !resizePreviewUrl ? (
                      <div className="h-40 w-56 mx-auto bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
                    ) : resizePreviewUrl ? (
                      <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resizePreviewUrl} alt="Resize preview"
                          className="block rounded-lg bg-slate-950 border border-slate-800 max-h-64 max-w-full w-auto" />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
            {op === 'convert' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(['jpg', 'png', 'webp', 'avif'] as const).map((f) => (
                    <button key={f} onClick={() => setTargetFormat(f)}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                        targetFormat === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}>
                      .{f.toUpperCase()}
                    </button>
                  ))}
                </div>
                {targetFormat !== 'png' && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-slate-400 text-sm">Quality</label>
                      <span className="text-indigo-400 text-sm">{convertQuality}%</span>
                    </div>
                    <input type="range" min={10} max={100} value={convertQuality} onChange={(e) => setConvertQuality(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer" />
                  </div>
                )}
                {(previewUrl || previewLoading) && op === 'convert' && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1.5">
                      {t('batchPreviewCaption', { name: previewFile?.name ?? '' })}
                      {previewLoading && <span className="text-indigo-400 ml-1">· {t('batchUpdating')}</span>}
                    </p>
                    {previewLoading && !previewUrl ? (
                      <div className="h-40 w-56 mx-auto bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
                    ) : previewUrl ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewUrl} alt="Convert preview"
                            className="block rounded-lg bg-slate-950 border border-slate-800 max-h-64 max-w-full w-auto" />
                        </div>
                        {previewOrigSize != null && previewNewSize != null && (
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="text-slate-500">{formatBytes(previewOrigSize)}</span>
                            <span className="text-slate-600">→</span>
                            <span className="text-slate-300">{formatBytes(previewNewSize)}</span>
                            {previewNewSize < previewOrigSize && (
                              <span className="text-emerald-400 font-medium">-{Math.round((1 - previewNewSize / previewOrigSize) * 100)}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
            {op === 'watermark' && (
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">{t('watermarkText')}</label>
                  <input type="text" value={wmText} onChange={(e) => setWmText(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1.5 block">{t('batchFont')}</label>
                  <select value={wmFontFamily} onChange={(e) => setWmFontFamily(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    style={{ fontFamily: `"${wmFontFamily}", sans-serif` }}>
                    {WATERMARK_FONTS.map(f => (
                      <option key={f.css} value={f.css}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm mb-1.5 block">{t('batchTextColor')}</label>
                    <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)}
                      className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-slate-400 text-sm">{t('wmSize')}</label>
                      <span className="text-indigo-400 text-sm">{wmFontSize}px</span>
                    </div>
                    <input type="range" min={12} max={200} value={wmFontSize}
                      onChange={(e) => setWmFontSize(Number(e.target.value))}
                      className="w-full accent-indigo-500 mt-3 cursor-pointer" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-slate-400 text-sm">{t('wmOpacity')}</label>
                    <span className="text-indigo-400 text-sm">{Math.round(wmOpacity * 100)}%</span>
                  </div>
                  <input type="range" min={5} max={100} value={Math.round(wmOpacity * 100)}
                    onChange={(e) => setWmOpacity(Number(e.target.value) / 100)}
                    className="w-full accent-indigo-500 cursor-pointer" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm mb-1.5 block">{t('wmPosition')}</label>
                    <select value={wmPosition}
                      onChange={(e) => setWmPosition(e.target.value as typeof wmPosition)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
                      <option value="top-left">{t('wmPosTopLeft')}</option>
                      <option value="top-right">{t('wmPosTopRight')}</option>
                      <option value="bottom-left">{t('wmPosBottomLeft')}</option>
                      <option value="bottom-right">{t('wmPosBottomRight')}</option>
                      <option value="center">{t('wmPosCenter')}</option>
                      <option value="tile">{t('wmPosTile')}</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-slate-400 text-sm">{t('degrees')}</label>
                      <span className="text-indigo-400 text-sm">{wmRotation}°</span>
                    </div>
                    <input type="range" min={-180} max={180} value={wmRotation}
                      onChange={(e) => setWmRotation(Number(e.target.value))}
                      className="w-full accent-indigo-500 mt-3 cursor-pointer" />
                  </div>
                </div>
                {previewFile && (
                  <div>
                    <p className="text-slate-500 text-xs mb-1.5">
                      {t('batchPreviewCaption', { name: previewFile.name })}
                    </p>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                      <canvas ref={wmCanvasRef} className="w-full block select-none" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File list */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 max-h-72 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">{files.length} file{files.length !== 1 ? 's' : ''}</span>
              <button onClick={reset} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{t('clearAll')}</button>
            </div>
            {files.map((entry, i) => {
              const savings = entry.resultSize != null && entry.resultSize < entry.file.size
                ? Math.round((1 - entry.resultSize / entry.file.size) * 100)
                : 0;
              const isSelected = i === previewIdx;
              return (
                <div key={i}
                  onClick={() => setPreviewIdx(i)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-950 border-l-2 border-indigo-500 border-t border-r border-b border-t-slate-800 border-r-slate-800 border-b-slate-800'
                      : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                  }`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    entry.status === 'done' ? 'bg-emerald-400' :
                    entry.status === 'error' ? 'bg-red-400' :
                    entry.status === 'processing' ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'
                  }`} />
                  {isSelected && <span className="material-symbols-outlined text-indigo-400 text-sm flex-shrink-0">visibility</span>}
                  <span className={`text-xs flex-1 truncate ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>{entry.file.name}</span>
                  {entry.status === 'done' && entry.resultName && (
                    <span className="text-[10px] font-mono font-semibold bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-400 flex-shrink-0 uppercase">
                      {entry.resultName.split('.').pop()}
                    </span>
                  )}
                  {entry.status === 'done' && entry.resultSize != null ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-slate-500 text-xs">{formatBytes(entry.resultSize)}</span>
                      {savings > 0 && (
                        <span className="text-emerald-400 text-xs font-medium">-{savings}%</span>
                      )}
                      {entry.resultSize > entry.file.size && (
                        <span className="text-amber-400 text-xs font-medium">+{Math.round((entry.resultSize / entry.file.size - 1) * 100)}%</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-600 text-xs flex-shrink-0">{formatBytes(entry.file.size)}</span>
                  )}
                  {entry.status === 'done' && entry.resultBlob && (
                    <button
                      onClick={() => downloadBlob(entry.resultBlob!, entry.resultName!)}
                      className="flex-shrink-0 text-indigo-400 hover:text-indigo-300 transition-colors">
                      <span className="material-symbols-outlined text-base">download</span>
                    </button>
                  )}
                  {entry.status === 'pending' && (
                    <button onClick={() => removeFile(i)} className="flex-shrink-0 text-slate-600 hover:text-red-400 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                  {entry.status === 'error' && (
                    <span className="text-red-400 text-xs flex-shrink-0" title={entry.errorMsg}>{t('batchFailed')}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress */}
          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t('processingLabel')}</span>
                <span className="text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="h-2 bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-3">
            {doneFiles.length === 0 ? (
              <button onClick={processAll} disabled={processing || files.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
                <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                {t('batchProcessFiles', { count: files.length })}
              </button>
            ) : (
              <>
                <button onClick={downloadAll}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
                  <span className="material-symbols-outlined text-lg">download</span>
                  {t('batchDownloadAll', { count: doneFiles.length })}
                </button>
                <button onClick={reset}
                  className="flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700">
                  <span className="material-symbols-outlined text-lg">refresh</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export function ImageEditingCore({ mode }: Props) {
  let content: React.ReactNode;
  switch (mode) {
    case 'remove-bg':       content = <RemoveBgMode />; break;
    case 'add-watermark':   content = <WatermarkMode />; break;
    case 'drawing-canvas':  content = <DrawingCanvasMode />; break;
    case 'image-batch':     content = <ImageBatchMode />; break;
    default: content = null;
  }
  return (
    <div className="space-y-5">
      <ImageTabBar mode={mode} />
      {content}
    </div>
  );
}

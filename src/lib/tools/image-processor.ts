import type { ProcessOptions, ProcessResult } from '@/types/tools';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  return [canvas, canvas.getContext('2d')!];
}

// Native canvas encode — used for crop/rotate where speed matters over compression ratio
function canvasBlob(canvas: HTMLCanvasElement, mime: string, quality = 100): Promise<Blob> {
  return new Promise((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error(`${mime} export failed`)), mime, quality / 100)
  );
}

// JPEG: mozjpeg WASM — better quality/size ratio than browser encoder
async function toJpeg(imageData: ImageData, quality: number): Promise<Blob> {
  const { encode } = await import('@jsquash/jpeg');
  const buf = await encode(imageData, { quality });
  return new Blob([buf], { type: 'image/jpeg' });
}

// WebP: libwebp WASM — better quality/size ratio than browser encoder
async function toWebp(imageData: ImageData, quality: number): Promise<Blob> {
  const { encode } = await import('@jsquash/webp');
  const buf = await encode(imageData, { quality });
  return new Blob([buf], { type: 'image/webp' });
}

// AVIF: libavif WASM
async function toAvif(imageData: ImageData, quality: number): Promise<Blob> {
  const { encode } = await import('@/lib/wasm/avif-encode-st');
  const buf = await encode(imageData, { quality });
  return new Blob([buf], { type: 'image/avif' });
}

// PNG: lossless via oxipng WASM
async function toPng(imageData: ImageData): Promise<Blob> {
  const { encode } = await import('@jsquash/png');
  const { optimise } = await import('@/lib/wasm/oxipng-st');
  const raw = await encode(imageData);
  const opt = await optimise(raw, { level: 2 });
  return new Blob([opt], { type: 'image/png' });
}

function outName(name: string, suffix: string, ext: string): string {
  const base = name.replace(/\.[^/.]+$/, '');
  return suffix ? `${base}_${suffix}.${ext}` : `${base}.${ext}`;
}

function detectAlpha(img: HTMLImageElement): boolean {
  const sw = Math.min(img.naturalWidth, 64), sh = Math.min(img.naturalHeight, 64);
  const [, ctx] = makeCanvas(sw, sh);
  ctx.drawImage(img, 0, 0, sw, sh);
  const d = ctx.getImageData(0, 0, sw, sh).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 255) return true;
  return false;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function pngToJpg(file: File, options: ProcessOptions = {}): Promise<ProcessResult> {
  const img = await loadImage(file);
  const [canvas, ctx] = makeCanvas(img.naturalWidth, img.naturalHeight);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const blob = await toJpeg(ctx.getImageData(0, 0, canvas.width, canvas.height), options.quality ?? 92);
  return { blob, filename: outName(file.name, '', 'jpg'), originalSize: file.size, newSize: blob.size };
}

export async function jpgToPng(file: File): Promise<ProcessResult> {
  const img = await loadImage(file);
  const [canvas, ctx] = makeCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);
  const blob = await canvasBlob(canvas, 'image/png');
  return { blob, filename: outName(file.name, '', 'png'), originalSize: file.size, newSize: blob.size };
}

export async function jpgToWebp(file: File, options: ProcessOptions = {}): Promise<ProcessResult> {
  const img = await loadImage(file);
  const [canvas, ctx] = makeCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);
  const blob = await toWebp(ctx.getImageData(0, 0, canvas.width, canvas.height), options.quality ?? 85);
  return { blob, filename: outName(file.name, '', 'webp'), originalSize: file.size, newSize: blob.size };
}

export async function compressImage(file: File, options: ProcessOptions = {}): Promise<ProcessResult> {
  const img = await loadImage(file);
  const quality = options.quality ?? 80;
  const alpha = file.type === 'image/png' && detectAlpha(img);
  const fmt = options.format; // undefined = auto (best-of)

  const [canvas, ctx] = makeCanvas(img.naturalWidth, img.naturalHeight);
  if (!alpha && fmt !== 'png') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const encode = async (f: string, q: number) => {
    switch (f) {
      case 'png':  return { blob: await toPng(imageData), ext: 'png' };
      case 'jpg':  return { blob: await toJpeg(imageData, q), ext: 'jpg' };
      case 'avif': return { blob: await toAvif(imageData, q), ext: 'avif' };
      default:     return { blob: await toWebp(imageData, q), ext: 'webp' };
    }
  };

  let best: { blob: Blob; ext: string };

  if (fmt) {
    best = await encode(fmt, quality);
  } else {
    const webpBlob = await toWebp(imageData, quality);
    best = { blob: webpBlob, ext: 'webp' };
    if (!alpha) {
      const jpgBlob = await toJpeg(imageData, quality);
      if (jpgBlob.size < webpBlob.size) best = { blob: jpgBlob, ext: 'jpg' };
    }
    if (best.blob.size >= file.size) {
      for (const q of [70, 60, 50, 40, 30]) {
        const retry = await toWebp(imageData, q);
        if (retry.size < file.size) { best = { blob: retry, ext: 'webp' }; break; }
      }
    }
  }

  const base = file.name.replace(/\.[^/.]+$/, '');
  return { blob: best.blob, filename: `${base}_compressed.${best.ext}`, originalSize: file.size, newSize: best.blob.size };
}

export async function resizeImage(file: File, options: ProcessOptions = {}): Promise<ProcessResult> {
  const img = await loadImage(file);
  const ar = img.naturalWidth / img.naturalHeight;
  let { width: w, height: h } = options;
  if (w && !h)      h = options.maintainAspectRatio !== false ? Math.round(w / ar) : img.naturalHeight;
  else if (h && !w) w = options.maintainAspectRatio !== false ? Math.round(h * ar) : img.naturalWidth;
  else if (!w && !h) { w = img.naturalWidth; h = img.naturalHeight; }

  const [canvas, ctx] = makeCanvas(w!, h!);
  ctx.drawImage(img, 0, 0, w!, h!);

  const isPng  = file.type.includes('png');
  const isWebp = file.type.includes('webp');
  const ext    = isPng ? 'png' : isWebp ? 'webp' : 'jpg';
  const q      = options.quality ?? 92;

  // Resize: WASM encoders give better size/quality ratio when changing dimensions
  const blob = isPng  ? await canvasBlob(canvas, 'image/png')
             : isWebp ? await toWebp(ctx.getImageData(0, 0, w!, h!), q)
             :          await toJpeg(ctx.getImageData(0, 0, w!, h!), q);

  return { blob, filename: outName(file.name, `${w}x${h}`, ext), originalSize: file.size, newSize: blob.size };
}

export async function cropImage(file: File, options: ProcessOptions = {}): Promise<ProcessResult> {
  const img = await loadImage(file);
  const { cropX = 0, cropY = 0, cropWidth = img.naturalWidth, cropHeight = img.naturalHeight } = options;
  const [canvas] = makeCanvas(cropWidth, cropHeight);
  canvas.getContext('2d')!.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  const isPng  = file.type === 'image/png'  || file.name.toLowerCase().endsWith('.png');
  const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
  const mime   = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';
  const ext    = isPng ? 'png'       : isWebp ? 'webp'       : 'jpg';

  const blob = await canvasBlob(canvas, mime, isPng ? 100 : options.quality ?? 95);
  return { blob, filename: outName(file.name, 'cropped', ext), originalSize: file.size, newSize: blob.size };
}

export async function rotateImage(file: File, options: ProcessOptions = {}): Promise<ProcessResult> {
  const img = await loadImage(file);
  const degrees = options.degrees ?? 90;
  const { naturalWidth: w, naturalHeight: h } = img;
  const newW = degrees === 90 || degrees === 270 ? h : w;
  const newH = degrees === 90 || degrees === 270 ? w : h;

  const [canvas, ctx] = makeCanvas(newW, newH);
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(img, -w / 2, -h / 2);

  const isPng  = file.type === 'image/png'  || file.name.toLowerCase().endsWith('.png');
  const isWebp = file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp');
  const mime   = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';
  const ext    = isPng ? 'png'       : isWebp ? 'webp'       : 'jpg';

  const blob = await canvasBlob(canvas, mime, isPng ? 100 : options.quality ?? 95);
  return { blob, filename: outName(file.name, `rotated${degrees}`, ext), originalSize: file.size, newSize: blob.size };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

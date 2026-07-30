export interface FilterOptions {
  brightness?: number;  // -100 to 100
  contrast?: number;    // -100 to 100
  saturation?: number;  // -100 to 100
  hue?: number;         // 0 to 360
  blur?: number;        // 0 to 10
  sharpen?: boolean;
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
  noise?: number;       // 0 to 50
}

export interface WatermarkOptions {
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  opacity?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tile';
  rotation?: number;
  image?: File;
  imageOpacity?: number;
  imageScale?: number;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image from URL'));
    img.src = url;
  });
}

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext('2d')!];
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error('Canvas toBlob failed')),
      mimeType,
      quality
    );
  });
}

/** Apply a 3×3 convolution kernel to ImageData */
function applyConvolution(imageData: ImageData, kernel: number[], divisor = 1): ImageData {
  const { width, height, data } = imageData;
  const output = new Uint8ClampedArray(data.length);
  const half = Math.floor(Math.sqrt(kernel.length) / 2);
  const kSize = Math.round(Math.sqrt(kernel.length));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const idx = (py * width + px) * 4;
          const k = kernel[ky * kSize + kx];
          r += data[idx] * k;
          g += data[idx + 1] * k;
          b += data[idx + 2] * k;
        }
      }
      const idx = (y * width + x) * 4;
      output[idx] = Math.min(255, Math.max(0, r / divisor));
      output[idx + 1] = Math.min(255, Math.max(0, g / divisor));
      output[idx + 2] = Math.min(255, Math.max(0, b / divisor));
      output[idx + 3] = data[idx + 3];
    }
  }
  return new ImageData(output, width, height);
}

function getPositionXY(
  position: WatermarkOptions['position'],
  canvasW: number,
  canvasH: number,
  itemW: number,
  itemH: number,
  margin = 20
): { x: number; y: number } {
  switch (position) {
    case 'top-left':      return { x: margin, y: margin };
    case 'top-right':     return { x: canvasW - itemW - margin, y: margin };
    case 'bottom-left':   return { x: margin, y: canvasH - itemH - margin };
    case 'bottom-right':  return { x: canvasW - itemW - margin, y: canvasH - itemH - margin };
    case 'center':
    default:              return { x: (canvasW - itemW) / 2, y: (canvasH - itemH) / 2 };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function applyFilters(file: File, options: FilterOptions): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const [canvas, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);

  // Build CSS filter string for hardware-accelerated ops
  const filters: string[] = [];
  if (options.brightness !== undefined && options.brightness !== 0) {
    // CSS brightness: 1 = normal, map -100..100 → 0..2
    filters.push(`brightness(${1 + options.brightness / 100})`);
  }
  if (options.contrast !== undefined && options.contrast !== 0) {
    filters.push(`contrast(${1 + options.contrast / 100})`);
  }
  if (options.saturation !== undefined && options.saturation !== 0) {
    filters.push(`saturate(${1 + options.saturation / 100})`);
  }
  if (options.hue) {
    filters.push(`hue-rotate(${options.hue}deg)`);
  }
  if (options.blur) {
    filters.push(`blur(${options.blur}px)`);
  }
  if (options.grayscale) {
    filters.push('grayscale(1)');
  }
  if (options.sepia) {
    filters.push('sepia(1)');
  }
  if (options.invert) {
    filters.push('invert(1)');
  }

  ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
  ctx.drawImage(img, 0, 0);
  ctx.filter = 'none';

  // Pixel-level effects (sharpen, noise) applied to ImageData
  if (options.sharpen || (options.noise && options.noise > 0)) {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (options.sharpen) {
      const sharpenKernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      imageData = applyConvolution(imageData, sharpenKernel);
    }

    if (options.noise && options.noise > 0) {
      const { data } = imageData;
      const amount = options.noise;
      for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * amount * 2;
        data[i] = Math.min(255, Math.max(0, data[i] + n));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvasToBlob(canvas, mimeType);
}

export async function svgToPng(file: File, scale = 1): Promise<Blob> {
  const text = await file.text();
  const blob = new Blob([text], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImageFromUrl(url);
    const w = Math.round(img.naturalWidth * scale) || 800;
    const h = Math.round(img.naturalHeight * scale) || 600;
    const [canvas, ctx] = createCanvas(w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvasToBlob(canvas, 'image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function svgToJpg(
  file: File,
  quality = 0.92,
  bgColor = '#ffffff'
): Promise<Blob> {
  const text = await file.text();
  const blob = new Blob([text], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImageFromUrl(url);
    const w = img.naturalWidth || 800;
    const h = img.naturalHeight || 600;
    const [canvas, ctx] = createCanvas(w, h);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);
    return canvasToBlob(canvas, 'image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function addWatermark(file: File, options: WatermarkOptions): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const [canvas, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);

  const opacity = options.opacity ?? 0.5;
  ctx.save();
  ctx.globalAlpha = opacity;

  if (options.image) {
    // Image watermark
    const wm = await loadImageFromFile(options.image);
    const scale = options.imageScale ?? 0.2;
    const wmW = Math.round(img.naturalWidth * scale);
    const wmH = Math.round((wm.naturalHeight / wm.naturalWidth) * wmW);
    const wmOpacity = options.imageOpacity ?? opacity;

    ctx.globalAlpha = wmOpacity;

    if (options.position === 'tile') {
      const stepX = wmW + 20;
      const stepY = wmH + 20;
      for (let ty = 0; ty < canvas.height; ty += stepY) {
        for (let tx = 0; tx < canvas.width; tx += stepX) {
          ctx.drawImage(wm, tx, ty, wmW, wmH);
        }
      }
    } else {
      const { x, y } = getPositionXY(options.position, canvas.width, canvas.height, wmW, wmH);
      if (options.rotation) {
        ctx.translate(x + wmW / 2, y + wmH / 2);
        ctx.rotate((options.rotation * Math.PI) / 180);
        ctx.drawImage(wm, -wmW / 2, -wmH / 2, wmW, wmH);
      } else {
        ctx.drawImage(wm, x, y, wmW, wmH);
      }
    }
  } else if (options.text) {
    // Text watermark
    const fontSize = options.fontSize ?? 32;
    const fontFamily = options.fontFamily ?? 'Arial';
    const color = options.textColor ?? 'rgba(255,255,255,0.8)';
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;

    const metrics = ctx.measureText(options.text);
    const textW = metrics.width;
    const textH = fontSize;

    if (options.position === 'tile') {
      const stepX = textW + 40;
      const stepY = textH + 30;
      ctx.save();
      if (options.rotation) {
        for (let ty = -canvas.height; ty < canvas.height * 2; ty += stepY) {
          for (let tx = -canvas.width; tx < canvas.width * 2; tx += stepX) {
            ctx.save();
            ctx.translate(tx + textW / 2, ty + textH / 2);
            ctx.rotate((options.rotation * Math.PI) / 180);
            ctx.fillText(options.text!, -textW / 2, textH / 2);
            ctx.restore();
          }
        }
      } else {
        for (let ty = 0; ty < canvas.height; ty += stepY) {
          for (let tx = 0; tx < canvas.width; tx += stepX) {
            ctx.fillText(options.text!, tx, ty + textH);
          }
        }
      }
      ctx.restore();
    } else {
      const { x, y } = getPositionXY(options.position, canvas.width, canvas.height, textW, textH);
      if (options.rotation) {
        ctx.translate(x + textW / 2, y + textH / 2);
        ctx.rotate((options.rotation * Math.PI) / 180);
        ctx.fillText(options.text!, -textW / 2, textH / 2);
      } else {
        ctx.fillText(options.text!, x, y + textH);
      }
    }
  }

  ctx.restore();

  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvasToBlob(canvas, mimeType);
}

export async function getDominantColor(
  file: File
): Promise<{ r: number; g: number; b: number }> {
  const img = await loadImageFromFile(file);
  const sampleSize = 64;
  const [, ctx] = createCanvas(sampleSize, sampleSize);
  const canvas = ctx.canvas;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  // Sample corners + edges to get dominant background
  const corners = [
    [0, 0], [sampleSize - 1, 0],
    [0, sampleSize - 1], [sampleSize - 1, sampleSize - 1],
  ];
  for (const [cx, cy] of corners) {
    const i = (cy * sampleSize + cx) * 4;
    rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; count++;
  }

  return { r: Math.round(rSum / count), g: Math.round(gSum / count), b: Math.round(bSum / count) };
}

export async function removeBackground(
  file: File,
  tolerance = 30,
  customBgColor?: { r: number; g: number; b: number }
): Promise<Blob> {
  const img = await loadImageFromFile(file);
  const [canvas, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  const total = width * height;

  function getPixelRGB(x: number, y: number): [number, number, number] {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  }

  // --- Background color detection ---
  let bgR: number, bgG: number, bgB: number;
  let bgVariance = 0;

  if (customBgColor) {
    bgR = customBgColor.r;
    bgG = customBgColor.g;
    bgB = customBgColor.b;
  } else {
    const strip = Math.max(1, Math.min(3, Math.floor(Math.min(width, height) / 10)));
    const rs: number[] = [], gs: number[] = [], bs: number[] = [];

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < strip; y++) {
        const [r, g, b] = getPixelRGB(x, y); rs.push(r); gs.push(g); bs.push(b);
      }
      for (let y = height - strip; y < height; y++) {
        const [r, g, b] = getPixelRGB(x, y); rs.push(r); gs.push(g); bs.push(b);
      }
    }
    for (let y = strip; y < height - strip; y++) {
      for (let x = 0; x < strip; x++) {
        const [r, g, b] = getPixelRGB(x, y); rs.push(r); gs.push(g); bs.push(b);
      }
      for (let x = width - strip; x < width; x++) {
        const [r, g, b] = getPixelRGB(x, y); rs.push(r); gs.push(g); bs.push(b);
      }
    }

    rs.sort((a, b) => a - b); gs.sort((a, b) => a - b); bs.sort((a, b) => a - b);
    const mid = Math.floor(rs.length / 2);
    bgR = rs[mid]; bgG = gs[mid]; bgB = bs[mid];

    // Compute variance of edge pixels — used for adaptive tolerance on gradients
    let sumSq = 0;
    for (let i = 0; i < rs.length; i++) {
      const dr = rs[i] - bgR, dg = gs[i] - bgG, db = bs[i] - bgB;
      sumSq += 0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db;
    }
    bgVariance = Math.sqrt(sumSq / rs.length);
  }

  function colorDist(r: number, g: number, b: number): number {
    const dr = r - bgR, dg = g - bgG, db = b - bgB;
    return Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
  }

  // Adaptive tolerance: auto-increase for gradient backgrounds
  const effTol = Math.min(tolerance * 2.5, Math.max(tolerance, tolerance * 0.5 + bgVariance * 2.5));

  // --- Phase 1: Gradient-aware flood-fill from edges ---
  const visited = new Uint8Array(total);
  const queue: number[] = [];

  function tryEnqueue(x: number, y: number, pr: number, pg: number, pb: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const pi = idx * 4;
    const r = data[pi], g = data[pi + 1], b = data[pi + 2];
    const dist = colorDist(r, g, b);

    if (dist <= effTol) {
      visited[idx] = 1;
      queue.push(idx);
      return;
    }

    // Gradient following: allow traversal if locally smooth AND within extended range
    if (dist <= effTol * 1.8) {
      const dr = r - pr, dg = g - pg, db = b - pb;
      const localDist = Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
      if (localDist <= effTol * 0.3) {
        visited[idx] = 1;
        queue.push(idx);
      }
    }
  }

  // Seed from every pixel on all four edges
  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0, bgR, bgG, bgB);
    tryEnqueue(x, height - 1, bgR, bgG, bgB);
  }
  for (let y = 1; y < height - 1; y++) {
    tryEnqueue(0, y, bgR, bgG, bgB);
    tryEnqueue(width - 1, y, bgR, bgG, bgB);
  }

  while (queue.length > 0) {
    const idx = queue.pop()!;
    const x = idx % width;
    const y = (idx - x) / width;
    const pi = idx * 4;
    const pr = data[pi], pg = data[pi + 1], pb = data[pi + 2];
    tryEnqueue(x + 1, y, pr, pg, pb);
    tryEnqueue(x - 1, y, pr, pg, pb);
    tryEnqueue(x, y + 1, pr, pg, pb);
    tryEnqueue(x, y - 1, pr, pg, pb);
  }

  // --- Phase 2: Remove interior background islands ---
  // Catches background regions blocked by foreground elements (e.g. text on dark bg)
  const minIsland = Math.max(50, Math.floor(total * 0.0005));
  const checked = new Uint8Array(total);
  const islandTol = effTol * 0.8;

  for (let i = 0; i < total; i++) {
    if (visited[i] || checked[i]) continue;
    const pi = i * 4;
    if (colorDist(data[pi], data[pi + 1], data[pi + 2]) > islandTol) continue;

    const island: number[] = [i];
    checked[i] = 1;
    let h = 0;
    while (h < island.length) {
      const ci = island[h++];
      const cx = ci % width;
      const cy = (ci - cx) / width;
      const neighbors: [number, number][] = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (visited[ni] || checked[ni]) continue;
        const npi = ni * 4;
        if (colorDist(data[npi], data[npi + 1], data[npi + 2]) <= islandTol) {
          checked[ni] = 1;
          island.push(ni);
        }
      }
    }

    if (island.length >= minIsland) {
      for (const ci of island) visited[ci] = 1;
    }
  }

  // --- Phase 3: Alpha blending with smooth edge transition ---
  const hardZone = effTol * 0.35;
  const blendZone = effTol - hardZone;
  for (let i = 0; i < total; i++) {
    if (!visited[i]) continue;
    const pi = i * 4;
    const dist = colorDist(data[pi], data[pi + 1], data[pi + 2]);
    if (dist <= hardZone) {
      data[pi + 3] = 0;
    } else {
      const t = Math.min(1, (dist - hardZone) / blendZone);
      data[pi + 3] = Math.round(t * t * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas, 'image/png');
}

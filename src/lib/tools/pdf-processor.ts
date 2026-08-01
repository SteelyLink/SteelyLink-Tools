export async function mergePDFs(files: File[]): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib');
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const bytes = await mergedPdf.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function mergePDFsFromPages(
  buffers: ArrayBuffer[],
  order: { fileIdx: number; pageIdx: number }[]
): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib');
  const pdfs = await Promise.all(buffers.map(b => PDFDocument.load(b)));
  const out = await PDFDocument.create();
  for (const { fileIdx, pageIdx } of order) {
    const [page] = await out.copyPages(pdfs[fileIdx], [pageIdx]);
    out.addPage(page);
  }
  const bytes = await out.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function splitPDF(
  file: File,
  splitAt: number[]
): Promise<{ blob: Blob; pageRange: string }[]> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();

  const boundaries = [0, ...splitAt.filter((p) => p > 0 && p < totalPages), totalPages];
  const results: { blob: Blob; pageRange: string }[] = [];

  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    const newPdf = await PDFDocument.create();
    const indices = Array.from({ length: end - start }, (_, j) => start + j);
    const pages = await newPdf.copyPages(pdf, indices);
    pages.forEach((page) => newPdf.addPage(page));
    const bytes = await newPdf.save();
    results.push({
      blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
      pageRange: `pages_${start + 1}-${end}`,
    });
  }

  return results;
}

export async function getPDFPageCount(file: File): Promise<number> {
  const { PDFDocument } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
}

export async function compressPDF(file: File): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib');
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const saved = await pdf.save({ useObjectStreams: true });
  return new Blob([saved.buffer as ArrayBuffer], { type: 'application/pdf' });
}

async function deriveKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('artink-pdf-salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

const ENC_MAGIC = new Uint8Array([0x41, 0x50, 0x45, 0x4e, 0x43]); // "APENC"

export async function encryptPDF(file: File, password: string): Promise<Blob> {
  const key = await deriveKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const pdfBytes = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pdfBytes);
  // Layout: magic(5) | iv(12) | encrypted(n)
  const result = new Uint8Array(ENC_MAGIC.length + 12 + encrypted.byteLength);
  result.set(ENC_MAGIC, 0);
  result.set(iv, ENC_MAGIC.length);
  result.set(new Uint8Array(encrypted), ENC_MAGIC.length + 12);
  return new Blob([result.buffer], { type: 'application/octet-stream' });
}

export async function decryptPDF(file: File, password: string): Promise<Blob> {
  const rawBytes = await file.arrayBuffer();
  const data = new Uint8Array(rawBytes);

  // Check for our custom encrypted format
  const magic = data.slice(0, ENC_MAGIC.length);
  const isEncrypted = ENC_MAGIC.every((b, i) => magic[i] === b);

  if (isEncrypted) {
    const key = await deriveKey(password);
    const iv = data.slice(ENC_MAGIC.length, ENC_MAGIC.length + 12);
    const ciphertext = data.slice(ENC_MAGIC.length + 12);
    try {
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      return new Blob([decrypted], { type: 'application/pdf' });
    } catch {
      throw new Error('Decryption failed. Wrong password?');
    }
  }

  throw new Error('This file was not encrypted with the PDF Encrypt tool. Only .enc files created by this tool are supported.');
}

export interface WatermarkOptions {
  text: string;
  opacity: number;
  rotation: number;
  fontSize: number;
  color: [number, number, number];
  position: 'center' | 'diagonal';
}

export async function watermarkPDF(file: File, opts: WatermarkOptions): Promise<Blob> {
  const { PDFDocument, rgb, degrees } = await import('pdf-lib');
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const x = opts.position === 'center' ? width / 2 - (opts.text.length * opts.fontSize * 0.3) : width / 4;
    const y = opts.position === 'center' ? height / 2 : height / 4;
    page.drawText(opts.text, {
      x,
      y,
      size: opts.fontSize,
      color: rgb(opts.color[0], opts.color[1], opts.color[2]),
      opacity: opts.opacity,
      rotate: degrees(opts.position === 'diagonal' ? opts.rotation : 0),
    });
  }

  const saved = await pdf.save();
  return new Blob([saved.buffer as ArrayBuffer], { type: 'application/pdf' });
}

// pdfjs-dist is itself a webpack bundle; importing it through webpack breaks it with
// "Object.defineProperty called on non-object". Loading the copy in /public via
// `new Function` bypasses webpack, which is the same approach PDFToolCore uses.
// eslint-disable-next-line no-new-func, @typescript-eslint/no-explicit-any
const _dynamicImport = new Function('u', 'return import(u)') as (u: string) => Promise<any>;

export async function extractTextFromPDF(bytes: ArrayBuffer): Promise<string> {
  // Self-hosted, not jsdelivr: a third-party CDN turns every PDF text extraction into a
  // cross-origin round trip for 490 KB, and it is slow or unreachable behind the Great
  // Firewall — which looked exactly like the tool hanging with no feedback.
  const pdfjsLib: typeof import('pdfjs-dist') = await _dynamicImport('/pdfjs/pdf.min.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    let text = '';
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!('str' in item)) continue; // skip TextMarkedContent markers
      const y = item.transform[5];
      // New line when Y coordinate shifts by more than 5 units
      if (lastY !== null && Math.abs(y - lastY) > 5) text += '\n';
      text += item.str;
      if (item.hasEOL) text += '\n';
      lastY = y;
    }

    if (text.trim()) pageTexts.push(text.trim());
  }

  await pdf.destroy();
  return pageTexts.join('\n\n');
}

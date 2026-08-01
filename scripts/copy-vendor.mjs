/**
 * Copies third-party browser assets out of node_modules into public/.
 *
 * These are libraries the app loads at runtime rather than through the webpack bundle:
 * pdf.js is itself a bundle and breaks when webpack processes it, and Leaflet's stylesheet
 * is only needed by one tool. Both were previously fetched from cdn.jsdelivr.net, which
 * added a cross-origin round trip for 490 KB before any PDF could be read and is slow or
 * unreachable from mainland China — indistinguishable, to a visitor, from a broken tool.
 *
 * Copying at build time rather than committing the files keeps the version served in
 * lockstep with package.json; nothing under the destinations below is tracked by git.
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODULES = join(ROOT, 'node_modules');
const PUBLIC = join(ROOT, 'public');

/** [source under node_modules, destination under public, 'file' | 'dir'] */
const ASSETS = [
  ['pdfjs-dist/build/pdf.min.mjs', 'pdfjs/pdf.min.mjs', 'file'],
  ['pdfjs-dist/build/pdf.worker.min.mjs', 'pdfjs/pdf.worker.min.mjs', 'file'],
  ['leaflet/dist/leaflet.css', 'vendor/leaflet/leaflet.css', 'file'],
  // leaflet.css references images/ with relative URLs, so it has to travel with them.
  ['leaflet/dist/images', 'vendor/leaflet/images', 'dir'],
];

let copied = 0;

for (const [from, to, kind] of ASSETS) {
  const src = join(MODULES, from);
  const dest = join(PUBLIC, to);

  if (!existsSync(src)) {
    throw new Error(
      `Missing ${from} in node_modules. Run \`npm install\` before building — ` +
        'these files are copied at build time, not committed.'
    );
  }

  mkdirSync(dirname(dest), { recursive: true });
  if (kind === 'dir') {
    rmSync(dest, { recursive: true, force: true });
    cpSync(src, dest, { recursive: true });
  } else {
    copyFileSync(src, dest);
  }
  copied++;
}

console.log(`✓ vendor assets: ${copied} copied into public/`);

/**
 * Scans src/ for every Material Symbols icon name in use, then downloads a
 * subsetted font from the Google Fonts API containing only those glyphs.
 * The result is self-hosted in public/fonts/ so no external CDN is needed
 * at runtime — Google Fonts is blocked in mainland China.
 *
 * Run before `next build`: node scripts/build-icon-font.mjs
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'public', 'fonts', 'material-symbols-outlined.ttf');

// --------------- collect icon names ---------------

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry)) files.push(full);
  }
  return files;
}

const icons = new Set();

for (const file of walk(SRC)) {
  const content = readFileSync(file, 'utf8');

  // Literal children: <span className="material-symbols-outlined ...">home</span>
  for (const m of content.matchAll(/material-symbols-outlined[^>]*>\s*([a-z0-9_]+)\s*</g)) {
    icons.add(m[1]);
  }

  // Data fields: icon: 'home'
  for (const m of content.matchAll(/\bicon:\s*['"]([a-z0-9_]+)['"]/g)) {
    icons.add(m[1]);
  }
}

const sorted = [...icons].sort();
if (sorted.length === 0) throw new Error('No icon names found — check the scan patterns.');

// --------------- fetch subsetted font ---------------

const cssUrl =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined' +
  ':opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' +
  `&icon_names=${sorted.join(',')}` +
  '&display=swap';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
if (!cssRes.ok) throw new Error(`Google Fonts CSS request failed: ${cssRes.status}`);
const css = await cssRes.text();

if (css.includes('Invalid selector')) {
  throw new Error('Google Fonts rejected the icon list — one of the names is invalid.');
}

// Pick the weight-400 face (the .material-symbols-outlined class uses normal weight)
const face = css.split('@font-face').find((block) => /font-weight:\s*400/.test(block));
if (!face) throw new Error('Could not find the weight-400 @font-face block in the CSS.');

const fontUrl = face.match(/url\((https:\/\/[^)]+)\)/)?.[1];
if (!fontUrl) throw new Error('Could not extract the font URL from the CSS.');

const fontRes = await fetch(fontUrl, { headers: { 'User-Agent': UA } });
if (!fontRes.ok) throw new Error(`Font download failed: ${fontRes.status}`);
const font = Buffer.from(await fontRes.arrayBuffer());

writeFileSync(OUT, font);

console.log(`✓ icon font: ${sorted.length} icons → ${(font.length / 1024).toFixed(1)} KB`);

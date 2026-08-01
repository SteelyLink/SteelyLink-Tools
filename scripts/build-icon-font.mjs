/**
 * Builds a self-hosted, subsetted Material Symbols font containing exactly the
 * icons this site uses — and nothing else.
 *
 * Why this exists:
 *   - Google Fonts is unreachable from mainland China, so the font must be served
 *     from our own origin. Google's API is only touched here, at build time.
 *   - The full font is 3.9 MB. Subsetting takes it to ~35 KB.
 *   - Material Symbols resolves glyphs through *ligatures* — the text "music_note"
 *     maps to a glyph — not codepoints. So a name missing from the subset does not
 *     render a blank box, it renders the literal word "music_note". Missing even
 *     one name is visually loud, which makes completeness matter far more than
 *     saving a few KB.
 *
 * How names are collected:
 *   Icon names reach the DOM in many shapes here — JSX children, `icon:` registry
 *   fields, category maps (`audio: 'music_note'`), plain arrays (`['tune', ...]`),
 *   and inline ternaries. Pattern-matching each shape is what let `music_note`
 *   slip through before. So every lowercase string literal in src/ is treated as a
 *   *candidate* and Google's API decides which are real icon names. Over-inclusion
 *   costs a few bytes; under-inclusion breaks the UI.
 *
 *   Verdicts are cached in icon-names.cache.json (committed) so only newly
 *   introduced names cost a request.
 *
 * Output: public/fonts/material-symbols-outlined.woff2 — a VARIABLE font. It must
 * stay variable: the app sets `font-variation-settings: 'FILL' 1` in ~70 places,
 * and a static instance silently renders every one of those icons outlined.
 *
 * Run: npm run icons:build   (output is committed, so builds stay offline-safe)
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, rmSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'public', 'fonts', 'material-symbols-outlined.woff2');
const LEGACY_OUT = join(ROOT, 'public', 'fonts', 'material-symbols-outlined.ttf');
const CACHE = join(__dirname, 'icon-names.cache.json');

// A real browser UA is required. Without one Google serves seven single-weight
// static TTFs instead of the variable woff2 — which is how the FILL axis was lost.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// FILL is the only axis the app varies (`font-variation-settings: 'FILL' 1`, ~70
// call sites). wght/opsz/GRAD are left at their defaults, so they are pinned rather
// than shipped as variable axes: requesting all four costs 197 KB, FILL alone 25 KB.
const AXES = 'FILL@0..1';
const AXES_UNFILLED = 'FILL@0';

/**
 * Two undocumented quirks of the css2 `icon_names` API, both of which have already
 * caused shipped bugs:
 *   1. Names MUST be alphabetically sorted, or the request 400s.
 *   2. An unrecognised name does not error — `icon_names` is silently dropped and
 *      the entire 3.9 MB family is served. That is also the failure mode when the
 *      URL grows too long, so the caller must check what it actually got back.
 */
function cssUrl(names, axes = AXES) {
  return (
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:' +
    axes +
    `&icon_names=${[...names].sort().join(',')}` +
    '&display=block'
  );
}

/** Subset responses point at /l/font?kit=…; the full family at /s/materialsymbolsoutlined/…. */
function isSubset(css) {
  return /url\(https:\/\/fonts\.gstatic\.com\/l\/font\?kit=/.test(css);
}

async function fetchCss(names, axes = AXES) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(cssUrl(names, axes), { headers: { 'User-Agent': UA } });
      if (res.ok) return res.text();
      if (res.status === 400) {
        throw new Error(`Google Fonts rejected the request (400) for ${names.length} name(s).`);
      }
    } catch (err) {
      if (attempt === 2) throw err;
    }
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  throw new Error('Google Fonts CSS request failed after 3 attempts.');
}

async function fetchFont(css) {
  const url = css.match(/url\((https:\/\/[^)]+)\)\s*format\('woff2'\)/)?.[1];
  if (!url) throw new Error('Could not find a woff2 URL in the returned CSS.');
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Font download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------- collect names

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry)) files.push(full);
  }
  return files;
}

/** Names we are certain are icons — a typo in one of these is a bug worth failing on. */
const certain = new Set();
/** Names that merely look like they could be icons; Google decides. */
const candidates = new Set();

for (const file of walk(SRC)) {
  const content = readFileSync(file, 'utf8');

  // <span className="material-symbols-outlined ...">music_note</span>
  for (const m of content.matchAll(/material-symbols-outlined[^>]*>\s*([a-z][a-z0-9_]*)\s*</g)) {
    certain.add(m[1]);
  }
  // icon: 'music_note'
  for (const m of content.matchAll(/\bicon:\s*['"]([a-z][a-z0-9_]*)['"]/g)) {
    certain.add(m[1]);
  }
  // Any other string literal that could be an icon name in any position.
  for (const m of content.matchAll(/['"]([a-z][a-z0-9_]*)['"]/g)) {
    candidates.add(m[1]);
  }
}

for (const name of certain) candidates.add(name);

if (certain.size === 0) {
  throw new Error('No icon names found in src/ — the scan patterns are broken.');
}

// ------------------------------------------------------------------- validation

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};

/**
 * Asking for a single name is the one case where the subset-vs-full-family response
 * is a clean verdict on that name: a real icon yields a ~2 KB subset, anything else
 * yields the whole family.
 */
async function isIcon(name) {
  return isSubset(await fetchCss([name]));
}

const unknown = [...candidates].filter((n) => !(n in cache));
if (unknown.length) {
  process.stdout.write(`validating ${unknown.length} candidate names `);
  const queue = [...unknown];
  let done = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let name = queue.pop(); name; name = queue.pop()) {
        cache[name] = await isIcon(name);
        if (++done % 50 === 0) process.stdout.write('.');
      }
    })
  );
  process.stdout.write('\n');
  const sortedCache = Object.fromEntries(Object.keys(cache).sort().map((k) => [k, cache[k]]));
  writeFileSync(CACHE, JSON.stringify(sortedCache, null, 2) + '\n');
}

// A name we were certain about that Google rejects means a typo in source: that
// icon is rendering as raw text in production right now. Fail loudly.
const bogus = [...certain].filter((n) => !cache[n]);
if (bogus.length) {
  throw new Error(
    'Used as icons in src/ but not real Material Symbols names ' +
      `(these render as literal text):\n  ${bogus.join('\n  ')}`
  );
}

const icons = [...candidates].filter((n) => cache[n]).sort();

// ---------------------------------------------------------------- fetch subset

const css = await fetchCss(icons);

// Guards the silent full-family fallback — the likely cause is the icon_names list
// outgrowing the URL length Google accepts, which would ship 3.9 MB to every visitor.
if (!isSubset(css)) {
  throw new Error(
    `Google served the full 3.9 MB family instead of a subset for ${icons.length} icons ` +
      `(URL was ${cssUrl(icons).length} chars). The icon_names list is probably too long.`
  );
}

const font = await fetchFont(css);

// The FILL axis must actually be interpolable. A font pinned to FILL 0 renders every
// `font-variation-settings: 'FILL' 1` icon outlined — it looks plausible and is easy
// to miss, so assert it rather than trust the request. The variable font is strictly
// larger than the unfilled static instance because it carries the FILL deltas.
const flatFont = await fetchFont(await fetchCss(icons, AXES_UNFILLED));
if (font.length <= flatFont.length) {
  throw new Error(
    `Font does not carry a variable FILL axis (${font.length} bytes vs ${flatFont.length} ` +
      `for the FILL-0 instance). Filled icons would render outlined.`
  );
}

writeFileSync(OUT, font);
if (existsSync(LEGACY_OUT)) rmSync(LEGACY_OUT);

console.log(
  `✓ icon font: ${icons.length} glyphs (${certain.size} confirmed in use) → ` +
    `${(font.length / 1024).toFixed(1)} KB, variable woff2 (FILL 0..1)`
);

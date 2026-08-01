/**
 * Generates public/og-image.png (1200x630), the share card for every page.
 *
 * It must be a PNG. An SVG og:image is ignored by essentially every consumer that
 * matters — iOS Link Presentation (the Safari share sheet and iMessage), Twitter,
 * Facebook, WhatsApp, Slack. When they can't load it they fall back to the tiny
 * site favicon centred on a white card, which is the "white frame" this replaces.
 *
 * The PNG is committed, so deploys never need a rasterizer. Regenerate on a machine
 * with @resvg/resvg-js available:
 *     npm i --no-save @resvg/resvg-js && node scripts/generate-og-image.mjs
 * Text is rasterized using local system fonts, so re-run it only when the design
 * changes — not as part of every build.
 */
import { writeFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

const W = 1200;
const H = 630;

// The favicon mark: three squares and a diamond. Authored on a 960 grid, so it is
// scaled down rather than redrawn to keep one source of truth for the shape.
const MARK =
  'M677-409 409-677l268-267 267 267-267 268ZM31-489v-379h378v379H31ZM489-31v-378h379v378H489ZM31-31v-378h378v378H31Z';

// Arial is used explicitly rather than a system-ui stack: this renders through
// resvg, not a browser, and an unresolvable family silently drops the text.
const FONT = 'Arial';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#0f172a"/>
  <ellipse cx="1010" cy="120" rx="520" ry="400" fill="url(#glow)"/>

  <!-- Brand lockup -->
  <rect x="72" y="64" width="72" height="72" rx="18" fill="url(#brand)"/>
  <path transform="translate(90,82) scale(0.0375) translate(0,960)" d="${MARK}" fill="#ffffff"/>
  <text x="164" y="110" font-family="${FONT}" font-size="34" font-weight="bold" fill="#e2e8f0">SteelyLink Tools</text>

  <!-- Badge -->
  <rect x="72" y="258" width="286" height="46" rx="23" fill="#1e2540" stroke="#4f46e5" stroke-width="1.5"/>
  <text x="215" y="288" font-family="${FONT}" font-size="17" font-weight="bold" fill="#a5b4fc" text-anchor="middle" letter-spacing="1.5">FREE BROWSER TOOLS</text>

  <!-- Headline -->
  <text x="72" y="404" font-family="${FONT}" font-size="86" font-weight="bold" fill="#f8fafc">110 Online Tools</text>
  <text x="72" y="458" font-family="${FONT}" font-size="30" fill="#94a3b8">Image · PDF · Dev · Calculator · Gaming · Audio</text>

  <!-- Footer -->
  <rect x="72" y="524" width="1056" height="1.5" fill="#1e293b"/>
  <text x="72" y="574" font-family="${FONT}" font-size="24" fill="#64748b">tools.steelylink.com</text>
  <text x="1128" y="574" font-family="${FONT}" font-size="24" fill="#64748b" text-anchor="end">No sign-up · No install · Runs in your browser</text>
</svg>`;

const { Resvg } = await import('@resvg/resvg-js').catch(() => {
  throw new Error(
    'Rasterizing the OG image needs @resvg/resvg-js:\n' +
      '  npm i --no-save @resvg/resvg-js && node scripts/generate-og-image.mjs\n' +
      'public/og-image.png is committed, so this is only needed when the design changes.'
  );
});

const png = new Resvg(svg, {
  font: { loadSystemFonts: true, defaultFontFamily: FONT },
  fitTo: { mode: 'width', value: W },
}).render().asPng();

writeFileSync(join(PUBLIC, 'og-image.png'), png);

// The SVG version is deliberately not kept: leaving it around invites pointing
// og:image back at a format the share-sheet consumers can't read.
const staleSvg = join(PUBLIC, 'og-image.svg');
if (existsSync(staleSvg)) rmSync(staleSvg);

console.log(`✓ og-image.png (${W}x${H}) — ${(png.length / 1024).toFixed(1)} KB`);

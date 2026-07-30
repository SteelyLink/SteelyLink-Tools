/**
 * Generates a static OG image (1200x630) as SVG and embeds it as a data URL
 * for the opengraph-image. Since we can't use next/og in static export,
 * we generate a simple SVG and save it as public/og-image.svg.
 *
 * For PNG conversion, use: npx sharp-cli -i public/og-image.svg -o public/og-image.png
 * Or just use the SVG directly — most social platforms accept it.
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0f172a"/>
  <!-- Brand icon -->
  <rect x="72" y="64" width="40" height="40" rx="10" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <text x="92" y="92" font-family="system-ui,sans-serif" font-size="22" font-weight="800" fill="white" text-anchor="middle" dominant-baseline="central">S</text>
  <text x="126" y="88" font-family="system-ui,sans-serif" font-size="22" font-weight="600" fill="#94a3b8">SteelyLink Tools</text>
  <!-- Badge -->
  <rect x="72" y="280" width="240" height="40" rx="20" fill="rgba(99,102,241,0.12)" stroke="rgba(99,102,241,0.3)" stroke-width="1"/>
  <text x="192" y="305" font-family="system-ui,sans-serif" font-size="15" font-weight="700" fill="#818cf8" text-anchor="middle" letter-spacing="0.08em">FREE BROWSER TOOLS</text>
  <!-- Title -->
  <text x="72" y="390" font-family="system-ui,sans-serif" font-size="68" font-weight="800" fill="#f1f5f9">110 Online Tools</text>
  <!-- Subtitle -->
  <text x="72" y="440" font-family="system-ui,sans-serif" font-size="26" fill="#64748b">Image · PDF · Dev · Calculator · Gaming · Audio</text>
  <!-- Bottom -->
  <text x="72" y="570" font-family="system-ui,sans-serif" font-size="20" fill="#475569">tools.steelylink.com · No Sign-up · No Install</text>
</svg>`;

writeFileSync(join(PUBLIC, 'og-image.svg'), svg, 'utf8');
console.log('✓ og-image.svg (1200x630)');

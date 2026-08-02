/**
 * Renders every brand icon from scripts/brand.mjs.
 *
 * Writes:
 *   public/favicon.svg          vector, used by browsers that prefer it
 *   public/favicon.png          64x64
 *   public/favicon.ico          32x32 + 16x16
 *   public/apple-touch-icon.png 180x180
 *   public/icon-192.png         192x192, referenced by the web manifest
 *   public/icon-512.png         512x512, referenced by the web manifest
 *
 * All six are the same opaque, square tile. Previously only apple-touch-icon.png was —
 * the favicons were a purple glyph on transparency, and iOS Link Presentation (the
 * Safari share sheet) does not always pick the touch icon. When it fell back to a
 * favicon it composited the transparency onto white, which is the white square the
 * share card kept showing. Making every source full-bleed removes the choice.
 *
 * Output is committed, so deploys never need a rasterizer. Regenerate on a machine
 * with @resvg/resvg-js available:
 *     npm i --no-save @resvg/resvg-js && npm run brand:build
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tileSvg } from './brand.mjs';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const { Resvg } = await import('@resvg/resvg-js').catch(() => {
  throw new Error(
    'Rendering the brand icons needs @resvg/resvg-js:\n' +
      '  npm i --no-save @resvg/resvg-js && npm run brand:build\n' +
      'The output is committed, so this is only needed when the mark changes.'
  );
});

const svg = tileSvg();
const png = (size) =>
  Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng());

/**
 * Packs PNGs into an ICO container. ICO has carried PNG payloads since Vista and every
 * browser that still asks for favicon.ico reads them, so there's no need to emit BMP.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette size — 0 for truecolor
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const outputs = [
  ['favicon.svg', Buffer.from(svg, 'utf8')],
  ['favicon.png', png(64)],
  ['favicon.ico', ico([32, 16].map((size) => ({ size, data: png(size) })))],
  ['apple-touch-icon.png', png(180)],
  ['icon-192.png', png(192)],
  ['icon-512.png', png(512)],
  // og:image. Square on purpose — see the note in src/lib/utils/seo.ts.
  ['og-icon.png', png(1200)],
];

for (const [name, data] of outputs) {
  writeFileSync(join(PUBLIC, name), data);
  console.log(`✓ ${name.padEnd(21)} ${(data.length / 1024).toFixed(1)} KB`);
}

/**
 * Renders every brand icon from scripts/brand.mjs.
 *
 * Transparent glyph, for the browser tab:
 *   public/favicon.svg          vector; every engine that honours sizes="any" takes this
 *
 * Opaque tile, for anywhere the icon is drawn onto someone else's surface — and, per the
 * note below, for the one engine that won't draw a transparent favicon at all:
 *   public/favicon.ico          32x32 + 16x16  iOS Safari's tab icon
 *   public/apple-touch-icon.png 180x180  iOS home screen
 *   public/icon-192.png         192x192  web manifest
 *   public/icon-512.png         512x512  web manifest
 *   public/og-icon.png          1200x1200 og:image
 *
 * See scripts/brand.mjs for why the split exists.
 *
 * Output is committed, so deploys never need a rasterizer. Regenerate on a machine
 * with @resvg/resvg-js available:
 *     npm i --no-save @resvg/resvg-js && npm run brand:build
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glyphSvg, tileSvg } from './brand.mjs';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const { Resvg } = await import('@resvg/resvg-js').catch(() => {
  throw new Error(
    'Rendering the brand icons needs @resvg/resvg-js:\n' +
      '  npm i --no-save @resvg/resvg-js && npm run brand:build\n' +
      'The output is committed, so this is only needed when the mark changes.'
  );
});

const tile = tileSvg();
const glyph = glyphSvg();

const render = (svg, size) =>
  Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng());

const png = (size) => render(tile, size);

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
  ['favicon.svg', Buffer.from(glyph + '\n', 'utf8')],
  /*
   * The .ico is rendered from the TILE, not the glyph, and it is the only favicon that is.
   * That looks inconsistent and it is deliberate.
   *
   * iOS Safari draws a globe placeholder instead of this site's icon whenever the favicon
   * it resolves has any transparency in it. Measured across four shipped revisions, with
   * the icon on disk decoded for each:
   *
   *   feb92a0  fully opaque   ICO 32+16  ->  iOS drew the icon
   *   b66c810  transparent    ICO 32+16  ->  globe
   *   11aad1e  transparent    ICO 16/32/48 -> globe
   *   9dff318  transparent    ICO 16/32/48 -> globe, with the SVG declared first instead
   *
   * b66c810 shares feb92a0's exact ICO layout and differs only in transparency, which is
   * what rules out the container; 9dff318 rules out declaration order. Opacity is the only
   * attribute that tracks the outcome. I can't point at the WebKit code that does this, so
   * treat the mechanism as unexplained and the correlation as measured.
   *
   * Desktop keeps the transparent glyph because favicon.svg carries sizes="any", which
   * Chrome and Firefox honour as "prefer the scalable one" — and which 9dff318 proved does
   * NOT hand the SVG to Safari. So the two engines take different files on purpose, and
   * favicon.png is gone: a third raster candidate only adds a way for a desktop browser to
   * land on the tile by accident.
   *
   * 32 then 16, two entries, is feb92a0's layout reproduced rather than reinvented.
   */
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

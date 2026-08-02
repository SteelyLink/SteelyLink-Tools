/**
 * The single definition of the SteelyLink Tools mark.
 *
 * Every icon the site ships is drawn from here, so the brand can't drift between them.
 *
 * There are two forms, because the two places an icon lands want opposite things:
 *
 *   The TILE — apple-touch-icon, the manifest icons, og:image. These get drawn onto a
 *   surface the site doesn't control, so the background has to be painted: iOS
 *   composites transparency onto white, which is where the white square behind the
 *   share-sheet icon came from. The tile is also square-cornered, because a rounded
 *   corner is a transparent corner; iOS and Android apply their own mask.
 *
 *   The GLYPH — favicon.svg, favicon.png, favicon.ico. A browser tab is the one place
 *   a transparent icon is right: it sits on the tab strip, adopts the user's light or
 *   dark chrome, and needs no card behind it. It's also tiny, so it's drawn full bleed
 *   — the tile's 22-unit padding is a third of a 16px favicon and throws away the
 *   detail that makes the mark legible at that size.
 *
 * Making the favicons tiles was a fix for the share card, back when iOS was falling
 * back to a favicon. It doesn't any more: og:image is a square tile of its own, and
 * Link Presentation reads og:image before it looks at any icon. So the tab keeps the
 * glyph and the share card keeps the tile.
 *
 * Geometry is authored on a 180-unit grid, matching the 180x180 apple-touch icon.
 */

/**
 * Query string appended to every icon URL. The filenames have to stay put — browsers
 * and iOS probe /favicon.ico and /apple-touch-icon.png directly — but the icons are
 * served with a 30-day max-age plus a year of stale-while-revalidate, so a client that
 * already holds the old artwork would keep drawing it long after a deploy. Bumping
 * this makes the redraw immediate.
 *
 * Bump on any change to the mark, and keep it in step with src/app/layout.tsx.
 */
export const ICON_VERSION = 3;

/** Diagonal tile gradient, sampled from the original apple-touch-icon. */
export const GRADIENT = [
  ['0%', '#3730a3'],
  ['50%', '#4f46e5'],
  ['100%', '#6d28d9'],
];

/** The mark itself — near-white rather than pure white, again matching the original. */
export const MARK_COLOR = '#f6f6fd';

/**
 * The mark when it stands alone on transparency, as it does in a browser tab. Indigo
 * 500 — one step brighter than the tile gradient, because a tab strip is a light or
 * mid-grey background rather than the dark surface the site is designed on, and the
 * darker gradient purples go muddy against it at 16px.
 */
export const GLYPH_COLOR = '#6366f1';

/** Canvas the geometry below is authored against. */
export const GRID = 180;

// A 2x2 grid of 63-unit cells: 22 padding, 10 gutter. Three cells hold a rounded
// square; the top-right holds the same square rotated onto its corner.
const PAD = 22;
const CELL = 63;
const GAP = 10;
const SQUARE_RX = 8;
const DIAMOND_SIDE = 44;
const DIAMOND_RX = 6;

const CELL_2 = PAD + CELL + GAP;
const DIAMOND_CX = CELL_2 + CELL / 2;
const DIAMOND_CY = PAD + CELL / 2;

/**
 * The four white shapes, without a background. Indented to sit inside a tile.
 */
export function markShapes(fill = MARK_COLOR, indent = '  ') {
  const square = (x, y) =>
    `${indent}<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="${SQUARE_RX}" fill="${fill}"/>`;
  const half = DIAMOND_SIDE / 2;
  return [
    square(PAD, PAD),
    square(PAD, CELL_2),
    square(CELL_2, CELL_2),
    `${indent}<rect x="${-half}" y="${-half}" width="${DIAMOND_SIDE}" height="${DIAMOND_SIDE}" ` +
      `rx="${DIAMOND_RX}" fill="${fill}" ` +
      `transform="translate(${DIAMOND_CX} ${DIAMOND_CY}) rotate(45)"/>`,
  ].join('\n');
}

/**
 * A complete, opaque, square icon tile.
 *
 * @param {object}  [opts]
 * @param {number}  [opts.size]  pixel width/height written to the root element
 * @param {string}  [opts.id]    gradient id, so the tile can be inlined in a larger SVG
 */
export function tileSvg({ size = GRID, id = 'tile' } = {}) {
  const stops = GRADIENT.map(
    ([offset, color]) => `      <stop offset="${offset}" stop-color="${color}"/>`
  ).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${GRID} ${GRID}">
  <defs>
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
${stops}
    </linearGradient>
  </defs>
  <rect width="${GRID}" height="${GRID}" fill="url(#${id})"/>
${markShapes()}
</svg>`;
}

/**
 * The mark alone, on transparency, cropped to itself.
 *
 * Same shapes as the tile — the viewBox just clips the tile's padding away instead of
 * the geometry being authored twice, so the two can't drift. `BLEED` leaves a hair of
 * margin so the outermost corners aren't clipped by a viewport rounding error.
 *
 * @param {object} [opts]
 * @param {number} [opts.size]   pixel width/height written to the root element
 * @param {string} [opts.fill]   glyph colour
 */
export function glyphSvg({ size = GRID, fill = GLYPH_COLOR } = {}) {
  const BLEED = 4;
  const min = PAD - BLEED;
  const span = GRID - 2 * min;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${min} ${min} ${span} ${span}">
${markShapes(fill)}
</svg>`;
}

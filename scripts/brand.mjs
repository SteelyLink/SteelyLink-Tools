/**
 * The single definition of the SteelyLink Tools mark.
 *
 * Every icon the site ships — favicon.svg, favicon.png, favicon.ico,
 * apple-touch-icon.png and the lockup on og-image.png — is drawn from here, so the
 * brand can't drift between them. It drifted before: the favicons were a bare purple
 * mark on a *transparent* background while apple-touch-icon.png was a full-bleed
 * gradient tile. iOS composites transparency onto white, so whenever the share sheet
 * picked a favicon over the touch icon it drew a purple glyph inside a white square.
 *
 * Two rules keep that from coming back:
 *   1. The tile is opaque edge to edge — the background is painted, never left blank.
 *   2. The tile has square corners. A rounded corner is a transparent corner, and iOS
 *      renders that as white. Platforms that want a rounded icon (iOS home screen,
 *      Android adaptive icons) apply their own mask.
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
export const ICON_VERSION = 2;

/** Diagonal tile gradient, sampled from the original apple-touch-icon. */
export const GRADIENT = [
  ['0%', '#3730a3'],
  ['50%', '#4f46e5'],
  ['100%', '#6d28d9'],
];

/** The mark itself — near-white rather than pure white, again matching the original. */
export const MARK_COLOR = '#f6f6fd';

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

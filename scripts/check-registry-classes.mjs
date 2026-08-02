/**
 * Fails if any icon colour stored in the tool registry was purged from the built CSS.
 *
 * `colorClass` / `iconBgClass` live in src/lib/tools/registry.ts, which is data rather
 * than a component. Tailwind only emits classes it can see as literal text in a file
 * matched by `content`, and src/lib was missing from that list — so 74 of the 91
 * registry classes never made it into the stylesheet and those tools rendered their
 * icon with no colour at all. This guards the glob.
 *
 * Run after a build:  node scripts/check-registry-classes.mjs
 */
import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_DIR = join(ROOT, 'out', '_next', 'static', 'css');

const css = readdirSync(CSS_DIR)
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join(CSS_DIR, f), 'utf8'))
  .join('\n');

const registry = readFileSync(join(ROOT, 'src', 'lib', 'tools', 'registry.ts'), 'utf8');

const classes = new Set();
for (const [, value] of registry.matchAll(/(?:colorClass|iconBgClass):\s*'([^']+)'/g)) {
  for (const c of value.split(/\s+/)) if (c) classes.add(c);
}

// Tailwind escapes `/` in a generated selector, so `from-rose-500/20` is emitted as
// `.from-rose-500\/20`.
const selector = (c) => '.' + c.replace(/\//g, '\\/');
const missing = [...classes].filter((c) => !css.includes(selector(c)));

console.log(`registry icon classes: ${classes.size}`);
if (missing.length) {
  console.error(`✗ ${missing.length} purged from the built CSS:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log('✓ all present in the built CSS');

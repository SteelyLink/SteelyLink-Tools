// Single-threaded oxipng wrapper — avoids the wasm-bindgen-rayon worker
// that Turbopack cannot compile.
async function initST(moduleOrPath) {
  const { default: init, optimise, optimise_raw } = await import(
    '@jsquash/oxipng/codec/pkg/squoosh_oxipng.js'
  );
  await init(moduleOrPath);
  return { optimise, optimise_raw };
}

let wasmReady;

export async function init(moduleOrPath) {
  if (!wasmReady) wasmReady = initST(moduleOrPath);
  return wasmReady;
}

export async function optimise(data, options = {}) {
  const { optimise: _optimise } = await init();
  return _optimise(data, options.level ?? 2, options.interlace ?? false);
}

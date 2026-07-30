// Single-threaded AVIF encoder — bypasses the multi-threaded worker
// (avif_enc_mt.worker.mjs) whose dynamic import expression hangs Turbopack.
import { defaultOptions } from '@jsquash/avif/meta.js';
import { initEmscriptenModule } from '@jsquash/avif/utils.js';

let emscriptenModule;

async function init(module, moduleOptionOverrides) {
  let actualModule = module;
  let actualOptions = moduleOptionOverrides;
  if (arguments.length === 1 && !(module instanceof WebAssembly.Module)) {
    actualModule = undefined;
    actualOptions = module;
  }
  const avifEncoder = await import('@jsquash/avif/codec/enc/avif_enc.js');
  emscriptenModule = initEmscriptenModule(avifEncoder.default, actualModule, actualOptions);
  return emscriptenModule;
}

export async function encode(data, options = {}) {
  if (!emscriptenModule) emscriptenModule = init();
  const _options = { ...defaultOptions, ...options };
  const module = await emscriptenModule;
  const result = module.encode(data.data, data.width, data.height, _options);
  if (!result) throw new Error('Encoding error.');
  return result;
}

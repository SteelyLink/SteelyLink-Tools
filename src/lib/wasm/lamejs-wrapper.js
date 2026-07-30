// Wrapper to avoid Turbopack CJS resolution issues with lamejs/src/js/index.js
// Re-implements Mp3Encoder using lamejs internals with explicit ESM imports

/* eslint-disable */

// Import common first — every other module depends on it at require-time,
// and Turbopack handles static ESM imports more reliably than dynamic CJS require chains.
import common from 'lamejs/src/js/common.js';

// Patch globalThis so the CJS modules' require('./common.js') resolves
// (Turbopack sometimes loses the binding in deep CJS chains)
if (typeof globalThis.__lamejs_common === 'undefined') {
  globalThis.__lamejs_common = common;
}

const { new_byte, assert } = common;

// Use dynamic import to let Turbopack process each file independently
let _ready;
function init() {
  if (_ready) return _ready;
  _ready = Promise.all([
    import('lamejs/src/js/MPEGMode.js'),
    import('lamejs/src/js/Lame.js'),
    import('lamejs/src/js/GainAnalysis.js'),
    import('lamejs/src/js/QuantizePVT.js'),
    import('lamejs/src/js/Quantize.js'),
    import('lamejs/src/js/Takehiro.js'),
    import('lamejs/src/js/Reservoir.js'),
    import('lamejs/src/js/BitStream.js'),
    import('lamejs/src/js/Encoder.js'),
    import('lamejs/src/js/Version.js'),
    import('lamejs/src/js/VBRTag.js'),
    import('lamejs/src/js/Presets.js'),
  ]).then(([
    MPEGMode, Lame, GainAnalysis, QuantizePVT, Quantize,
    Takehiro, Reservoir, BitStream, Encoder, Version, VBRTag, Presets,
  ]) => ({
    MPEGMode: MPEGMode.default ?? MPEGMode,
    Lame: Lame.default ?? Lame,
    GainAnalysis: GainAnalysis.default ?? GainAnalysis,
    QuantizePVT: QuantizePVT.default ?? QuantizePVT,
    Quantize: Quantize.default ?? Quantize,
    Takehiro: Takehiro.default ?? Takehiro,
    Reservoir: Reservoir.default ?? Reservoir,
    BitStream: BitStream.default ?? BitStream,
    Encoder: Encoder.default ?? Encoder,
    Version: Version.default ?? Version,
    VBRTag: VBRTag.default ?? VBRTag,
    Presets: Presets.default ?? Presets,
  }));
  return _ready;
}

export class Mp3Encoder {
  /** @type {Promise<void>} */
  _init;
  _encode;
  _flush;

  constructor(channels = 1, samplerate = 44100, kbps = 128) {
    this._init = init().then((mods) => {
      const {
        MPEGMode, Lame, GainAnalysis, QuantizePVT, Quantize,
        Takehiro, Reservoir, BitStream, Version, VBRTag, Presets,
      } = mods;

      const lame = new Lame();
      const ga = new GainAnalysis();
      const bs = new BitStream();
      const p = new Presets();
      const qupvt = new QuantizePVT();
      const qu = new Quantize();
      const vbr = new VBRTag();
      const ver = new Version();
      const rv = new Reservoir();
      const tak = new Takehiro();

      lame.setModules(ga, bs, p, qupvt, qu, vbr, ver, { setModules() {} }, {});
      bs.setModules(ga, {}, ver, vbr);
      p.setModules(lame);
      qu.setModules(bs, rv, qupvt, tak);
      qupvt.setModules(tak, rv, lame.enc.psy);
      rv.setModules(bs);
      tak.setModules(qupvt);
      vbr.setModules(lame, bs, ver);

      const gfp = lame.lame_init();
      gfp.num_channels = channels;
      gfp.in_samplerate = samplerate;
      gfp.brate = kbps;
      gfp.mode = MPEGMode.STEREO;
      gfp.quality = 3;
      gfp.bWriteVbrTag = false;
      gfp.disable_reservoir = true;
      gfp.write_id3tag_automatic = false;

      lame.lame_init_params(gfp);
      let maxSamples = 1152;
      let mp3buf_size = 0 | (1.25 * maxSamples + 7200);
      let mp3buf = new_byte(mp3buf_size);

      this._encode = (left, right) => {
        if (channels === 1) right = left;
        if (left.length > maxSamples) {
          maxSamples = left.length;
          mp3buf_size = 0 | (1.25 * maxSamples + 7200);
          mp3buf = new_byte(mp3buf_size);
        }
        const sz = lame.lame_encode_buffer(gfp, left, right, left.length, mp3buf, 0, mp3buf_size);
        return new Int8Array(mp3buf.subarray(0, sz));
      };

      this._flush = () => {
        const sz = lame.lame_encode_flush(gfp, mp3buf, 0, mp3buf_size);
        return new Int8Array(mp3buf.subarray(0, sz));
      };
    });
  }

  async encodeBuffer(left, right) {
    await this._init;
    return this._encode(left, right);
  }

  async flush() {
    await this._init;
    return this._flush();
  }
}

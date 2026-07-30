export interface AudioInfo {
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
  size: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = new AudioContext();
  try {
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    return buffer;
  } finally {
    await ctx.close();
  }
}

export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);       // sub-chunk size
  view.setUint16(20, 1, true);        // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);       // bits per sample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channel data
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/** Render an AudioBuffer into a new OfflineAudioContext and return the result. */
async function renderOffline(
  source: AudioBuffer,
  setupGraph: (ctx: OfflineAudioContext, src: AudioBufferSourceNode) => AudioNode
): Promise<AudioBuffer> {
  const offCtx = new OfflineAudioContext(
    source.numberOfChannels,
    source.length,
    source.sampleRate
  );
  const srcNode = offCtx.createBufferSource();
  srcNode.buffer = source;
  const output = setupGraph(offCtx, srcNode);
  output.connect(offCtx.destination);
  srcNode.start(0);
  return offCtx.startRendering();
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getAudioInfo(file: File): Promise<AudioInfo> {
  const buffer = await decodeAudioFile(file);
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'unknown';
  return {
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    channels: buffer.numberOfChannels,
    format: ext,
    size: file.size,
  };
}

export async function trimAudio(
  file: File,
  startSec: number,
  endSec: number
): Promise<Blob> {
  const source = await decodeAudioFile(file);
  const { sampleRate, numberOfChannels } = source;

  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.min(Math.floor(endSec * sampleRate), source.length);
  const trimLength = Math.max(0, endSample - startSample);

  const offCtx = new OfflineAudioContext(numberOfChannels, trimLength, sampleRate);
  const srcNode = offCtx.createBufferSource();
  srcNode.buffer = source;
  srcNode.connect(offCtx.destination);
  srcNode.start(0, startSec, endSec - startSec);

  const rendered = await offCtx.startRendering();
  return audioBufferToWav(rendered);
}

export async function adjustVolume(file: File, multiplier: number): Promise<Blob> {
  const source = await decodeAudioFile(file);
  const rendered = await renderOffline(source, (ctx, src) => {
    const gainNode = ctx.createGain();
    gainNode.gain.value = multiplier;
    src.connect(gainNode);
    return gainNode;
  });
  return audioBufferToWav(rendered);
}

/** Resample an AudioBuffer to a different sample rate via OfflineAudioContext. */
async function resampleBuffer(buf: AudioBuffer, targetRate: number): Promise<AudioBuffer> {
  if (buf.sampleRate === targetRate) return buf;
  const n = Math.round(buf.duration * targetRate);
  const off = new OfflineAudioContext(buf.numberOfChannels, n, targetRate);
  const src = off.createBufferSource();
  src.buffer = buf;
  src.connect(off.destination);
  src.start(0);
  return off.startRendering();
}

export async function convertAudio(
  file: File,
  targetFormat: 'wav' | 'mp3' | 'webm' | string,
  options?: { bitrate?: 128 | 192 | 320; sampleRate?: 44100 | 48000 }
): Promise<Blob> {
  const buffer = await decodeAudioFile(file);
  const resampled = options?.sampleRate ? await resampleBuffer(buffer, options.sampleRate) : buffer;

  if (targetFormat === 'wav' || targetFormat === 'audio/wav') {
    return audioBufferToWav(resampled);
  }

  if (targetFormat === 'mp3' || targetFormat === 'audio/mpeg') {
    return exportTrimmedAudio(resampled, 0, resampled.duration, 'mp3', options?.bitrate ?? 192);
  }

  // WebM/OGG via MediaRecorder
  const targetMimeType = targetFormat.includes('/') ? targetFormat : `audio/${targetFormat}`;
  if (!MediaRecorder.isTypeSupported(targetMimeType)) {
    return audioBufferToWav(resampled);
  }

  const wavBlob = audioBufferToWav(resampled);
  return new Promise<Blob>((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(wavBlob);
    audio.src = url;

    audio.addEventListener('canplaythrough', async () => {
      URL.revokeObjectURL(url);
      const ctx = new AudioContext();
      const srcNode = ctx.createMediaElementSource(audio);
      const dest = ctx.createMediaStreamDestination();
      srcNode.connect(dest);

      const recorder = new MediaRecorder(dest.stream, { mimeType: targetMimeType });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => { ctx.close(); resolve(new Blob(chunks, { type: targetMimeType })); };
      recorder.onerror = (e) => { ctx.close(); reject(e); };
      recorder.start();
      audio.play();
      audio.addEventListener('ended', () => recorder.stop());
    }, { once: true });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio for conversion'));
    }, { once: true });
  });
}

export async function mergeAudio(
  files: File[],
  options?: { fadeIn?: number; fadeOut?: number }
): Promise<Blob> {
  if (files.length === 0) throw new Error('No files provided');
  if (files.length === 1) {
    const buf = await decodeAudioFile(files[0]);
    return audioBufferToWav(buf);
  }

  const buffers = await Promise.all(files.map(decodeAudioFile));
  const sampleRate = Math.max(...buffers.map((b) => b.sampleRate));
  const numChannels = Math.max(...buffers.map((b) => b.numberOfChannels));
  const totalLength = buffers.reduce((sum, b) => sum + Math.ceil(b.duration * sampleRate), 0);

  const offCtx = new OfflineAudioContext(numChannels, totalLength, sampleRate);
  let offsetSamples = 0;
  for (const buf of buffers) {
    const segStart = offsetSamples / sampleRate;
    const segDur = buf.duration;
    const segEnd = segStart + segDur;
    const fi = Math.min(options?.fadeIn  ?? 0, segDur / 2);
    const fo = Math.min(options?.fadeOut ?? 0, segDur / 2);

    const src = offCtx.createBufferSource();
    src.buffer = buf;

    if (fi > 0 || fo > 0) {
      const gain = offCtx.createGain();
      if (fi > 0) {
        gain.gain.setValueAtTime(0, segStart);
        gain.gain.linearRampToValueAtTime(1, segStart + fi);
      } else {
        gain.gain.setValueAtTime(1, segStart);
      }
      if (fo > 0) {
        gain.gain.setValueAtTime(1, segEnd - fo);
        gain.gain.linearRampToValueAtTime(0, segEnd);
      }
      src.connect(gain);
      gain.connect(offCtx.destination);
    } else {
      src.connect(offCtx.destination);
    }

    src.start(segStart);
    offsetSamples += Math.ceil(buf.duration * sampleRate);
  }

  const rendered = await offCtx.startRendering();
  return audioBufferToWav(rendered);
}

export async function splitAudio(file: File, splitAt: number[]): Promise<Blob[]> {
  const source = await decodeAudioFile(file);
  const duration = source.duration;

  // Build boundaries: [0, ...splitAt, duration]
  const sorted = [...splitAt].filter((t) => t > 0 && t < duration).sort((a, b) => a - b);
  const boundaries = [0, ...sorted, duration];

  const blobs: Blob[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    const blob = await trimAudio(file, start, end);
    blobs.push(blob);
  }
  return blobs;
}

/**
 * Trim an AudioBuffer to [startSec, endSec] and encode as MP3 or WAV.
 * MP3 uses lamejs (client-side, no server required).
 */
export async function exportTrimmedAudio(
  buffer: AudioBuffer,
  startSec: number,
  endSec: number,
  format: 'mp3' | 'wav',
  bitrate: 128 | 192 | 320 = 192
): Promise<Blob> {
  const { sampleRate, numberOfChannels } = buffer;
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.min(Math.floor(endSec * sampleRate), buffer.length);
  const trimLen = Math.max(1, endSample - startSample);

  const offCtx = new OfflineAudioContext(numberOfChannels, trimLen, sampleRate);
  const src = offCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(offCtx.destination);
  src.start(0, startSec, endSec - startSec);
  const trimmed = await offCtx.startRendering();

  if (format === 'wav') return audioBufferToWav(trimmed);

  const { Mp3Encoder } = await import('@/lib/wasm/lamejs-bundle.mjs');
  const channels = (numberOfChannels > 1 ? 2 : 1) as 1 | 2;
  const encoder = new Mp3Encoder(channels, sampleRate, bitrate);
  const BLOCK = 1152;
  const chunks: Uint8Array[] = [];

  const toInt16 = (ch: Float32Array): Int16Array => {
    const out = new Int16Array(ch.length);
    for (let i = 0; i < ch.length; i++) {
      out[i] = Math.max(-32768, Math.min(32767, Math.round(ch[i] * 32767)));
    }
    return out;
  };

  const left = toInt16(trimmed.getChannelData(0));
  const right = channels === 2 ? toInt16(trimmed.getChannelData(1)) : left;

  for (let i = 0; i < left.length; i += BLOCK) {
    const lc = left.subarray(i, i + BLOCK);
    const enc = channels === 2
      ? encoder.encodeBuffer(lc, right.subarray(i, i + BLOCK))
      : encoder.encodeBuffer(lc);
    if (enc.length > 0) chunks.push(enc);
  }
  const tail = encoder.flush();
  if (tail.length > 0) chunks.push(tail);

  return new Blob(chunks.map((c) => new Uint8Array(c)), { type: 'audio/mpeg' });
}

export async function denoiseAudio(file: File): Promise<Blob> {
  const TARGET_SR  = 48000;
  const FRAME_SIZE = 480;
  const SCALE      = 32768;

  const source = await decodeAudioFile(file);

  // Resample to 48 kHz if the source is at a different rate
  let work: AudioBuffer;
  if (source.sampleRate !== TARGET_SR) {
    const targetLen = Math.round(source.duration * TARGET_SR);
    const ctx = new OfflineAudioContext(source.numberOfChannels, targetLen, TARGET_SR);
    const node = ctx.createBufferSource();
    node.buffer = source;
    node.connect(ctx.destination);
    node.start(0);
    work = await ctx.startRendering();
  } else {
    work = source;
  }

  // Load RNNoise WASM (dynamically, ~100 KB, cached after first load)
  // locateFile override needed because Next.js bundling breaks Emscripten's scriptDirectory-relative WASM lookup;
  // rnnoise.wasm is copied to public/ and served at the root path.
  const { createRNNWasmModule } = await import('@jitsi/rnnoise-wasm');
  const rn = await createRNNWasmModule({ locateFile: () => '/rnnoise.wasm' });

  const inPtr  = rn._malloc(FRAME_SIZE * 4);
  const outPtr = rn._malloc(FRAME_SIZE * 4);

  const denoised = new AudioBuffer({
    numberOfChannels: work.numberOfChannels,
    length: work.length,
    sampleRate: TARGET_SR,
  });

  for (let ch = 0; ch < work.numberOfChannels; ch++) {
    const inp = work.getChannelData(ch);
    const out = denoised.getChannelData(ch);
    const state = rn._rnnoise_create(0);

    for (let i = 0; i < inp.length; i += FRAME_SIZE) {
      for (let j = 0; j < FRAME_SIZE; j++) {
        rn.HEAPF32[(inPtr >> 2) + j] = (i + j < inp.length ? inp[i + j] : 0) * SCALE;
      }
      rn._rnnoise_process_frame(state, outPtr, inPtr);
      for (let j = 0; j < FRAME_SIZE && i + j < out.length; j++) {
        out[i + j] = rn.HEAPF32[(outPtr >> 2) + j] / SCALE;
      }
    }

    rn._rnnoise_destroy(state);
  }

  rn._free(inPtr);
  rn._free(outPtr);

  // Resample back to original rate if we upsampled earlier
  if (source.sampleRate !== TARGET_SR) {
    const ctx = new OfflineAudioContext(source.numberOfChannels, source.length, source.sampleRate);
    const node = ctx.createBufferSource();
    node.buffer = denoised;
    node.connect(ctx.destination);
    node.start(0);
    return audioBufferToWav(await ctx.startRendering());
  }

  return audioBufferToWav(denoised);
}


'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ImageTabBar } from './ImageTabBar';

const MAX_FILE_MB  = 50;
const MAX_CLIP_SEC = 30;
const FPS_OPTIONS  = [5, 10, 15, 20] as const;
const WIDTH_OPTIONS = [320, 480, 640] as const;

type Phase = 'idle' | 'loaded' | 'converting' | 'done' | 'error';
type Fps   = typeof FPS_OPTIONS[number];
type W     = typeof WIDTH_OPTIONS[number];

function fmt(s: number) {
  const m  = Math.floor(s / 60);
  const sc = Math.floor(s % 60);
  const cs = Math.floor((s % 1) * 10);
  return `${m}:${String(sc).padStart(2, '0')}.${cs}`;
}
function fmtBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

async function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  if (Math.abs(video.currentTime - time) < 0.005) return;
  return new Promise(resolve => {
    let settled = false;
    const done = () => { if (!settled) { settled = true; resolve(); } };
    const timeout = setTimeout(done, 2000);
    video.addEventListener('seeked', function h() {
      video.removeEventListener('seeked', h);
      clearTimeout(timeout);
      done();
    }, { once: true });
    video.currentTime = time;
  });
}

interface Props { mode: string; }

export function VideoGifCore({ mode }: Props) {
  const t = useTranslations('Tool');
  const [phase, setPhase]         = useState<Phase>('idle');
  const [file, setFile]           = useState<File | null>(null);
  const [videoUrl, setVideoUrl]   = useState('');
  const [duration, setDuration]   = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime]     = useState(0);
  const [fps, setFps]             = useState<Fps>(10);
  const [outWidth, setOutWidth]   = useState<W>(480);
  const [progress, setProgress]   = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [gifUrl, setGifUrl]       = useState('');
  const [gifSize, setGifSize]     = useState(0);
  const [error, setError]         = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const gifBlobRef = useRef('');
  const abortRef   = useRef(false);
  const timeInited = useRef(false);

  const loadFile = useCallback((f: File) => {
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_MB} MB. Please use a smaller video.`);
      setPhase('error');
      return;
    }
    const ok = ['video/mp4', 'video/webm', 'video/quicktime'].includes(f.type)
      || /\.(mp4|webm|mov)$/i.test(f.name);
    if (!ok) {
      setError('Unsupported format. Please upload MP4, WebM, or MOV.');
      setPhase('error');
      return;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (gifBlobRef.current) { URL.revokeObjectURL(gifBlobRef.current); gifBlobRef.current = ''; }
    timeInited.current = false;
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setGifUrl('');
    setError('');
    setPhase('loaded');
  }, [videoUrl]);

  const onVideoLoaded = useCallback(() => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    setDuration(v.duration);
    if (!timeInited.current) {
      timeInited.current = true;
      setStartTime(0);
      setEndTime(Math.min(v.duration, MAX_CLIP_SEC));
    }
  }, []);

  const handleConvert = useCallback(async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !file) return;

    const clipLen = endTime - startTime;
    if (clipLen <= 0 || clipLen > MAX_CLIP_SEC) return;

    abortRef.current = false;
    setPhase('converting');
    setProgress(0);
    setError('');

    try {
      const scale     = outWidth / video.videoWidth;
      const outHeight = Math.round(video.videoHeight * scale);
      canvas.width    = outWidth;
      canvas.height   = outHeight;
      const ctx       = canvas.getContext('2d', { willReadFrequently: true })!;

      const totalFrames = Math.max(1, Math.round(clipLen * fps));

      // — Phase 1: extract frames —
      setStatusMsg(t('extractingFrames'));
      const frames: Uint8ClampedArray[] = [];
      for (let i = 0; i < totalFrames; i++) {
        if (abortRef.current) return;
        await seekTo(video, startTime + i / fps);
        ctx.drawImage(video, 0, 0, outWidth, outHeight);
        frames.push(new Uint8ClampedArray(ctx.getImageData(0, 0, outWidth, outHeight).data));
        setProgress((i + 1) / totalFrames * 0.5);
        await new Promise(r => setTimeout(r, 0));
      }
      if (abortRef.current) return;

      // — Phase 2: encode GIF —
      setStatusMsg(t('encodingGif'));
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
      const gif   = GIFEncoder();
      const delay = Math.round(1000 / fps); // ms per frame

      for (let i = 0; i < frames.length; i++) {
        if (abortRef.current) return;
        const palette = quantize(frames[i], 256);
        const index   = applyPalette(frames[i], palette);
        gif.writeFrame(index, outWidth, outHeight, { palette, delay });
        setProgress(0.5 + (i + 1) / frames.length * 0.5);
        await new Promise(r => setTimeout(r, 0));
      }

      gif.finish();
      const raw  = gif.bytes();
      // Copy into a plain ArrayBuffer to satisfy the Blob constructor type
      const ab   = new ArrayBuffer(raw.byteLength);
      new Uint8Array(ab).set(raw);
      const blob = new Blob([ab], { type: 'image/gif' });
      if (gifBlobRef.current) URL.revokeObjectURL(gifBlobRef.current);
      const url = URL.createObjectURL(blob);
      gifBlobRef.current = url;
      setGifUrl(url);
      setGifSize(blob.size);
      setStatusMsg('');
      setPhase('done');
    } catch (e) {
      console.error(e);
      setError('Conversion failed. Try a shorter clip, lower FPS, or smaller width.');
      setPhase('loaded');
    }
  }, [file, startTime, endTime, fps, outWidth]);

  const handleDownload = useCallback(() => {
    if (!gifUrl || !file) return;
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = file.name.replace(/\.[^.]+$/, '.gif');
    a.click();
  }, [gifUrl, file]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  }, [loadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { loadFile(f); e.target.value = ''; }
  }, [loadFile]);

  const accept  = mode === 'mp4-to-gif'
    ? '.mp4,video/mp4'
    : '.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime';
  const clipLen    = endTime - startTime;
  const frameCount = Math.max(1, Math.round(clipLen * fps));
  const pct        = Math.round(progress * 100);

  return (
    <div className="space-y-5">
      <ImageTabBar mode={mode} />

      {/* Hidden canvas used for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Idle: upload zone ── */}
      {phase === 'idle' && (
        <label
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`flex flex-col items-center justify-center gap-5 min-h-[240px] rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-400 bg-indigo-600/10'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/30 hover:bg-slate-900/50'
          }`}
        >
          <input type="file" accept={accept} onChange={handleFileInput} className="hidden" />
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>
              video_file
            </span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-slate-200 font-semibold">
              {t('dropVideoHere')}
            </p>
            <p className="text-slate-500 text-sm">
              {mode === 'mp4-to-gif' ? 'MP4' : 'MP4 · WebM · MOV'} &nbsp;·&nbsp; Max {MAX_FILE_MB} MB &nbsp;·&nbsp; Max {MAX_CLIP_SEC}s
            </p>
          </div>
        </label>
      )}

      {/* ── File-load error ── */}
      {phase === 'error' && (
        <div className="space-y-3">
          <div className="flex gap-3 p-4 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-sm">
            <span className="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">error</span>
            {error}
          </div>
          <label className="btn-ghost text-sm cursor-pointer inline-flex items-center gap-2">
            <input type="file" accept={accept} onChange={handleFileInput} className="hidden" />
            {t('tryAnotherFile')}
          </label>
        </div>
      )}

      {/* ── Loaded / Converting / Done ──
           The video element lives here always (after load) so videoRef is valid during conversion */}
      {videoUrl && (
        <div className="space-y-5">
          {/* Video — visible in 'loaded' phase, sr-only during convert/done */}
          <div className={phase === 'loaded' ? 'grid md:grid-cols-[1fr_1fr] gap-5 items-start' : ''}>
            <div className={phase === 'loaded' ? 'space-y-2' : 'sr-only pointer-events-none'}>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('sourceVideoLabel')}</p>
              <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={onVideoLoaded}
                controls={phase === 'loaded'}
                muted
                playsInline
                preload="metadata"
                className="w-full rounded-xl bg-black block"
              />
              {file && <p className="text-slate-600 text-xs">{file.name} · {fmtBytes(file.size)}</p>}
            </div>

            {/* Settings panel — loaded phase only */}
            {phase === 'loaded' && (
              <div className="space-y-5">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('settingsLabel')}</p>

                {/* Start time */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">{t('startTime')}</span>
                    <span className="text-indigo-300 font-mono font-bold">{fmt(startTime)}</span>
                  </div>
                  <input type="range"
                    min={0} max={Math.max(0, endTime - 0.1)} step={0.1}
                    value={startTime}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setStartTime(v);
                      if (videoRef.current) videoRef.current.currentTime = v;
                    }}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* End time */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">{t('endTime')}</span>
                    <span className="text-indigo-300 font-mono font-bold">{fmt(endTime)}</span>
                  </div>
                  <input type="range"
                    min={Math.min(duration, startTime + 0.1)}
                    max={Math.min(duration, startTime + MAX_CLIP_SEC)}
                    step={0.1}
                    value={endTime}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setEndTime(v);
                      if (videoRef.current) videoRef.current.currentTime = v;
                    }}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {clipLen > MAX_CLIP_SEC && (
                  <p className="text-amber-400 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Clip exceeds {MAX_CLIP_SEC}s limit. Please shorten the selection.
                  </p>
                )}

                {/* FPS */}
                <div>
                  <p className="text-slate-400 text-sm mb-2">{t('frameRate')}</p>
                  <div className="flex gap-2 flex-wrap">
                    {FPS_OPTIONS.map(f => (
                      <button key={f} onClick={() => setFps(f)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                          fps === f
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}>
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width */}
                <div>
                  <p className="text-slate-400 text-sm mb-2">{t('outputWidth')}</p>
                  <div className="flex gap-2">
                    {WIDTH_OPTIONS.map(w => (
                      <button key={w} onClick={() => setOutWidth(w)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                          outWidth === w
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}>
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: t('duration'), value: `${clipLen.toFixed(1)}s` },
                    { label: t('frames'),   value: `~${frameCount}` },
                  ].map(r => (
                    <div key={r.label} className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                      <p className="text-slate-500">{r.label}</p>
                      <p className="text-slate-200 font-semibold mt-0.5">{r.value}</p>
                    </div>
                  ))}
                </div>

                {/* Inline conversion error */}
                {error && (
                  <div className="flex gap-2 p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-sm">
                    <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleConvert}
                    disabled={clipLen <= 0 || clipLen > MAX_CLIP_SEC}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>gif</span>
                    {t('convertToGif')}
                  </button>
                  <label className="btn-ghost text-sm cursor-pointer flex items-center gap-1.5">
                    <input type="file" accept={accept} onChange={handleFileInput} className="hidden" />
                    <span className="material-symbols-outlined text-base">swap_horiz</span>
                    {t('changeFile')}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ── Converting: progress ── */}
          {phase === 'converting' && (
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{statusMsg}</span>
                <span className="text-indigo-400 font-mono font-bold">{pct}%</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg,#4f46e5,#818cf8)',
                  }}
                />
              </div>
              <p className="text-slate-600 text-xs">
                Processing {frameCount} frames at {fps} FPS · {outWidth}px wide
              </p>
              <button
                onClick={() => { abortRef.current = true; setPhase('loaded'); setStatusMsg(''); }}
                className="btn-ghost text-sm"
              >
                {t('cancelBtn')}
              </button>
            </div>
          )}

          {/* ── Done: result ── */}
          {phase === 'done' && gifUrl && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-5 items-start">
                {/* GIF preview */}
                <div className="space-y-2">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('generatedGif')}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gifUrl}
                    alt="Generated GIF"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900"
                  />
                  <p className="text-slate-500 text-xs">
                    {fmtBytes(gifSize)} · {outWidth}px · {fps} FPS · {frameCount} frames
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('downloadGif')}</p>
                  <button onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
                    <span className="material-symbols-outlined">download</span>
                    {t('downloadGif')}&nbsp;
                    <span className="text-indigo-200 text-sm font-normal">({fmtBytes(gifSize)})</span>
                  </button>
                  <button onClick={() => setPhase('loaded')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 transition-colors text-sm">
                    <span className="material-symbols-outlined text-base">tune</span>
                    {t('adjustSettings')}
                  </button>
                  <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 transition-colors text-sm cursor-pointer">
                    <input type="file" accept={accept} onChange={handleFileInput} className="hidden" />
                    <span className="material-symbols-outlined text-base">video_file</span>
                    {t('convertAnotherVideo')}
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SEO descriptive content ── */}
      {phase === 'idle' && (
        <div className="pt-2 border-t border-slate-800 space-y-3 text-sm text-slate-500">
          <p>{t('gifDesc')}</p>
          <ul className="grid sm:grid-cols-3 gap-2">
            {[
              { icon: 'lock',  label: t('gifPerkNoUpload') },
              { icon: 'timer', label: t('gifPerkMaxClip', { sec: MAX_CLIP_SEC }) },
              { icon: 'tune',  label: t('gifPerkFpsSize') },
            ].map(f => (
              <li key={f.icon} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
                <span className="material-symbols-outlined text-base text-indigo-400">{f.icon}</span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

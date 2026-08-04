'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export type AudioMode =
  | 'audio-trim'
  | 'audio-volume'
  | 'audio-convert'
  | 'audio-merge'
  | 'audio-split'
  | 'audio-denoise';

interface Props {
  mode: AudioMode;
}

// ─── Utility ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function getOutputName(original: string, suffix: string, ext = 'wav'): string {
  const base = original.replace(/\.[^/.]+$/, '');
  return `${base}_${suffix}.${ext}`;
}

// ─── Time helpers ────────────────────────────────────────────────────────────

function fmtMs(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function parseTimeInput(val: string): number | null {
  const colon = val.trim().match(/^(\d+):(\d{2})\.(\d{1,3})$/);
  if (colon) return parseInt(colon[1]) * 60 + parseInt(colon[2]) + parseInt(colon[3].padEnd(3, '0')) / 1000;
  const plain = parseFloat(val.trim());
  return isNaN(plain) ? null : plain;
}

function calcRulerInterval(viewDuration: number): number {
  const candidates = [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10, 30, 60, 120, 300];
  const target = viewDuration / 8;
  return candidates.find((c) => c >= target) ?? 300;
}

// ─── TimeInput ───────────────────────────────────────────────────────────────

function TimeInput({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');
  const apply = () => {
    setEditing(false);
    const v = parseTimeInput(raw);
    if (v !== null) onChange(Math.max(min, Math.min(max, v)));
  };
  return (
    <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
      <p className="text-slate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">{label}</p>
      <input
        type="text"
        value={editing ? raw : fmtMs(value)}
        onFocus={() => { setEditing(true); setRaw(fmtMs(value)); }}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={apply}
        onKeyDown={(e) => { if (e.key === 'Enter') apply(); if (e.key === 'Escape') setEditing(false); }}
        className="w-full text-slate-200 text-base font-mono bg-transparent focus:outline-none focus:text-indigo-400 transition-colors cursor-text select-all"
      />
    </div>
  );
}

// ─── File Info Panel ─────────────────────────────────────────────────────────

interface AudioFileInfo {
  name: string;
  size: number;
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
}

function FileInfoCard({ info, onRemove }: { info: AudioFileInfo; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        <span className="material-symbols-outlined text-indigo-400 flex-shrink-0 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          audio_file
        </span>
        <div className="min-w-0">
          <p className="text-slate-200 text-sm font-medium truncate">{info.name}</p>
          <p className="text-slate-500 text-xs mt-0.5">
            {formatDuration(info.duration)} · {formatBytes(info.size)} · {info.sampleRate / 1000}kHz · {info.channels === 1 ? 'Mono' : 'Stereo'}
          </p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-slate-500 hover:text-slate-300 transition-colors ml-4 flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Drop Zone ───────────────────────────────────────────────────────────────

function DropZone({
  multiple,
  onFiles,
  accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.webm,.mp4',
}: {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  accept?: string;
}) {
  const t = useTranslations('Tool');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('audio/')
      );
      if (files.length > 0) onFiles(files);
    },
    [onFiles]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-colors ${
        dragging
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) onFiles(files);
          e.target.value = '';
        }}
      />
      <span
        className="material-symbols-outlined text-slate-600 text-5xl mb-3 block"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        audio_file
      </span>
      <p className="text-slate-300 font-medium mb-1">
        {t('dragDrop')}
      </p>
      <p className="text-slate-500 text-sm">
        {t('dropAudioHere')}{multiple ? '' : ''}
      </p>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <svg className="animate-spin w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {label}
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className="h-1.5 bg-indigo-500 rounded-full animate-pulse w-2/3" />
      </div>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
      <span className="material-symbols-outlined text-red-400 text-lg flex-shrink-0">error</span>
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  );
}

// ─── Mode: Trim ──────────────────────────────────────────────────────────────

const CANVAS_H = 184;   // total canvas height (px)
const WAVEFORM_H = 144; // waveform area height
const RULER_H = 40;     // ruler area height
const PEAK_N = 3000;    // pre-computed peak resolution
const HANDLE_HIT = 22;  // pointer hit radius (px) — enlarged for mobile touch

function TrimMode() {
  const t = useTranslations('Tool');
  // ── File / Audio state
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<AudioFileInfo | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);

  // ── Selection state
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);

  // ── View state (zoom / scroll)
  const [zoom, setZoom] = useState(1);
  const [viewStart, setViewStart] = useState(0);

  // ── Playback state
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [hoverSec, setHoverSec] = useState<number | null>(null);

  // ── Export options
  const [exportFormat, setExportFormat] = useState<'wav' | 'mp3'>('wav');
  const [bitrate, setBitrate] = useState<128 | 192 | 320>(192);

  // ── Processing
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Canvas / container
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasW, setCanvasW] = useState(600);

  // ── Audio playback refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playStartCtxRef = useRef(0);
  const playOffsetRef = useRef(0);
  const playEndRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<(() => void) | null>(null);
  const playingRef = useRef(false);
  const pausedRef = useRef(false);
  const playheadSecRef = useRef(0);

  // ── Drag state
  type DragType = 'left' | 'right' | 'new' | 'pan';
  const dragRef = useRef<{ type: DragType; startX: number; anchorSec: number; origStart: number; origEnd: number } | null>(null);
  const origPanVSRef = useRef(0);
  // Live refs so pointer handlers always see current values without stale closures
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  const viewStartRef = useRef(viewStart);
  useEffect(() => { viewStartRef.current = viewStart; }, [viewStart]);
  // Keep live refs in sync so pointer callbacks always see current state
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { playheadSecRef.current = playheadSec; }, [playheadSec]);

  // ── Derived
  const duration = useMemo(() => buffer?.duration ?? 0, [buffer]);
  const viewDuration = useMemo(() => duration > 0 ? Math.max(0.01, duration / zoom) : 1, [duration, zoom]);
  // viewDurationRef must be declared after viewDuration (useMemo) to avoid TDZ error
  const viewDurationRef = useRef(1);
  useEffect(() => { viewDurationRef.current = viewDuration; }, [viewDuration]);

  // ── Pixel ↔ Time helpers (depend on canvasW + viewStart + viewDuration)
  const getCanvasW = useCallback(() => canvasRef.current?.offsetWidth || canvasW, [canvasW]);
  const pxToTime = useCallback((px: number) => viewStart + (px / getCanvasW()) * viewDuration, [viewStart, viewDuration, getCanvasW]);
  const timeToPx = useCallback((t: number) => ((t - viewStart) / viewDuration) * getCanvasW(), [viewStart, viewDuration, getCanvasW]);

  // ── Clamp viewStart when zoom changes
  useEffect(() => {
    if (duration <= 0) return;
    const maxVS = Math.max(0, duration - viewDuration);
    setViewStart((vs) => Math.max(0, Math.min(maxVS, vs)));
  }, [duration, viewDuration]);

  // ── ResizeObserver for canvas width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCanvasW(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = Math.max(1, canvas.offsetWidth || canvasW);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(CANVAS_H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(CANVAS_H * dpr);
    }
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, CANVAS_H);

    if (!peaks || duration <= 0) return;

    const vs = viewStart;
    const vd = viewDuration;

    // ── Waveform bars
    const BAR_W = 2.5;
    const BAR_GAP = 1;
    const UNIT = BAR_W + BAR_GAP;
    const numBars = Math.floor(W / UNIT);
    const centerY = WAVEFORM_H / 2;

    for (let i = 0; i < numBars; i++) {
      const tA = vs + (i / numBars) * vd;
      const tB = vs + ((i + 1) / numBars) * vd;
      const pA = Math.floor((tA / duration) * PEAK_N);
      const pB = Math.ceil((tB / duration) * PEAK_N);
      let peak = 0;
      for (let p = pA; p < pB && p < PEAK_N; p++) peak = Math.max(peak, peaks[p]);
      peak = Math.max(0.02, peak);
      const barH = Math.max(2, peak * (WAVEFORM_H - 20) * 0.95);
      const x = i * UNIT;
      const midT = (tA + tB) / 2;
      const inSel = midT >= startSec && midT <= endSec;
      ctx.globalAlpha = inSel ? 1 : 0.4;
      ctx.fillStyle = inSel ? '#818cf8' : '#334155';
      ctx.fillRect(x, centerY - barH / 2, BAR_W, barH);
    }
    ctx.globalAlpha = 1;

    // ── Selection overlay
    const sX = Math.max(0, timeToPx(startSec));
    const eX = Math.min(W, timeToPx(endSec));
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.fillRect(sX, 0, eX - sX, WAVEFORM_H);

    // ── Draw handle (line + grip)
    const drawHandle = (px: number, side: 'left' | 'right') => {
      const x = Math.max(1.5, Math.min(W - 1.5, px));
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(x - 1.5, 0, 3, WAVEFORM_H);
      const gW = 12; const gH = 36;
      const gX = side === 'left' ? x - gW : x;
      const gY = WAVEFORM_H / 2 - gH / 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(gX, gY, gW, gH, 4);
      else ctx.rect(gX, gY, gW, gH);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.2;
      for (let g = -1; g <= 1; g++) {
        ctx.beginPath();
        ctx.moveTo(gX + 2.5, WAVEFORM_H / 2 + g * 5);
        ctx.lineTo(gX + gW - 2.5, WAVEFORM_H / 2 + g * 5);
        ctx.stroke();
      }
    };
    drawHandle(timeToPx(startSec), 'left');
    drawHandle(timeToPx(endSec), 'right');

    // ── Off-screen handle edge indicators (any handle off left OR right)
    const rawSX = timeToPx(startSec);
    const rawEX = timeToPx(endSec);
    const gy = WAVEFORM_H / 2;
    if (rawSX < 0 || rawEX < 0) {
      ctx.fillStyle = 'rgba(99,102,241,0.18)';
      ctx.fillRect(0, 0, 22, WAVEFORM_H);
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.moveTo(18, gy - 11);
      ctx.lineTo(18, gy + 11);
      ctx.lineTo(6,  gy);
      ctx.closePath();
      ctx.fill();
    }
    if (rawSX > W || rawEX > W) {
      ctx.fillStyle = 'rgba(99,102,241,0.18)';
      ctx.fillRect(W - 22, 0, 22, WAVEFORM_H);
      ctx.fillStyle = '#818cf8';
      ctx.beginPath();
      ctx.moveTo(W - 18, gy - 11);
      ctx.lineTo(W - 18, gy + 11);
      ctx.lineTo(W - 6,  gy);
      ctx.closePath();
      ctx.fill();
    }

    // ── Playhead
    const phX = timeToPx(playheadSec);
    if (phX >= 0 && phX <= W) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(phX - 1, 0, 2, WAVEFORM_H);
      ctx.beginPath();
      ctx.moveTo(phX - 5, 0);
      ctx.lineTo(phX + 5, 0);
      ctx.lineTo(phX, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    }

    // ── Hover line
    if (hoverSec !== null) {
      const hx = timeToPx(hoverSec);
      if (hx >= 0 && hx <= W) {
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(hx - 0.5, 0, 1, WAVEFORM_H);
      }
    }

    // ── Time ruler background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, WAVEFORM_H, W, RULER_H);

    // Tick marks
    const interval = calcRulerInterval(vd);
    const firstTick = Math.ceil(vs / interval) * interval;
    ctx.font = '10px "Inter", system-ui, sans-serif';

    for (let t = firstTick; t <= vs + vd + 0.0001; t += interval) {
      const rx = timeToPx(t);
      if (rx < -10 || rx > W + 10) continue;
      ctx.fillStyle = '#334155';
      ctx.fillRect(rx, WAVEFORM_H, 1, 8);
      if (rx > 24 && rx < W - 24) {
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText(fmtMs(t), rx, WAVEFORM_H + 22);
      }
    }

    // Selection boundary labels in ruler
    ctx.fillStyle = '#818cf8';
    ctx.font = '10px "Inter", system-ui, sans-serif';
    if (sX >= 0 && sX <= W) {
      ctx.textAlign = sX < 30 ? 'left' : 'right';
      ctx.fillText(fmtMs(startSec), Math.max(2, sX + (sX < 30 ? 2 : -2)), WAVEFORM_H + 36);
    }
    if (eX >= 0 && eX <= W) {
      ctx.textAlign = eX > W - 30 ? 'right' : 'left';
      ctx.fillText(fmtMs(endSec), Math.min(W - 2, eX + (eX > W - 30 ? -2 : 2)), WAVEFORM_H + 36);
    }

    // Hover tooltip
    if (hoverSec !== null) {
      const hx = timeToPx(hoverSec);
      if (hx >= 0 && hx <= W) {
        const label = fmtMs(hoverSec);
        ctx.font = '10px "Inter", system-ui, sans-serif';
        const lw = ctx.measureText(label).width + 10;
        const lx = Math.max(0, Math.min(W - lw, hx - lw / 2));
        ctx.fillStyle = 'rgba(15,23,42,0.92)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(lx, WAVEFORM_H + 2, lw, 17, 3);
        else ctx.rect(lx, WAVEFORM_H + 2, lw, 17);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(label, lx + lw / 2, WAVEFORM_H + 14);
      }
    }
  }, [peaks, canvasW, startSec, endSec, playheadSec, hoverSec, duration, viewStart, viewDuration, timeToPx]);

  // ── File loading
  const loadFile = useCallback(async (f: File) => {
    setError(null);
    setFile(f);
    setPlaying(false);
    try {
      const { getAudioInfo, decodeAudioFile } = await import('@/lib/tools/audio-processor');
      const [ai, ab] = await Promise.all([getAudioInfo(f), decodeAudioFile(f)]);
      setInfo({ name: f.name, size: f.size, duration: ab.duration, sampleRate: ab.sampleRate, channels: ab.numberOfChannels, format: ai.format });
      setBuffer(ab);
      setStartSec(0);
      setEndSec(ab.duration);
      setPlayheadSec(0);
      setZoom(1);
      setViewStart(0);
      // Pre-compute peaks
      const ch = ab.getChannelData(0);
      const block = Math.floor(ch.length / PEAK_N);
      const p = new Float32Array(PEAK_N);
      for (let i = 0; i < PEAK_N; i++) {
        let max = 0;
        const s = i * block;
        const e = Math.min(s + block, ch.length);
        for (let j = s; j < e; j++) max = Math.max(max, Math.abs(ch[j]));
        p[i] = Math.max(0.02, max);
      }
      setPeaks(p);
    } catch (err) {
      setError((err as Error).message || t('errors.processingFailed'));
    }
  }, []);

  // ── Playback
  const stopPlayback = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (sourceRef.current) {
      sourceRef.current.onended = null; // must clear before stop() to prevent stale callback firing
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    tickRef.current = null;
    setPaused(false);
    setPlaying(false);
  }, []);

  const startPlayback = useCallback((from: number, to: number) => {
    if (!buffer) return;
    stopPlayback();
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    const actx = audioCtxRef.current;
    if (actx.state === 'suspended') actx.resume();
    const src = actx.createBufferSource();
    src.buffer = buffer;
    src.connect(actx.destination);
    const startAt = actx.currentTime + 0.03;
    src.start(startAt, from, Math.max(0.001, to - from));
    playStartCtxRef.current = startAt;
    playOffsetRef.current = from;
    playEndRef.current = to;
    sourceRef.current = src;
    setPlaying(true);
    setPlayheadSec(from);
    src.onended = () => { setPlaying(false); setPlayheadSec(from); };
    const tick = () => {
      if (!audioCtxRef.current) return;
      const elapsed = Math.max(0, audioCtxRef.current.currentTime - playStartCtxRef.current);
      const pos = playOffsetRef.current + elapsed;
      if (pos <= playEndRef.current) {
        setPlayheadSec(pos);
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPlayheadSec(from);
        setPlaying(false);
        setPaused(false);
      }
    };
    tickRef.current = tick;
    rafRef.current = requestAnimationFrame(tick);
  }, [buffer, stopPlayback]);

  const togglePause = useCallback(() => {
    if (!audioCtxRef.current || !playing) return;
    if (!paused) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      audioCtxRef.current.suspend();
      setPaused(true);
    } else {
      audioCtxRef.current.resume().then(() => {
        setPaused(false);
        if (tickRef.current) {
          rafRef.current = requestAnimationFrame(tickRef.current);
        }
      });
    }
  }, [playing, paused]);

  // Cleanup on unmount
  useEffect(() => () => {
    stopPlayback();
    audioCtxRef.current?.close();
  }, [stopPlayback]);

  // ── Drag cursor helper
  const getCursor = useCallback((x: number, W: number): string => {
    const sX = timeToPx(startSec);
    const eX = timeToPx(endSec);
    const EDGE_HIT = 22;
    const nearLeft    = sX >= 0 && sX <= W && Math.abs(x - sX) <= HANDLE_HIT;
    const nearRight   = eX >= 0 && eX <= W && Math.abs(x - eX) <= HANDLE_HIT;
    const atLeftEdge  = (sX < 0 || eX < 0) && x < EDGE_HIT;
    const atRightEdge = (sX > W || eX > W) && x > W - EDGE_HIT;
    if (nearLeft || nearRight || atLeftEdge || atRightEdge) return 'ew-resize';
    return zoomRef.current > 1 ? 'grab' : 'crosshair';
  }, [timeToPx, startSec, endSec]);

  // ── Pointer handlers
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const W = getCanvasW();
    if (x < 0 || x > W) return;
    const sX = timeToPx(startSec);
    const eX = timeToPx(endSec);
    const EDGE_HIT = 22;
    // All four off-screen states
    const startOffLeft  = sX < 0;
    const startOffRight = sX > W;
    const endOffLeft    = eX < 0;
    const endOffRight   = eX > W;
    // On-screen only when fully within canvas
    const nearLeft  = !startOffLeft && !startOffRight && Math.abs(x - sX) <= HANDLE_HIT;
    const nearRight = !endOffLeft   && !endOffRight   && Math.abs(x - eX) <= HANDLE_HIT;
    const atLeftEdge  = x < EDGE_HIT;
    const atRightEdge = x > W - EDGE_HIT;
    let type: DragType;
    if (nearLeft && nearRight) {
      // Both handles visible and overlapping: midpoint decides
      type = x >= (sX + eX) / 2 ? 'right' : 'left';
    } else if (atRightEdge && startOffRight) {
      // Both handles off right (start < end, both > W): bring start back first
      type = 'left';
    } else if (atLeftEdge && endOffLeft) {
      // Both handles off left (start < end, both < 0): bring end back first
      type = 'right';
    } else if (atRightEdge && endOffRight && nearLeft) {
      // End off right, left handle visible but near right edge: edge zone wins
      type = 'right';
    } else if (atLeftEdge && startOffLeft && nearRight) {
      // Start off left, right handle visible but near left edge: edge zone wins
      type = 'left';
    } else if (nearLeft)              type = 'left';
    else if (nearRight)               type = 'right';
    else if (atLeftEdge  && startOffLeft) type = 'left';
    else if (atRightEdge && endOffRight)  type = 'right';
    else if (zoomRef.current > 1)     type = 'pan';
    else                              type = 'new';
    e.currentTarget.setPointerCapture(e.pointerId);
    const anchorSec = Math.max(0, Math.min(duration, pxToTime(x)));
    // For any off-screen handle, snap to cursor position so drag tracks absolutely
    const origStart = (type === 'left'  && (startOffLeft || startOffRight)) ? anchorSec : startSec;
    const origEnd   = (type === 'right' && (endOffLeft   || endOffRight))   ? anchorSec : endSec;
    dragRef.current = { type, startX: x, anchorSec, origStart, origEnd };
    if (type === 'pan') origPanVSRef.current = viewStartRef.current;
  }, [timeToPx, pxToTime, getCanvasW, startSec, endSec, duration]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const W = getCanvasW();
    const clamped = Math.max(0, Math.min(W, x));
    setHoverSec(pxToTime(clamped));
    if (canvasRef.current) {
      const dType = dragRef.current?.type;
      canvasRef.current.style.cursor = dType
        ? (dType === 'pan' ? 'grabbing' : 'ew-resize')
        : getCursor(x, W);
    }
    if (!dragRef.current || e.buttons === 0) return;
    const { type, startX, anchorSec, origStart, origEnd } = dragRef.current;
    const dx = x - startX;
    if (type === 'pan') {
      const maxVS = Math.max(0, duration - viewDuration);
      setViewStart(Math.max(0, Math.min(maxVS, origPanVSRef.current - (dx / W) * viewDuration)));
      return;
    }
    const dt = (dx / W) * viewDuration;
    if (type === 'left') {
      const ns = Math.max(0, Math.min(origEnd - 0.001, origStart + dt));
      setStartSec(ns);
      setPlayheadSec(ns);
    } else if (type === 'right') {
      const ne = Math.max(origStart + 0.001, Math.min(duration, origEnd + dt));
      setEndSec(ne);
      setPlayheadSec(ne);
    } else {
      // Draw new selection after meaningful drag (>5px); single click handled in onPointerUp
      if (Math.abs(x - startX) > 5) {
        const t = Math.max(0, Math.min(duration, pxToTime(x)));
        if (t <= anchorSec) { setStartSec(t); setEndSec(anchorSec); }
        else { setStartSec(anchorSec); setEndSec(t); }
      }
    }
  }, [pxToTime, getCanvasW, viewDuration, duration, getCursor]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const { type, startX, anchorSec, origStart, origEnd } = dragRef.current;
    dragRef.current = null;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const W = getCanvasW();
    const dx = x - startX;
    const dt = (dx / W) * viewDuration;

    if (type === 'left') {
      const ns = Math.max(0, Math.min(origEnd - 0.001, origStart + dt));
      if (playingRef.current || pausedRef.current) {
        stopPlayback();
        startPlayback(ns, origEnd);
      }
    } else if (type === 'right') {
      const ne = Math.max(origStart + 0.001, Math.min(duration, origEnd + dt));
      if (playingRef.current || pausedRef.current) {
        stopPlayback();
        startPlayback(ne, duration);
      }
    } else if (type === 'new' || type === 'pan') {
      // Short click (< 5px movement) → seek playhead and start playback from that position
      if (Math.abs(x - startX) <= 5) {
        const seekTo = anchorSec;
        setPlayheadSec(seekTo);
        const from = Math.max(startSec, Math.min(endSec - 0.001, seekTo));
        startPlayback(from, endSec);
      }
    }
  }, [getCanvasW, viewDuration, duration, startSec, endSec, pxToTime, stopPlayback, startPlayback]);
  const onMouseLeave = useCallback(() => { setHoverSec(null); }, []);

  // ── Wheel: vertical scroll = zoom centered on cursor; shift/horizontal = pan
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const W = el.offsetWidth || canvasW;
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const delta = e.shiftKey ? e.deltaY : e.deltaX;
        const dt = delta / W * viewDuration * 0.8;
        setViewStart((vs) => Math.max(0, Math.min(Math.max(0, duration - viewDuration), vs + dt)));
      } else {
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const mTime = viewStart + (mx / W) * viewDuration;
        const factor = e.deltaY > 0 ? 0.75 : 1 / 0.75;
        const newZoom = Math.max(1, Math.min(64, zoom * factor));
        const newVD = duration / newZoom;
        const newVS = Math.max(0, Math.min(duration - newVD, mTime - (mx / W) * newVD));
        setZoom(newZoom);
        setViewStart(newVS);
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [zoom, viewStart, viewDuration, duration, canvasW]);

  // ── Pinch-to-zoom (mobile two-finger gesture)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let initDist = 0;
    let initZoom = 1;
    let initMidTime = 0;

    const getTouchDist = (t: TouchList) => {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      initDist = getTouchDist(e.touches);
      initZoom = zoomRef.current;
      const rect = el.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      initMidTime = viewStartRef.current + (midX / el.offsetWidth) * viewDurationRef.current;
    };

    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || initDist === 0) return;
      e.preventDefault();
      const scale = getTouchDist(e.touches) / initDist;
      const newZoom = Math.max(1, Math.min(64, initZoom * scale));
      const newVD = duration / newZoom;
      const rect = el.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const newVS = Math.max(0, Math.min(Math.max(0, duration - newVD), initMidTime - (midX / el.offsetWidth) * newVD));
      setZoom(newZoom);
      setViewStart(newVS);
    };

    const onEnd = (e: TouchEvent) => { if (e.touches.length < 2) initDist = 0; };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [duration]); // refs used internally — no stale closure

  // ── Space key: pause/resume/play from playhead
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      if (playingRef.current || pausedRef.current) {
        togglePause();
      } else if (buffer) {
        startPlayback(Math.min(playheadSecRef.current, endSec - 0.001), endSec);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePause, startPlayback, buffer, endSec]);

  // ── Export
  const handleExport = async () => {
    if (!buffer || !file) return;
    setProcessing(true);
    setError(null);
    try {
      const { exportTrimmedAudio } = await import('@/lib/tools/audio-processor');
      const blob = await exportTrimmedAudio(buffer, startSec, endSec, exportFormat, bitrate);
      downloadBlob(blob, file.name.replace(/\.[^.]+$/, `_trimmed.${exportFormat}`));
    } catch (err) {
      setError((err as Error).message || t('errors.processingFailed'));
    } finally {
      setProcessing(false);
    }
  };

  const reset = useCallback(() => {
    stopPlayback();
    setFile(null); setBuffer(null); setInfo(null); setPeaks(null); setError(null);
  }, [stopPlayback]);

  // ── Render: no file
  if (!file) return <DropZone onFiles={(fs) => loadFile(fs[0])} />;

  const selDuration = Math.max(0, endSec - startSec);

  return (
    <div className="space-y-4">
      {info && <FileInfoCard info={info} onRemove={reset} />}
      {error && <ErrorBanner message={error} />}

      {/* ── Waveform canvas */}
      <div ref={containerRef} className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ cursor: 'crosshair', touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { dragRef.current = null; }}
          onMouseLeave={onMouseLeave}
        />
        {!peaks && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}
      </div>

      {/* ── Scrollbar */}
      <WaveformScrollbar zoom={zoom} duration={duration} viewStart={viewStart} viewDuration={viewDuration} onChange={setViewStart} />

      {/* ── Hints: desktop keyboard / mobile gesture */}
      <div className="hidden sm:flex items-center justify-center gap-4 flex-wrap text-xs text-slate-500 -mt-1">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono text-xs">Space</kbd>
          <span>{t('kbdPauseResume')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 text-sm">⟳</span>
          <span>{t('kbdScrollZoom')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>pan_tool</span>
          <span>{t('kbdDragPan')}</span>
        </span>
      </div>
      <div className="flex sm:hidden items-center justify-center gap-5 text-xs text-slate-500 -mt-1">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-slate-400">pinch</span>
          <span>{t('mobilePinchZoom')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-slate-400">touch_app</span>
          <span>{t('mobileHoldPan')}</span>
        </span>
      </div>

      {/* ── Controls row: playback + zoom */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Play All — always visible, always restarts from 0 */}
        <button
          onClick={() => startPlayback(0, duration)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          {t('playAll')}
        </button>
        {/* Play Selection — combined play/pause/resume */}
        {(() => {
          const isActPlaying = playing && !paused;
          const selClick = isActPlaying ? togglePause : (paused ? togglePause : () => startPlayback(startSec, endSec));
          const selClass  = isActPlaying
            ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
            : 'bg-indigo-600/20 border-indigo-600/50 text-indigo-300 hover:bg-indigo-600/30';
          return (
            <button onClick={selClick} disabled={selDuration < 0.01}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-40 ${selClass}`}>
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{isActPlaying ? 'pause' : 'play_circle'}</span>
              {isActPlaying ? t('pause') : t('playSelection')}
              <kbd className="ml-0.5 px-1 py-px rounded border text-[10px] font-mono leading-none bg-white/5 border-white/10 opacity-50">Space</kbd>
            </button>
          );
        })()}
        {/* Stop — only when active */}
        {(playing || paused) && (
          <button
            onClick={stopPlayback}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>stop</span>
            {t('stop')}
          </button>
        )}

        <div className="flex-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-xs mr-0.5">{t('zoomLabel')}</span>
          {([1, 2, 4, 8, 16] as const).map((z) => (
            <button
              key={z}
              onClick={() => {
                const newVD = duration / z;
                const center = playheadSec > 0 ? playheadSec : viewStart + viewDuration / 2;
                setZoom(z);
                setViewStart(Math.max(0, Math.min(Math.max(0, duration - newVD), center - newVD / 2)));
              }}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                zoom === z
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {z}×
            </button>
          ))}
        </div>
      </div>

      {/* ── Time inputs */}
      <div className="grid grid-cols-2 gap-3">
        <TimeInput
          label="Start"
          value={startSec}
          min={0}
          max={endSec - 0.001}
          onChange={(v) => setStartSec(v)}
        />
        <TimeInput
          label="End"
          value={endSec}
          min={startSec + 0.001}
          max={duration}
          onChange={(v) => setEndSec(v)}
        />
      </div>

      {/* ── Selection summary */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm">
        <span className="text-slate-500">Selection</span>
        <span className="text-indigo-400 font-mono font-semibold">{fmtMs(selDuration)}</span>
      </div>

      {/* ── Export options */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <p className="text-slate-400 text-sm font-medium mb-3">{t('export')}</p>
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="text-slate-500 text-xs mb-1.5">{t('formatLabel')}</p>
            <div className="flex gap-1.5">
              {(['wav', 'mp3'] as const).map((f) => (
                <button key={f} onClick={() => setExportFormat(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${exportFormat === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {exportFormat === 'mp3' && (
            <div>
              <p className="text-slate-500 text-xs mb-1.5">{t('bitrateLabel')}</p>
              <div className="flex gap-1.5">
                {([128, 192, 320] as const).map((b) => (
                  <button key={b} onClick={() => setBitrate(b)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${bitrate === b ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                    {b}k
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {processing && <ProgressBar label={t('exportingLabel')} />}
      {!processing && (
        <button
          onClick={handleExport}
          disabled={selDuration < 0.01}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-lg">content_cut</span>
          {t('export')} {exportFormat.toUpperCase()}{exportFormat === 'mp3' ? ` · ${bitrate} kbps` : ''}
        </button>
      )}
    </div>
  );
}

// ─── WaveformScrollbar ───────────────────────────────────────────────────────

function WaveformScrollbar({ zoom, duration, viewStart, viewDuration, onChange }: {
  zoom: number; duration: number; viewStart: number; viewDuration: number;
  onChange: (vs: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sbDrag = useRef<{ startX: number; startVS: number } | null>(null);
  if (zoom <= 1 || duration <= 0) return null;
  const clamp = (vs: number) => Math.max(0, Math.min(Math.max(0, duration - viewDuration), vs));
  const thumbPct = Math.max(5, (viewDuration / duration) * 100);
  const leftPct  = Math.min(100 - thumbPct, (viewStart / duration) * 100);
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(clamp(viewStart - viewDuration * 0.25))}
        className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 p-0.5 rounded hover:bg-slate-800/60">
        <span className="material-symbols-outlined text-base leading-none">chevron_left</span>
      </button>
      <div ref={trackRef}
        className="flex-1 relative h-5 flex items-center cursor-pointer group select-none"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).dataset.thumb) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const frac = (e.clientX - rect.left) / rect.width;
          onChange(clamp(frac * duration - viewDuration / 2));
        }}>
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full" />
        <div
          data-thumb="1"
          className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full cursor-grab active:cursor-grabbing bg-slate-600 group-hover:bg-slate-500 hover:!bg-indigo-500/70 transition-colors"
          style={{ width: `${thumbPct}%`, left: `${leftPct}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            sbDrag.current = { startX: e.clientX, startVS: viewStart };
          }}
          onPointerMove={(e) => {
            if (!sbDrag.current || !trackRef.current) return;
            const dx = e.clientX - sbDrag.current.startX;
            onChange(clamp(sbDrag.current.startVS + (dx / trackRef.current.offsetWidth) * duration));
          }}
          onPointerUp={() => { sbDrag.current = null; }}
          onPointerCancel={() => { sbDrag.current = null; }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <button onClick={() => onChange(clamp(viewStart + viewDuration * 0.25))}
        className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 p-0.5 rounded hover:bg-slate-800/60">
        <span className="material-symbols-outlined text-base leading-none">chevron_right</span>
      </button>
    </div>
  );
}

// ─── Keyboard hints row (shared) ─────────────────────────────────────────────

function KeyboardHints({ extra }: { extra?: React.ReactNode }) {
  const t = useTranslations('Tool');
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap text-xs text-slate-500 -mt-1">
      <span className="flex items-center gap-1.5">
        <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono text-xs">Space</kbd>
        <span>{t('kbdPauseResume')}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-slate-400 text-sm">⟳</span>
        <span>{t('kbdScrollZoom')}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-sm text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>pan_tool</span>
        <span>{t('kbdDragPan')}</span>
      </span>
      {extra}
    </div>
  );
}

// ─── SimpleWaveformCanvas ────────────────────────────────────────────────────

interface SimpleWaveformCanvasProps {
  peaks: Float32Array;
  duration: number;
  playheadSec: number;
  viewStart: number;
  viewDuration: number;
  zoom: number;
  onSeek: (t: number) => void;
  onZoomPan: (zoom: number, viewStart: number) => void;
  accentColor?: string;
}

const SWF_CANVAS_H = 184;
const SWF_WAVE_H   = 144;

function SimpleWaveformCanvas({
  peaks, duration, playheadSec, viewStart, viewDuration, zoom,
  onSeek, onZoomPan, accentColor = '#818cf8',
}: SimpleWaveformCanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasW, setCanvasW] = useState(600);
  const [hoverSec, setHoverSec] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  // Pan support
  const swfDragMode = useRef<'seek' | 'pan'>('seek');
  const swfPanStartX = useRef(0);
  const swfPanStartVS = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCanvasW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const timeToPx = useCallback((t: number) => {
    const W = canvasRef.current?.offsetWidth || canvasW;
    return ((t - viewStart) / viewDuration) * W;
  }, [canvasW, viewStart, viewDuration]);

  const pxToTime = useCallback((x: number) => {
    const W = canvasRef.current?.offsetWidth || canvasW;
    return viewStart + (x / W) * viewDuration;
  }, [canvasW, viewStart, viewDuration]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = Math.max(1, canvas.offsetWidth || canvasW);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(SWF_CANVAS_H * dpr)) {
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(SWF_CANVAS_H * dpr);
    }
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, SWF_CANVAS_H);
    if (!peaks || duration <= 0) return;

    const BAR_W = 2.5; const BAR_GAP = 1; const UNIT = BAR_W + BAR_GAP;
    const numBars = Math.floor(W / UNIT);
    const centerY = SWF_WAVE_H / 2;

    for (let i = 0; i < numBars; i++) {
      const tA = viewStart + (i / numBars) * viewDuration;
      const tB = viewStart + ((i + 1) / numBars) * viewDuration;
      const pA = Math.floor((tA / duration) * PEAK_N);
      const pB = Math.ceil((tB / duration) * PEAK_N);
      let peak = 0;
      for (let p = Math.max(0, pA); p < pB && p < PEAK_N; p++) peak = Math.max(peak, peaks[p]);
      peak = Math.max(0.02, peak);
      const barH = Math.max(2, peak * (SWF_WAVE_H - 20) * 0.95);
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(i * UNIT, centerY - barH / 2, BAR_W, barH);
    }
    ctx.globalAlpha = 1;

    // Playhead
    const phX = timeToPx(playheadSec);
    if (phX >= 0 && phX <= W) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(phX - 1, 0, 2, SWF_WAVE_H);
      ctx.beginPath();
      ctx.moveTo(phX - 5, 0); ctx.lineTo(phX + 5, 0); ctx.lineTo(phX, 8);
      ctx.fillStyle = '#fbbf24'; ctx.fill();
    }

    // Hover line
    if (hoverSec !== null) {
      const hx = timeToPx(hoverSec);
      if (hx >= 0 && hx <= W) {
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(hx - 0.5, 0, 1, SWF_WAVE_H);
      }
    }

    // Ruler
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, SWF_WAVE_H, W, SWF_CANVAS_H - SWF_WAVE_H);
    const interval = calcRulerInterval(viewDuration);
    const firstTick = Math.ceil(viewStart / interval) * interval;
    ctx.font = '10px "Inter", system-ui, sans-serif';
    for (let t = firstTick; t <= viewStart + viewDuration + 0.0001; t += interval) {
      const rx = timeToPx(t);
      if (rx < -10 || rx > W + 10) continue;
      ctx.fillStyle = '#334155';
      ctx.fillRect(rx, SWF_WAVE_H, 1, 8);
      if (rx > 24 && rx < W - 24) {
        ctx.fillStyle = '#64748b'; ctx.textAlign = 'center';
        ctx.fillText(fmtMs(t), rx, SWF_WAVE_H + 22);
      }
    }

    // Hover tooltip
    if (hoverSec !== null) {
      const hx = timeToPx(hoverSec);
      if (hx >= 0 && hx <= W) {
        const label = fmtMs(hoverSec);
        ctx.font = '10px "Inter", system-ui, sans-serif';
        const lw = ctx.measureText(label).width + 10;
        const lx = Math.max(0, Math.min(W - lw, hx - lw / 2));
        ctx.fillStyle = 'rgba(15,23,42,0.92)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(lx, SWF_WAVE_H + 2, lw, 17, 3);
        else ctx.rect(lx, SWF_WAVE_H + 2, lw, 17);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center';
        ctx.fillText(label, lx + lw / 2, SWF_WAVE_H + 14);
      }
    }
  }, [peaks, canvasW, playheadSec, hoverSec, duration, viewStart, viewDuration, timeToPx, accentColor]);

  // Wheel zoom/pan
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const W = el.offsetWidth || canvasW;
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const delta = e.shiftKey ? e.deltaY : e.deltaX;
        const dt = delta / W * viewDuration * 0.8;
        const newVS = Math.max(0, Math.min(Math.max(0, duration - viewDuration), viewStart + dt));
        onZoomPan(zoom, newVS);
      } else {
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const mTime = viewStart + (mx / W) * viewDuration;
        const factor = e.deltaY > 0 ? 0.75 : 1 / 0.75;
        const newZoom = Math.max(1, Math.min(64, zoom * factor));
        const newVD = duration / newZoom;
        const newVS = Math.max(0, Math.min(duration - newVD, mTime - (mx / W) * newVD));
        onZoomPan(newZoom, newVS);
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [zoom, viewStart, viewDuration, duration, canvasW, onZoomPan]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    swfPanStartX.current = x;
    swfPanStartVS.current = viewStart;
    if (zoom > 1) {
      swfDragMode.current = 'pan';
    } else {
      swfDragMode.current = 'seek';
      const t = Math.max(0, Math.min(duration, pxToTime(x)));
      onSeek(t);
    }
  }, [duration, pxToTime, onSeek, zoom, viewStart]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const t = Math.max(0, Math.min(duration, pxToTime(x)));
    setHoverSec(t);
    if (canvasRef.current) {
      const draggingPan = isDraggingRef.current && swfDragMode.current === 'pan';
      canvasRef.current.style.cursor = draggingPan ? 'grabbing' : 'crosshair';
    }
    if (!isDraggingRef.current || e.buttons === 0) return;
    const dx = x - swfPanStartX.current;
    if (swfDragMode.current === 'seek') {
      onSeek(t);
    } else if (swfDragMode.current === 'pan') {
      const W = canvasRef.current?.offsetWidth || canvasW;
      const maxVS = Math.max(0, duration - viewDuration);
      onZoomPan(zoom, Math.max(0, Math.min(maxVS, swfPanStartVS.current - (dx / W) * viewDuration)));
    }
  }, [duration, pxToTime, onSeek, onZoomPan, zoom, viewDuration, canvasW]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (swfDragMode.current === 'pan' && Math.abs(x - swfPanStartX.current) <= 5) {
      const t = Math.max(0, Math.min(duration, pxToTime(x)));
      onSeek(t);
    }
    swfDragMode.current = 'seek';
    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
  }, [duration, pxToTime, onSeek]);

  return (
    <div ref={containerRef} className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full"
        style={{ cursor: 'crosshair', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { isDraggingRef.current = false; swfDragMode.current = 'seek'; if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair'; }}
        onMouseLeave={() => setHoverSec(null)}
      />
    </div>
  );
}

// ─── MiniWaveformCanvas ───────────────────────────────────────────────────────

function MiniWaveformCanvas({ peaks, color }: { peaks: Float32Array | null; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [w, setW] = useState(100);

  useEffect(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks) return;
    const dpr = window.devicePixelRatio || 1;
    const H = canvas.parentElement?.offsetHeight || 60;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, H);
    const n = Math.min(100, Math.floor(w / 2));
    const cy = H / 2;
    for (let i = 0; i < n; i++) {
      const pIdx = Math.floor((i / n) * peaks.length);
      const peak = peaks[pIdx] ?? 0.02;
      const bh = Math.max(2, peak * (H - 8) * 0.9);
      const x = (i / n) * w;
      const bw = Math.max(1, (w / n) - 1);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(x, cy - bh / 2, bw, bh);
    }
    ctx.globalAlpha = 1;
  }, [peaks, color, w]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Shared playback controls row ────────────────────────────────────────────

function PlaybackControls({
  playing, paused, buffer, duration, zoom, viewStart, viewDuration, playheadSec,
  onPlay, onTogglePause, onStop, onZoomChange, onPlayFromHere,
}: {
  playing: boolean; paused: boolean; buffer: AudioBuffer | null;
  duration: number; zoom: number; viewStart: number; viewDuration: number; playheadSec: number;
  onPlay: () => void; onTogglePause: () => void; onStop: () => void;
  onZoomChange: (z: number, vs: number) => void;
  onPlayFromHere?: () => void;
}) {
  const t = useTranslations('Tool');
  // When onPlayFromHere is provided it acts as the primary play/pause/resume button.
  // The separate pause row is suppressed in that case.
  // paused=true means playing=true AND paused=true (AudioContext suspended).
  const isActuallyPlaying = playing && !paused;
  const fromHereClick = isActuallyPlaying ? onTogglePause : (paused ? onTogglePause : onPlayFromHere!);
  const fromHereClass = isActuallyPlaying
    ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
    : 'bg-indigo-600/20 border-indigo-600/50 text-indigo-300 hover:bg-indigo-600/30';

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={onPlay} disabled={!buffer}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          {t('playAll')}
        </button>

        {onPlayFromHere ? (
          /* Combined play-from-here / pause / resume button */
          <button onClick={fromHereClick} disabled={!buffer}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-40 ${fromHereClass}`}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{isActuallyPlaying ? 'pause' : 'play_circle'}</span>
            {isActuallyPlaying ? t('pause') : t('playFromHere')}
            <kbd className="ml-0.5 px-1 py-px rounded border text-[10px] font-mono leading-none bg-white/5 border-white/10 opacity-50">Space</kbd>
          </button>
        ) : (
          /* No play-from-here: show standard pause/resume button when active */
          (playing || paused) && (
            <button onClick={onTogglePause}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${paused ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700 border-slate-600 text-white'}`}>
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{paused ? 'play_arrow' : 'pause'}</span>
              {paused ? t('resume') : t('pause')}
            </button>
          )
        )}

        {(playing || paused) && (
          <button onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>stop</span>
            {t('stop')}
          </button>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-xs mr-0.5">{t('zoomLabel')}</span>
          {([1, 2, 4, 8, 16] as const).map(z => (
            <button key={z} onClick={() => {
              const newVD = duration / z;
              const center = playheadSec > 0 ? playheadSec : viewStart + viewDuration / 2;
              onZoomChange(z, Math.max(0, Math.min(Math.max(0, duration - newVD), center - newVD / 2)));
            }}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${zoom === z ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              {z}×
            </button>
          ))}
        </div>
      </div>
      <WaveformScrollbar
        zoom={zoom} duration={duration} viewStart={viewStart}
        viewDuration={viewDuration}
        onChange={(vs) => onZoomChange(zoom, vs)}
      />
    </>
  );
}

// ─── Mode: Volume ─────────────────────────────────────────────────────────────

function VolumeMode() {
  const t = useTranslations('Tool');
  const [file, setFile]           = useState<File | null>(null);
  const [info, setInfo]           = useState<AudioFileInfo | null>(null);
  const [buffer, setBuffer]       = useState<AudioBuffer | null>(null);
  const [peaks, setPeaks]         = useState<Float32Array | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [volume, setVolume]       = useState(100);
  const [playing, setPlaying]     = useState(false);
  const [paused, setPaused]       = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [zoom, setZoom]           = useState(1);
  const [viewStart, setViewStart] = useState(0);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null);
  const gainRef        = useRef<GainNode | null>(null);
  const rafRef         = useRef<number | null>(null);
  const tickRef        = useRef<((t: number) => void) | null>(null);
  const startTimeRef   = useRef(0);
  const startSecRef    = useRef(0);
  const playingRef     = useRef(false);
  const pausedRef      = useRef(false);
  const playheadSecRef = useRef(0);
  const volumeRef      = useRef(100);

  useEffect(() => { playingRef.current  = playing;      }, [playing]);
  useEffect(() => { pausedRef.current   = paused;       }, [paused]);
  useEffect(() => { playheadSecRef.current = playheadSec; }, [playheadSec]);
  useEffect(() => { volumeRef.current   = volume;       }, [volume]);

  const duration    = buffer?.duration ?? 0;
  const viewDuration = duration / Math.max(1, zoom);
  const dbDisplay   = volume === 0 ? '-∞ dB' : `${(20 * Math.log10(volume / 100)).toFixed(1)} dB`;
  const status      = volume <= 100 ? 'safe' : volume <= 150 ? 'loud' : 'distorted';

  const stopPlayback = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current.disconnect(); sourceRef.current = null;
    }
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    gainRef.current = null; tickRef.current = null;
    setPaused(false); setPlaying(false);
  }, []);

  const startPlayback = useCallback((from: number, to: number) => {
    if (!buffer) return;
    stopPlayback();
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const gainNode = ctx.createGain();
    gainNode.gain.value = volumeRef.current / 100;
    gainRef.current = gainNode;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(gainNode); gainNode.connect(ctx.destination);
    const startAt = ctx.currentTime;
    src.start(startAt, from, to - from);
    startTimeRef.current = startAt; startSecRef.current = from;
    sourceRef.current = src;
    setPlayheadSec(from); setPlaying(true);
    const tick = () => {
      if (!audioCtxRef.current) return;
      const cur = Math.min(to, startSecRef.current + (audioCtxRef.current.currentTime - startTimeRef.current));
      setPlayheadSec(cur); playheadSecRef.current = cur;
      if (cur < to) rafRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = tick;
    rafRef.current = requestAnimationFrame(tick);
    src.onended = () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      setPlayheadSec(to); setPlaying(false); setPaused(false);
    };
  }, [buffer, stopPlayback]);

  const handleVolume = useCallback((pct: number) => {
    setVolume(pct);
    if (gainRef.current) gainRef.current.gain.value = pct / 100;
  }, []);

  const togglePause = useCallback(() => {
    if (!audioCtxRef.current || !playing) return;
    if (!paused) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      audioCtxRef.current.suspend(); setPaused(true);
    } else {
      audioCtxRef.current.resume().then(() => {
        setPaused(false);
        if (tickRef.current) rafRef.current = requestAnimationFrame(tickRef.current);
      });
    }
  }, [playing, paused]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      if (playingRef.current || pausedRef.current) togglePause();
      else if (buffer) startPlayback(playheadSecRef.current, duration);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePause, startPlayback, buffer, duration]);

  useEffect(() => () => { stopPlayback(); audioCtxRef.current?.close(); }, [stopPlayback]);

  const loadFile = useCallback(async (f: File) => {
    setError(null); setFile(f); setBuffer(null); setPeaks(null);
    stopPlayback();
    try {
      const { getAudioInfo, decodeAudioFile } = await import('@/lib/tools/audio-processor');
      const [ai, ab] = await Promise.all([getAudioInfo(f), decodeAudioFile(f)]);
      setInfo({ name: f.name, size: f.size, duration: ab.duration, sampleRate: ab.sampleRate, channels: ab.numberOfChannels, format: ai.format });
      setBuffer(ab); setPlayheadSec(0); setZoom(1); setViewStart(0);
      const ch = ab.getChannelData(0);
      const block = Math.floor(ch.length / PEAK_N);
      const p = new Float32Array(PEAK_N);
      for (let i = 0; i < PEAK_N; i++) {
        let max = 0;
        const s = i * block; const e2 = Math.min(s + block, ch.length);
        for (let j = s; j < e2; j++) max = Math.max(max, Math.abs(ch[j]));
        p[i] = Math.max(0.02, max);
      }
      setPeaks(p);
    } catch (err) { setError((err as Error).message || 'Failed to load.'); }
  }, [stopPlayback]);

  const handleExport = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const { adjustVolume } = await import('@/lib/tools/audio-processor');
      const blob = await adjustVolume(file, volume / 100);
      downloadBlob(blob, getOutputName(file.name, `vol${volume}pct`));
    } catch (e) { setError((e as Error).message || t('errors.processingFailed')); }
    finally { setProcessing(false); }
  };

  const reset = useCallback(() => {
    stopPlayback();
    setFile(null); setInfo(null); setBuffer(null); setPeaks(null); setError(null);
  }, [stopPlayback]);

  if (!file) return <DropZone onFiles={fs => loadFile(fs[0])} />;

  return (
    <div className="space-y-4">
      {info && <FileInfoCard info={info} onRemove={reset} />}
      {error && <ErrorBanner message={error} />}

      {peaks ? (
        <SimpleWaveformCanvas
          peaks={peaks} duration={duration} playheadSec={playheadSec}
          viewStart={viewStart} viewDuration={viewDuration} zoom={zoom}
          onSeek={t => { stopPlayback(); setPlayheadSec(t); startPlayback(t, duration); }}
          onZoomPan={(z, vs) => { setZoom(z); setViewStart(vs); }}
        />
      ) : (
        <div className="h-36 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
          <svg className="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      )}

      {peaks && <KeyboardHints />}

      <PlaybackControls
        playing={playing} paused={paused} buffer={buffer}
        duration={duration} zoom={zoom} viewStart={viewStart}
        viewDuration={viewDuration} playheadSec={playheadSec}
        onPlay={() => startPlayback(0, duration)}
        onPlayFromHere={() => startPlayback(playheadSecRef.current, duration)}
        onTogglePause={togglePause} onStop={stopPlayback}
        onZoomChange={(z, vs) => { setZoom(z); setViewStart(vs); }}
      />

      {/* Volume control */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-sm font-semibold">{t('volumeLabel')}</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">{dbDisplay}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              status === 'safe'       ? 'bg-emerald-500/20 text-emerald-400' :
              status === 'loud'       ? 'bg-amber-500/20   text-amber-400'   :
                                        'bg-red-500/20     text-red-400'
            }`}>
              {status === 'safe' ? t('statusSafe') : status === 'loud' ? t('statusLoud') : t('statusDistorted')}
            </span>
            <span className="text-indigo-400 font-bold text-sm w-12 text-right">{volume}%</span>
          </div>
        </div>
        <input type="range" min={0} max={300} step={1} value={volume}
          onChange={e => handleVolume(Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer" />
        <div className="flex justify-between">
          <span className="text-slate-600 text-xs">{t('volumeMin')}</span>
          <span className="text-slate-600 text-xs">{t('volumeOriginal')}</span>
          <span className="text-slate-600 text-xs">{t('volumeMax')}</span>
        </div>
        {status === 'distorted' && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-xs">
            <span className="material-symbols-outlined text-sm flex-shrink-0">warning</span>
            {t('clippingWarning')}
          </div>
        )}
      </div>

      {processing && <ProgressBar label={t('adjustingVolume')} />}
      <button onClick={handleExport} disabled={processing || !buffer}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
        <span className="material-symbols-outlined text-lg">download</span>
        {t('exportWav', { pct: volume })}
      </button>
    </div>
  );
}

// ─── Mode: Convert ────────────────────────────────────────────────────────────

function ConvertMode() {
  const t = useTranslations('Tool');
  const [file, setFile]               = useState<File | null>(null);
  const [info, setInfo]               = useState<AudioFileInfo | null>(null);
  const [buffer, setBuffer]           = useState<AudioBuffer | null>(null);
  const [peaks, setPeaks]             = useState<Float32Array | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [processing, setProcessing]   = useState(false);
  const [targetFormat, setTargetFormat] = useState<'wav' | 'mp3' | 'webm'>('wav');
  const [bitrate, setBitrate]         = useState<128 | 192 | 320>(192);
  const [sampleRate, setSampleRate]   = useState<44100 | 48000>(44100);
  const [resultUrl, setResultUrl]     = useState<string | null>(null);
  const [resultExt, setResultExt]     = useState('wav');
  const [playing, setPlaying]         = useState(false);
  const [paused, setPaused]           = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [zoom, setZoom]               = useState(1);
  const [viewStart, setViewStart]     = useState(0);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null);
  const rafRef         = useRef<number | null>(null);
  const tickRef        = useRef<((t: number) => void) | null>(null);
  const startTimeRef   = useRef(0);
  const startSecRef    = useRef(0);
  const playingRef     = useRef(false);
  const pausedRef      = useRef(false);
  const playheadSecRef = useRef(0);
  const resultUrlRef   = useRef<string | null>(null);

  useEffect(() => { playingRef.current    = playing;    }, [playing]);
  useEffect(() => { pausedRef.current     = paused;     }, [paused]);
  useEffect(() => { playheadSecRef.current = playheadSec; }, [playheadSec]);

  const duration    = buffer?.duration ?? 0;
  const viewDuration = duration / Math.max(1, zoom);

  const stopPlayback = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current.disconnect(); sourceRef.current = null;
    }
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    tickRef.current = null; setPaused(false); setPlaying(false);
  }, []);

  const startPlayback = useCallback((from: number, to: number, buf?: AudioBuffer) => {
    const src = buf ?? buffer;
    if (!src) return;
    stopPlayback();
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const node = ctx.createBufferSource();
    node.buffer = src;
    node.connect(ctx.destination);
    const startAt = ctx.currentTime;
    node.start(startAt, from, to - from);
    startTimeRef.current = startAt; startSecRef.current = from;
    sourceRef.current = node;
    setPlayheadSec(from); setPlaying(true);
    const tick = () => {
      if (!audioCtxRef.current) return;
      const cur = Math.min(to, startSecRef.current + (audioCtxRef.current.currentTime - startTimeRef.current));
      setPlayheadSec(cur); playheadSecRef.current = cur;
      if (cur < to) rafRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = tick; rafRef.current = requestAnimationFrame(tick);
    node.onended = () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      setPlayheadSec(to); setPlaying(false); setPaused(false);
    };
  }, [buffer, stopPlayback]);

  const togglePause = useCallback(() => {
    if (!audioCtxRef.current || !playing) return;
    if (!paused) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      audioCtxRef.current.suspend(); setPaused(true);
    } else {
      audioCtxRef.current.resume().then(() => {
        setPaused(false);
        if (tickRef.current) rafRef.current = requestAnimationFrame(tickRef.current);
      });
    }
  }, [playing, paused]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      if (playingRef.current || pausedRef.current) togglePause();
      else if (buffer) startPlayback(playheadSecRef.current, duration);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePause, startPlayback, buffer, duration]);

  useEffect(() => () => {
    stopPlayback(); audioCtxRef.current?.close();
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
  }, [stopPlayback]);

  const loadFile = useCallback(async (f: File) => {
    setError(null); setFile(f); setBuffer(null); setPeaks(null);
    if (resultUrlRef.current) { URL.revokeObjectURL(resultUrlRef.current); resultUrlRef.current = null; }
    setResultUrl(null);
    stopPlayback();
    try {
      const { getAudioInfo, decodeAudioFile } = await import('@/lib/tools/audio-processor');
      const [ai, ab] = await Promise.all([getAudioInfo(f), decodeAudioFile(f)]);
      setInfo({ name: f.name, size: f.size, duration: ab.duration, sampleRate: ab.sampleRate, channels: ab.numberOfChannels, format: ai.format });
      setBuffer(ab); setPlayheadSec(0); setZoom(1); setViewStart(0);
      const ch = ab.getChannelData(0);
      const block = Math.floor(ch.length / PEAK_N);
      const p = new Float32Array(PEAK_N);
      for (let i = 0; i < PEAK_N; i++) {
        let max = 0;
        const s = i * block; const e2 = Math.min(s + block, ch.length);
        for (let j = s; j < e2; j++) max = Math.max(max, Math.abs(ch[j]));
        p[i] = Math.max(0.02, max);
      }
      setPeaks(p);
    } catch (err) { setError((err as Error).message || 'Failed to load.'); }
  }, [stopPlayback]);

  const handleConvert = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const { convertAudio } = await import('@/lib/tools/audio-processor');
      const blob = await convertAudio(file, targetFormat, { bitrate, sampleRate });
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResultUrl(url); setResultExt(targetFormat);
    } catch (e) { setError((e as Error).message || 'Conversion failed.'); }
    finally { setProcessing(false); }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl; a.download = getOutputName(file.name, 'converted', resultExt);
    a.click();
  };

  const reset = useCallback(() => {
    stopPlayback();
    if (resultUrlRef.current) { URL.revokeObjectURL(resultUrlRef.current); resultUrlRef.current = null; }
    setFile(null); setInfo(null); setBuffer(null); setPeaks(null); setError(null); setResultUrl(null);
  }, [stopPlayback]);

  if (!file) return <DropZone onFiles={fs => loadFile(fs[0])} />;

  return (
    <div className="space-y-4">
      {info && <FileInfoCard info={info} onRemove={reset} />}
      {error && <ErrorBanner message={error} />}

      {peaks ? (
        <SimpleWaveformCanvas
          peaks={peaks} duration={duration} playheadSec={playheadSec}
          viewStart={viewStart} viewDuration={viewDuration} zoom={zoom}
          onSeek={t => { stopPlayback(); setPlayheadSec(t); startPlayback(t, duration); }}
          onZoomPan={(z, vs) => { setZoom(z); setViewStart(vs); }}
          accentColor="#34d399"
        />
      ) : (
        <div className="h-36 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
          <svg className="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      )}

      {peaks && <KeyboardHints />}

      <PlaybackControls
        playing={playing} paused={paused} buffer={buffer}
        duration={duration} zoom={zoom} viewStart={viewStart}
        viewDuration={viewDuration} playheadSec={playheadSec}
        onPlay={() => startPlayback(0, duration)}
        onPlayFromHere={() => startPlayback(playheadSecRef.current, duration)}
        onTogglePause={togglePause} onStop={stopPlayback}
        onZoomChange={(z, vs) => { setZoom(z); setViewStart(vs); }}
      />

      {/* Format + options */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-slate-200 font-semibold text-sm">{t('exportFormatLabel')}</h3>
        <div className="flex gap-2">
          {(['wav', 'mp3', 'webm'] as const).map(f => (
            <button key={f} onClick={() => setTargetFormat(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${targetFormat === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'}`}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {targetFormat === 'mp3' && (
          <div className="space-y-2">
            <p className="text-slate-500 text-xs font-medium">{t('bitrateLabel')}</p>
            <div className="flex gap-2">
              {([128, 192, 320] as const).map(b => (
                <button key={b} onClick={() => setBitrate(b)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${bitrate === b ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                  {b} kbps
                </button>
              ))}
            </div>
          </div>
        )}

        {targetFormat !== 'webm' && (
          <div className="space-y-2">
            <p className="text-slate-500 text-xs font-medium">{t('sampleRateLabel')}</p>
            <div className="flex gap-2">
              {([44100, 48000] as const).map(r => (
                <button key={r} onClick={() => setSampleRate(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${sampleRate === r ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                  {r / 1000} kHz
                </button>
              ))}
            </div>
          </div>
        )}

        {targetFormat === 'webm' && (
          <p className="text-slate-600 text-xs">{t('webmNote')}</p>
        )}
      </div>

      {processing && <ProgressBar label={t('convertingLabel')} />}

      <button onClick={handleConvert} disabled={processing || !buffer}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium rounded-xl transition-colors">
        <span className="material-symbols-outlined text-lg">sync</span>
        {t('convertToFormat', { format: targetFormat.toUpperCase() })}
      </button>

      {resultUrl && (
        <div className="p-4 bg-slate-900 border border-emerald-800/40 rounded-xl space-y-3">
          <p className="text-emerald-400 text-sm font-semibold">{t('previewConverted')}</p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={resultUrl} className="w-full h-10" />
          <button onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            {t('downloadDotExt', { ext: resultExt })}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Mode: Merge ──────────────────────────────────────────────────────────────

const TRACK_COLORS = ['#818cf8', '#34d399', '#f59e0b', '#f472b6', '#60a5fa', '#a78bfa'];

interface MergeFileEntry {
  file: File;
  info: AudioFileInfo | null;
  peaks: Float32Array | null;
  color: string;
}

function MergeMode() {
  const t = useTranslations('Tool');
  const [entries, setEntries]       = useState<MergeFileEntry[]>([]);
  const [fadeIn,  setFadeIn]        = useState(0.2);
  const [fadeOut, setFadeOut]       = useState(0.2);
  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultPeaks, setResultPeaks] = useState<Float32Array | null>(null);
  const [resultBuffer, setResultBuffer] = useState<AudioBuffer | null>(null);
  const [resultUrl, setResultUrl]   = useState<string | null>(null);
  const [playing, setPlaying]       = useState(false);
  const [paused, setPaused]         = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [zoom, setZoom]             = useState(1);
  const [viewStart, setViewStart]   = useState(0);
  const [dropIdx, setDropIdx]       = useState<number | null>(null);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null);
  const rafRef         = useRef<number | null>(null);
  const tickRef        = useRef<((t: number) => void) | null>(null);
  const startTimeRef   = useRef(0);
  const startSecRef    = useRef(0);
  const playingRef     = useRef(false);
  const pausedRef      = useRef(false);
  const playheadSecRef = useRef(0);
  const dragIdxRef     = useRef<number | null>(null);
  const resultUrlRef   = useRef<string | null>(null);
  const timelineRef    = useRef<HTMLDivElement>(null);
  const listDragIdxRef = useRef<number | null>(null);
  const listRef        = useRef<HTMLDivElement>(null);
  const [listDropIdx, setListDropIdx] = useState<number | null>(null);

  useEffect(() => { playingRef.current    = playing;    }, [playing]);
  useEffect(() => { pausedRef.current     = paused;     }, [paused]);
  useEffect(() => { playheadSecRef.current = playheadSec; }, [playheadSec]);

  const resDuration  = resultBuffer?.duration ?? 0;
  const viewDuration = resDuration / Math.max(1, zoom);

  const stopPlayback = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current.disconnect(); sourceRef.current = null;
    }
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    tickRef.current = null; setPaused(false); setPlaying(false);
  }, []);

  const startPlayback = useCallback((from: number, to: number, buf?: AudioBuffer) => {
    const src = buf ?? resultBuffer;
    if (!src) return;
    stopPlayback();
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const node = ctx.createBufferSource();
    node.buffer = src;
    node.connect(ctx.destination);
    const startAt = ctx.currentTime;
    node.start(startAt, from, to - from);
    startTimeRef.current = startAt; startSecRef.current = from;
    sourceRef.current = node;
    setPlayheadSec(from); setPlaying(true);
    const tick = () => {
      if (!audioCtxRef.current) return;
      const cur = Math.min(to, startSecRef.current + (audioCtxRef.current.currentTime - startTimeRef.current));
      setPlayheadSec(cur); playheadSecRef.current = cur;
      if (cur < to) rafRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = tick; rafRef.current = requestAnimationFrame(tick);
    node.onended = () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      setPlayheadSec(to); setPlaying(false); setPaused(false);
    };
  }, [resultBuffer, stopPlayback]);

  const togglePause = useCallback(() => {
    if (!audioCtxRef.current || !playing) return;
    if (!paused) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      audioCtxRef.current.suspend(); setPaused(true);
    } else {
      audioCtxRef.current.resume().then(() => {
        setPaused(false);
        if (tickRef.current) rafRef.current = requestAnimationFrame(tickRef.current);
      });
    }
  }, [playing, paused]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      if (playingRef.current || pausedRef.current) togglePause();
      else if (resultBuffer) startPlayback(playheadSecRef.current, resDuration);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePause, startPlayback, resultBuffer, resDuration]);

  useEffect(() => () => {
    stopPlayback(); audioCtxRef.current?.close();
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
  }, [stopPlayback]);

  const addFiles = useCallback(async (files: File[]) => {
    setError(null); setResultBlob(null); setResultPeaks(null); setResultBuffer(null); setResultUrl(null);
    const { getAudioInfo, decodeAudioFile } = await import('@/lib/tools/audio-processor');
    const newEntries = await Promise.all(files.map(async (f, i) => {
      const color = TRACK_COLORS[(entries.length + i) % TRACK_COLORS.length];
      try {
        const [ai, ab] = await Promise.all([getAudioInfo(f), decodeAudioFile(f)]);
        const ch = ab.getChannelData(0);
        const n = 100; const block = Math.floor(ch.length / n);
        const p = new Float32Array(n);
        for (let j = 0; j < n; j++) {
          let max = 0; const s = j * block; const e2 = Math.min(s + block, ch.length);
          for (let k = s; k < e2; k++) max = Math.max(max, Math.abs(ch[k]));
          p[j] = Math.max(0.02, max);
        }
        return { file: f, info: { name: f.name, size: f.size, duration: ab.duration, sampleRate: ab.sampleRate, channels: ab.numberOfChannels, format: ai.format }, peaks: p, color };
      } catch {
        return { file: f, info: null, peaks: null, color };
      }
    }));
    setEntries(prev => [...prev, ...newEntries]);
  }, [entries.length]);

  const removeEntry = (i: number) => setEntries(prev => prev.filter((_, idx) => idx !== i));

  // Drag-to-reorder
  const startReorderDrag = useCallback((i: number, e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragIdxRef.current = i;
    setDropIdx(i);
  }, []);

  const onTimelinePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragIdxRef.current === null) return;
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const total = entries.reduce((s, en) => s + (en.info?.duration ?? 1), 0);
    let acc = 0;
    for (let j = 0; j < entries.length; j++) {
      const w = ((entries[j].info?.duration ?? 1) / total) * rect.width;
      acc += w;
      if (x <= acc) { setDropIdx(j); return; }
    }
    setDropIdx(entries.length - 1);
  }, [entries]);

  const onTimelinePointerUp = useCallback(() => {
    const from = dragIdxRef.current;
    const to = dropIdx;
    dragIdxRef.current = null;
    setDropIdx(null);
    if (from === null || to === null || from === to) return;
    setEntries(prev => {
      const a = [...prev];
      const [item] = a.splice(from, 1);
      a.splice(to, 0, item);
      return a;
    });
  }, [dropIdx]);

  const startListDrag = useCallback((i: number, e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    listDragIdxRef.current = i;
    setListDropIdx(i);
  }, []);

  const onListPointerMove = useCallback((e: React.PointerEvent) => {
    if (listDragIdxRef.current === null) return;
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = e.clientY - rect.top;
    const itemH = rect.height / entries.length;
    setListDropIdx(Math.max(0, Math.min(entries.length - 1, Math.floor(y / itemH))));
  }, [entries.length]);

  const onListPointerUp = useCallback(() => {
    const from = listDragIdxRef.current;
    const to = listDropIdx;
    listDragIdxRef.current = null;
    setListDropIdx(null);
    if (from === null || to === null || from === to) return;
    setEntries(prev => {
      const a = [...prev];
      const [item] = a.splice(from, 1);
      a.splice(to, 0, item);
      return a;
    });
  }, [listDropIdx]);

  const totalDuration = entries.reduce((s, e) => s + (e.info?.duration ?? 0), 0);

  const handleMerge = async () => {
    if (entries.length < 2) { setError(t('addAtLeast2')); return; }
    setProcessing(true); setError(null);
    try {
      const { mergeAudio, decodeAudioFile } = await import('@/lib/tools/audio-processor');
      const blob = await mergeAudio(entries.map(e => e.file), { fadeIn, fadeOut });
      const ab = await decodeAudioFile(new File([blob], 'merged.wav', { type: 'audio/wav' }));
      const ch = ab.getChannelData(0);
      const block = Math.floor(ch.length / PEAK_N);
      const p = new Float32Array(PEAK_N);
      for (let i = 0; i < PEAK_N; i++) {
        let max = 0; const s = i * block; const e2 = Math.min(s + block, ch.length);
        for (let j = s; j < e2; j++) max = Math.max(max, Math.abs(ch[j]));
        p[i] = Math.max(0.02, max);
      }
      setResultBlob(blob); setResultBuffer(ab); setResultPeaks(p);
      setPlayheadSec(0); setZoom(1); setViewStart(0);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url; setResultUrl(url);
    } catch (e) { setError((e as Error).message || t('errors.processingFailed')); }
    finally { setProcessing(false); }
  };

  const reset = useCallback(() => {
    stopPlayback();
    if (resultUrlRef.current) { URL.revokeObjectURL(resultUrlRef.current); resultUrlRef.current = null; }
    setEntries([]); setResultBlob(null); setResultPeaks(null); setResultBuffer(null); setResultUrl(null); setError(null);
  }, [stopPlayback]);

  return (
    <div className="space-y-4">
      <DropZone multiple onFiles={addFiles} />
      {error && <ErrorBanner message={error} />}

      {entries.length > 0 && (
        <>
          {/* Horizontal timeline */}
          <div
            ref={timelineRef}
            className="flex h-20 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden select-none"
            onPointerMove={onTimelinePointerMove}
            onPointerUp={onTimelinePointerUp}
            onPointerCancel={() => { dragIdxRef.current = null; setDropIdx(null); }}
          >
            {entries.map((entry, i) => {
              const w = totalDuration > 0
                ? (entry.info?.duration ?? 0) / totalDuration * 100
                : 100 / entries.length;
              const isDrop = dropIdx === i && dragIdxRef.current !== null && dragIdxRef.current !== i;
              return (
                <div
                  key={i}
                  style={{ width: `${w}%`, background: entry.color + '22' }}
                  className={`relative flex-shrink-0 border-r border-slate-700 cursor-grab touch-none ${isDrop ? 'ring-2 ring-inset ring-white/40' : ''}`}
                  onPointerDown={ev => startReorderDrag(i, ev)}
                >
                  <MiniWaveformCanvas peaks={entry.peaks} color={entry.color} />
                  <span className="absolute bottom-1 left-1 text-[10px] text-slate-400 truncate max-w-full px-1 pointer-events-none">
                    {entry.file.name}
                  </span>
                  <span className="absolute top-1 left-1 text-[9px] text-slate-600 pointer-events-none">{i + 1}</span>
                </div>
              );
            })}
          </div>

          {/* File list */}
          <div className="flex items-center justify-between px-0.5">
            <span className="text-slate-500 text-xs">{t('dragToReorder')}</span>
            <span className="text-slate-600 text-xs">{t('filesCount', { count: entries.length })}</span>
          </div>
          <div
            ref={listRef}
            className="space-y-1.5"
            onPointerMove={onListPointerMove}
            onPointerUp={onListPointerUp}
            onPointerCancel={() => { listDragIdxRef.current = null; setListDropIdx(null); }}
          >
            {entries.map((entry, i) => {
              const isDrop = listDropIdx === i && listDragIdxRef.current !== null && listDragIdxRef.current !== i;
              return (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 bg-slate-900 border rounded-lg transition-colors ${isDrop ? 'border-indigo-500 ring-1 ring-indigo-500/40' : 'border-slate-800'}`}>
                  <span
                    className="cursor-grab active:cursor-grabbing touch-none text-slate-600 hover:text-slate-400 flex-shrink-0 select-none"
                    onPointerDown={e => startListDrag(i, e)}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6-14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                  </span>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                  <span className="text-slate-500 text-xs w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm truncate">{entry.file.name}</p>
                    {entry.info && <p className="text-slate-600 text-xs">{formatDuration(entry.info.duration)} · {formatBytes(entry.info.size)}</p>}
                  </div>
                  <button onClick={() => removeEntry(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              );
            })}
            <p className="text-slate-600 text-xs text-right">{t('totalDurationLabel', { duration: formatDuration(totalDuration) })}</p>
          </div>

          {/* Fade controls */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            {[{ label: t('fadeIn'), value: fadeIn, set: setFadeIn }, { label: t('fadeOut'), value: fadeOut, set: setFadeOut }].map(({ label, value, set }) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-400 text-xs font-medium">{label}</span>
                  <span className="text-indigo-400 text-xs font-bold">{value.toFixed(2)}s</span>
                </div>
                <input type="range" min={0} max={2} step={0.05} value={value}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer" />
              </div>
            ))}
          </div>
        </>
      )}

      {processing && <ProgressBar label={t('mergingAudio')} />}

      {entries.length >= 2 && !processing && (
        <button onClick={handleMerge}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
          <span className="material-symbols-outlined text-lg">merge</span>
          {t('mergeNFiles', { count: entries.length })}
        </button>
      )}

      {/* Merged preview */}
      {resultPeaks && resultBuffer && (
        <div className="space-y-3 p-4 bg-slate-900 border border-emerald-800/40 rounded-xl">
          <p className="text-emerald-400 text-sm font-semibold">{t('mergedPreview')}</p>
          <SimpleWaveformCanvas
            peaks={resultPeaks} duration={resDuration} playheadSec={playheadSec}
            viewStart={viewStart} viewDuration={viewDuration} zoom={zoom}
            onSeek={t => { stopPlayback(); setPlayheadSec(t); startPlayback(t, resDuration); }}
            onZoomPan={(z, vs) => { setZoom(z); setViewStart(vs); }}
            accentColor="#34d399"
          />
          <KeyboardHints />
          <PlaybackControls
            playing={playing} paused={paused} buffer={resultBuffer}
            duration={resDuration} zoom={zoom} viewStart={viewStart}
            viewDuration={viewDuration} playheadSec={playheadSec}
            onPlay={() => startPlayback(0, resDuration)}
            onTogglePause={togglePause} onStop={stopPlayback}
            onZoomChange={(z, vs) => { setZoom(z); setViewStart(vs); }}
          />
          <div className="flex gap-3">
            <button onClick={() => resultBlob && downloadBlob(resultBlob, 'merged_audio.wav')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
              <span className="material-symbols-outlined text-lg">download</span>
              {t('downloadMergedWav')}
            </button>
            <button onClick={reset}
              className="flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700">
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mode: Split ──────────────────────────────────────────────────────────────

const SPLIT_HIT = 22; // px hit radius for split marker drag — enlarged for mobile touch

function SplitMode() {
  const t = useTranslations('Tool');
  // ── File / Audio
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<AudioFileInfo | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);

  // ── Split points (sorted seconds)
  const [splitPoints, setSplitPoints] = useState<number[]>([]);

  // ── View
  const [zoom, setZoom] = useState(1);
  const [viewStart, setViewStart] = useState(0);

  // ── Playback
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [hoverSec, setHoverSec] = useState<number | null>(null);

  // ── Export
  const [exportFormat, setExportFormat] = useState<'wav' | 'mp3'>('wav');
  const [bitrate, setBitrate] = useState<128 | 192 | 320>(192);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBlobs, setResultBlobs] = useState<Blob[]>([]);

  // ── Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasW, setCanvasW] = useState(600);

  // ── Playback refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playStartCtxRef = useRef(0);
  const playOffsetRef = useRef(0);
  const playEndRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<(() => void) | null>(null);
  const playingRef = useRef(false);
  const pausedRef = useRef(false);
  const playheadSecRef = useRef(0);

  // ── Drag / click state
  const splitDragRef = useRef<{ type: 'playhead' | 'seek' | 'pan'; startX: number; markerVal: number } | null>(null);
  const dragMarkerValRef = useRef<number | null>(null);
  const panStartVSRef = useRef(0);

  // ── Derived
  const duration = useMemo(() => buffer?.duration ?? 0, [buffer]);
  const viewDuration = useMemo(() => duration > 0 ? Math.max(0.01, duration / zoom) : 1, [duration, zoom]);

  // Live refs for use inside event listeners (avoid stale closures)
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  const viewStartRef = useRef(viewStart);
  useEffect(() => { viewStartRef.current = viewStart; }, [viewStart]);
  const viewDurationRef = useRef(viewDuration);
  useEffect(() => { viewDurationRef.current = viewDuration; }, [viewDuration]);
  // Ref for double-tap logic so pinch handler can call current version
  const dblClickHandlerRef = useRef<((clientX: number, clientY: number) => void) | null>(null);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { playheadSecRef.current = playheadSec; }, [playheadSec]);

  const getCanvasW = useCallback(() => canvasRef.current?.offsetWidth || canvasW, [canvasW]);
  const pxToTime = useCallback((px: number) => viewStart + (px / getCanvasW()) * viewDuration, [viewStart, viewDuration, getCanvasW]);
  const timeToPx = useCallback((t: number) => ((t - viewStart) / viewDuration) * getCanvasW(), [viewStart, viewDuration, getCanvasW]);

  useEffect(() => {
    if (duration <= 0) return;
    setViewStart(vs => Math.max(0, Math.min(Math.max(0, duration - viewDuration), vs)));
  }, [duration, viewDuration]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setCanvasW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Canvas draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = Math.max(1, canvas.offsetWidth || canvasW);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(CANVAS_H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(CANVAS_H * dpr);
    }
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, CANVAS_H);
    if (!peaks || duration <= 0) return;

    const sorted = [...splitPoints].sort((a, b) => a - b);
    const BAR_W = 2.5, BAR_GAP = 1, UNIT = BAR_W + BAR_GAP;
    const numBars = Math.floor(W / UNIT);
    const centerY = WAVEFORM_H / 2;
    const SEG_COLORS = ['#818cf8', '#60a5fa']; // alternating indigo / blue

    for (let i = 0; i < numBars; i++) {
      const tA = viewStart + (i / numBars) * viewDuration;
      const tB = viewStart + ((i + 1) / numBars) * viewDuration;
      const pA = Math.floor((tA / duration) * PEAK_N);
      const pB = Math.ceil((tB / duration) * PEAK_N);
      let peak = 0;
      for (let p = pA; p < pB && p < PEAK_N; p++) peak = Math.max(peak, peaks[p]);
      const barH = Math.max(2, Math.max(0.02, peak) * (WAVEFORM_H - 20) * 0.95);
      const segIdx = sorted.filter(sp => sp <= (tA + tB) / 2).length;
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = SEG_COLORS[segIdx % 2];
      ctx.fillRect(i * UNIT, centerY - barH / 2, BAR_W, barH);
    }
    ctx.globalAlpha = 1;

    // Split markers
    for (const sp of sorted) {
      const spX = timeToPx(sp);
      if (spX < -20 || spX > W + 20) continue;
      ctx.fillStyle = '#f97316';
      ctx.fillRect(spX - 1.5, 0, 3, WAVEFORM_H);
      ctx.beginPath();
      ctx.moveTo(spX - 7, 0); ctx.lineTo(spX + 7, 0); ctx.lineTo(spX, 12);
      ctx.fill();
    }

    // Playhead
    const phX = timeToPx(playheadSec);
    if (phX >= 0 && phX <= W) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(phX - 1, 0, 2, WAVEFORM_H);
      ctx.beginPath();
      ctx.moveTo(phX - 5, 0); ctx.lineTo(phX + 5, 0); ctx.lineTo(phX, 8);
      ctx.fill();
    }

    // Hover
    if (hoverSec !== null) {
      const hx = timeToPx(hoverSec);
      if (hx >= 0 && hx <= W) { ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(hx - 0.5, 0, 1, WAVEFORM_H); }
    }

    // Ruler
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, WAVEFORM_H, W, RULER_H);
    const interval = calcRulerInterval(viewDuration);
    const firstTick = Math.ceil(viewStart / interval) * interval;
    ctx.font = '10px "Inter", system-ui, sans-serif';
    for (let t = firstTick; t <= viewStart + viewDuration + 0.0001; t += interval) {
      const rx = timeToPx(t);
      if (rx < -10 || rx > W + 10) continue;
      ctx.fillStyle = '#334155'; ctx.fillRect(rx, WAVEFORM_H, 1, 8);
      if (rx > 24 && rx < W - 24) { ctx.fillStyle = '#64748b'; ctx.textAlign = 'center'; ctx.fillText(fmtMs(t), rx, WAVEFORM_H + 22); }
    }
    // Marker labels in ruler
    for (const sp of sorted) {
      const spX = timeToPx(sp);
      if (spX < 0 || spX > W) continue;
      ctx.fillStyle = '#f97316'; ctx.font = '10px "Inter", system-ui, sans-serif';
      ctx.textAlign = spX < 30 ? 'left' : spX > W - 30 ? 'right' : 'center';
      ctx.fillText(fmtMs(sp), Math.max(2, Math.min(W - 2, spX)), WAVEFORM_H + 36);
    }
    // Hover tooltip
    if (hoverSec !== null) {
      const hx = timeToPx(hoverSec);
      if (hx >= 0 && hx <= W) {
        const label = fmtMs(hoverSec);
        ctx.font = '10px "Inter", system-ui, sans-serif';
        const lw = ctx.measureText(label).width + 10;
        const lx = Math.max(0, Math.min(W - lw, hx - lw / 2));
        ctx.fillStyle = 'rgba(15,23,42,0.92)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(lx, WAVEFORM_H + 2, lw, 17, 3);
        else ctx.rect(lx, WAVEFORM_H + 2, lw, 17);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center';
        ctx.fillText(label, lx + lw / 2, WAVEFORM_H + 14);
      }
    }
  }, [peaks, canvasW, splitPoints, playheadSec, hoverSec, duration, viewStart, viewDuration, timeToPx]);

  // ── File loading
  const loadFile = useCallback(async (f: File) => {
    setError(null); setFile(f); setSplitPoints([]); setResultBlobs([]);
    try {
      const { getAudioInfo, decodeAudioFile } = await import('@/lib/tools/audio-processor');
      const [ai, ab] = await Promise.all([getAudioInfo(f), decodeAudioFile(f)]);
      setInfo({ name: f.name, size: f.size, duration: ab.duration, sampleRate: ab.sampleRate, channels: ab.numberOfChannels, format: ai.format });
      setBuffer(ab);
      setPlayheadSec(0); setZoom(1); setViewStart(0);
      const ch = ab.getChannelData(0);
      const block = Math.floor(ch.length / PEAK_N);
      const p = new Float32Array(PEAK_N);
      for (let i = 0; i < PEAK_N; i++) {
        let max = 0; const s = i * block; const e = Math.min(s + block, ch.length);
        for (let j = s; j < e; j++) max = Math.max(max, Math.abs(ch[j]));
        p[i] = Math.max(0.02, max);
      }
      setPeaks(p);
    } catch (err) { setError((err as Error).message || t('errors.processingFailed')); }
  }, []);

  // ── Playback (mirrors TrimMode)
  const stopPlayback = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      sourceRef.current.disconnect(); sourceRef.current = null;
    }
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    tickRef.current = null; setPaused(false); setPlaying(false);
  }, []);

  const startPlayback = useCallback((from: number, to: number) => {
    if (!buffer) return;
    stopPlayback();
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') audioCtxRef.current = new AudioContext();
    const actx = audioCtxRef.current;
    if (actx.state === 'suspended') actx.resume();
    const src = actx.createBufferSource();
    src.buffer = buffer; src.connect(actx.destination);
    const startAt = actx.currentTime + 0.03;
    src.start(startAt, from, Math.max(0.001, to - from));
    playStartCtxRef.current = startAt; playOffsetRef.current = from; playEndRef.current = to;
    sourceRef.current = src; setPlaying(true); setPlayheadSec(from);
    src.onended = () => { setPlaying(false); setPaused(false); setPlayheadSec(from); };
    const tick = () => {
      if (!audioCtxRef.current) return;
      const pos = playOffsetRef.current + Math.max(0, audioCtxRef.current.currentTime - playStartCtxRef.current);
      if (pos <= playEndRef.current) { setPlayheadSec(pos); rafRef.current = requestAnimationFrame(tick); }
      else { setPlayheadSec(from); setPlaying(false); setPaused(false); }
    };
    tickRef.current = tick; rafRef.current = requestAnimationFrame(tick);
  }, [buffer, stopPlayback]);

  const togglePause = useCallback(() => {
    if (!audioCtxRef.current || !playing) return;
    if (!paused) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      audioCtxRef.current.suspend(); setPaused(true);
    } else {
      audioCtxRef.current.resume().then(() => {
        setPaused(false);
        if (tickRef.current) rafRef.current = requestAnimationFrame(tickRef.current);
      });
    }
  }, [playing, paused]);

  useEffect(() => () => { stopPlayback(); audioCtxRef.current?.close(); }, [stopPlayback]);

  // ── Wheel: vertical scroll = zoom centered on cursor; shift/horizontal = pan
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const W = el.offsetWidth || canvasW;
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        const delta = e.shiftKey ? e.deltaY : e.deltaX;
        const dt = delta / W * viewDuration * 0.8;
        setViewStart(vs => Math.max(0, Math.min(Math.max(0, duration - viewDuration), vs + dt)));
      } else {
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const mTime = viewStart + (mx / W) * viewDuration;
        const factor = e.deltaY > 0 ? 0.75 : 1 / 0.75;
        const newZoom = Math.max(1, Math.min(64, zoom * factor));
        const newVD = duration / newZoom;
        setZoom(newZoom);
        setViewStart(Math.max(0, Math.min(duration - newVD, mTime - (mx / W) * newVD)));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [zoom, viewStart, viewDuration, duration, canvasW]);

  // ── Keep dblClickHandlerRef current so pinch useEffect can call it
  useEffect(() => {
    dblClickHandlerRef.current = (clientX: number, clientY: number) => {
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const W = el.offsetWidth;
      const clamped = Math.max(0, Math.min(W, x));
      const sec = pxToTime(clamped);
      const nearIdx = splitPoints.findIndex(sp => Math.abs(timeToPx(sp) - x) <= SPLIT_HIT * 2);
      if (nearIdx >= 0) {
        setSplitPoints(prev => prev.filter((_, i) => i !== nearIdx));
      } else if (sec > 0.001 && sec < duration - 0.001) {
        setSplitPoints(prev => [...prev, sec].sort((a, b) => a - b));
      }
    };
  }, [pxToTime, timeToPx, splitPoints, duration]);

  // ── Pinch-to-zoom (mobile two-finger gesture)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    let initDist = 0;
    let initZoom = 1;
    let initMidTime = 0;

    const getTouchDist = (t: TouchList) => {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      initDist = getTouchDist(e.touches);
      initZoom = zoomRef.current;
      const rect = el.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      initMidTime = viewStartRef.current + (midX / el.offsetWidth) * viewDurationRef.current;
    };

    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || initDist === 0) return;
      e.preventDefault();
      const scale = getTouchDist(e.touches) / initDist;
      const newZoom = Math.max(1, Math.min(64, initZoom * scale));
      const newVD = duration / newZoom;
      const rect = el.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const newVS = Math.max(0, Math.min(Math.max(0, duration - newVD), initMidTime - (midX / el.offsetWidth) * newVD));
      setZoom(newZoom);
      setViewStart(newVS);
    };

    const onEnd = (e: TouchEvent) => { if (e.touches.length < 2) initDist = 0; };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [duration]); // refs used internally — no stale closure

  // ── Space key: pause/resume/play from playhead
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      if (playingRef.current || pausedRef.current) {
        togglePause();
      } else if (buffer) {
        startPlayback(playheadSecRef.current, duration);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePause, startPlayback, buffer, duration]);

  // ── Pointer handlers
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    e.currentTarget.setPointerCapture(e.pointerId);
    const phX = timeToPx(playheadSecRef.current);
    dragMarkerValRef.current = null;
    if (Math.abs(x - phX) <= 20) {
      if (playingRef.current || pausedRef.current) stopPlayback();
      splitDragRef.current = { type: 'playhead', startX: x, markerVal: 0 };
    } else if (zoom > 1) {
      // Drag immediately pans when zoomed in; short click still seeks (handled in onPointerUp)
      panStartVSRef.current = viewStart;
      splitDragRef.current = { type: 'pan', startX: x, markerVal: 0 };
    } else {
      if (playingRef.current || pausedRef.current) stopPlayback();
      splitDragRef.current = { type: 'seek', startX: x, markerVal: 0 };
    }
  }, [timeToPx, stopPlayback, zoom, viewStart]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const W = getCanvasW();
    const clamped = Math.max(0, Math.min(W, x));
    setHoverSec(pxToTime(clamped));
    if (canvasRef.current) {
      const phX = timeToPx(playheadSecRef.current);
      const nearPh = Math.abs(x - phX) <= 20;
      const dragging = splitDragRef.current;
      if (dragging?.type === 'playhead') {
        canvasRef.current.style.cursor = 'grabbing';
      } else if (dragging?.type === 'pan') {
        canvasRef.current.style.cursor = 'grabbing';
      } else if (nearPh) {
        canvasRef.current.style.cursor = 'grab';
      } else {
        canvasRef.current.style.cursor = 'crosshair';
      }
    }
    if (!splitDragRef.current || e.buttons === 0) return;
    const { type, startX } = splitDragRef.current;
    if (type === 'playhead') {
      setPlayheadSec(Math.max(0, Math.min(duration, pxToTime(clamped))));
    } else if (type === 'pan') {
      const dx = x - startX;
      const maxVS = Math.max(0, duration - viewDuration);
      setViewStart(Math.max(0, Math.min(maxVS, panStartVSRef.current - (dx / W) * viewDuration)));
    }
  }, [pxToTime, timeToPx, duration, getCanvasW, zoom, viewDuration]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const W = getCanvasW();
    const clamped = Math.max(0, Math.min(W, x));
    const drag = splitDragRef.current;
    splitDragRef.current = null;
    dragMarkerValRef.current = null;

    if (drag?.type === 'playhead') {
      setPlayheadSec(Math.max(0, Math.min(duration, pxToTime(clamped))));
      return;
    }

    // Pan with significant movement: just finish, no seek
    if (drag?.type === 'pan' && Math.abs(x - drag.startX) > 5) return;

    // Short click (seek or tiny pan): move playhead
    if (playingRef.current || pausedRef.current) stopPlayback();
    const sec = pxToTime(clamped);
    setPlayheadSec(sec);
    playheadSecRef.current = sec;
  }, [pxToTime, getCanvasW, duration, stopPlayback]);

  const onDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const W = getCanvasW();
    const clamped = Math.max(0, Math.min(W, x));
    const sec = pxToTime(clamped);
    const nearIdx = splitPoints.findIndex(sp => Math.abs(timeToPx(sp) - x) <= SPLIT_HIT * 2);
    if (nearIdx >= 0) {
      setSplitPoints(prev => prev.filter((_, i) => i !== nearIdx));
    } else if (sec > 0.001 && sec < duration - 0.001) {
      setSplitPoints(prev => [...prev, sec].sort((a, b) => a - b));
    }
  }, [pxToTime, getCanvasW, splitPoints, timeToPx, duration]);

  const onMouseLeave = useCallback(() => setHoverSec(null), []);

  // ── Add split at playhead
  const addSplitAtPlayhead = useCallback(() => {
    const t = playheadSec;
    if (t <= 0.001 || t >= duration - 0.001) return;
    setSplitPoints(prev => {
      if (prev.some(sp => Math.abs(sp - t) < 0.05)) return prev;
      return [...prev, t].sort((a, b) => a - b);
    });
  }, [playheadSec, duration]);

  // ── Export
  const handleExport = async () => {
    if (!buffer || !file) return;
    setProcessing(true); setError(null); setResultBlobs([]);
    try {
      const { exportTrimmedAudio } = await import('@/lib/tools/audio-processor');
      const sorted = [...splitPoints].sort((a, b) => a - b).filter(t => t > 0.001 && t < duration - 0.001);
      const boundaries = [0, ...sorted, duration];
      const blobs: Blob[] = [];
      for (let i = 0; i < boundaries.length - 1; i++) {
        blobs.push(await exportTrimmedAudio(buffer, boundaries[i], boundaries[i + 1], exportFormat, bitrate));
      }
      setResultBlobs(blobs);
    } catch (err) { setError((err as Error).message || t('errors.processingFailed')); }
    finally { setProcessing(false); }
  };

  const reset = useCallback(() => {
    stopPlayback();
    setFile(null); setBuffer(null); setInfo(null); setPeaks(null); setError(null);
    setSplitPoints([]); setResultBlobs([]);
  }, [stopPlayback]);

  if (!file) return <DropZone onFiles={fs => loadFile(fs[0])} />;

  const sortedSp = [...splitPoints].sort((a, b) => a - b).filter(t => t > 0 && t < duration);
  const boundaries = [0, ...sortedSp, duration];
  const segCount = boundaries.length - 1;

  return (
    <div className="space-y-4">
      {info && <FileInfoCard info={info} onRemove={reset} />}
      {error && <ErrorBanner message={error} />}

      {/* Waveform canvas */}
      <div ref={containerRef} className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ cursor: 'crosshair', touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { splitDragRef.current = null; dragMarkerValRef.current = null; }}
          onDoubleClick={onDoubleClick}
          onMouseLeave={onMouseLeave}
        />
        {!peaks && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Hints: desktop keyboard / mobile gesture */}
      <div className="hidden sm:flex items-center justify-center gap-4 flex-wrap text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono text-xs">Space</kbd>
          <span>{t('kbdPauseResume')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400 text-sm">⟳</span>
          <span>{t('kbdScrollZoom')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono text-xs">⇧</kbd>
          <span>{t('kbdShiftPan')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>pan_tool</span>
          <span>{t('kbdDragPan')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400">✦</span>
          <span>{t('kbdDblSplit')}</span>
        </span>
      </div>
      <div className="flex sm:hidden items-center justify-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-slate-400">pinch</span>
          <span>{t('mobilePinchZoom')}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-slate-400">touch_app</span>
          <span>{t('mobileHoldPan')}</span>
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => startPlayback(0, duration)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          {t('playAll')}
        </button>
        {(() => {
          const isActPlaying = playing && !paused;
          const pfhClick = isActPlaying ? togglePause : (paused ? togglePause : () => startPlayback(playheadSec, duration));
          const pfhClass  = isActPlaying
            ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
            : 'bg-indigo-600/20 border-indigo-600/50 text-indigo-300 hover:bg-indigo-600/30';
          return (
            <button onClick={pfhClick} disabled={!buffer}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-40 ${pfhClass}`}>
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{isActPlaying ? 'pause' : 'play_circle'}</span>
              {isActPlaying ? t('pause') : t('playFromHere')}
              <kbd className="ml-0.5 px-1 py-px rounded border text-[10px] font-mono leading-none bg-white/5 border-white/10 opacity-50">Space</kbd>
            </button>
          );
        })()}
        {(playing || paused) && (
          <button onClick={stopPlayback}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>stop</span>
            {t('stop')}
          </button>
        )}
        <div className="w-px h-4 bg-slate-700 mx-0.5" />
        <button onClick={addSplitAtPlayhead} disabled={!buffer || playheadSec <= 0.001 || playheadSec >= duration - 0.001}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/30 transition-colors disabled:opacity-40">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>content_cut</span>
          {t('splitHere')}
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-xs mr-0.5">{t('zoomLabel')}</span>
          {([1, 2, 4, 8, 16] as const).map(z => (
            <button key={z} onClick={() => {
              const newVD = duration / z;
              const center = playheadSec > 0 ? playheadSec : viewStart + viewDuration / 2;
              setZoom(z);
              setViewStart(Math.max(0, Math.min(Math.max(0, duration - newVD), center - newVD / 2)));
            }}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${zoom === z ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              {z}×
            </button>
          ))}
        </div>
      </div>

      <WaveformScrollbar zoom={zoom} duration={duration} viewStart={viewStart} viewDuration={viewDuration} onChange={setViewStart} />

      {/* Split points list */}
      {sortedSp.length > 0 && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-200 font-semibold text-sm">{t('splitPointsLabel', { count: sortedSp.length })}</h3>
            <button onClick={() => setSplitPoints([])} className="text-slate-500 text-xs hover:text-slate-300 transition-colors">{t('clearAll')}</button>
          </div>
          <div className="space-y-1">
            {sortedSp.map((sp, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-orange-400 text-sm font-mono">{fmtMs(sp)}</span>
                <button onClick={() => setSplitPoints(prev => prev.filter(s => s !== sp))}
                  className="text-slate-600 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Segment count */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm">
        <span className="text-slate-500">{t('segmentsLabel')}</span>
        <span className="text-indigo-400 font-semibold">{segCount}</span>
      </div>

      {/* Export options */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <p className="text-slate-400 text-sm font-medium mb-3">{t('export')}</p>
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="text-slate-500 text-xs mb-1.5">{t('formatLabel')}</p>
            <div className="flex gap-1.5">
              {(['wav', 'mp3'] as const).map(f => (
                <button key={f} onClick={() => setExportFormat(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${exportFormat === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {exportFormat === 'mp3' && (
            <div>
              <p className="text-slate-500 text-xs mb-1.5">{t('bitrateLabel')}</p>
              <div className="flex gap-1.5">
                {([128, 192, 320] as const).map(b => (
                  <button key={b} onClick={() => setBitrate(b)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${bitrate === b ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                    {b}k
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {processing && <ProgressBar label={t('exportingSegments')} />}

      {!processing && resultBlobs.length === 0 && (
        <button onClick={handleExport} disabled={!buffer}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
          <span className="material-symbols-outlined text-lg">call_split</span>
          {t('exportNSegments', { count: segCount, s: segCount !== 1 ? 's' : '' })}
        </button>
      )}

      {resultBlobs.length > 0 && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-200 font-semibold text-sm">{t('segmentsReady', { count: resultBlobs.length })}</h3>
            <button onClick={() => setResultBlobs([])} className="text-slate-500 text-xs hover:text-slate-300 transition-colors">{t('reExportBtn')}</button>
          </div>
          {resultBlobs.map((blob, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-sm">
                {t('partLabel', { n: i + 1 })} · <span className="text-slate-500 font-mono text-xs">{fmtMs(boundaries[i])} → {fmtMs(boundaries[i + 1])}</span> · {formatBytes(blob.size)}
              </span>
              <button onClick={() => downloadBlob(blob, (file?.name ?? 'audio').replace(/\.[^.]+$/, `_part${i + 1}.${exportFormat}`))}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0 ml-2">
                <span className="material-symbols-outlined text-sm">download</span>
                {t('download')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mode: Denoise ────────────────────────────────────────────────────────────

function DenoiseMode() {
  const t = useTranslations('Tool');
  const [file, setFile]           = useState<File | null>(null);
  const [info, setInfo]           = useState<AudioFileInfo | null>(null);
  const [buffer, setBuffer]       = useState<AudioBuffer | null>(null);
  const [peaks, setPeaks]         = useState<Float32Array | null>(null);
  const [outBuffer, setOutBuffer] = useState<AudioBuffer | null>(null);
  const [outPeaks, setOutPeaks]   = useState<Float32Array | null>(null);
  const [outBlob, setOutBlob]     = useState<Blob | null>(null);
  const [abMode, setAbMode]       = useState<'before' | 'after'>('before');
  const [processing, setProcessing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [playing, setPlaying]     = useState(false);
  const [paused, setPaused]       = useState(false);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [zoom, setZoom]           = useState(1);
  const [viewStart, setViewStart] = useState(0);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null);
  const rafRef         = useRef<number | null>(null);
  const tickRef        = useRef<((t: number) => void) | null>(null);
  const startTimeRef   = useRef(0);
  const startSecRef    = useRef(0);
  const playingRef     = useRef(false);
  const pausedRef      = useRef(false);
  const playheadSecRef = useRef(0);

  useEffect(() => { playingRef.current  = playing;      }, [playing]);
  useEffect(() => { pausedRef.current   = paused;       }, [paused]);
  useEffect(() => { playheadSecRef.current = playheadSec; }, [playheadSec]);

  const activeBuffer   = abMode === 'after' && outBuffer ? outBuffer : buffer;
  const activePeaks    = abMode === 'after' && outPeaks  ? outPeaks  : peaks;
  const duration       = activeBuffer?.duration ?? 0;
  const viewDuration   = duration / Math.max(1, zoom);

  const stopPlayback = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current.disconnect(); sourceRef.current = null;
    }
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    tickRef.current = null;
    setPaused(false); setPlaying(false);
  }, []);

  const startPlayback = useCallback((from: number, to: number) => {
    const buf = abMode === 'after' && outBuffer ? outBuffer : buffer;
    if (!buf) return;
    stopPlayback();
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const startAt = ctx.currentTime;
    src.start(startAt, from, to - from);
    startTimeRef.current = startAt; startSecRef.current = from;
    sourceRef.current = src;
    setPlayheadSec(from); setPlaying(true);
    const tick = () => {
      if (!audioCtxRef.current) return;
      const cur = Math.min(to, startSecRef.current + (audioCtxRef.current.currentTime - startTimeRef.current));
      setPlayheadSec(cur); playheadSecRef.current = cur;
      if (cur < to) rafRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = tick;
    rafRef.current = requestAnimationFrame(tick);
    src.onended = () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      setPlayheadSec(to); setPlaying(false); setPaused(false);
    };
  }, [buffer, outBuffer, abMode, stopPlayback]);

  const togglePause = useCallback(() => {
    if (!audioCtxRef.current || !playing) return;
    if (!paused) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      audioCtxRef.current.suspend(); setPaused(true);
    } else {
      audioCtxRef.current.resume().then(() => {
        setPaused(false);
        if (tickRef.current) rafRef.current = requestAnimationFrame(tickRef.current);
      });
    }
  }, [playing, paused]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      if (playingRef.current || pausedRef.current) togglePause();
      else if (activeBuffer) startPlayback(playheadSecRef.current, duration);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [togglePause, startPlayback, activeBuffer, duration]);

  useEffect(() => () => { stopPlayback(); audioCtxRef.current?.close(); }, [stopPlayback]);

  const computePeaks = (ab: AudioBuffer): Float32Array => {
    const ch = ab.getChannelData(0);
    const block = Math.floor(ch.length / PEAK_N);
    const p = new Float32Array(PEAK_N);
    for (let i = 0; i < PEAK_N; i++) {
      let max = 0;
      const s = i * block; const e2 = Math.min(s + block, ch.length);
      for (let j = s; j < e2; j++) max = Math.max(max, Math.abs(ch[j]));
      p[i] = Math.max(0.02, max);
    }
    return p;
  };

  const loadFile = useCallback(async (f: File) => {
    setError(null); setFile(f); setBuffer(null); setPeaks(null);
    setOutBuffer(null); setOutPeaks(null); setOutBlob(null); setAbMode('before');
    stopPlayback();
    try {
      const { getAudioInfo, decodeAudioFile } = await import('@/lib/tools/audio-processor');
      const [ai, ab] = await Promise.all([getAudioInfo(f), decodeAudioFile(f)]);
      setInfo({ name: f.name, size: f.size, duration: ab.duration, sampleRate: ab.sampleRate, channels: ab.numberOfChannels, format: ai.format });
      setBuffer(ab); setPlayheadSec(0); setZoom(1); setViewStart(0);
      setPeaks(computePeaks(ab));
    } catch (err) { setError((err as Error).message || 'Failed to load.'); }
  }, [stopPlayback]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDenoise = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const { denoiseAudio, decodeAudioFile } = await import('@/lib/tools/audio-processor');
      const blob = await denoiseAudio(file);
      const ab = await decodeAudioFile(new File([blob], 'denoised.wav', { type: 'audio/wav' }));
      setOutBuffer(ab);
      setOutPeaks(computePeaks(ab));
      setOutBlob(blob);
      setAbMode('after');
      stopPlayback();
      setPlayheadSec(0);
    } catch (e) { setError((e as Error).message || 'Processing failed.'); }
    finally { setProcessing(false); }
  };

  const reset = useCallback(() => {
    stopPlayback();
    setFile(null); setInfo(null); setBuffer(null); setPeaks(null);
    setOutBuffer(null); setOutPeaks(null); setOutBlob(null);
    setAbMode('before'); setError(null);
  }, [stopPlayback]);

  if (!file) return <DropZone onFiles={fs => loadFile(fs[0])} />;

  return (
    <div className="space-y-4">
      {info && <FileInfoCard info={info} onRemove={reset} />}
      {error && <ErrorBanner message={error} />}

      {/* A/B toggle */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mr-1">{t('compareLabel')}</span>
        {(['before', 'after'] as const).map(m => (
          <button key={m} onClick={() => { stopPlayback(); setPlayheadSec(0); setAbMode(m); }}
            disabled={m === 'after' && !outBuffer}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              abMode === m
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}>
            {m === 'before' ? t('beforeLabel') : t('afterLabel')}
          </button>
        ))}
        {outBuffer && (
          <span className="text-xs text-slate-500 ml-1">{abMode === 'before' ? t('originalAudio') : t('gateApplied')}</span>
        )}
      </div>

      {activePeaks ? (
        <SimpleWaveformCanvas
          peaks={activePeaks} duration={duration} playheadSec={playheadSec}
          viewStart={viewStart} viewDuration={viewDuration} zoom={zoom}
          onSeek={t => { stopPlayback(); setPlayheadSec(t); startPlayback(t, duration); }}
          onZoomPan={(z, vs) => { setZoom(z); setViewStart(vs); }}
          accentColor={abMode === 'after' ? '#34d399' : undefined}
        />
      ) : (
        <div className="h-36 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center">
          <svg className="animate-spin w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      )}

      {activePeaks && <KeyboardHints />}

      <PlaybackControls
        playing={playing} paused={paused} buffer={activeBuffer}
        duration={duration} zoom={zoom} viewStart={viewStart}
        viewDuration={viewDuration} playheadSec={playheadSec}
        onPlay={() => startPlayback(0, duration)}
        onPlayFromHere={() => startPlayback(playheadSecRef.current, duration)}
        onTogglePause={togglePause} onStop={stopPlayback}
        onZoomChange={(z, vs) => { setZoom(z); setViewStart(vs); }}
      />

      {/* RNNoise AI panel */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-200 font-semibold text-sm">{t('rnnoiseTitle')}</h3>
          <span className="flex items-center gap-1.5 text-xs text-violet-300 bg-violet-500/10 border border-violet-500/30 px-2 py-1 rounded-lg">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            {t('rnnoiseAiTag')}
          </span>
        </div>
        <p className="text-slate-500 text-xs">{t('rnnoiseDesc')}</p>
        {info && info.sampleRate !== 48000 && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
            <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">warning</span>
            {t('rnnoiseSrWarning', { sr: (info.sampleRate / 1000).toFixed(1) })}
          </div>
        )}
        <p className="text-slate-600 text-xs flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">download</span>
          {t('rnnoiseFirstRun')}
        </p>
      </div>

      {processing && <ProgressBar label={t('rnnoiseApplying')} />}

      <div className="flex gap-3">
        <button onClick={handleDenoise} disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          {processing ? t('rnnoiseApplying') : t('rnnoiseApply')}
        </button>
        {outBlob && (
          <button onClick={() => file && downloadBlob(outBlob, getOutputName(file.name, 'denoised'))}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            {t('downloadWav')}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Root Component ──────────────────────────────────────────────────────────

export function AudioCore({ mode }: Props) {
  const t = useTranslations('Tool');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const AUDIO_TABS: { mode: AudioMode; label: string; icon: string }[] = [
    { mode: 'audio-trim',    label: t('tabTrim'),    icon: 'content_cut' },
    { mode: 'audio-split',   label: t('tabSplit'),   icon: 'call_split' },
    { mode: 'audio-volume',  label: t('volumeLabel'),icon: 'volume_up' },
    { mode: 'audio-convert', label: t('tabConvert'), icon: 'sync' },
    { mode: 'audio-merge',   label: t('tabMerge'),   icon: 'merge' },
    { mode: 'audio-denoise', label: t('tabDenoise'), icon: 'noise_control_off' },
  ];
  let content: React.ReactNode;
  switch (mode) {
    case 'audio-trim':    content = <TrimMode />; break;
    case 'audio-volume':  content = <VolumeMode />; break;
    case 'audio-convert': content = <ConvertMode />; break;
    case 'audio-merge':   content = <MergeMode />; break;
    case 'audio-split':   content = <SplitMode />; break;
    case 'audio-denoise': content = <DenoiseMode />; break;
    default: content = null;
  }

  return (
    <div className="space-y-5">
      {/* Audio tool tab bar — navigates between audio tool pages */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {AUDIO_TABS.map(tab => (
          <a
            key={tab.mode}
            href={`/${locale}/tools/${tab.mode}`}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === tab.mode
                ? 'bg-indigo-600 text-white shadow-md pointer-events-none'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </a>
        ))}
      </div>
      {content}
    </div>
  );
}

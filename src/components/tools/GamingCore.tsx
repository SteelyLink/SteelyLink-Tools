'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export type GamingMode =
  | 'cps-test'
  | 'reaction-test'
  | 'sensitivity-converter'
  | `${string}-sensitivity-converter`
  | `${string}-to-${string}-sensitivity`;

// ── Game sensitivity data ─────────────────────────────────────────────────────

interface GameDef {
  name: string;
  short: string;
  yaw: number;       // degrees per count at sensitivity 1.0
  sensMin: number;
  sensMax: number;
  sensStep: number;
  sensDefault: number;
  sensLabel: string;
  note?: string;
}

const GAMES: Record<string, GameDef> = {
  cs2:        { name: 'CS2 / CS:GO',          short: 'CS2',   yaw: 0.022,          sensMin: 0.1,   sensMax: 10,  sensStep: 0.1,  sensDefault: 1.0, sensLabel: 'sensLabelSensitivity' },
  valorant:   { name: 'Valorant',              short: 'VAL',   yaw: 0.07,           sensMin: 0.01,  sensMax: 10,  sensStep: 0.01, sensDefault: 0.3, sensLabel: 'sensLabelSensitivity' },
  apex:       { name: 'Apex Legends',          short: 'APX',   yaw: 0.022,          sensMin: 0.1,   sensMax: 5,   sensStep: 0.1,  sensDefault: 1.0, sensLabel: 'sensLabelMouseSensitivity' },
  overwatch2: { name: 'Overwatch 2',           short: 'OW2',   yaw: 0.0066,         sensMin: 1,     sensMax: 100, sensStep: 1,    sensDefault: 7,   sensLabel: 'sensLabelSensitivity' },
  r6siege:    { name: 'Rainbow Six Siege',     short: 'R6',    yaw: 0.005729577951, sensMin: 1,     sensMax: 100, sensStep: 1,    sensDefault: 40,  sensLabel: 'sensLabelMousePct' },
  pubg:       { name: 'PUBG',                  short: 'PUBG',  yaw: 0.00476,        sensMin: 1,     sensMax: 200, sensStep: 1,    sensDefault: 50,  sensLabel: 'sensLabelGeneralSensitivity' },
  fortnite:   { name: 'Fortnite',              short: 'FN',    yaw: 0.22,           sensMin: 0.001, sensMax: 1,   sensStep: 0.001,sensDefault: 0.10,sensLabel: 'sensLabelXY', note: 'sensNoteXAxis' },
  cod:        { name: 'Call of Duty',          short: 'CoD',   yaw: 0.0066,         sensMin: 1,     sensMax: 20,  sensStep: 0.5,  sensDefault: 7,   sensLabel: 'sensLabelSensitivity' },
  tarkov:     { name: 'Escape from Tarkov',    short: 'EFT',   yaw: 0.01375,        sensMin: 0.01,  sensMax: 10,  sensStep: 0.01, sensDefault: 0.5, sensLabel: 'sensLabelMouseSensitivity' },
  bf2042:     { name: 'Battlefield 2042',      short: 'BF',    yaw: 0.022,          sensMin: 1,     sensMax: 100, sensStep: 1,    sensDefault: 40,  sensLabel: 'sensLabelMouseSensitivity' },
  halo:       { name: 'Halo Infinite',         short: 'HALO',  yaw: 0.022,          sensMin: 1,     sensMax: 20,  sensStep: 0.5,  sensDefault: 4,   sensLabel: 'sensLabelSensitivity' },
  thefinals:  { name: 'The Finals',            short: 'TF',    yaw: 0.022,          sensMin: 0.01,  sensMax: 5,   sensStep: 0.01, sensDefault: 1.0, sensLabel: 'sensLabelSensitivity' },
  warframe:   { name: 'Warframe',              short: 'WF',    yaw: 0.0375,         sensMin: 0.01,  sensMax: 5,   sensStep: 0.01, sensDefault: 0.5, sensLabel: 'sensLabelMouseSensitivity' },
};

const GAME_KEYS = Object.keys(GAMES);

function cm360(dpi: number, sens: number, yaw: number): number {
  return (360 * 2.54) / (dpi * sens * yaw);
}
function sensFromCm360(dpi: number, target: number, yaw: number): number {
  return (360 * 2.54) / (dpi * target * yaw);
}

// ── CPS Test ─────────────────────────────────────────────────────────────────

function CpsTest() {
  const t = useTranslations('Tool');
  const [phase, setPhase]   = useState<'idle' | 'running' | 'done'>('idle');
  const [clicks, setClicks] = useState(0);
  const [cps, setCps]       = useState(0);
  const [timeLeft, setTime] = useState(10);
  const duration = 10;

  const startRef  = useRef<number>(0);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const clicksRef = useRef(0);

  const start = useCallback(() => {
    clicksRef.current = 0;
    setClicks(0); setCps(0); setTime(duration);
    setPhase('running');
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, duration - elapsed);
      setTime(Math.ceil(left));
      setCps(clicksRef.current / Math.max(elapsed, 0.01));
      if (elapsed >= duration) {
        clearInterval(timerRef.current!);
        setPhase('done');
      }
    }, 100);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === 'idle') { start(); return; }
    if (phase === 'running') {
      clicksRef.current++;
      setClicks(clicksRef.current);
    }
    // phase === 'done' is deliberately inert: the result stays frozen until the
    // user presses the explicit restart button, so over-clicking past the timer
    // can't wipe the score before it has been read.
  }, [phase, start]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const rating =
    cps >= 14 ? { label: t('ratingGodlike'), color: 'text-purple-400' } :
    cps >= 10 ? { label: t('ratingElite'),   color: 'text-red-400' } :
    cps >= 7  ? { label: t('ratingPro'),     color: 'text-amber-400' } :
    cps >= 5  ? { label: t('ratingGood'),    color: 'text-emerald-400' } :
                { label: t('ratingCasual'),  color: 'text-slate-400' };

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">{t('cpsInstruction', { duration })}</p>
      <div
        onPointerDown={(e) => { e.preventDefault(); handleClick(); }}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'manipulation' }}
        className={`relative rounded-2xl border-2 flex flex-col items-center justify-center gap-4 select-none transition-all min-h-[320px] sm:min-h-[280px]
          ${phase === 'running'
            ? 'border-indigo-500 bg-indigo-600/10 cursor-pointer'
            : phase === 'done'
            ? 'border-emerald-500 bg-emerald-600/10 cursor-default'
            : 'border-slate-700 hover:border-indigo-400 bg-slate-900/50 cursor-pointer'
          }`}
      >
        {phase === 'idle' && (
          <>
            <span className="material-symbols-outlined text-5xl text-slate-400">mouse</span>
            <p className="text-slate-300 font-bold text-xl">{t('clickToStart')}</p>
            <p className="text-slate-500 text-sm">{t('cpsSubtitle', { duration })}</p>
          </>
        )}
        {phase === 'running' && (
          <>
            <div className="text-center">
              <p className="text-slate-400 text-sm uppercase tracking-widest">{t('clicksLabel')}</p>
              <p className="text-white text-7xl font-black tabular-nums">{clicks}</p>
            </div>
            <div className="text-center">
              <p className="text-indigo-300 text-3xl font-bold tabular-nums">{cps.toFixed(1)} CPS</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all rounded-full" style={{ width: `${((duration - timeLeft) / duration) * 100}%` }} />
              </div>
              <span className="text-slate-400 text-sm tabular-nums">{timeLeft}s</span>
            </div>
            <p className="text-slate-600 text-xs absolute bottom-4">{t('keepClicking')}</p>
          </>
        )}
        {phase === 'done' && (
          <>
            <div className="text-center">
              <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">{t('finalScore')}</p>
              <p className="text-white text-7xl font-black tabular-nums">{cps.toFixed(2)}</p>
              <p className="text-slate-400 text-lg">CPS</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${rating.color}`}>{rating.label}</p>
              <p className="text-slate-500 text-sm">{t('totalClicksIn', { clicks, duration })}</p>
            </div>
            <p className="text-emerald-400/80 text-sm">{t('cpsTestComplete')}</p>
          </>
        )}
      </div>
      {phase === 'done' && (
        <button
          onClick={start}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          {t('cpsRestartTest')}
        </button>
      )}
      {phase === 'done' && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: t('ratingCasual'), range: '< 5',  color: 'text-slate-400' },
            { label: t('ratingGood'),   range: '5–7',   color: 'text-emerald-400' },
            { label: t('ratingPro'),    range: '7–10',  color: 'text-amber-400' },
            { label: t('ratingElite'),  range: '10+',   color: 'text-red-400' },
          ].map(r => (
            <div key={r.label} className="text-center p-2 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className={`font-bold text-sm ${r.color}`}>{r.label}</p>
              <p className="text-slate-500 text-xs">{r.range}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reaction Test ─────────────────────────────────────────────────────────────

function ReactionTest() {
  const t = useTranslations('Tool');
  const [roundCount, setRoundCount] = useState<1 | 5>(1);
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'ready' | 'between' | 'done'>('idle');
  const [times, setTimes]   = useState<number[]>([]);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [tooEarly, setTooEarly] = useState(false);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyAt     = useRef<number>(0);
  const doneRounds  = useRef(0);

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };

  const startWaiting = useCallback(() => {
    setTooEarly(false);
    setPhase('waiting');
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      // Stamp the time in the same synchronous call that triggers the green state.
      // This matches what humanbenchmark and all professional reaction tests do —
      // the only remaining offset is display latency (0–16 ms at 60 Hz), which is
      // unavoidable from JavaScript and is identical to what other tools incur.
      readyAt.current = performance.now();
      setPhase('ready');
    }, delay);
  }, []);

  // Auto-advance from 'between' phase → next round.
  // Use local `t` — NOT timerRef — so cleanup only cancels this timer and
  // never accidentally cancels the ready-timer startWaiting() creates.
  useEffect(() => {
    if (phase !== 'between') return;
    const t = setTimeout(() => startWaiting(), 1200);
    return () => clearTimeout(t);
  }, [phase, startWaiting]);

  useEffect(() => () => clearTimer(), []);

  const handleClick = useCallback(() => {
    if (phase === 'idle' || phase === 'done') {
      clearTimer();
      doneRounds.current = 0;
      setTimes([]);
      setLastTime(null);
      startWaiting();
      return;
    }
    if (phase === 'between') return; // ignore clicks between rounds
    if (phase === 'waiting') {
      clearTimer();
      setTooEarly(true);
      setPhase('idle');
      return;
    }
    if (phase === 'ready') {
      // Use performance.now() for sub-millisecond accuracy
      const rt = Math.round(performance.now() - readyAt.current);
      doneRounds.current += 1;
      setLastTime(rt);
      setTimes(prev => [...prev, rt]);
      if (doneRounds.current >= roundCount) {
        setPhase('done');
      } else {
        setPhase('between');
      }
    }
  }, [phase, roundCount, startWaiting]);

  const avg  = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const best = times.length ? Math.min(...times) : 0;
  const worst = times.length ? Math.max(...times) : 0;

  const reactionLabel = (ms: number) =>
    ms < 150 ? { label: t('ratingSuperhuman'), color: 'text-purple-400' } :
    ms < 200 ? { label: t('ratingProGamer'),   color: 'text-red-400' } :
    ms < 250 ? { label: t('ratingGood'),       color: 'text-amber-400' } :
    ms < 350 ? { label: t('ratingAverage'),    color: 'text-emerald-400' } :
               { label: t('ratingSlow'),       color: 'text-slate-400' };

  const rating = avg ? reactionLabel(avg) : null;
  const total = roundCount;
  const done  = doneRounds.current;

  return (
    <div className="space-y-5">
      {/* Round count selector — only visible before test starts */}
      {(phase === 'idle' || phase === 'done') && (
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm">{t('roundsLabel')}:</span>
          {([1, 5] as const).map(n => (
            <button
              key={n}
              onClick={() => { setRoundCount(n); setTimes([]); setLastTime(null); doneRounds.current = 0; setPhase('idle'); }}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg border transition-all ${
                roundCount === n
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              {n === 1 ? t('oneRound') : t('fiveRoundsAvg')}
            </button>
          ))}
        </div>
      )}

      {/* Main clickable area */}
      <div
        onPointerDown={handleClick}
        className={`rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer select-none touch-none min-h-[280px] border-2 ${
          phase === 'waiting'
            ? 'bg-red-950/60 border-red-700'
            : phase === 'ready'
            ? 'bg-emerald-600/40 border-emerald-400'
            : phase === 'between'
            ? 'bg-slate-900/80 border-slate-600'
            : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
        }`}
      >
        {(phase === 'idle') && (
          <>
            <span className="material-symbols-outlined text-4xl text-slate-400">speed</span>
            <p className="text-slate-200 font-bold text-xl">{t('clickToStart')}</p>
            {tooEarly && <p className="text-red-400 text-sm font-semibold">{t('tooEarlyMsg')}</p>}
            {!tooEarly && <p className="text-slate-500 text-sm">{roundCount === 1 ? t('oneRound') : t('fiveRoundsAvg')} · {t('clickWhenGreen')}</p>}
          </>
        )}
        {phase === 'done' && (
          <>
            <span className="material-symbols-outlined text-4xl text-indigo-400">emoji_events</span>
            <p className="text-slate-200 font-bold text-xl">{t('doneClickRestart')}</p>
          </>
        )}
        {phase === 'waiting' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500" />
            <p className="text-red-300 font-black text-3xl">{t('waitMsg')}</p>
            <p className="text-slate-500 text-sm">{t('dontClickYet')}</p>
          </>
        )}
        {phase === 'ready' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
            <p className="text-emerald-200 font-black text-4xl tracking-tight">CLICK!</p>
          </>
        )}
        {phase === 'between' && lastTime !== null && (
          <>
            <p className="text-white font-black text-5xl tabular-nums">{lastTime}<span className="text-2xl text-slate-400 font-normal ml-1">ms</span></p>
            <p className={`text-lg font-bold ${reactionLabel(lastTime).color}`}>{reactionLabel(lastTime).label}</p>
            <p className="text-slate-500 text-sm">{t('roundProgress', { done, total })}</p>
          </>
        )}
      </div>

      {/* Round progress dots */}
      {total === 5 && (phase === 'waiting' || phase === 'ready' || phase === 'between') && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < done ? 'bg-emerald-400' : i === done ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'
            }`} />
          ))}
        </div>
      )}

      {/* Results */}
      {times.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {times.map((t, i) => (
              <div key={i} className={`px-3 py-2 rounded-lg border text-center min-w-[64px] ${
                t === best && times.length > 1 ? 'bg-emerald-900/30 border-emerald-700' : 'bg-slate-800 border-slate-700'
              }`}>
                <p className="text-slate-500 text-xs">#{i + 1}</p>
                <p className={`font-mono font-bold ${t === best && times.length > 1 ? 'text-emerald-400' : 'text-slate-200'}`}>{t}ms</p>
              </div>
            ))}
          </div>
          {phase === 'done' && times.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="card-surface p-4 text-center">
                <p className="text-slate-500 text-xs">{t('avgLabel')}</p>
                <p className="text-white font-black text-2xl mt-1">{avg}ms</p>
                {rating && <p className={`text-sm font-bold mt-1 ${rating.color}`}>{rating.label}</p>}
              </div>
              <div className="card-surface p-4 text-center">
                <p className="text-slate-500 text-xs">{t('bestLabel')}</p>
                <p className="text-emerald-400 font-black text-2xl mt-1">{best}ms</p>
              </div>
              <div className="card-surface p-4 text-center">
                <p className="text-slate-500 text-xs">{t('worstLabel')}</p>
                <p className="text-slate-300 font-black text-2xl mt-1">{worst}ms</p>
              </div>
            </div>
          )}
          {phase === 'done' && times.length === 1 && (
            <div className="card-surface p-5 text-center">
              <p className="text-slate-500 text-xs mb-1">{t('resultLabel')}</p>
              <p className="text-white font-black text-4xl">{times[0]}ms</p>
              <p className={`text-base font-bold mt-2 ${reactionLabel(times[0]).color}`}>{reactionLabel(times[0]).label}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sensitivity Converter ─────────────────────────────────────────────────────

function SensitivityConverter({ defaultFrom, defaultTo }: { defaultFrom?: string; defaultTo?: string }) {
  const t = useTranslations('Tool');
  const [fromGame, setFromGame] = useState(defaultFrom && GAMES[defaultFrom] ? defaultFrom : 'cs2');
  const [toGame,   setToGame]   = useState(defaultTo   && GAMES[defaultTo]   && defaultTo !== fromGame ? defaultTo : 'valorant');
  const [dpi,      setDpi]      = useState('800');
  const [fromSens, setFromSens] = useState('');
  const [toSens,   setToSens]   = useState('');
  const [cm360Val, setCm360Val] = useState('');

  const from = GAMES[fromGame];
  const to   = GAMES[toGame];

  const compute = useCallback((val: string, fg: string, tg: string, dpiVal: string) => {
    const s = parseFloat(val);
    const d = parseFloat(dpiVal) || 800;
    const f = GAMES[fg], t = GAMES[tg];
    if (!f || !t || isNaN(s) || s <= 0) { setToSens(''); setCm360Val(''); return; }
    const cm = cm360(d, s, f.yaw);
    const target = sensFromCm360(d, cm, t.yaw);
    setCm360Val(cm.toFixed(2));
    setToSens(target.toFixed(target < 0.1 ? 4 : target < 1 ? 3 : 2));
  }, []);

  useEffect(() => { compute(fromSens, fromGame, toGame, dpi); }, [fromSens, fromGame, toGame, dpi, compute]);

  const swap = () => {
    const f = fromGame, t = toGame, s = toSens;
    setFromGame(t); setToGame(f);
    setFromSens(s);
  };

  const selectCls = 'bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full';

  return (
    <div className="space-y-5">
      <p className="text-slate-400 text-sm">{t('sensConverterDesc')}</p>

      {/* DPI */}
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t('mouseDPILabel')}</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {[400, 800, 1000, 1600, 3200].map(d => (
            <button key={d} onClick={() => setDpi(String(d))}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${String(d) === dpi ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-400'}`}>
              {d}
            </button>
          ))}
          <input type="number" value={dpi} onChange={(e) => setDpi(e.target.value)}
            className="w-24 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={t('customDPI')} />
        </div>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-start">
        {/* From */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-600 inline-flex items-center justify-center text-white" style={{ fontSize: 9 }}>1</span>
              {t('fromGameLabel')}
            </label>
            <select value={fromGame} onChange={(e) => {
              const newFrom = e.target.value;
              if (newFrom === toGame) setToGame(fromGame);
              setFromGame(newFrom);
              setFromSens('');
            }} className={selectCls}>
              {GAME_KEYS.map(k => <option key={k} value={k}>{GAMES[k].name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">{t(from.sensLabel as any)}</label>
            <input type="number" value={fromSens} onChange={(e) => setFromSens(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-lg font-bold px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`e.g. ${from.sensDefault}`}
              step={from.sensStep} min={from.sensMin} max={from.sensMax} />
            {from.note && <p className="text-slate-600 text-xs mt-1">{t(from.note as any)}</p>}
          </div>
        </div>

        {/* Swap */}
        <div className="flex sm:flex-col items-center justify-center gap-2 sm:pt-8 py-1">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <button onClick={swap}
            className="text-xs px-2 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg hover:text-white hover:border-slate-500 transition-colors">
            {t('swapGames')}
          </button>
        </div>

        {/* To */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 inline-flex items-center justify-center text-white" style={{ fontSize: 9 }}>2</span>
              {t('toGameLabel')}
            </label>
            <select value={toGame} onChange={(e) => setToGame(e.target.value)} className={selectCls}>
              {GAME_KEYS.filter(k => k !== fromGame).map(k => <option key={k} value={k}>{GAMES[k].name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">{t(to.sensLabel as any)} {t('sensResultSuffix')}</label>
            <div className="bg-slate-900/80 border border-emerald-700/50 rounded-xl px-4 py-3">
              <p className={`text-2xl font-black tabular-nums ${toSens ? 'text-emerald-300' : 'text-slate-600'}`}>
                {toSens || '—'}
              </p>
            </div>
            {to.note && <p className="text-slate-600 text-xs mt-1">{t(to.note as any)}</p>}
          </div>
        </div>
      </div>

      {/* cm/360 info */}
      {cm360Val && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider">{t('cm360Title')}</p>
              <p className="text-indigo-300 text-2xl font-bold tabular-nums">{cm360Val} cm</p>
            </div>
            <p className="text-slate-600 text-xs max-w-[200px] text-right">
              {t('cm360Desc')}
            </p>
          </div>
        </div>
      )}

      {/* All games table */}
      {fromSens && parseFloat(fromSens) > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('allGameConversions')}</p>
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800">
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">{t('gameHeader')}</th>
                  <th className="text-right px-4 py-2.5 text-slate-500 font-medium">{t('equivSensHeader')}</th>
                </tr>
              </thead>
              <tbody>
                {GAME_KEYS.filter(k => k !== fromGame).map(k => {
                  const g = GAMES[k];
                  const d = parseFloat(dpi) || 800;
                  const s = parseFloat(fromSens);
                  const cm = cm360(d, s, from.yaw);
                  const equiv = sensFromCm360(d, cm, g.yaw);
                  const val = equiv.toFixed(equiv < 0.1 ? 4 : equiv < 1 ? 3 : 2);
                  return (
                    <tr key={k} className={`border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors ${k === toGame ? 'bg-indigo-900/20' : ''}`}>
                      <td className="px-4 py-2.5 text-slate-300 font-medium">
                        {k === toGame && <span className="mr-2 text-indigo-400">→</span>}
                        {g.name}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-100">{val}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Aim Trainer ───────────────────────────────────────────────────────────────

interface Target { id: number; x: number; y: number; r: number; born: number; }
interface Ripple { x: number; y: number; born: number; }

const AIM_DURATION = 30;
const TARGET_R     = 36;
const TARGET_TTL   = 2000;
const FADE_IN_MS   = 180;
const FADE_OUT_MS  = 450;

function AimTrainer() {
  const t = useTranslations('Tool');
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const [phase, setPhase]       = useState<'idle' | 'playing' | 'done'>('idle');
  const [timeLeft, setTimeLeft] = useState(AIM_DURATION);
  const [hits, setHits]         = useState(0);
  const [misses, setMisses]     = useState(0);
  const [avgMs, setAvgMs]       = useState(0);

  const phaseRef    = useRef<'idle' | 'playing' | 'done'>('idle');
  const targetsRef  = useRef<Target[]>([]);
  const ripplesRef  = useRef<Ripple[]>([]);
  const startRef    = useRef(0);
  const hitsRef     = useRef(0);
  const missesRef   = useRef(0);
  const hitTimesRef = useRef<number[]>([]);
  const rafRef      = useRef<number>(0);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextIdRef   = useRef(0);
  const canvasSize  = useRef({ w: 0, h: 0 });
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playHit = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ac = audioCtxRef.current;
      const t  = ac.currentTime;

      // Warm body — sine thud 520→180 Hz, feels like a clean "pop"
      const body = ac.createOscillator();
      const bodyGain = ac.createGain();
      body.type = 'sine';
      body.frequency.setValueAtTime(520, t);
      body.frequency.exponentialRampToValueAtTime(180, t + 0.045);
      bodyGain.gain.setValueAtTime(0.28, t);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      body.connect(bodyGain); bodyGain.connect(ac.destination);
      body.start(t); body.stop(t + 0.07);

      // Bright sparkle — triangle at 1600 Hz, very short, adds "click" attack
      const spark = ac.createOscillator();
      const sparkGain = ac.createGain();
      spark.type = 'triangle';
      spark.frequency.value = 1600;
      sparkGain.gain.setValueAtTime(0.07, t);
      sparkGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
      spark.connect(sparkGain); sparkGain.connect(ac.destination);
      spark.start(t); spark.stop(t + 0.025);
    } catch { /* ignore */ }
  }, []);

  const spawnTarget = useCallback(() => {
    const { w, h } = canvasSize.current;
    const margin = TARGET_R + 12;
    const x = margin + Math.random() * (w - margin * 2);
    const y = margin + Math.random() * (h - margin * 2);
    targetsRef.current = [{ id: nextIdRef.current++, x, y, r: TARGET_R, born: performance.now() }];
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { w, h } = canvasSize.current;
    const now = performance.now();

    // Background
    ctx.fillStyle = '#060b18';
    ctx.fillRect(0, 0, w, h);

    // Subtle dot-grid
    ctx.fillStyle = 'rgba(30,41,59,0.9)';
    const gs = 28;
    for (let x = gs; x < w; x += gs) {
      for (let y = gs; y < h; y += gs) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Expire old targets
    const expired = targetsRef.current.filter(t => now - t.born > TARGET_TTL);
    if (expired.length > 0 && phaseRef.current === 'playing') {
      missesRef.current += expired.length;
      setMisses(missesRef.current);
      targetsRef.current = targetsRef.current.filter(t => now - t.born <= TARGET_TTL);
      spawnTarget();
    }

    // Ripples (hit burst)
    ripplesRef.current = ripplesRef.current.filter(r => now - r.born < 500);
    for (const r of ripplesRef.current) {
      const p = (now - r.born) / 500;
      const radius = TARGET_R * (0.8 + p * 1.4);
      ctx.beginPath();
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(147,197,253,${(1 - p) * 0.55})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      // second smaller ripple offset
      const r2 = TARGET_R * (0.5 + p * 0.9);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(199,227,255,${(1 - p) * 0.35})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Targets
    for (const t of targetsRef.current) {
      const age = now - t.born;
      const fadeIn  = Math.min(age / FADE_IN_MS, 1);
      const fadeOut = age > TARGET_TTL - FADE_OUT_MS
        ? Math.max(0, 1 - (age - (TARGET_TTL - FADE_OUT_MS)) / FADE_OUT_MS)
        : 1;
      const a = fadeIn * fadeOut;
      if (a <= 0.01) continue;

      const { x, y, r } = t;
      const timePct = Math.max(0, 1 - age / TARGET_TTL);

      // Outer glow
      ctx.shadowColor = `rgba(96,165,250,${a * 0.55})`;
      ctx.shadowBlur  = 20;

      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(147,197,253,${a * 0.85})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Glass fill — radial gradient
      const fill = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x, y, r);
      fill.addColorStop(0,   `rgba(186,219,255,${a * 0.22})`);
      fill.addColorStop(0.55,`rgba(59,130,246,${a * 0.10})`);
      fill.addColorStop(1,   `rgba(15,23,42,${a * 0.06})`);
      ctx.beginPath();
      ctx.arc(x, y, r - 1, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();

      // Glass sheen (top-left specular highlight)
      const sheen = ctx.createRadialGradient(x - r * 0.38, y - r * 0.45, 0, x - r * 0.15, y - r * 0.15, r * 0.75);
      sheen.addColorStop(0, `rgba(255,255,255,${a * 0.32})`);
      sheen.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(x, y, r - 1, 0, Math.PI * 2);
      ctx.fillStyle = sheen;
      ctx.fill();

      // Countdown arc
      ctx.shadowColor = `rgba(96,165,250,${a * 0.7})`;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(x, y, r - 3.5, -Math.PI / 2, -Math.PI / 2 + timePct * Math.PI * 2);
      ctx.strokeStyle = `rgba(96,165,250,${a * 0.95})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Inner concentric ring
      ctx.beginPath();
      ctx.arc(x, y, r * 0.48, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(147,197,253,${a * 0.55})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center dot
      ctx.shadowColor = `rgba(200,230,255,${a})`;
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (phaseRef.current === 'playing') {
      rafRef.current = requestAnimationFrame(drawFrame);
    }
  }, [spawnTarget]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phaseRef.current !== 'playing') return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.current.w / rect.width;
    const scaleY = canvasSize.current.h / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const now = performance.now();

    let hit = false;
    for (const t of targetsRef.current) {
      const dx = cx - t.x, dy = cy - t.y;
      if (Math.sqrt(dx * dx + dy * dy) <= t.r) {
        hit = true;
        hitsRef.current++;
        hitTimesRef.current.push(now - t.born);
        setHits(hitsRef.current);
        ripplesRef.current.push({ x: t.x, y: t.y, born: now });
        targetsRef.current = [];
        playHit();
        spawnTarget();
        break;
      }
    }
    if (!hit) {
      missesRef.current++;
      setMisses(missesRef.current);
    }
  }, [spawnTarget, playHit]);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;
    const w = wrap.clientWidth;
    const h = Math.max(320, Math.min(480, Math.round(w * 0.56)));
    canvas.width  = w;
    canvas.height = h;
    canvasSize.current = { w, h };

    phaseRef.current    = 'playing';
    hitsRef.current     = 0;
    missesRef.current   = 0;
    hitTimesRef.current = [];
    targetsRef.current  = [];
    ripplesRef.current  = [];
    nextIdRef.current   = 0;
    startRef.current    = Date.now();

    setHits(0); setMisses(0); setAvgMs(0); setTimeLeft(AIM_DURATION);
    setPhase('playing');
    spawnTarget();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, AIM_DURATION - elapsed);
      setTimeLeft(Math.ceil(left));
      if (elapsed >= AIM_DURATION) {
        clearInterval(timerRef.current!);
        phaseRef.current   = 'done';
        targetsRef.current = [];
        const avg = hitTimesRef.current.length > 0
          ? Math.round(hitTimesRef.current.reduce((a, b) => a + b, 0) / hitTimesRef.current.length)
          : 0;
        setAvgMs(avg);
        setPhase('done');
      }
    }, 100);

    rafRef.current = requestAnimationFrame(drawFrame);
  }, [spawnTarget, drawFrame]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  const rating =
    hits >= 60 ? { label: t('ratingGodlike'), color: 'text-purple-400' } :
    hits >= 40 ? { label: t('ratingPro'),     color: 'text-amber-400' } :
    hits >= 24 ? { label: t('ratingGood'),    color: 'text-emerald-400' } :
                 { label: t('ratingCasual'),  color: 'text-slate-400' };

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">{t('aimDesc', { duration: AIM_DURATION })}</p>

      {/* wrapRef always mounted so clientWidth is readable when startGame fires */}
      <div ref={wrapRef} className="w-full">
        {phase === 'idle' && (
          <div
            className="flex flex-col items-center justify-center gap-5 min-h-[300px] rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-slate-900/60 backdrop-blur cursor-pointer hover:border-blue-400/35 hover:from-blue-900/30 transition-all duration-300"
            onClick={startGame}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-700/10 border border-blue-400/30 flex items-center justify-center shadow-[0_0_32px_rgba(96,165,250,0.18)]">
              <span className="material-symbols-outlined text-4xl text-blue-300" style={{ fontVariationSettings: "'FILL' 1" }}>ads_click</span>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-xl tracking-tight">{t('clickToStart')}</p>
              <p className="text-slate-500 text-sm mt-1">{t('aimChallenge', { duration: AIM_DURATION })}</p>
            </div>
          </div>
        )}

        {phase === 'playing' && (
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-4 text-sm font-semibold">
              <span className="text-emerald-400">{hits} hits</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{misses} miss</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(timeLeft / AIM_DURATION) * 100}%`,
                    background: timeLeft > 10
                      ? 'linear-gradient(90deg,#3b82f6,#60a5fa)'
                      : 'linear-gradient(90deg,#ef4444,#f87171)',
                  }}
                />
              </div>
              <span className="text-slate-300 font-mono font-bold text-sm tabular-nums w-8 text-right">{timeLeft}s</span>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full block rounded-xl cursor-crosshair"
          style={{ display: phase === 'playing' ? 'block' : 'none' }}
        />
      </div>

      {phase === 'done' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t('hitsStatLabel'),     value: String(hits),               icon: 'check_circle', color: 'text-emerald-400' },
              { label: t('missesStatLabel'),   value: String(misses),             icon: 'cancel',       color: 'text-red-400' },
              { label: t('accuracyStatLabel'), value: `${accuracy}%`,             icon: 'my_location',  color: 'text-blue-400' },
              { label: t('avgTimeStatLabel'),  value: avgMs ? `${avgMs}ms` : '—', icon: 'schedule',     color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <span className={`material-symbols-outlined text-2xl ${s.color} mb-1.5 block`}
                  style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <p className="text-white text-xl font-bold">{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center py-4">
            <p className={`text-3xl font-black ${rating.color}`}>{rating.label}</p>
            <p className="text-slate-500 text-sm mt-1">{t('targetsHitResult', { hits, accuracy })}</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: t('ratingCasual'),  range: '< 24',  color: 'text-slate-400' },
              { label: t('ratingGood'),    range: '24–39',  color: 'text-emerald-400' },
              { label: t('ratingPro'),     range: '40–59',  color: 'text-amber-400' },
              { label: t('ratingGodlike'), range: '60+',    color: 'text-purple-400' },
            ].map(r => (
              <div key={r.label} className="text-center p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className={`font-bold text-sm ${r.color}`}>{r.label}</p>
                <p className="text-slate-500 text-xs">{r.range}</p>
              </div>
            ))}
          </div>
          <button onClick={startGame} className="btn-primary flex items-center gap-2 mx-auto">
            <span className="material-symbols-outlined text-lg">refresh</span>
            {t('playAgain')}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Parse mode ─────────────────────────────────────────────────────────────────

function parseGamingMode(mode: string): { type: 'sens'; from?: string; to?: string } | null {
  // cs2-to-valorant-sensitivity
  const xToY = mode.match(/^(.+)-to-(.+)-sensitivity$/);
  if (xToY) return { type: 'sens', from: xToY[1].replace(/-/g, ''), to: xToY[2].replace(/-/g, '') };
  // valorant-sensitivity-converter
  const single = mode.match(/^(.+)-sensitivity-converter$/);
  if (single) return { type: 'sens', from: single[1].replace(/-/g, '') };
  // sensitivity-converter
  if (mode === 'sensitivity-converter') return { type: 'sens' };
  return null;
}

// ── Main export ────────────────────────────────────────────────────────────────

interface Props { mode: string; }

export function GamingCore({ mode }: Props) {
  const t = useTranslations('Tool');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const sensInfo = parseGamingMode(mode);

  const MODES: Record<string, { label: string; icon: string }> = {
    'aim-trainer':            { label: t('tabAimTrainer'), icon: 'ads_click' },
    'cps-test':               { label: t('tabCpsTest'),    icon: 'mouse' },
    'reaction-test':          { label: t('tabReaction'),   icon: 'speed' },
    'sensitivity-converter':  { label: t('tabSensitivity'),icon: 'gamepad' },
  };

  const activeTab =
    mode === 'aim-trainer'   ? 'aim-trainer' :
    mode === 'cps-test'      ? 'cps-test' :
    mode === 'reaction-test' ? 'reaction-test' : 'sensitivity-converter';

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {Object.entries(MODES).map(([key, { label, icon }]) => (
          <a key={key} href={`/${locale}/tools/${key}`}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === key
                ? 'bg-indigo-600 text-white shadow-md pointer-events-none'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            {label}
          </a>
        ))}
      </div>

      {activeTab === 'aim-trainer' && <AimTrainer />}
      {activeTab === 'cps-test' && <CpsTest />}
      {activeTab === 'reaction-test' && <ReactionTest />}
      {activeTab === 'sensitivity-converter' && (
        <SensitivityConverter
          defaultFrom={sensInfo?.from}
          defaultTo={sensInfo?.to}
        />
      )}
    </div>
  );
}

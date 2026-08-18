'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  generateRandom, binaryCalc, booleanCalc,
  evaluateBooleanExpression, bitwiseCalc, calculateIP,
  calcTimeDiff, addToDate, calcBMI, calcLoan, analyzeString,
  matrixAdd, matrixMultiply, matrixTranspose, parseMatrix, matrixToString,
} from '@/lib/tools/calculator';

interface Props {
  mode: string;
}

function clipboardWrite(text: string): Promise<void> {
  const cb = navigator.clipboard as Clipboard | undefined;
  if (cb?.writeText) return cb.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const t = useTranslations('Tool');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await clipboardWrite(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{copied ? 'check' : 'content_copy'}</span>
      {copied ? t('copied') : t('copy')}
    </button>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string | number | React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-slate-200 text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function inputCls(extra = '') {
  return `input-field px-3 py-2 text-sm ${extra}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BaseConverter() {
  const t = useTranslations('Tool');
  const [value, setValue] = useState('255');
  const [activeBase, setActiveBase] = useState(10);

  const convert = (v: string, base: number) => {
    if (!v.trim()) return '';
    const n = parseInt(v, base);
    return isNaN(n) ? '—' : n.toString(base).toUpperCase();
  };

  const bases = [
    { base: 2,  label: t('binary'),      prefix: '0b' },
    { base: 8,  label: t('octal'),       prefix: '0o' },
    { base: 10, label: t('decimal'),     prefix: ''   },
    { base: 16, label: t('hexadecimal'), prefix: '0x' },
  ];

  const decValue = parseInt(value, activeBase);
  const valid = !isNaN(decValue);

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">{t('baseConvertLive')}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {bases.map(({ base, label, prefix }) => (
          <div key={base}>
            <label className="text-slate-400 text-xs mb-1.5 block">
              {label} <span className="text-slate-600">(base {base})</span>
            </label>
            <div className="flex gap-2 items-center">
              {prefix && <span className="text-slate-500 text-xs font-mono">{prefix}</span>}
              <input
                type="text"
                value={
                  base === activeBase
                    ? value
                    : valid
                    ? decValue.toString(base).toUpperCase()
                    : ''
                }
                onChange={(e) => {
                  setValue(e.target.value);
                  setActiveBase(base);
                }}
                placeholder={label}
                className={inputCls('font-mono flex-1')}
              />
            </div>
          </div>
        ))}
      </div>
      {valid && (
        <div className="card-surface p-4 animate-fade-in">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">{t('allRepresentations')}</p>
          <div className="grid grid-cols-2 gap-2">
            {bases.map(({ base, label, prefix }) => (
              <div key={base} className="bg-slate-800/50 rounded-lg px-3 py-2.5">
                <p className="text-slate-500 text-xs">{label}</p>
                <p className="text-slate-100 font-mono text-sm font-semibold mt-0.5">
                  {prefix}{decValue.toString(base).toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RandomGenerator() {
  const t = useTranslations('Tool');
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('10');
  const [decimals, setDecimals] = useState('0');
  const [results, setResults] = useState<number[]>([]);

  const generate = () => {
    const nums = generateRandom(
      parseFloat(min) || 0,
      parseFloat(max) || 100,
      Math.min(Math.max(parseInt(count) || 1, 1), 1000),
      Math.min(Math.max(parseInt(decimals) || 0, 0), 10)
    );
    setResults(nums);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('min'), value: min, set: setMin },
          { label: t('max'), value: max, set: setMax },
          { label: t('count'), value: count, set: setCount },
          { label: t('decimals'), value: decimals, set: setDecimals },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
            <input type="number" value={value} onChange={(e) => set(e.target.value)} className={inputCls()} />
          </div>
        ))}
      </div>
      <button onClick={generate} className="btn-primary flex items-center gap-2">
        <span className="material-symbols-outlined text-base">casino</span>
        {t('generate')}
      </button>
      {results.length > 0 && (
        <div className="animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">{results.length} {t('numbersGenerated')}</p>
            <CopyButton text={results.join('\n')} />
          </div>
          <div className="card-surface p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {results.map((n, i) => (
                <span key={i} className="text-slate-200 text-sm font-mono bg-slate-800 rounded px-2 py-1 text-center">
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('min'), value: Math.min(...results) },
              { label: t('max'), value: Math.max(...results) },
              { label: t('average'), value: Math.round(results.reduce((a, b) => a + b, 0) / results.length * 100) / 100 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-slate-500 text-xs">{label}</p>
                <p className="text-slate-100 font-mono font-semibold mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BinaryCalc() {
  const t = useTranslations('Tool');
  const [a, setA] = useState('1010');
  const [b, setB] = useState('0110');
  const [op, setOp] = useState<'+' | '-' | '*' | '/'>( '+');
  const [result, setResult] = useState<ReturnType<typeof binaryCalc> | null>(null);

  const compute = () => setResult(binaryCalc(a, b, op));

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {[['A', a, setA], ['B', b, setB]].map(([label, val, set]) => (
          <div key={label as string}>
            <label className="text-slate-400 text-xs mb-1.5 block">{t('binary')} {label as string}</label>
            <input
              type="text"
              value={val as string}
              onChange={(e) => (set as (v: string) => void)(e.target.value.replace(/[^01\s]/g, ''))}
              placeholder="e.g. 1010"
              className={inputCls('font-mono')}
            />
            <p className="text-slate-500 text-xs mt-1">
              = {parseInt((val as string).replace(/\s/g, ''), 2) || 0} {t('decimal')}
            </p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {(['+', '-', '*', '/'] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOp(o)}
            className={`px-5 py-2 rounded-lg border font-mono text-lg font-semibold transition-all ${
              op === o
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            {o}
          </button>
        ))}
        <button onClick={compute} className="btn-primary ml-2">= {t('calculate')}</button>
      </div>
      {result && (
        <div className="card-surface p-4 animate-fade-in space-y-1">
          {result.error ? (
            <p className="text-red-400 text-sm">{result.error}</p>
          ) : (
            <>
              <InfoRow label={t('binaryResult')} value={result.result} mono />
              <InfoRow label={t('decimal')} value={result.decimal} mono />
              <InfoRow label={t('hex')} value={result.decimal.toString(16).toUpperCase()} mono />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function BooleanCalc() {
  const t = useTranslations('Tool');
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [expr, setExpr] = useState('TRUE AND (FALSE OR TRUE)');
  const [exprResult, setExprResult] = useState<ReturnType<typeof evaluateBooleanExpression> | null>(null);

  const ops = ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'] as const;

  const Toggle = ({ val, set, label }: { val: boolean; set: (v: boolean) => void; label: string }) => (
    <button
      onClick={() => set(!val)}
      className={`px-6 py-3 rounded-lg border-2 font-bold text-lg transition-all ${
        val
          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
          : 'bg-red-500/10 border-red-500/60 text-red-400'
      }`}
    >
      {label}: {val ? t('true') : t('false')}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-4 flex-wrap">
        <Toggle val={a} set={setA} label="A" />
        <Toggle val={b} set={setB} label="B" />
      </div>

      {/* Truth table for current A/B */}
      <div className="card-surface p-4">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">{t('operations')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ops.map((op) => {
            const res = booleanCalc(a, b, op);
            return (
              <div
                key={op}
                className={`rounded-lg px-4 py-3 border ${
                  res
                    ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <p className="text-xs font-medium opacity-70">{op}</p>
                <p className="font-bold text-lg">{res ? t('true') : t('false')}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expression evaluator */}
      <div className="space-y-3">
        <label className="text-slate-400 text-sm font-medium block">{t('booleanExpression')}</label>
        <p className="text-slate-500 text-xs">{t('booleanExpressionHint')}</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            className={inputCls('flex-1 font-mono')}
            placeholder="e.g. TRUE AND (FALSE OR NOT FALSE)"
          />
          <button onClick={() => setExprResult(evaluateBooleanExpression(expr))} className="btn-primary">
            {t('evaluate')}
          </button>
        </div>
        {exprResult && (
          <div className="animate-fade-in card-surface p-4">
            {exprResult.error ? (
              <p className="text-red-400 text-sm">{exprResult.error}</p>
            ) : (
              <>
                <p className="text-slate-400 text-sm mb-2">{t('steps')}</p>
                {exprResult.steps.map((s, i) => (
                  <p key={i} className="text-slate-300 text-sm font-mono">{s}</p>
                ))}
                <div className={`mt-3 px-4 py-3 rounded-lg font-bold text-xl ${
                  exprResult.result ? 'bg-emerald-600/20 text-emerald-300' : 'bg-red-500/10 text-red-400'
                }`}>
                  {t('result')}: {exprResult.result ? t('true') : t('false')}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BitwiseCalc() {
  const t = useTranslations('Tool');
  const [a, setA] = useState('12');
  const [b, setB] = useState('10');

  const na = parseInt(a) || 0;
  const nb = parseInt(b) || 0;
  const ops = ['AND', 'OR', 'XOR', 'NOT', 'LSHIFT', 'RSHIFT'] as const;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {[['A', a, setA], [t('bitwiseBLabel'), b, setB]].map(([label, val, set]) => (
          <div key={label as string}>
            <label className="text-slate-400 text-xs mb-1.5 block">{label as string}</label>
            <input type="number" value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} className={inputCls('font-mono')} />
            <p className="text-slate-500 text-xs mt-1 font-mono">
              bin: {(parseInt(val as string) || 0).toString(2)} | hex: {(parseInt(val as string) || 0).toString(16).toUpperCase()}
            </p>
          </div>
        ))}
      </div>
      <div className="card-surface p-4">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">{t('results')}</p>
        <div className="space-y-0">
          {ops.map((op) => {
            const res = bitwiseCalc(na, nb, op);
            return (
              <div key={op} className="grid grid-cols-4 py-2.5 border-b border-slate-800/60 last:border-0 items-center">
                <span className="text-indigo-400 font-mono text-sm font-semibold">{op}</span>
                <span className="text-slate-200 font-mono text-sm">{res.result}</span>
                <span className="text-slate-400 font-mono text-xs">{res.binary}</span>
                <span className="text-slate-500 font-mono text-xs">0x{res.hex}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IPCalc() {
  const t = useTranslations('Tool');
  const [ip, setIp] = useState('192.168.1.1');
  const [cidr, setCidr] = useState('24');
  const [result, setResult] = useState<ReturnType<typeof calculateIP> | null>(null);

  const calc = () => setResult(calculateIP(ip, parseInt(cidr) || 24));

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="text-slate-400 text-xs mb-1.5 block">{t('ipAddress')}</label>
          <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} className={inputCls('font-mono')} placeholder="192.168.1.0" />
        </div>
        <div className="w-24">
          <label className="text-slate-400 text-xs mb-1.5 block">CIDR /</label>
          <input type="number" min="0" max="32" value={cidr} onChange={(e) => setCidr(e.target.value)} className={inputCls('font-mono')} />
        </div>
        <button onClick={calc} className="btn-primary">{t('calculate')}</button>
      </div>
      <p className="text-slate-500 text-xs">
        e.g. 192.168.1.0 / 24 — or enter as {ip}/{cidr}
      </p>
      {result && (
        <div className="animate-fade-in card-surface p-4 space-y-0">
          {result.error ? (
            <p className="text-red-400 text-sm">{result.error}</p>
          ) : (
            Object.entries(result.result).map(([k, v]) => (
              <InfoRow key={k} label={k.replace(/([A-Z])/g, ' $1').trim()} value={String(v)} mono />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TimeDiff() {
  const t = useTranslations('Tool');
  const [d1, setD1] = useState(() => new Date(Date.now() - 86400000 * 365).toISOString().slice(0, 16));
  const [d2, setD2] = useState(() => new Date().toISOString().slice(0, 16));
  const result = d1 && d2 ? calcTimeDiff(d1, d2) : null;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {[[t('startDateTime'), d1, setD1], [t('endDateTime'), d2, setD2]].map(([label, val, set]) => (
          <div key={label as string}>
            <label className="text-slate-400 text-xs mb-1.5 block">{label as string}</label>
            <input type="datetime-local" value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} className={inputCls()} />
          </div>
        ))}
      </div>
      {result && !result.error && (
        <div className="animate-fade-in space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: t('yearsLabel'),   value: result.result.years },
              { label: t('monthsLabel'),  value: result.result.months },
              { label: t('daysLabel'),    value: result.result.days },
              { label: t('hoursLabel'),   value: result.result.hours },
              { label: t('minutesLabel'), value: result.result.minutes },
              { label: t('secondsLabel'), value: result.result.seconds },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-slate-100 font-bold text-xl font-mono">{value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="card-surface p-3 space-y-0">
            <InfoRow label={t('totalDays')} value={result.result.totalDays.toLocaleString()} mono />
            <InfoRow label={t('totalHours')} value={result.result.totalHours.toLocaleString()} mono />
            <InfoRow label={t('totalSeconds')} value={result.result.totalSeconds.toLocaleString()} mono />
          </div>
        </div>
      )}
      {result?.error && <p className="text-red-400 text-sm">{result.error}</p>}
    </div>
  );
}

function DateCalc() {
  const t = useTranslations('Tool');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dir, setDir] = useState<'add' | 'sub'>('add');
  const [years,   setYears]   = useState('');
  const [months,  setMonths]  = useState('');
  const [weeks,   setWeeks]   = useState('');
  const [days,    setDays]    = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const calc = () => {
    const sign = dir === 'add' ? 1 : -1;
    const y = parseInt(years)  || 0;
    const mo = parseInt(months) || 0;
    const w = parseInt(weeks)  || 0;
    const d = parseInt(days)   || 0;
    if (!y && !mo && !w && !d) { setError('Enter at least one value.'); return; }
    try {
      const base = new Date(date + 'T00:00:00');
      if (isNaN(base.getTime())) { setError('Invalid base date.'); return; }
      base.setFullYear(base.getFullYear() + sign * y);
      base.setMonth(base.getMonth() + sign * mo);
      base.setDate(base.getDate() + sign * (w * 7 + d));
      setResult(base.toISOString().slice(0, 10));
      setError('');
    } catch {
      setError('Calculation failed.');
    }
  };

  const unitInput = (label: string, val: string, set: (v: string) => void) => (
    <div>
      <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
      <input type="number" value={val} onChange={(e) => set(e.target.value)}
        className={inputCls()} min="0" placeholder="0" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">{t('baseDateLabel')}</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls()} />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">{t('operationLabel')}</label>
          <div className="flex gap-2">
            {(['add', 'sub'] as const).map(d => (
              <button key={d} onClick={() => setDir(d)}
                className={`flex-1 py-2 text-sm rounded-lg border transition-all ${dir === d ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                {d === 'add' ? t('addOp') : t('subtractOp')}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-slate-500 text-xs">{t('dateCalcHint')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {unitInput(t('yearsLabel'), years, setYears)}
        {unitInput(t('monthsLabel'), months, setMonths)}
        {unitInput(t('weeksLabel'), weeks, setWeeks)}
        {unitInput(t('daysLabel'), days, setDays)}
      </div>
      <button onClick={calc} className="btn-primary">{t('calculate')}</button>
      {result && (
        <div className="animate-fade-in bg-indigo-600/10 border border-indigo-500/30 rounded-xl px-6 py-4 text-center">
          <p className="text-slate-400 text-sm">{t('result')}</p>
          <p className="text-indigo-300 text-2xl font-bold mt-1">{result}</p>
          <p className="text-slate-500 text-xs mt-1">
            {new Date(result + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

function BMICalc() {
  const t = useTranslations('Tool');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const result = (parseFloat(weight) && parseFloat(height))
    ? calcBMI(parseFloat(weight), parseFloat(height), unit)
    : null;

  const categoryColorMap: Record<string, string> = {
    'Underweight': 'text-blue-400',
    'Normal weight': 'text-emerald-400',
    'Overweight': 'text-amber-400',
    'Obese (Class I)': 'text-orange-400',
    'Obese (Class II)': 'text-red-400',
    'Obese (Class III)': 'text-red-600',
  };
  const bmiCategoryLabel: Record<string, string> = {
    'Underweight': t('bmiUnderweight'),
    'Normal weight': t('bmiNormal'),
    'Overweight': t('bmiOverweight'),
    'Obese (Class I)': t('bmiObeseI'),
    'Obese (Class II)': t('bmiObeseII'),
    'Obese (Class III)': t('bmiObeseIII'),
  };

  // BMI scale: 15 to 40
  const bmiPercent = result ? Math.min(100, Math.max(0, ((result.bmi - 15) / 25) * 100)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['metric', 'imperial'] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)}
            className={`px-4 py-2 text-sm rounded-lg border transition-all ${unit === u ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
            {u === 'metric' ? t('metricUnit') : t('imperialUnit')}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">
            {t('weightLabel')} ({unit === 'metric' ? 'kg' : 'lbs'})
          </label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls()} />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">
            {t('heightLabel')} ({unit === 'metric' ? 'cm' : 'inches'})
          </label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls()} />
        </div>
      </div>
      {result && (
        <div className="animate-fade-in space-y-4">
          <div className="text-center">
            <p className="text-6xl font-bold text-slate-100">{result.bmi}</p>
            <p className={`text-xl font-semibold mt-1 ${categoryColorMap[result.category] ?? 'text-slate-200'}`}>
              {bmiCategoryLabel[result.category] ?? result.category}
            </p>
            <p className="text-slate-500 text-sm mt-1">{t('healthyRange')} {result.healthyRange}</p>
          </div>
          {/* BMI bar */}
          <div className="space-y-1">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #3b82f6 0%, #22c55e 25%, #f59e0b 50%, #ef4444 75%, #dc2626 100%)' }}>
              <div className="relative h-full">
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-slate-900 transition-all" style={{ left: `calc(${bmiPercent}% - 8px)` }} />
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoanCalc() {
  const t = useTranslations('Tool');
  const [principal, setPrincipal] = useState('200000');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('30');
  const [result, setResult] = useState<ReturnType<typeof calcLoan> | null>(null);
  const [showFull, setShowFull] = useState(false);

  const calc = () => {
    const res = calcLoan(parseFloat(principal) || 0, parseFloat(rate) || 0, parseInt(years) || 1);
    setResult(res);
  };

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  const schedule = result ? (showFull ? result.schedule : result.schedule.slice(0, 12)) : [];

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: t('loanAmountLabel'), value: principal, set: setPrincipal },
          { label: t('annualRateLabel'), value: rate, set: setRate },
          { label: t('termYearsLabel'),  value: years, set: setYears },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
            <input type="number" value={value} onChange={(e) => set(e.target.value)} className={inputCls()} />
          </div>
        ))}
      </div>
      <button onClick={calc} className="btn-primary">{t('calculate')}</button>
      {result && (
        <div className="animate-fade-in space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('monthlyPayment'), value: fmt(result.monthly), color: 'text-indigo-400' },
              { label: t('totalPayment'),   value: fmt(result.total),   color: 'text-slate-200' },
              { label: t('totalInterest'),  value: fmt(result.interest), color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card-surface p-4 text-center">
                <p className="text-slate-500 text-xs">{label}</p>
                <p className={`font-bold text-lg mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Breakdown bar */}
          <div className="space-y-1">
            <div className="flex rounded-full overflow-hidden h-4">
              <div className="bg-indigo-600 transition-all" style={{ width: `${(parseFloat(principal) / result.total) * 100}%` }} title="Principal" />
              <div className="bg-amber-500 flex-1" title="Interest" />
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />{t('principalLabel')}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />{t('interestLabel')}</span>
            </div>
          </div>

          {/* Amortization table */}
          <div>
            <p className="text-slate-400 text-sm font-medium mb-2">
              {showFull ? t('amortizationSchedule') : t('amortizationFirst12')}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="text-left py-2 pr-4">{t('monthHeader')}</th>
                    <th className="text-right py-2 pr-4">{t('paymentHeader')}</th>
                    <th className="text-right py-2 pr-4">{t('principalLabel')}</th>
                    <th className="text-right py-2 pr-4">{t('interestLabel')}</th>
                    <th className="text-right py-2">{t('balanceHeader')}</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row) => (
                    <tr key={row.month} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                      <td className="py-1.5 pr-4 text-slate-500">{row.month}</td>
                      <td className="py-1.5 pr-4 text-right text-slate-300">{fmt(row.payment)}</td>
                      <td className="py-1.5 pr-4 text-right text-indigo-400">{fmt(row.principal)}</td>
                      <td className="py-1.5 pr-4 text-right text-amber-400">{fmt(row.interestPmt)}</td>
                      <td className="py-1.5 text-right text-slate-200">{fmt(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.schedule.length > 12 && (
              <button onClick={() => setShowFull(!showFull)} className="mt-2 text-indigo-400 text-xs hover:text-indigo-300 transition-colors">
                {showFull ? t('showLessBtn') : t('showAllMonths', { n: result.schedule.length })}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StringAnalyze() {
  const t = useTranslations('Tool');
  const [text, setText] = useState('');
  const result = text ? analyzeString(text) : null;

  const maxFreq = result?.mostFrequent[0]?.count ?? 1;

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('stringAnalyzeHint')}
        className="input-field px-4 py-3 text-sm min-h-[160px] resize-none block"
      />
      {result && (
        <div className="animate-fade-in space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: t('charsLabel'),     value: result.length, icon: 'format_size' },
              { label: t('bytesUtf8Label'), value: result.bytes,  icon: 'memory' },
              { label: t('wordsLabel'),     value: result.words,  icon: 'title' },
              { label: t('linesLabel'),     value: result.lines,  icon: 'segment' },
              { label: t('uniqueCharsLabel'), value: result.unique, icon: 'fingerprint' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="card-surface p-4 text-center">
                <span className="material-symbols-outlined text-indigo-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                <p className="text-slate-100 font-bold text-xl mt-1">{value.toLocaleString()}</p>
                <p className="text-slate-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {result.mostFrequent.length > 0 && (
            <div className="card-surface p-4">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">{t('top10CharsLabel')}</p>
              <div className="space-y-2">
                {result.mostFrequent.map(({ char, count }) => (
                  <div key={char} className="flex items-center gap-3">
                    <span className="text-slate-200 font-mono text-sm w-8 text-center bg-slate-800 rounded px-1 py-0.5">
                      {char === ' ' ? '␣' : char === '\n' ? '↵' : char === '\t' ? '⇥' : char}
                    </span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${(count / maxFreq) * 100}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-xs w-12 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatrixCalc() {
  const t = useTranslations('Tool');
  const [textA, setTextA] = useState('1 2 3\n4 5 6\n7 8 9');
  const [textB, setTextB] = useState('9 8 7\n6 5 4\n3 2 1');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [op, setOp] = useState('');

  const run = (opName: string) => {
    setOp(opName);
    const pa = parseMatrix(textA);
    if (pa.error || !pa.matrix) { setError(pa.error ?? 'Invalid matrix A'); setResult(''); return; }

    if (opName === 'transpose-a') {
      setResult(matrixToString(matrixTranspose(pa.matrix)));
      setError('');
      return;
    }

    const pb = parseMatrix(textB);
    if (pb.error || !pb.matrix) { setError(pb.error ?? 'Invalid matrix B'); setResult(''); return; }

    if (opName === 'transpose-b') {
      setResult(matrixToString(matrixTranspose(pb.matrix)));
      setError('');
      return;
    }

    const fn = opName === 'add' ? matrixAdd : matrixMultiply;
    const res = fn(pa.matrix, pb.matrix);
    if (res.error || !res.result) { setError(res.error ?? 'Operation failed'); setResult(''); return; }
    setResult(matrixToString(res.result));
    setError('');
  };

  const matAreaCls = 'input-field px-3 py-2 text-sm font-mono min-h-[120px] resize-none block';

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">{t('matrixHint')}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {[['Matrix A', textA, setTextA], ['Matrix B', textB, setTextB]].map(([label, val, set]) => (
          <div key={label as string}>
            <label className="text-slate-400 text-xs mb-1.5 block">{label as string}</label>
            <textarea value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} className={matAreaCls} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'add',         label: 'A + B' },
          { id: 'multiply',    label: 'A × B' },
          { id: 'transpose-a', label: t('matrixTransposeA') },
          { id: 'transpose-b', label: t('matrixTransposeB') },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => run(id)}
            className={`px-4 py-2 text-sm rounded-lg border transition-all ${op === id ? 'bg-indigo-600 border-indigo-500 text-white' : 'btn-secondary'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">{error}</p>}
      {result && !error && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm font-medium">{t('result')}</p>
            <CopyButton text={result} />
          </div>
          <pre className="input-field px-4 py-3 text-sm font-mono bg-slate-950/50 whitespace-pre overflow-x-auto">{result}</pre>
        </div>
      )}
    </div>
  );
}

function BankBin() {
  const t = useTranslations('Tool');
  const [bin, setBin] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const lookup = async () => {
    const cleaned = bin.replace(/\s/g, '').slice(0, 8);
    if (cleaned.length < 6) { setError('Enter at least 6 digits'); return; }
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`/api/bin/${cleaned}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Lookup failed (${res.status})`);
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (v: unknown): string => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">{t('binLookupHint')}</p>
      <div className="flex gap-3">
        <input
          type="text"
          value={bin}
          onChange={(e) => setBin(e.target.value.replace(/[^\d\s]/g, '').slice(0, 19))}
          onKeyDown={(e) => { if (e.key === 'Enter' && !loading && bin.replace(/\s/g, '').length >= 6) lookup(); }}
          placeholder="e.g. 411111 or 4111 1111 1111 1111"
          className={inputCls('flex-1 font-mono tracking-widest')}
          maxLength={23}
        />
        <button
          onClick={lookup}
          disabled={loading || bin.replace(/\s/g, '').length < 6}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? t('lookingUpLabel') : t('lookUpBtn')}
        </button>
      </div>
      {bin.replace(/\s/g, '').length > 0 && bin.replace(/\s/g, '').length < 6 && (
        <p className="text-slate-500 text-xs">{t('moreDigitsNeeded', { n: 6 - bin.replace(/\s/g, '').length })}</p>
      )}
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">{error}</p>}
      {data && (() => {
        const d = data as Record<string, Record<string, unknown>>;
        const alpha2 = (d.country?.alpha2 as string | undefined)?.toUpperCase();
        const countryName = d.country?.name as string | undefined;
        const countryNode = alpha2 ? (
          <span className="flex items-center gap-1.5">
            <Image src={`/vendor/flags/${alpha2.toLowerCase()}.svg`} width={20} height={15} alt={alpha2} className="rounded-sm object-cover flex-shrink-0" unoptimized />
            <span>{countryName || alpha2}</span>
            {countryName && <span className="text-slate-500 text-xs font-normal">({alpha2})</span>}
          </span>
        ) : '—';
        return (
          <div className="animate-fade-in card-surface p-4 space-y-0">
            {([
              { label: t('cardBrandLabel'),    value: renderValue(d.scheme) },
              { label: t('cardTypeLabel'),     value: renderValue((data as Record<string, unknown>).type) },
              { label: t('bankLabel'),         value: renderValue(d.bank?.name) },
              { label: t('countryRegionLabel'), value: countryNode },
              { label: t('cardLevelLabel'),    value: renderValue((data as Record<string, unknown>).category) },
            ] as { label: string; value: React.ReactNode }[]).map(({ label, value }) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Currency Converter ───────────────────────────────────────────────────────

const CURRENCIES: { code: string; name: string }[] = [
  { code: 'USD', name: 'US Dollar'          },
  { code: 'EUR', name: 'Euro'               },
  { code: 'GBP', name: 'British Pound'      },
  { code: 'JPY', name: 'Japanese Yen'       },
  { code: 'CNY', name: 'Chinese Yuan'       },
  { code: 'CAD', name: 'Canadian Dollar'    },
  { code: 'AUD', name: 'Australian Dollar'  },
  { code: 'CHF', name: 'Swiss Franc'        },
  { code: 'HKD', name: 'Hong Kong Dollar'   },
  { code: 'SGD', name: 'Singapore Dollar'   },
  { code: 'INR', name: 'Indian Rupee'       },
  { code: 'KRW', name: 'South Korean Won'   },
  { code: 'MXN', name: 'Mexican Peso'       },
  { code: 'BRL', name: 'Brazilian Real'     },
  { code: 'RUB', name: 'Russian Ruble'      },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'SEK', name: 'Swedish Krona'      },
  { code: 'NOK', name: 'Norwegian Krone'    },
  { code: 'DKK', name: 'Danish Krone'       },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'THB', name: 'Thai Baht'          },
  { code: 'MYR', name: 'Malaysian Ringgit'  },
  { code: 'IDR', name: 'Indonesian Rupiah'  },
  { code: 'PHP', name: 'Philippine Peso'    },
  { code: 'VND', name: 'Vietnamese Dong'    },
  { code: 'TWD', name: 'New Taiwan Dollar'  },
  { code: 'AED', name: 'UAE Dirham'         },
  { code: 'SAR', name: 'Saudi Riyal'        },
  { code: 'TRY', name: 'Turkish Lira'       },
  { code: 'PLN', name: 'Polish Zloty'       },
  { code: 'CZK', name: 'Czech Koruna'       },
  { code: 'HUF', name: 'Hungarian Forint'   },
];

const CURRENCY_FLAG: Record<string, string> = {
  USD: 'us', EUR: 'eu', GBP: 'gb', JPY: 'jp', CNY: 'cn',
  CAD: 'ca', AUD: 'au', CHF: 'ch', HKD: 'hk', SGD: 'sg',
  INR: 'in', KRW: 'kr', MXN: 'mx', BRL: 'br', RUB: 'ru',
  ZAR: 'za', SEK: 'se', NOK: 'no', DKK: 'dk', NZD: 'nz',
  THB: 'th', MYR: 'my', IDR: 'id', PHP: 'ph', VND: 'vn',
  TWD: 'tw', AED: 'ae', SAR: 'sa', TRY: 'tr', PLN: 'pl',
  CZK: 'cz', HUF: 'hu',
};

const TRENDING_CODES = ['EUR', 'CNY', 'JPY', 'GBP', 'KRW', 'AUD', 'CAD', 'HKD', 'CHF', 'INR', 'MXN', 'SGD'];

function FlagImg({ code, className = '' }: { code: string; className?: string }) {
  const country = CURRENCY_FLAG[code];
  if (!country) return <span className="text-slate-500 text-xs font-mono w-5">{code.slice(0, 2)}</span>;
  return (
    <Image
      src={`/vendor/flags/${country}.svg`}
      width={20} height={15}
      alt={code}
      className={`rounded-sm flex-shrink-0 object-cover ${className}`}
      unoptimized
    />
  );
}

function CurrencyConverter() {
  const t = useTranslations('Tool');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState('1');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(0);
  const baseRatesRef = useRef<Record<string, number> | null>(null);
  const fromRef = useRef('USD');

  const fetchRates = useCallback(async (base: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.result !== 'success') throw new Error('API error');
      const r = json.rates as Record<string, number>;
      setRates(r);
      setLastUpdate(Date.now());
      setCountdown(0);
      if (!baseRatesRef.current) baseRatesRef.current = r;
    } catch {
      setError('Failed to fetch exchange rates. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates('USD');
    const tick = setInterval(() => setCountdown(c => c + 1), 1000);
    const refresh = setInterval(() => fetchRates(fromRef.current), 60000);
    return () => { clearInterval(tick); clearInterval(refresh); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFromChange = (newFrom: string) => {
    fromRef.current = newFrom;
    setFrom(newFrom);
    fetchRates(newFrom);
  };

  const handleSwap = () => {
    const newFrom = to;
    const newTo = from;
    fromRef.current = newFrom;
    setFrom(newFrom);
    setTo(newTo);
    fetchRates(newFrom);
  };

  const rate = rates?.[to] ?? null;
  const amountNum = parseFloat(amount) || 0;
  const result = rate !== null ? amountNum * rate : null;

  const usdRelative = (r: Record<string, number>, code: string) => {
    const usd = r['USD'];
    return usd && r[code] != null ? r[code] / usd : null;
  };

  const popularPairs: [string, string][] = [
    ['USD', 'EUR'], ['USD', 'CNY'], ['USD', 'JPY'], ['EUR', 'GBP'],
    ['USD', 'GBP'], ['USD', 'INR'], ['EUR', 'JPY'], ['USD', 'CAD'],
  ];

  return (
    <div className="space-y-5">
      {/* Live status bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">{t('liveRatesLabel')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          {loading ? (
            <svg className="animate-spin w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <button onClick={() => fetchRates(fromRef.current)} className="hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span>
            </button>
          )}
          <span>{lastUpdate > 0 ? t('refreshInLabel', { s: Math.max(1, 60 - countdown) }) : t('connectingLabel')}</span>
        </div>
      </div>

      {/* From / To selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t('fromCurrencyLabel')}</label>
          <div className="flex items-center gap-2">
            <FlagImg code={from} />
            <select
              value={from}
              onChange={(e) => handleFromChange(e.target.value)}
              className={inputCls('flex-1 bg-slate-900 text-slate-100')}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center justify-end pb-1">
          <button
            onClick={handleSwap}
            disabled={loading}
            title="Swap currencies"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-slate-400 text-xl">swap_horiz</span>
          </button>
        </div>

        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t('toCurrencyLabel')}</label>
          <div className="flex items-center gap-2">
            <FlagImg code={to} />
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inputCls('flex-1 bg-slate-900 text-slate-100')}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="text-slate-400 text-xs font-medium mb-1.5 block">{t('amountCurrencyLabel')}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          step="any"
          className={inputCls('w-full text-lg font-mono')}
          placeholder={t('enterAmountPlaceholder')}
        />
      </div>

      {/* Result */}
      {!rates && loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-4 justify-center">
          <svg className="animate-spin w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t('fetchingRatesLabel')}
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{error}</p>
      ) : result !== null && (
        <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
          <div className="text-center space-y-1">
            <p className="text-slate-400 text-sm flex items-center justify-center gap-1.5">
              <FlagImg code={from} />
              {amountNum.toLocaleString()} {from} =
            </p>
            <p className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <FlagImg code={to} />
              {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </p>
            <p className="text-slate-400 text-sm font-semibold">{to} — {CURRENCIES.find(c => c.code === to)?.name}</p>
          </div>
          <div className="border-t border-slate-700/50 pt-3 text-center text-xs text-slate-500">
            1 {from} = {rate?.toFixed(6)} {to}
          </div>
        </div>
      )}

      {/* Trending */}
      {rates && (
        <div className="space-y-2">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>bar_chart</span>
            {t('marketRatesLabel', { from })}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {TRENDING_CODES.filter(code => code !== from).slice(0, 9).map((code) => {
              const r = rates[code];
              if (r === undefined) return null;
              const base = baseRatesRef.current;
              let pct: number | null = null;
              if (base) {
                const cur = usdRelative(rates, code);
                const ini = usdRelative(base, code);
                if (cur !== null && ini !== null && ini !== 0) pct = ((cur - ini) / ini) * 100;
              }
              const isUp   = pct !== null && pct >  0.001;
              const isDown = pct !== null && pct < -0.001;
              return (
                <button
                  key={code}
                  onClick={() => setTo(code)}
                  className={`flex flex-col px-3 py-2.5 rounded-xl border transition-all text-left ${
                    to === code ? 'bg-emerald-900/20 border-emerald-500/40' : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <FlagImg code={code} />
                    <span className="text-slate-300 text-xs font-semibold">{code}</span>
                  </div>
                  <p className="text-slate-200 text-xs font-mono leading-tight">
                    {r < 0.01 ? r.toExponential(2) : r.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </p>
                  {isUp   && <p className="text-emerald-400 text-[10px] mt-0.5">▲ {pct!.toFixed(3)}%</p>}
                  {isDown && <p className="text-red-400    text-[10px] mt-0.5">▼ {Math.abs(pct!).toFixed(3)}%</p>}
                  {!isUp && !isDown && <p className="text-slate-600 text-[10px] mt-0.5">{t('stableRateLabel')}</p>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick pairs */}
      <div>
        <p className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wider">{t('quickPairsLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {popularPairs.map(([f, toCurr]) => (
            <button
              key={`${f}-${toCurr}`}
              onClick={() => { setTo(toCurr); handleFromChange(f); }}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1 ${
                from === f && to === toCurr
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              <FlagImg code={f} />{f}/<FlagImg code={toCurr} />{toCurr}
            </button>
          ))}
        </div>
      </div>

      {/* All rates */}
      {rates && (
        <div className="space-y-2">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t('allRatesLabel', { from })}</p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3">
              {CURRENCIES.filter(c => c.code !== from).map((c) => {
                const r = rates[c.code];
                if (r === undefined) return null;
                return (
                  <button
                    key={c.code}
                    onClick={() => setTo(c.code)}
                    className={`flex items-center justify-between px-3 py-2.5 text-sm border-b border-slate-800/40 hover:bg-slate-800/50 transition-colors ${
                      to === c.code ? 'bg-emerald-900/20 border-l-2 border-l-emerald-500' : ''
                    }`}
                  >
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <FlagImg code={c.code} /> {c.code}
                    </span>
                    <span className="text-slate-200 font-mono text-xs">
                      {(amountNum * r).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Unit Converter ────────────────────────────────────────────────────────────

const UNIT_DATA = {
  length: {
    units: ['m', 'km', 'cm', 'mm', 'ft', 'in', 'mi', 'yd'] as const,
    factors: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, mi: 1609.344, yd: 0.9144 },
  },
  weight: {
    units: ['kg', 'g', 'mg', 'lb', 'oz', 't'] as const,
    factors: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, t: 1000 },
  },
  temperature: {
    units: ['C', 'F', 'K'] as const,
    factors: null,
  },
} as const;

type UnitCategory = keyof typeof UNIT_DATA;

function convertTemp(val: number, from: string, to: string): number {
  const celsius = from === 'C' ? val : from === 'F' ? (val - 32) * 5 / 9 : val - 273.15;
  return to === 'C' ? celsius : to === 'F' ? celsius * 9 / 5 + 32 : celsius + 273.15;
}

function fmtNum(n: number): string {
  if (!isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 0.001 && abs < 1e9) return parseFloat(n.toPrecision(6)).toString();
  return n.toExponential(4);
}

function UnitConverter() {
  const t = useTranslations('Tool');
  const [category, setCategory] = useState<UnitCategory>('length');
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');

  const data = UNIT_DATA[category];
  const num = parseFloat(value);
  const valid = !isNaN(num) && value.trim() !== '';

  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    setFromUnit(UNIT_DATA[cat].units[0]);
  };

  const convertTo = (toUnit: string): string => {
    if (!valid) return '—';
    if (category === 'temperature') return fmtNum(convertTemp(num, fromUnit, toUnit));
    const factors = data.factors as Record<string, number>;
    return fmtNum(num * factors[fromUnit] / factors[toUnit]);
  };

  const unitLabelKey: Record<string, string> = {
    m: 'unitM', km: 'unitKm', cm: 'unitCm', mm: 'unitMm',
    ft: 'unitFt', in: 'unitIn', mi: 'unitMi', yd: 'unitYd',
    kg: 'unitKg', g: 'unitG', mg: 'unitMg', lb: 'unitLb',
    oz: 'unitOz', t: 'unitTon',
    C: 'unitCelsius', F: 'unitFahrenheit', K: 'unitKelvin',
  };

  const categories: { key: UnitCategory; labelKey: string; icon: string }[] = [
    { key: 'length',      labelKey: 'unitLength',      icon: 'straighten' },
    { key: 'weight',      labelKey: 'unitWeight',      icon: 'scale' },
    { key: 'temperature', labelKey: 'unitTemperature', icon: 'thermostat' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {categories.map(({ key, labelKey, icon }) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
              category === key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">{icon}</span>
            {t(labelKey as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">{t('unitValue')}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="1"
            className={inputCls('text-lg font-mono')}
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">{t('unitFrom')}</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 rounded-lg text-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {data.units.map(u => (
              <option key={u} value={u}>{u} — {t(unitLabelKey[u] as Parameters<typeof t>[0])}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-surface overflow-hidden">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider px-4 py-3 border-b border-slate-800">
          {t('unitConvertAll')}
        </p>
        <div className="divide-y divide-slate-800/60">
          {data.units.map(u => {
            const isFrom = u === fromUnit;
            return (
              <div
                key={u}
                className={`flex items-center justify-between px-4 py-3 ${isFrom ? 'bg-indigo-600/10' : ''}`}
              >
                <span className="text-slate-400 text-sm">
                  {u}
                  <span className="text-slate-600 text-xs ml-1.5">
                    {t(unitLabelKey[u] as Parameters<typeof t>[0])}
                  </span>
                </span>
                <span className={`font-mono text-sm font-semibold ${isFrom ? 'text-indigo-300' : 'text-slate-100'}`}>
                  {isFrom ? (value || '—') : convertTo(u)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Mode mapping (keys must match registry IDs exactly) ──────────────────────

const MODES: Record<string, React.FC> = {
  'base-convert':       BaseConverter,
  'random-number':      RandomGenerator,
  'binary-calculator':  BinaryCalc,
  'boolean-calculator': BooleanCalc,
  'bitwise-calculator': BitwiseCalc,
  'ip-calculator':      IPCalc,
  'time-diff':          TimeDiff,
  'bmi-calculator':     BMICalc,
  'loan-calculator':    LoanCalc,
  'string-analyzer':    StringAnalyze,
  'matrix-calculator':  MatrixCalc,
  'date-calculator':    DateCalc,
  'bank-bin':           BankBin,
  'currency-converter': CurrencyConverter,
  'unit-converter':     UnitConverter,
};

const FINANCE_MODES = new Set(['bank-bin', 'currency-converter']);

function FinanceTabBar({ mode }: { mode: string }) {
  const t = useTranslations('Tool');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const tabs = [
    { mode: 'bank-bin',           label: t('tabBIN'),      icon: 'credit_card' },
    { mode: 'currency-converter', label: t('tabCurrency'), icon: 'currency_exchange' },
  ];
  return (
    <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
      {tabs.map(tab => (
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
  );
}

export function CalculatorCore({ mode }: Props) {
  const t = useTranslations('Tool');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const Component = MODES[mode];
  const isFinance = FINANCE_MODES.has(mode);

  const calcTabs = [
    { mode: 'base-convert',       label: t('tabBase'),     icon: 'tag' },
    { mode: 'random-number',      label: t('tabRandom'),   icon: 'casino' },
    { mode: 'binary-calculator',  label: t('tabBinary'),   icon: 'memory' },
    { mode: 'boolean-calculator', label: t('tabBoolean'),  icon: 'toggle_on' },
    { mode: 'bitwise-calculator', label: t('tabBitwise'),  icon: 'code' },
    { mode: 'ip-calculator',      label: t('tabIP'),       icon: 'lan' },
    { mode: 'time-diff',          label: t('tabTimeDiff'), icon: 'timer' },
    { mode: 'date-calculator',    label: t('tabDate'),     icon: 'calendar_month' },
    { mode: 'bmi-calculator',     label: t('tabBMI'),      icon: 'monitor_weight' },
    { mode: 'loan-calculator',    label: t('tabLoan'),     icon: 'payments' },
    { mode: 'matrix-calculator',  label: t('tabMatrix'),        icon: 'grid_on' },
    { mode: 'string-analyzer',    label: t('tabString'),        icon: 'text_fields' },
    { mode: 'unit-converter',     label: t('tabUnitConverter'), icon: 'straighten' },
  ];

  return (
    <div className="space-y-5">
      {isFinance ? (
        <FinanceTabBar mode={mode} />
      ) : (
        <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {calcTabs.map(tab => (
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
      )}
      {Component ? <Component /> : null}
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  convert, detectEncoding, ENCODING_LABELS, ALL_ENCODING_TYPES,
  type EncodingType,
} from '@/lib/tools/text-encoder';

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

interface Props {
  mode: string;
}

function modeToEncoding(mode: string): EncodingType {
  const map: Record<string, EncodingType> = {
    'hex-convert': 'hex',
    'binary-convert': 'binary',
    'octal-convert': 'octal',
    'decimal-convert': 'decimal',
    'base64-convert': 'base64',
    'url-convert': 'url',
    'html-entity-convert': 'html-entity',
    'unicode-convert': 'unicode',
    'ascii-convert': 'ascii',
    'rot13-convert': 'rot13',
    'morse-convert': 'morse',
  };
  return map[mode] ?? 'text';
}

function CopyButton({ text, size = 'sm' }: { text: string; size?: 'sm' | 'xs' }) {
  const t = useTranslations('Tool');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await clipboardWrite(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const cls =
    size === 'xs'
      ? 'flex items-center gap-1 text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors'
      : 'flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors';
  return (
    <button onClick={copy} className={cls}>
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
        {copied ? 'check' : 'content_copy'}
      </span>
      {copied ? t('copied') : t('copy')}
    </button>
  );
}

export function TextEncoderCore({ mode }: Props) {
  const t = useTranslations('Tool');
  const defaultFrom = modeToEncoding(mode);

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [from, setFrom] = useState<EncodingType>(defaultFrom);
  const [to, setTo] = useState<EncodingType>(defaultFrom === 'text' ? 'base64' : 'text');
  const [error, setError] = useState('');
  const [autoDetect, setAutoDetect] = useState(false);

  const runConvert = useCallback(
    (inp: string, f: EncodingType, t: EncodingType) => {
      if (!inp) { setOutput(''); setError(''); return; }
      const effectiveFrom = autoDetect ? detectEncoding(inp) : f;
      const res = convert(inp, effectiveFrom, t);
      if (res.error) {
        setError(res.error);
        setOutput('');
      } else {
        setError('');
        setOutput(res.result);
      }
    },
    [autoDetect]
  );

  const handleConvert = () => runConvert(input, from, to);

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setFrom(to);
    setTo(from);
    setError('');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (autoDetect && val) {
      const detected = detectEncoding(val);
      setFrom(detected);
    }
  };

  const inputChars = [...input].length;
  const outputChars = [...output].length;

  const selectCls =
    'bg-slate-900/80 border border-slate-700 rounded-lg text-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full';

  return (
    <div className="space-y-5">
      {/* Auto-detect toggle */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-300">
          <button
            role="checkbox"
            aria-checked={autoDetect}
            onClick={() => setAutoDetect((v) => !v)}
            className={`w-9 h-5 rounded-full transition-colors relative ${autoDetect ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoDetect ? 'translate-x-4' : 'translate-x-0.5'}`}
            />
          </button>
          {t('autoDetectEncoding')}
        </label>
        {autoDetect && input && (
          <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
            {t('detected')} {ENCODING_LABELS[from]}
          </span>
        )}
      </div>

      {/* Main layout: input | controls | output */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_160px_1fr] gap-4 items-start">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-400 text-sm font-medium">{t('inputLabel')}</label>
            <button
              onClick={handleClear}
              className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
            >
              {t('clear')}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={t('enterTextToConvert')}
            className="input-field px-4 py-3 text-sm font-mono min-h-[260px] resize-none block"
          />
          <p className="text-slate-500 text-xs">{inputChars} {t('characters')}</p>
        </div>

        {/* Center controls */}
        <div className="flex flex-col gap-3 items-stretch pt-7">
          <div>
            <label className="text-slate-500 text-xs block mb-1">{t('fromLabel')}</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value as EncodingType)}
              disabled={autoDetect}
              className={selectCls}
            >
              {ALL_ENCODING_TYPES.map((enc) => (
                <option key={enc} value={enc}>{ENCODING_LABELS[enc]}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="flex items-center justify-center gap-1 text-sm px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title={t('swapLabel')}
          >
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            {t('swapLabel')}
          </button>

          <div>
            <label className="text-slate-500 text-xs block mb-1">{t('toLabel')}</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value as EncodingType)}
              className={selectCls}
            >
              {ALL_ENCODING_TYPES.map((enc) => (
                <option key={enc} value={enc}>{ENCODING_LABELS[enc]}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleConvert}
            disabled={!input}
            className="btn-primary text-sm disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">transform</span>
            {t('convert')}
          </button>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-400 text-sm font-medium">{t('outputLabel')}</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder={t('resultPlaceholder')}
            className="input-field px-4 py-3 text-sm font-mono min-h-[260px] resize-none block bg-slate-950/50"
          />
          <p className="text-slate-500 text-xs">{outputChars} {t('characters')}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl animate-fade-in">
          {error}
        </p>
      )}

      {/* Quick reference */}
      <div className="card-surface p-4">
        <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
          {t('encodingReference')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {ALL_ENCODING_TYPES.map((enc) => (
            <button
              key={enc}
              onClick={() => {
                setFrom(enc);
                setTo('text');
              }}
              className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                from === enc
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <span className="font-medium block">{enc.toUpperCase()}</span>
              <span className="text-slate-500 text-[10px]">{ENCODING_LABELS[enc]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  formatJSON, encodeBase64, decodeBase64,
  generateMultipleUUIDs, convertTimestamp,
  generatePassword, type PasswordOptions,
} from '@/lib/tools/dev-processor';
import {
  validateJSON, formatXML, validateXML,
  formatYAML, markdownToHTML, generateLorem, convertCase, hashText,
  testRegex, type CaseType,
} from '@/lib/tools/data-formatter';
import CSVCore from '@/components/tools/CSVCore';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import type { DevMode } from '@/types/tools';

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
  mode: DevMode;
}

function CopyButton({ text }: { text: string }) {
  const t = useTranslations('Tool');
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await clipboardWrite(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
      <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
      {copied ? t('copied') : t('copy')}
    </button>
  );
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

function JsonFormatter() {
  const t = useTranslations('Tool');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'format' | 'minify'>('format');

  const process = () => {
    if (!checkRateLimit('json-format', 30, 60000)) { setError(t('errors.rateLimitExceeded')); return; }
    const res = formatJSON(input);
    if (!res.isValid) { setError(res.error || t('invalidJson')); setOutput(''); return; }
    setError('');
    setOutput(mode === 'format' ? res.formatted! : res.minified!);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        {(['format', 'minify'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${mode === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
            {m === 'format' ? t('formatBeautify') : t('minify')}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-400 text-sm font-medium">{t('inputJson')}</label>
            <button onClick={() => setInput('')} className="text-slate-500 text-xs hover:text-slate-300">{t('clear')}</button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={'{\n  "example": "paste your JSON here"\n}'}
            className="input-field px-4 py-3 text-sm font-mono min-h-[280px] resize-none block" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-400 text-sm font-medium">{t('outputLabel')}</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea value={output} readOnly placeholder={t('formattedJsonPlaceholder')}
            className="input-field px-4 py-3 text-sm font-mono min-h-[280px] resize-none block bg-slate-950/50" />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{error}</p>}
      <button onClick={process} disabled={!input} className="btn-primary disabled:opacity-60 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">auto_fix_high</span>
        {mode === 'format' ? t('formatJson') : t('minifyJson')}
      </button>
    </div>
  );
}

// ─── JSON Validator ──────────────────────────────────────────────────────────

function tryFixJson(s: string): string {
  // Remove // line comments
  s = s.replace(/\/\/[^\n]*/g, '');
  // Remove /* */ block comments
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, '$1');
  // Single-quoted strings → double-quoted (simple cases)
  s = s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
  // undefined → null
  s = s.replace(/:\s*undefined\b/g, ': null');
  return s;
}

function JsonValidator() {
  const t = useTranslations('Tool');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ valid: boolean; error?: string; line?: number; col?: number } | null>(null);
  const [fixed, setFixed] = useState<string | null>(null);

  const validate = () => {
    if (!input.trim()) return;
    setFixed(null);
    setResult(validateJSON(input));
  };

  const autoFix = () => {
    const attempt = tryFixJson(input);
    const r = validateJSON(attempt);
    setFixed(attempt);
    setResult(r);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-slate-400 text-sm font-medium">{t('inputJson')}</label>
          <button onClick={() => { setInput(''); setResult(null); setFixed(null); }} className="text-slate-500 text-xs hover:text-slate-300">{t('clear')}</button>
        </div>
        <textarea value={input} onChange={(e) => { setInput(e.target.value); setResult(null); setFixed(null); }}
          placeholder={'{\n  "key": "value"\n}'}
          className="input-field px-4 py-3 text-sm font-mono min-h-[300px] resize-none block" />
      </div>
      <button onClick={validate} disabled={!input.trim()} className="btn-primary disabled:opacity-60 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">verified</span>
        {t('validateJson')}
      </button>
      {result && (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${result.valid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          <span className="material-symbols-outlined text-xl flex-shrink-0">{result.valid ? 'check_circle' : 'error'}</span>
          <div className="flex-1">
            <p className="font-medium text-sm">{result.valid ? t('validJson') : t('invalidJson')}</p>
            {result.error && <p className="text-xs mt-1 opacity-80">{result.error}</p>}
            {result.line && <p className="text-xs mt-1 opacity-80">Line {result.line}{result.col ? `, Column ${result.col}` : ''}</p>}
          </div>
          {!result.valid && !fixed && (
            <button onClick={autoFix}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium rounded-lg hover:bg-amber-500/30 transition-colors">
              <span className="material-symbols-outlined text-base">auto_fix_high</span>
              {t('autoFixJson')}
            </button>
          )}
        </div>
      )}
      {fixed && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">{t('fixedJsonTitle')}</p>
            <CopyButton text={fixed} />
          </div>
          <textarea value={fixed} readOnly
            className="input-field px-4 py-3 text-sm font-mono min-h-[200px] resize-none block bg-slate-950/50" />
        </div>
      )}
    </div>
  );
}

// ─── Base64 ──────────────────────────────────────────────────────────────────

function Base64Tool() {
  const t = useTranslations('Tool');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = () => {
    if (!checkRateLimit('base64', 30, 60000)) { setError(t('errors.rateLimitExceeded')); return; }
    setError('');
    if (mode === 'encode') {
      setOutput(encodeBase64(input));
    } else {
      const res = decodeBase64(input);
      if (res.error) { setError(res.error); setOutput(''); }
      else setOutput(res.result);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        {(['encode', 'decode'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${mode === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
            {m === 'encode' ? t('encode') : t('decode')}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">
            {mode === 'encode' ? t('base64PlainText') : 'Base64'}
          </label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? t('enterTextToEncode') : t('enterBase64ToDecode')}
            className="input-field px-4 py-3 text-sm min-h-[200px] resize-none block" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-400 text-sm font-medium">{mode === 'encode' ? t('base64Output') : t('decodedText')}</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea value={output} readOnly placeholder={t('resultAppears')}
            className="input-field px-4 py-3 text-sm font-mono min-h-[200px] resize-none block bg-slate-950/50" />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{error}</p>}
      <button onClick={process} disabled={!input} className="btn-primary disabled:opacity-60 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">transform</span>
        {mode === 'encode' ? t('encode') : t('decode')}
      </button>
    </div>
  );
}

// ─── UUID Generator ──────────────────────────────────────────────────────────

function UUIDGenerator() {
  const t = useTranslations('Tool');
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);

  const generate = () => {
    if (!checkRateLimit('uuid-gen', 20, 60000)) return;
    setUuids(generateMultipleUUIDs(count));
  };

  const copyAll = () => clipboardWrite(uuids.join('\n'));

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-4">
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('numberOfUuids')}</label>
          <div className="flex items-center gap-2">
            {[1, 5, 10, 20].map((n) => (
              <button key={n} onClick={() => setCount(n)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${count === n ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">shuffle</span>
          {t('generate')}
        </button>
        {uuids.length > 0 && (
          <button onClick={copyAll} className="btn-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">content_copy</span>
            {t('copyAll')}
          </button>
        )}
      </div>
      {uuids.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono group">
              <span className="text-slate-200 text-sm">{uuid}</span>
              <button onClick={() => clipboardWrite(uuid)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-all">
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Timestamp Converter ─────────────────────────────────────────────────────

function TimestampConverter() {
  const t = useTranslations('Tool');
  const [input, setInput] = useState('');
  const result = input ? convertTimestamp(input) : null;
  const rows = result && !result.error ? [
    { label: t('unixSeconds'), value: String(result.unix) },
    { label: t('unixMs'), value: String(result.unixMs) },
    { label: 'ISO 8601', value: result.iso },
    { label: 'UTC', value: result.utc },
    { label: t('local'), value: result.local },
    { label: t('relativeTime'), value: result.relative },
  ] : [];

  return (
    <div className="space-y-5">
      <div>
        <label className="text-slate-400 text-sm font-medium mb-2 block">{t('enterTimestamp')}</label>
        <div className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="1700000000, 2024-01-01, now, ..."
            className="input-field flex-1 px-4 py-3 text-sm" />
          <button onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}
            className="btn-secondary px-4 text-sm whitespace-nowrap">
            {t('useNow')}
          </button>
        </div>
      </div>
      {result?.error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{result.error}</p>}
      {rows.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl group">
              <div className="min-w-0">
                <p className="text-slate-500 text-xs mb-0.5">{row.label}</p>
                <p className="text-slate-200 text-sm font-mono truncate">{row.value}</p>
              </div>
              <button onClick={() => clipboardWrite(row.value)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-all ml-3 flex-shrink-0">
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Regex Tester ────────────────────────────────────────────────────────────

function RegexTester() {
  const t = useTranslations('Tool');
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [input, setInput] = useState('');
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);

  const result = pattern && input ? testRegex(pattern, flags, input, showReplace ? replacement : undefined) : null;

  const highlightedHTML = useCallback(() => {
    if (!result || result.error || result.matches.length === 0) return input;
    let out = '';
    let last = 0;
    const sorted = [...result.matches].sort((a, b) => a.index - b.index);
    for (const m of sorted) {
      out += input.slice(last, m.index).replace(/</g, '&lt;');
      out += `<mark class="bg-yellow-400/30 text-yellow-200 rounded px-0.5">${m.match.replace(/</g, '&lt;')}</mark>`;
      last = m.index + m.match.length;
    }
    out += input.slice(last).replace(/</g, '&lt;');
    return out;
  }, [result, input]);

  const allFlags = ['g', 'i', 'm', 's', 'u'];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('pattern')}</label>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <span className="text-slate-500 px-3 text-lg font-mono">/</span>
            <input value={pattern} onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. \b\w+\b"
              className="flex-1 bg-transparent py-3 text-sm font-mono text-slate-200 outline-none" />
            <span className="text-slate-500 px-1 text-lg font-mono">/</span>
            <input value={flags} onChange={(e) => setFlags(e.target.value)}
              className="w-16 bg-transparent py-3 text-sm font-mono text-indigo-400 outline-none px-1" />
          </div>
        </div>
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('flags')}</label>
          <div className="flex gap-1">
            {allFlags.map((f) => (
              <button key={f} onClick={() => {
                setFlags((prev) => prev.includes(f) ? prev.replace(f, '') : prev + f);
              }} className={`w-8 h-10 text-xs font-mono rounded-lg border transition-all ${flags.includes(f) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-slate-400 text-sm font-medium mb-2 block">{t('testString')}</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to test against..."
          className="input-field px-4 py-3 text-sm font-mono min-h-[120px] resize-none block" />
      </div>

      {result?.error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">
          Invalid regex: {result.error}
        </p>
      )}

      {result && !result.error && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${result.count > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              {result.count} match{result.count !== 1 ? 'es' : ''}
            </span>
            <button onClick={() => setShowReplace(!showReplace)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              {showReplace ? t('hideReplace') : t('showReplace')}
            </button>
          </div>

          {result.count > 0 && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-slate-500 text-xs mb-2">Highlighted matches</p>
              <p className="text-sm font-mono leading-relaxed break-all"
                dangerouslySetInnerHTML={{ __html: highlightedHTML() }} />
            </div>
          )}

          {result.matches.length > 0 && (
            <div className="space-y-1">
              {result.matches.slice(0, 20).map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-mono">
                  <span className="text-slate-600 text-xs w-6">{i + 1}</span>
                  <span className="text-yellow-300 flex-1 truncate">{m.match}</span>
                  <span className="text-slate-500 text-xs">@{m.index}</span>
                </div>
              ))}
              {result.matches.length > 20 && (
                <p className="text-slate-500 text-xs px-3">…and {result.matches.length - 20} more</p>
              )}
            </div>
          )}

          {showReplace && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex gap-3">
                <input value={replacement} onChange={(e) => setReplacement(e.target.value)}
                  placeholder="Replacement string (use $1, $2 for groups)"
                  className="input-field flex-1 px-4 py-2.5 text-sm font-mono" />
              </div>
              {result.replaced !== undefined && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="flex justify-between mb-1">
                    <p className="text-slate-500 text-xs">Result after replace</p>
                    <CopyButton text={result.replaced} />
                  </div>
                  <p className="text-sm font-mono text-slate-200 break-all">{result.replaced}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Text Case Converter ──────────────────────────────────────────────────────

function TextCaseConverter() {
  const [input, setInput] = useState('');

  const cases: { key: CaseType; label: string; example: string }[] = [
    { key: 'upper',    label: 'UPPER CASE',    example: 'HELLO WORLD' },
    { key: 'lower',    label: 'lower case',    example: 'hello world' },
    { key: 'title',    label: 'Title Case',    example: 'Hello World' },
    { key: 'sentence', label: 'Sentence case', example: 'Hello world' },
    { key: 'camel',    label: 'camelCase',     example: 'helloWorld' },
    { key: 'pascal',   label: 'PascalCase',    example: 'HelloWorld' },
    { key: 'snake',    label: 'snake_case',    example: 'hello_world' },
    { key: 'kebab',    label: 'kebab-case',    example: 'hello-world' },
    { key: 'constant', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-slate-400 text-sm font-medium mb-2 block">Input Text</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to convert..."
          className="input-field px-4 py-3 text-sm min-h-[120px] resize-none block" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cases.map(({ key, label, example }) => {
          const converted = input ? convertCase(input, key) : example;
          return (
            <div key={key} className="p-4 bg-slate-900 border border-slate-800 rounded-xl group hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-slate-500 text-xs font-medium">{label}</p>
                <button onClick={() => clipboardWrite(converted)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-300 transition-all flex-shrink-0">
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              </div>
              <p className={`text-sm font-mono break-all ${input ? 'text-slate-200' : 'text-slate-600'}`}>{converted}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Hash Generator ──────────────────────────────────────────────────────────

function HashGenerator() {
  const t = useTranslations('Tool');
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

  const generate = async () => {
    if (!input) return;
    if (!checkRateLimit('hash-gen', 20, 60000)) return;
    setLoading(true);
    const results: Record<string, string> = {};
    for (const algo of algorithms) {
      results[algo] = await hashText(input, algo);
    }
    setHashes(results);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-slate-400 text-sm font-medium mb-2 block">Input Text</label>
        <textarea value={input} onChange={(e) => { setInput(e.target.value); setHashes({}); }}
          placeholder="Enter text to hash..."
          className="input-field px-4 py-3 text-sm min-h-[120px] resize-none block" />
      </div>
      <button onClick={generate} disabled={!input || loading}
        className="btn-primary disabled:opacity-60 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">{loading ? 'hourglass_empty' : 'fingerprint'}</span>
        {loading ? t('generatingDots') : t('generateHashes')}
      </button>
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-2 animate-fade-in">
          {algorithms.map((algo) => (
            <div key={algo} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-indigo-400 text-xs font-semibold">{algo}</span>
                <button onClick={() => clipboardWrite(hashes[algo])}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-all">
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              </div>
              <p className="text-slate-200 text-xs font-mono break-all">{hashes[algo]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── QR Code Reader ──────────────────────────────────────────────────────────

function QRReader() {
  const t = useTranslations('Tool');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const readQR = async (file: File) => {
    setError('');
    setResult('');
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }

    try {
      const bitmap = await createImageBitmap(file);
      const canvas = canvasRef.current!;
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Try BarcodeDetector first (native, faster when available)
      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as unknown as { BarcodeDetector: new (opts: object) => { detect(src: ImageData): Promise<{ rawValue: string }[]> } }).BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await detector.detect(imageData);
          if (barcodes.length > 0) { setResult(barcodes[0].rawValue); return; }
        } catch { /* fall through to jsQR */ }
      }

      // Fallback: jsQR (works in all browsers)
      const jsQR = (await import('jsqr')).default;
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        setResult(code.data);
      } else {
        setError(t('qrNotFound'));
      }
    } catch (e) {
      setError('Failed to read the image: ' + (e as Error).message);
    }
  };

  const handleFile = (file: File) => readQR(file);

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => document.getElementById('qr-file-input')?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
        <span className="material-symbols-outlined text-4xl text-slate-500 mb-3">qr_code_scanner</span>
        <p className="text-slate-400 text-sm">{t('dropQRImage')}</p>
        <p className="text-slate-600 text-xs mt-1">PNG, JPG, WebP, GIF supported</p>
      </div>
      <input id="qr-file-input" type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{error}</p>}

      {result && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              {t('qrCodeDecoded')}
            </span>
            <CopyButton text={result} />
          </div>
          <p className="text-slate-200 text-sm font-mono break-all">{result}</p>
          {result.startsWith('http') && (
            <a href={result} target="_blank" rel="noopener noreferrer"
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              {t('openUrl')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CSV Formatter ───────────────────────────────────────────────────────────

function CSVFormatter() {
  return <CSVCore />;
}

// ─── XML Formatter ───────────────────────────────────────────────────────────

function XMLFormatter() {
  const t = useTranslations('Tool');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'format' | 'validate'>('format');

  const process = () => {
    setError('');
    if (mode === 'validate') {
      const res = validateXML(input);
      setOutput('');
      if (res.valid) {
        setError('');
        setOutput('✓ Valid XML');
      } else {
        setError(res.error || 'Invalid XML');
      }
      return;
    }
    const res = formatXML(input);
    if (res.error) { setError(res.error); setOutput(''); return; }
    setOutput(res.result);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['format', 'validate'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${mode === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
            {m === 'format' ? t('format_verb') : t('validate')}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-400 text-sm font-medium">{t('inputXml')}</label>
            <button onClick={() => { setInput(''); setOutput(''); setError(''); }} className="text-slate-500 text-xs hover:text-slate-300">{t('clear')}</button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={'<?xml version="1.0"?>\n<root>\n  <item>value</item>\n</root>'}
            className="input-field px-4 py-3 text-sm font-mono min-h-[280px] resize-none block" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-400 text-sm font-medium">{t('xmlOutput')}</label>
            {output && output !== '✓ Valid XML' && <CopyButton text={output} />}
          </div>
          <textarea value={output} readOnly placeholder={t('xmlFormattedPlaceholder')}
            className={`input-field px-4 py-3 text-sm font-mono min-h-[280px] resize-none block bg-slate-950/50 ${output === '✓ Valid XML' ? 'text-emerald-400' : ''}`} />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{error}</p>}
      <button onClick={process} disabled={!input} className="btn-primary disabled:opacity-60 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">{mode === 'format' ? 'auto_fix_high' : 'verified'}</span>
        {mode === 'format' ? t('formatXml') : t('validateXml')}
      </button>
    </div>
  );
}

// ─── YAML Formatter ──────────────────────────────────────────────────────────

function YAMLFormatter() {
  const t = useTranslations('Tool');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const format = () => {
    setError('');
    if (!input.trim()) return;
    const res = formatYAML(input);
    if (res.error) { setError(res.error); setOutput(''); return; }
    setOutput(res.result);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-400 text-sm font-medium">{t('inputYaml')}</label>
            <button onClick={() => { setInput(''); setOutput(''); setError(''); }} className="text-slate-500 text-xs hover:text-slate-300">{t('clear')}</button>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={'name: John\nage: 30\naddress:\n  city: New York\n  zip: 10001'}
            className="input-field px-4 py-3 text-sm font-mono min-h-[280px] resize-none block" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-400 text-sm font-medium">{t('formattedYaml')}</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea value={output} readOnly placeholder="Formatted YAML appears here..."
            className="input-field px-4 py-3 text-sm font-mono min-h-[280px] resize-none block bg-slate-950/50" />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl">{error}</p>}
      <button onClick={format} disabled={!input} className="btn-primary disabled:opacity-60 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">auto_fix_high</span>
        {t('formatYaml')}
      </button>
    </div>
  );
}

// ─── Lorem Ipsum Generator ───────────────────────────────────────────────────

function LoremIpsumGenerator() {
  const t = useTranslations('Tool');
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50);
  const [output, setOutput] = useState('');

  const generate = () => {
    setOutput(generateLorem(paragraphs, wordsPerParagraph));
  };

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('loremParagraphs')}: {paragraphs}</label>
          <input type="range" min={1} max={10} value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))}
            className="w-full accent-indigo-500" />
        </div>
        <div>
          <label className="text-slate-400 text-sm font-medium mb-2 block">{t('wordsPerParagraph')}: {wordsPerParagraph}</label>
          <input type="range" min={10} max={150} step={5} value={wordsPerParagraph} onChange={(e) => setWordsPerParagraph(Number(e.target.value))}
            className="w-full accent-indigo-500" />
        </div>
      </div>
      <button onClick={generate} className="btn-primary flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">article</span>
        {t('generateLoremIpsum')}
      </button>
      {output && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-xs">{paragraphs} paragraph{paragraphs !== 1 ? 's' : ''} · ~{paragraphs * wordsPerParagraph} words</p>
            <CopyButton text={output} />
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            {output.split('\n\n').map((para, i) => (
              <p key={i} className="text-slate-300 text-sm leading-relaxed">{para}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MarkdownFormatter() {
  const t = useTranslations('Tool');
  const [input, setInput] = useState(`# Hello, Markdown!

Write your **markdown** here and see the *preview* update live.

## Features
- Headings
- **Bold** and *italic*
- [Links](https://example.com)
- \`inline code\`
- Lists

\`\`\`js
console.log("Hello, World!");
\`\`\`
`);
  const [view, setView] = useState<'split' | 'preview' | 'source'>('split');

  const html = markdownToHTML(input);

  const exportHTML = () => {
    const full = `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><title>Export</title></head>\n<body>\n${html}\n</body>\n</html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'export.html'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {(['split', 'source', 'preview'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${view === v ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {v === 'split' ? t('mdTabSplit') : v === 'source' ? t('mdTabSource') : t('preview')}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <CopyButton text={html} />
          <button onClick={exportHTML} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">download</span>
            {t('exportHtml')}
          </button>
        </div>
      </div>

      <div className={`grid gap-4 ${view === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {(view === 'split' || view === 'source') && (
          <div>
            <p className="text-slate-500 text-xs mb-2">{t('markdownSource')}</p>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              className="input-field px-4 py-3 text-sm font-mono min-h-[450px] resize-none block" />
          </div>
        )}
        {(view === 'split' || view === 'preview') && (
          <div>
            <p className="text-slate-500 text-xs mb-2">{t('preview')}</p>
            <div
              className="min-h-[450px] p-4 bg-slate-950/50 border border-slate-800 rounded-xl prose prose-invert prose-sm max-w-none text-slate-300
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-100 [&_h1]:mb-3
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-200 [&_h2]:mb-2 [&_h2]:mt-4
                [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-slate-200 [&_h3]:mb-2
                [&_p]:mb-3 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                [&_li]:mb-1
                [&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-indigo-300 [&_code]:text-xs [&_code]:font-mono
                [&_pre]:bg-slate-900 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-auto [&_pre]:mb-3
                [&_pre_code]:bg-transparent [&_pre_code]:p-0
                [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400
                [&_a]:text-indigo-400 [&_a]:underline
                [&_hr]:border-slate-700 [&_hr]:my-4
                [&_strong]:text-slate-200 [&_strong]:font-semibold
                [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root Switch ─────────────────────────────────────────────────────────────

export function DevToolCore({ mode }: Props) {
  const t = useTranslations('Tool');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const DEV_TABS: { mode: DevMode; label: string; icon: string }[] = [
    { mode: 'json-formatter',      label: 'JSON',              icon: 'data_object' },
    { mode: 'json-validator',      label: t('devTabValidate'), icon: 'check_circle' },
    { mode: 'base64',              label: t('devTabBase64'),   icon: 'key' },
    { mode: 'uuid-generator',      label: t('devTabUUID'),     icon: 'fingerprint' },
    { mode: 'timestamp-converter', label: t('devTabTimestamp'),icon: 'schedule' },
    { mode: 'regex-tester',        label: t('devTabRegex'),    icon: 'search' },
    { mode: 'text-case',           label: t('devTabCase'),     icon: 'text_format' },
    { mode: 'lorem-ipsum',         label: t('devTabLorem'),    icon: 'article' },
    { mode: 'hash-generator',      label: t('devTabHash'),     icon: 'tag' },
    { mode: 'qr-reader',           label: t('devTabQRReader'), icon: 'qr_code_scanner' },
    { mode: 'csv-formatter',       label: t('devTabCSV'),      icon: 'table_view' },
    { mode: 'xml-formatter',       label: t('devTabXML'),      icon: 'code' },
    { mode: 'yaml-formatter',      label: t('devTabYAML'),     icon: 'text_snippet' },
    { mode: 'markdown-formatter',  label: t('devTabMarkdown'), icon: 'format_list_bulleted' },
  ];
  let content: React.ReactNode;
  switch (mode) {
    case 'json-formatter':      content = <JsonFormatter />; break;
    case 'json-validator':      content = <JsonValidator />; break;
    case 'base64':              content = <Base64Tool />; break;
    case 'uuid-generator':      content = <UUIDGenerator />; break;
    case 'timestamp-converter': content = <TimestampConverter />; break;
    case 'regex-tester':        content = <RegexTester />; break;
    case 'text-case':           content = <TextCaseConverter />; break;
    case 'lorem-ipsum':         content = <LoremIpsumGenerator />; break;
    case 'hash-generator':      content = <HashGenerator />; break;
    case 'qr-reader':           content = <QRReader />; break;
    case 'csv-formatter':       content = <CSVFormatter />; break;
    case 'xml-formatter':       content = <XMLFormatter />; break;
    case 'yaml-formatter':      content = <YAMLFormatter />; break;
    case 'markdown-formatter':  content = <MarkdownFormatter />; break;
    default:                    content = null;
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {DEV_TABS.map(tab => (
          <Link
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
          </Link>
        ))}
      </div>
      {content}
    </div>
  );
}

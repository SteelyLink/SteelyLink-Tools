'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  detectDelimiter, parseCSVText, formatCSVData, validateCSVData, getIssueRowSet,
  type Delimiter, type ParseResult, type ValidationResult,
} from '@/lib/tools/csv-processor';

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

const ROWS_PER_PAGE = 100;

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

type DelimOption = 'auto' | Delimiter;

const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors';
const BTN_SECONDARY = 'flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-colors';

export default function CSVCore() {
  const t = useTranslations('Tool');
  const DELIM_LABELS: Record<string, string> = {
    auto: t('delimAuto'),
    ',': t('delimComma'),
    ';': t('delimSemicolon'),
    '\t': t('delimTab'),
    '|': t('delimPipe'),
  };
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  const [inputDelim, setInputDelim] = useState<DelimOption>('auto');
  const [outputDelim, setOutputDelim] = useState<Delimiter>(',');
  const [trimSpaces, setTrimSpaces] = useState(true);
  const [fillMissing, setFillMissing] = useState(true);
  const [addBOM, setAddBOM] = useState(false);

  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [formattedText, setFormattedText] = useState<string | null>(null);
  const [issueRowSet, setIssueRowSet] = useState<Set<number>>(new Set());

  const [activeTab, setActiveTab] = useState<'preview' | 'raw' | 'issues'>('preview');
  const [page, setPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipResetRef = useRef(false);

  // Reset results when input changes (skip if change was triggered by auto-fix)
  useEffect(() => {
    if (skipResetRef.current) {
      skipResetRef.current = false;
      return;
    }
    setParsed(null);
    setValidation(null);
    setFormattedText(null);
    setIssueRowSet(new Set());
    setPage(0);
  }, [rawText, inputDelim]);

  const getEffectiveDelimiter = useCallback((): Delimiter => {
    if (inputDelim === 'auto') return detectDelimiter(rawText);
    return inputDelim;
  }, [inputDelim, rawText]);

  const runParseAndValidate = useCallback((text: string, delim: Delimiter) => {
    const result = parseCSVText(text, { delimiter: delim, trimSpaces, maxRows: 5000 });
    const v = validateCSVData(result.rows);
    const s = getIssueRowSet(v.issues);
    return { result, v, s };
  }, [trimSpaces]);

  // Preview: parse + auto-validate so error rows are highlighted immediately
  const handleParse = useCallback(() => {
    if (!rawText.trim()) return;
    const delim = getEffectiveDelimiter();
    const { result, v, s } = runParseAndValidate(rawText, delim);
    setParsed(result);
    setValidation(v);
    setIssueRowSet(s);
    setPage(0);
    setActiveTab('preview');
  }, [rawText, getEffectiveDelimiter, runParseAndValidate]);

  const handleFormat = useCallback(() => {
    if (!rawText.trim()) return;
    const delim = getEffectiveDelimiter();
    const result = parseCSVText(rawText, { delimiter: delim, trimSpaces, maxRows: 5000 });
    const formatted = formatCSVData(result.rows, {
      outputDelimiter: outputDelim,
      trimSpaces,
      fillMissingCols: fillMissing,
      addBOM,
    });
    // Validate the formatted output to confirm it's clean
    const reparsed = parseCSVText(formatted, { delimiter: outputDelim, trimSpaces });
    const v = validateCSVData(reparsed.rows);
    const s = getIssueRowSet(v.issues);
    setParsed(reparsed);
    setValidation(v);
    setIssueRowSet(s);
    setFormattedText(formatted);
    setPage(0);
    setActiveTab('raw');
  }, [rawText, getEffectiveDelimiter, outputDelim, trimSpaces, fillMissing, addBOM]);

  const handleValidate = useCallback(() => {
    if (!rawText.trim()) return;
    const delim = getEffectiveDelimiter();
    const { result, v, s } = runParseAndValidate(rawText, delim);
    setParsed(result);
    setValidation(v);
    setIssueRowSet(s);
    setPage(0);
    setActiveTab('issues');
  }, [rawText, getEffectiveDelimiter, runParseAndValidate]);

  const handleAutoFix = useCallback(() => {
    if (!parsed) return;
    const rows = parsed.rows;
    if (rows.length === 0) return;

    const headerColCount = rows[0].length;

    // Remove completely empty data rows; pad rows with too few cols
    const emptySet = new Set(validation?.emptyRowIndices ?? []);
    const fixedRows = rows
      .filter((_, i) => i === 0 || !emptySet.has(i))
      .map(row => {
        const r = trimSpaces ? row.map(f => f.trim()) : [...row];
        while (r.length < headerColCount) r.push('');
        return r;
      });

    const fixed = formatCSVData(fixedRows, {
      outputDelimiter: outputDelim,
      trimSpaces,
      fillMissingCols: true,
      addBOM: false,
    });

    // Re-parse and validate immediately; skip the reset effect
    const reparsed = parseCSVText(fixed, { delimiter: outputDelim, trimSpaces });
    const v = validateCSVData(reparsed.rows);
    const s = getIssueRowSet(v.issues);

    skipResetRef.current = true;
    setRawText(fixed);
    setFormattedText(null);
    setParsed(reparsed);
    setValidation(v);
    setIssueRowSet(s);
    setPage(0);
    setActiveTab('issues');
  }, [parsed, validation, outputDelim, trimSpaces]);

  const handleReset = useCallback(() => {
    setRawText('');
    setFileName(null);
    setFileSize(null);
    setParsed(null);
    setValidation(null);
    setFormattedText(null);
    setIssueRowSet(new Set());
    setPage(0);
    setActiveTab('preview');
  }, []);

  const loadFile = useCallback((file: File) => {
    if (!file.name.match(/\.(csv|tsv|txt)$/i)) return;
    setFileName(file.name);
    setFileSize(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target?.result as string;
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); // strip UTF-8 BOM
      setRawText(text);
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleDownload = useCallback(() => {
    const text = formattedText ?? rawText;
    if (!text) return;
    const content = addBOM ? '﻿' + text : text;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ? fileName.replace(/\.[^.]+$/, '_formatted.csv') : 'formatted.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [formattedText, rawText, fileName, addBOM]);

  const handleCopy = useCallback(async () => {
    const text = formattedText ?? rawText;
    if (!text) return;
    await clipboardWrite(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [formattedText, rawText]);

  // Table display
  const displayRows = parsed?.rows ?? [];
  const totalPages = Math.max(1, Math.ceil(Math.max(0, displayRows.length - 1) / ROWS_PER_PAGE));
  const headerRow = displayRows[0] ?? [];
  const bodyRows = displayRows.slice(1 + page * ROWS_PER_PAGE, 1 + (page + 1) * ROWS_PER_PAGE);

  const detectedDelim = rawText ? detectDelimiter(rawText) : ',';
  const hasContent = rawText.trim().length > 0;

  const errorCount = validation?.issues.filter(i => i.severity === 'error').length ?? 0;
  const warnCount = validation?.issues.filter(i => i.severity === 'warning').length ?? 0;
  const canAutoFix = parsed !== null && (
    (validation?.emptyRowIndices.length ?? 0) > 0 ||
    (validation?.issues.some(i => i.severity === 'error') ?? false)
  );

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700'}`}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center z-10 rounded-xl bg-indigo-500/10">
            <p className="text-indigo-300 font-semibold text-sm">{t('dropCsvHere')}</p>
          </div>
        )}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-xs font-medium">{t('inputCsv')}</span>
            {fileName && (
              <span className="text-indigo-400 text-xs bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                {fileName}{fileSize ? ` · ${formatBytes(fileSize)}` : ''}
              </span>
            )}
            {rawText && inputDelim === 'auto' && (
              <span className="text-slate-500 text-xs">
                {t('detected').toLowerCase()} <span className="text-indigo-400 font-mono">{DELIM_LABELS[detectedDelim]}</span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              {t('upload')}
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFileChange} />
          </div>
        </div>
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder={t('pasteCsvPlaceholder')}
          className="w-full px-4 py-3 bg-transparent text-sm font-mono text-slate-300 placeholder:text-slate-600 resize-none outline-none min-h-[200px] block"
          spellCheck={false}
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-slate-500 text-xs mb-1.5 block">{t('inputDelimiter')}</label>
          <select
            value={inputDelim}
            onChange={e => setInputDelim(e.target.value as DelimOption)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl outline-none focus:border-indigo-500 transition-colors"
          >
            {(Object.entries(DELIM_LABELS) as [string, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-slate-500 text-xs mb-1.5 block">{t('outputDelimiter')}</label>
          <select
            value={outputDelim}
            onChange={e => setOutputDelim(e.target.value as Delimiter)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl outline-none focus:border-indigo-500 transition-colors"
          >
            {([',', ';', '\t', '|'] as Delimiter[]).map(d => (
              <option key={d} value={d}>{DELIM_LABELS[d]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 pt-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={trimSpaces} onChange={e => setTrimSpaces(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
            <span className="text-slate-400 text-xs">{t('trimSpaces')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={fillMissing} onChange={e => setFillMissing(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
            <span className="text-slate-400 text-xs">{t('fillMissingCols')}</span>
          </label>
        </div>
        <div className="flex flex-col gap-2 pt-5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={addBOM} onChange={e => setAddBOM(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
            <span className="text-slate-400 text-xs">{t('utf8Bom')}</span>
          </label>
        </div>
      </div>

      {/* Action buttons — all blue */}
      <div className="flex flex-wrap gap-2">
        <button onClick={handleParse} disabled={!hasContent} className={BTN_PRIMARY}>
          <span className="material-symbols-outlined text-base">table_chart</span>
          {t('preview')}
        </button>
        <button onClick={handleFormat} disabled={!hasContent} className={BTN_PRIMARY}>
          <span className="material-symbols-outlined text-base">auto_fix_high</span>
          {t('format')}
        </button>
        <button onClick={handleValidate} disabled={!hasContent} className={BTN_PRIMARY}>
          <span className="material-symbols-outlined text-base">verified</span>
          {t('validate')}
        </button>
        {hasContent && (
          <>
            <button onClick={handleCopy} className={BTN_SECONDARY}>
              <span className="material-symbols-outlined text-base">{copied ? 'check' : 'content_copy'}</span>
              {copied ? t('copied') : t('copy')}
            </button>
            <button onClick={handleDownload} className={BTN_SECONDARY}>
              <span className="material-symbols-outlined text-base">download</span>
              {t('downloadCsv')}
            </button>
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-300 text-sm font-medium rounded-xl transition-colors ml-auto">
              <span className="material-symbols-outlined text-base">restart_alt</span>
              {t('reset')}
            </button>
          </>
        )}
      </div>

      {/* Results */}
      {parsed && (
        <div className="space-y-3">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <span className="text-slate-400">
              <span className="text-slate-200 font-medium">{parsed.rows.length}</span> {t('rowsLabel')}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-400">
              <span className="text-slate-200 font-medium">{headerRow.length}</span> {t('colsLabel')}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-400">
              {t('delimiterLabel')}: <span className="text-indigo-400 font-mono">{DELIM_LABELS[parsed.delimiter]}</span>
            </span>
            {parsed.truncated && (
              <><span className="text-slate-700">·</span><span className="text-amber-400">{t('previewLimitedRows')}</span></>
            )}
            {validation && (
              <>
                <span className="text-slate-700">·</span>
                {errorCount === 0 && warnCount === 0
                  ? <span className="text-emerald-400">{t('validCsv')}</span>
                  : errorCount > 0
                    ? <span className="text-red-400">{errorCount} {t('errorLabel').toLowerCase()}{errorCount > 1 ? 's' : ''}{warnCount > 0 ? `, ${warnCount} ${t('warningLabel').toLowerCase()}${warnCount > 1 ? 's' : ''}` : ''}</span>
                    : <span className="text-amber-400">{warnCount} {t('warningLabel').toLowerCase()}{warnCount > 1 ? 's' : ''}</span>
                }
              </>
            )}
          </div>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-xl">
            {(['preview', 'raw', 'issues'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab === 'issues' && validation
                  ? `Issues (${validation.issues.length})`
                  : tab === 'preview' ? t('preview')
                  : tab === 'raw' ? 'Raw'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Preview table */}
          {activeTab === 'preview' && (
            <div className="space-y-2">
              <div className="overflow-auto rounded-xl border border-slate-800 max-h-[480px]">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-900 border-b border-slate-700">
                      <th className="px-3 py-2 text-left text-slate-500 font-medium text-xs w-10 select-none">#</th>
                      {headerRow.map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-left text-slate-300 font-semibold text-xs whitespace-nowrap">
                          {h || <span className="text-slate-600 italic">col {i + 1}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bodyRows.map((row, ri) => {
                      const rowIdxInRows = 1 + page * ROWS_PER_PAGE + ri;
                      const hasIssue = issueRowSet.has(rowIdxInRows); // issueRowSet = issue.row-1, rowIdxInRows is 0-indexed into rows
                      return (
                        <tr
                          key={ri}
                          className={`border-b border-slate-900 transition-colors ${hasIssue ? 'bg-red-500/8 hover:bg-red-500/12' : 'hover:bg-slate-900/50'}`}
                        >
                          <td className="px-3 py-2 text-slate-600 text-xs select-none">{page * ROWS_PER_PAGE + ri + 1}</td>
                          {headerRow.map((_, ci) => {
                            const cell = row[ci] ?? '';
                            const isEmpty = cell.trim() === '';
                            return (
                              <td key={ci} className={`px-4 py-2 text-xs whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis ${isEmpty ? 'text-slate-700 italic' : 'text-slate-300'}`}>
                                {isEmpty ? t('emptyCell') : cell}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    {bodyRows.length === 0 && (
                      <tr>
                        <td colSpan={headerRow.length + 1} className="px-4 py-8 text-center text-slate-600 text-sm">{t('noDataRows')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2 justify-center">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 rounded-lg transition-colors">
                    {t('prevPage')}
                  </button>
                  <span className="text-slate-500 text-xs">
                    Page {page + 1} / {totalPages} · {t('rowsLabel')} {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, displayRows.length - 1)}
                  </span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 rounded-lg transition-colors">
                    {t('nextPage')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Raw text */}
          {activeTab === 'raw' && (
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs">{formattedText ? t('formattedOutput') : t('rawInput')}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
              <textarea
                value={formattedText ?? rawText}
                readOnly
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono rounded-xl outline-none resize-none min-h-[300px] block"
              />
            </div>
          )}

          {/* Issues panel */}
          {activeTab === 'issues' && (
            <div className="space-y-3">
              {validation ? (
                <>
                  {/* Summary + auto-fix */}
                  <div className={`flex items-start justify-between gap-3 p-4 rounded-xl border ${errorCount === 0 && warnCount === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : errorCount > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-xl mt-0.5 ${errorCount === 0 && warnCount === 0 ? 'text-emerald-400' : errorCount > 0 ? 'text-red-400' : 'text-amber-400'}`}>
                        {errorCount === 0 && warnCount === 0 ? 'check_circle' : errorCount > 0 ? 'error' : 'warning'}
                      </span>
                      <div>
                        <p className={`font-semibold text-sm ${errorCount === 0 && warnCount === 0 ? 'text-emerald-400' : errorCount > 0 ? 'text-red-400' : 'text-amber-400'}`}>
                          {errorCount === 0 && warnCount === 0 ? t('noIssuesFound') : errorCount > 0 ? t('structuralErrors') : t('warningsOnly')}
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {validation.rowCount} rows · {validation.colCount} columns
                          {validation.issues.length > 0 && ` · ${errorCount} error${errorCount !== 1 ? 's' : ''}, ${warnCount} warning${warnCount !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    {canAutoFix && (
                      <button
                        onClick={handleAutoFix}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">build</span>
                        {t('autoFix')}
                      </button>
                    )}
                  </div>

                  {validation.issues.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-6">{t('allRowsGood')}</p>
                  )}

                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
                    {validation.issues.map((issue, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs border ${issue.severity === 'error' ? 'bg-red-500/8 border-red-500/20 text-red-300' : 'bg-amber-500/8 border-amber-500/20 text-amber-300'}`}
                      >
                        <span className={`material-symbols-outlined text-base mt-0.5 flex-shrink-0 ${issue.severity === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                          {issue.severity === 'error' ? 'cancel' : 'warning'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{issue.severity === 'error' ? t('errorLabel') : t('warningLabel')}</span>
                          {issue.col !== undefined && <span className="text-slate-500"> · Col {issue.col}</span>}
                          <span className="text-slate-400 ml-1">— {issue.message}</span>
                        </div>
                        <button
                          onClick={() => {
                            const targetPage = Math.max(0, Math.floor((issue.row - 2) / ROWS_PER_PAGE));
                            setPage(targetPage);
                            setActiveTab('preview');
                          }}
                          className="flex-shrink-0 text-indigo-400 hover:text-indigo-300 text-xs underline"
                        >
                          {t('goToRow')}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-600 text-sm">
                  {t('clickValidateMsg')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

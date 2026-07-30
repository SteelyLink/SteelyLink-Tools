'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toolRegistry } from '@/lib/tools/registry';
import type { ToolMode } from '@/types/tools';

interface Props {
  locale: string;
  placeholder: string;
}

interface SearchResult {
  id: ToolMode;
  name: string;
}

const toolNames: Record<string, Record<string, string>> = {
  en: {
    'png-to-jpg': 'PNG to JPG Converter', 'jpg-to-png': 'JPG to PNG Converter',
    'webp-to-jpg': 'WebP to JPG Converter', 'jpg-to-webp': 'JPG to WebP Converter',
    'compress-image': 'Image Compressor', 'resize-image': 'Image Resizer',
    'crop-image': 'Image Cropper', 'rotate-image': 'Image Rotator',
    'merge-pdf': 'PDF Merger', 'split-pdf': 'PDF Splitter',
    'json-formatter': 'JSON Formatter', 'base64': 'Base64 Encoder/Decoder',
    'uuid-generator': 'UUID Generator', 'timestamp-converter': 'Timestamp Converter',
    'word-counter': 'Word Counter', 'qr-code': 'QR Code Generator',
    'password-generator': 'Password Generator',
  },
};

export function ToolSearchBar({ locale, placeholder }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); setShowResults(false); return; }
    const names = toolNames[locale] || toolNames.en;
    const lower = q.toLowerCase();

    const matches = Object.keys(toolRegistry)
      .filter((id) => {
        const tool = toolRegistry[id as ToolMode];
        const name = names[id] || id;
        return (
          name.toLowerCase().includes(lower) ||
          id.includes(lower) ||
          tool.keywords.some((k) => k.includes(lower))
        );
      })
      .slice(0, 6)
      .map((id) => ({ id: id as ToolMode, name: names[id] || id }));

    setResults(matches);
    setShowResults(true);
  }, [locale]);

  function handleSelect(id: ToolMode) {
    router.push(`/${locale}/tools/${id}`);
    setShowResults(false);
    setQuery('');
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
          onFocus={() => query && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          placeholder={placeholder}
          className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg shadow-black/20 transition-all text-base"
        />
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-40 animate-fade-in">
          {results.map((result) => {
            const tool = toolRegistry[result.id];
            return (
              <button
                key={result.id}
                onMouseDown={() => handleSelect(result.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left"
              >
                <span className={`material-symbols-outlined text-lg ${tool.colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {tool.icon}
                </span>
                <span className="text-slate-200 text-sm">{result.name}</span>
                <span className="ml-auto text-slate-500 text-xs capitalize">{tool.category}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

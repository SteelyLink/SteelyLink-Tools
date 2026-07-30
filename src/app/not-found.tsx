'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const VALID_LOCALES = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'es', 'ja'];

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  'zh-hk': '繁體中文 (HK)',
  es: 'Español',
  ja: '日本語',
};

const LABELS: Record<string, { title: string; desc: string; home: string; blog: string; shortcuts: string[] }> = {
  en:      { title: 'Page Not Found',      desc: "The page you're looking for doesn't exist or has been moved.", home: 'Go Home',    blog: 'Browse Tutorials', shortcuts: ['Compress Image', 'Compress PDF', 'PNG to JPG', 'JSON Formatter', 'Remove BG'] },
  'zh-cn': { title: '页面未找到',           desc: '您访问的页面不存在或已被移动。',                                 home: '返回首页',   blog: '浏览教程',          shortcuts: ['压缩图片', '压缩PDF', 'PNG转JPG', 'JSON格式化', '去除背景'] },
  'zh-tw': { title: '頁面未找到',           desc: '您訪問的頁面不存在或已被移動。',                                 home: '返回首頁',   blog: '瀏覽教學',          shortcuts: ['壓縮圖片', '壓縮PDF', 'PNG轉JPG', 'JSON格式化', '移除背景'] },
  'zh-hk': { title: '頁面未找到',           desc: '您訪問的頁面不存在或已被移動。',                                 home: '返回首頁',   blog: '瀏覽教學',          shortcuts: ['壓縮圖片', '壓縮PDF', 'PNG轉JPG', 'JSON格式化', '移除背景'] },
  es:      { title: 'Página No Encontrada', desc: 'La página que buscas no existe o ha sido movida.',              home: 'Ir al inicio', blog: 'Ver tutoriales', shortcuts: ['Comprimir imagen', 'Comprimir PDF', 'PNG a JPG', 'Formateador JSON', 'Quitar fondo'] },
  ja:      { title: 'ページが見つかりません', desc: 'お探しのページは存在しないか、移動されました。',                     home: 'ホームへ',   blog: 'チュートリアル一覧', shortcuts: ['画像圧縮', 'PDF圧縮', 'PNG→JPG', 'JSON整形', '背景削除'] },
};

// Map browser language tags to site locales
const LANG_MAP: Record<string, string> = {
  en: 'en', 'en-US': 'en', 'en-GB': 'en', 'en-AU': 'en',
  'zh-CN': 'zh-cn', 'zh-SG': 'zh-cn', zh: 'zh-cn',
  'zh-TW': 'zh-tw',
  'zh-HK': 'zh-hk', 'zh-MO': 'zh-hk',
  es: 'es', 'es-ES': 'es', 'es-MX': 'es', 'es-AR': 'es', 'es-CO': 'es',
  ja: 'ja', 'ja-JP': 'ja',
};

export default function NotFound() {
  const pathname = usePathname();
  const pathSegment = pathname?.split('/')[1] ?? '';
  const pathLocale = VALID_LOCALES.includes(pathSegment) ? pathSegment : null;

  const [locale, setLocale] = useState<string>(pathLocale ?? 'en');

  useEffect(() => {
    if (pathLocale) return;
    // Detect from browser language preference
    const navLangs: readonly string[] = (typeof navigator !== 'undefined' && navigator.languages?.length)
      ? navigator.languages
      : [navigator.language ?? 'en'];

    for (const lang of navLangs) {
      const mapped = LANG_MAP[lang] ?? LANG_MAP[lang.slice(0, 2)];
      if (mapped && VALID_LOCALES.includes(mapped)) {
        setLocale(mapped);
        return;
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const l = LABELS[locale] ?? LABELS.en;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 text-center">
      {/* 404 number */}
      <div className="relative mb-8">
        <div className="text-[140px] font-black text-slate-800/60 leading-none select-none tracking-tight">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-indigo-400"
            style={{ fontSize: '72px', fontVariationSettings: "'FILL' 1" }}
          >
            search_off
          </span>
        </div>
      </div>

      {/* Message */}
      <h1 className="text-2xl font-bold text-slate-100 mb-3">{l.title}</h1>
      <p className="text-slate-400 text-base max-w-md mb-10 leading-relaxed">{l.desc}</p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          {l.home}
        </Link>
        <Link
          href={`/${locale}/blog`}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          {l.blog}
        </Link>
      </div>

      {/* Popular shortcuts */}
      <div className="mt-14 flex flex-wrap justify-center gap-2 max-w-lg">
        {[
          { id: 'compress-image', icon: 'compress' },
          { id: 'pdf-compress',   icon: 'picture_as_pdf' },
          { id: 'png-to-jpg',     icon: 'image' },
          { id: 'json-formatter', icon: 'code' },
          { id: 'remove-bg',      icon: 'auto_fix_high' },
        ].map(({ id, icon }, i) => (
          <Link
            key={id}
            href={`/${locale}/tools/${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            {l.shortcuts[i]}
          </Link>
        ))}
      </div>

      {/* Language selector */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {VALID_LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              loc === locale
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {LOCALE_NAMES[loc]}
          </button>
        ))}
      </div>

      {/* Site brand */}
      <div className="mt-10 flex items-center gap-2 text-slate-600 text-sm">
        <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">S</div>
        SteelyLink Tools
      </div>
    </div>
  );
}

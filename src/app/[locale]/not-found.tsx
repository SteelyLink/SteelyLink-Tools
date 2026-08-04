'use client';

import { usePathname } from 'next/navigation';

const VALID_LOCALES = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'es', 'ja'];

const LABELS: Record<string, { title: string; desc: string; home: string; blog: string; search: string }> = {
  en:    { title: 'Page Not Found', desc: "The page you're looking for doesn't exist or has been moved.", home: 'Go Home', blog: 'Browse Tutorials', search: 'Search Tools' },
  'zh-cn': { title: '页面未找到', desc: '您访问的页面不存在或已被移动。', home: '返回首页', blog: '浏览教程', search: '搜索工具' },
  'zh-tw': { title: '頁面未找到', desc: '您訪問的頁面不存在或已被移動。', home: '返回首頁', blog: '瀏覽教學', search: '搜尋工具' },
  'zh-hk': { title: '頁面未找到', desc: '您訪問的頁面不存在或已被移動。', home: '返回首頁', blog: '瀏覽教學', search: '搜尋工具' },
  es:    { title: 'Página No Encontrada', desc: 'La página que buscas no existe o ha sido movida.', home: 'Ir al Inicio', blog: 'Ver Tutoriales', search: 'Buscar Herramientas' },
  ja:    { title: 'ページが見つかりません', desc: 'お探しのページは存在しないか、移動されました。', home: 'ホームへ', blog: 'チュートリアル一覧', search: 'ツールを検索' },
};

export default function NotFound() {
  const pathname = usePathname();
  const segment = pathname?.split('/')[1] ?? 'en';
  const locale = VALID_LOCALES.includes(segment) ? segment : 'en';
  const l = LABELS[locale] ?? LABELS.en;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
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
        <a
          href={`/${locale}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          {l.home}
        </a>
        <a
          href={`/${locale}/blog`}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          {l.blog}
        </a>
      </div>

      {/* Popular tool shortcuts */}
      <div className="mt-14 flex flex-wrap justify-center gap-2 max-w-lg">
        {[
          { id: 'compress-image', label: 'Compress Image', icon: 'compress' },
          { id: 'pdf-compress', label: 'Compress PDF', icon: 'picture_as_pdf' },
          { id: 'png-to-jpg', label: 'PNG to JPG', icon: 'image' },
          { id: 'json-formatter', label: 'JSON Formatter', icon: 'code' },
          { id: 'remove-bg', label: 'Remove BG', icon: 'auto_fix_high' },
        ].map(({ id, label, icon }) => (
          <a
            key={id}
            href={`/${locale}/tools/${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

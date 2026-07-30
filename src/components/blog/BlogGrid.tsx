'use client';

import { useState } from 'react';
import { BlogCard } from './BlogCard';
import type { BlogPostMeta } from '@/types/blog';

const POSTS_PER_PAGE = 24;

interface Props {
  posts: BlogPostMeta[];
  locale: string;
  toolNames: Record<string, string>;
  toolDescs: Record<string, string>;
  heroTitle: string;
  heroDesc: string;
  filterAllLabel: string;
  tutorialsLabel: string;
  featuredGuidesLabel: string;
  categoryLabels: Record<string, string>;
  readGuideLabel: string;
  featuredBadgeLabel: string;
  howToUseLabel: string;
  previousLabel: string;
  nextLabel: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  image: 'image', pdf: 'picture_as_pdf', dev: 'code', calc: 'calculate',
  game: 'sports_esports', audio: 'music_note', encode: 'translate', finance: 'currency_exchange', light: 'widgets',
};

const CATEGORY_ORDER = ['image', 'pdf', 'dev', 'calc', 'game', 'audio', 'encode', 'finance', 'light'];

export function BlogGrid({
  posts, locale, toolNames, toolDescs, heroTitle, heroDesc, filterAllLabel,
  tutorialsLabel, featuredGuidesLabel, categoryLabels,
  readGuideLabel, featuredBadgeLabel, howToUseLabel, previousLabel, nextLabel,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [page, setPage] = useState(1);

  const availableCategories = CATEGORY_ORDER.filter((c) => posts.some((p) => p.category === c));

  const featured = posts.filter((p) => p.featured);
  const filtered = activeCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setPage(1);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 pt-28 pb-20">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 mb-4">
          <span className="material-symbols-outlined text-indigo-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">{tutorialsLabel}</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-50 tracking-tight mb-3">{heroTitle}</h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{heroDesc.replace('{count}', String(posts.length))}</p>
      </div>

      {/* Featured strip */}
      {activeCategory === 'all' && featured.length > 0 && (
        <div className="mb-12">
          <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            {featuredGuidesLabel}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(0, 6).map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                locale={locale}
                toolName={toolNames[post.toolId] ?? post.toolId}
                toolDesc={toolDescs[post.toolId] ?? ''}
                categoryLabel={categoryLabels[post.category] ?? post.category}
                featuredLabel={featuredBadgeLabel}
                readGuideLabel={readGuideLabel}
                howToUseLabel={howToUseLabel}
              />
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
            activeCategory === 'all'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          {filterAllLabel} ({posts.length})
        </button>
        {availableCategories.map((cat) => {
          const count = posts.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {CATEGORY_ICONS[cat] ?? 'article'}
              </span>
              {categoryLabels[cat] ?? cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((post) => (
          <BlogCard
            key={post.slug}
            post={post}
            locale={locale}
            toolName={toolNames[post.toolId] ?? post.toolId}
            toolDesc={toolDescs[post.toolId] ?? ''}
            categoryLabel={categoryLabels[post.category] ?? post.category}
            featuredLabel={featuredBadgeLabel}
            readGuideLabel={readGuideLabel}
            howToUseLabel={howToUseLabel}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <button
            onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {previousLabel}
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-8 h-8 text-sm font-semibold rounded-lg transition-all ${
                  p === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {nextLabel}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}

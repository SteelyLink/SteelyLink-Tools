import { toolRegistry } from '@/lib/tools/registry';
import type { BlogPostMeta } from '@/types/blog';
import type { ToolMode } from '@/types/tools';

interface Props {
  post: BlogPostMeta;
  locale: string;
  toolName: string;
  toolDesc: string;
  categoryLabel: string;
  featuredLabel: string;
  readGuideLabel: string;
  howToUseLabel: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  image: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  pdf: 'text-red-400 bg-red-500/10 border-red-500/20',
  dev: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  calc: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  game: 'text-green-400 bg-green-500/10 border-green-500/20',
  audio: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  encode: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  finance: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  light: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
};

export function BlogCard({ post, locale, toolName, toolDesc, categoryLabel, featuredLabel, readGuideLabel, howToUseLabel }: Props) {
  const tool = toolRegistry[post.toolId as ToolMode];
  const colorKey = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.light;

  return (
    <a
      href={`/${locale}/blog/${post.slug}`}
      className="group flex flex-col gap-3 p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/30"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${tool?.iconBgClass ?? 'from-slate-700 to-slate-800'} flex items-center justify-center border`}
        >
          <span
            className={`material-symbols-outlined text-base ${tool?.colorClass ?? 'text-slate-400'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {tool?.icon ?? 'article'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorKey}`}>
              {categoryLabel}
            </span>
            {post.featured && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border text-violet-400 bg-violet-500/10 border-violet-500/20">
                {featuredLabel}
              </span>
            )}
          </div>
          <h2 className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors line-clamp-2 leading-snug">
            {howToUseLabel} {toolName}
          </h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{toolDesc}</p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-slate-600 text-xs">{post.publishedAt}</span>
        <span className="text-indigo-400 text-xs font-medium group-hover:text-indigo-300 transition-colors flex items-center gap-1">
          {readGuideLabel}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </div>
    </a>
  );
}

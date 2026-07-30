import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { toolsByCategory } from '@/lib/tools/registry';
import type { ToolCategory } from '@/types/tools';

const CATEGORY_LABEL_KEY: Record<string, string> = {
  image:   'imageCategory',
  pdf:     'pdfCategory',
  dev:     'devCategory',
  light:   'lightCategory',
  calc:    'calcCategory',
  finance: 'financeCategory',
  encode:  'encodeCategory',
  audio:   'audioCategory',
  game:    'gameCategory',
};

const CATEGORY_DESC_KEY: Record<string, string> = {
  image:   'imageCategoryDesc',
  pdf:     'pdfCategoryDesc',
  dev:     'devCategoryDesc',
  light:   'lightCategoryDesc',
  calc:    'calcCategoryDesc',
  finance: 'financeCategoryDesc',
  encode:  'encodeCategoryDesc',
  audio:   'audioCategoryDesc',
  game:    'gameCategoryDesc',
};

interface Props {
  category: ToolCategory;
  locale: string;
}

export async function CategoryPage({ category, locale }: Props) {
  const t    = await getTranslations({ locale, namespace: 'Home' });
  const tn   = await getTranslations({ locale, namespace: 'ToolNames' });
  const td   = await getTranslations({ locale, namespace: 'ToolDescriptions' });
  const tnav = await getTranslations({ locale, namespace: 'Nav' });

  const GAME_MAIN_TOOLS = new Set(['sensitivity-converter', 'aim-trainer', 'cps-test', 'reaction-test']);
  const IMAGE_FORMAT_CONVERTERS = new Set([
    'jpg-to-png', 'webp-to-jpg', 'jpg-to-webp', 'webp-to-png', 'png-to-webp',
    'heic-to-jpg', 'heic-to-png', 'avif-to-jpg', 'avif-to-png', 'svg-to-png', 'svg-to-jpg',
    'mp4-to-gif',
  ]);
  const allTools = toolsByCategory[category] ?? [];
  const tools = category === 'game'
    ? allTools.filter(t => GAME_MAIN_TOOLS.has(t.id))
    : category === 'image'
      ? allTools.filter(t => !IMAGE_FORMAT_CONVERTERS.has(t.id))
      : allTools;
  const label = t(CATEGORY_LABEL_KEY[category] as 'imageCategory');
  const desc  = t(CATEGORY_DESC_KEY[category] as 'imageCategoryDesc');

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 pt-28 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <a href={`/${locale}`} className="hover:text-slate-300 transition-colors">
          {tnav('home')}
        </a>
        <span>/</span>
        <span className="text-slate-300">{label}</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-50 tracking-tight mb-3">{label}</h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{desc}</p>
        <p className="text-slate-500 text-sm mt-3">
          {t('freeToolsCount', { count: tools.length })}
        </p>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/${locale}/tools/${tool.id}`}
            className="group flex items-start gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/30"
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${tool.iconBgClass} flex items-center justify-center border`}>
              <span
                className={`material-symbols-outlined text-lg ${tool.colorClass}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {tool.icon}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors truncate">
                {tool.id === 'png-to-jpg' ? t('imageConverterName') : tn(tool.id)}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed line-clamp-2">
                {tool.id === 'png-to-jpg' ? t('imageConverterDesc') : td(tool.id)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toolRegistry } from '@/lib/tools/registry';
import type { ToolDefinition, ToolMode } from '@/types/tools';

interface Props {
  tool: ToolDefinition;
  locale: string;
}

export function RelatedTools({ tool, locale }: Props) {
  const t = useTranslations('Tool');
  const tn = useTranslations('ToolNames');
  const td = useTranslations('ToolDescriptions');

  const relatedIds = tool.related.filter((id) => toolRegistry[id]);
  if (relatedIds.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-5">{t('relatedTools')}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedIds.map((id) => {
          const related = toolRegistry[id as ToolMode];
          if (!related) return null;
          return (
            <Link
              key={id}
              href={`/${locale}/tools/${id}`}
              className="group flex items-start gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${related.iconBgClass} flex items-center justify-center border`}>
                <span className={`material-symbols-outlined text-lg ${related.colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {related.icon}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors">
                  {tn(id as ToolMode)}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                  {td(id as ToolMode)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

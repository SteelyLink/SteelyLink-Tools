import { blogRegistry } from '@/data/blog/registry';

interface Props {
  toolId: string;
  locale: string;
  toolName: string;
  sectionLabel: string;
  tutorialLabel: string;
  titleLabel: string;
}

export function RelatedArticles({ toolId, locale, toolName, sectionLabel, tutorialLabel, titleLabel }: Props) {
  const slug = `how-to-use-${toolId}`;
  const post = blogRegistry[slug];
  if (!post) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-5">{sectionLabel}</h2>
      <a
        href={`/${locale}/blog/${slug}`}
        className="group flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-all duration-200"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-indigo-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            menu_book
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-slate-500 text-xs mb-0.5 uppercase tracking-wider font-medium">{tutorialLabel}</p>
          <h3 className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors">
            {titleLabel}
          </h3>
        </div>
        <span className="material-symbols-outlined text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0">
          arrow_forward
        </span>
      </a>
    </section>
  );
}

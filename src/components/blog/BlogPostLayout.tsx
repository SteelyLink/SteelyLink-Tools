import Link from 'next/link';
import { FAQAccordion } from '@/components/tool-page/FAQAccordion';
import type { BlogPostContent, BlogPostMeta } from '@/types/blog';
import type { ToolDefinition } from '@/types/tools';

interface Props {
  content: BlogPostContent;
  post: BlogPostMeta;
  toolData: ToolDefinition;
  locale: string;
  toolName: string;
  backLabel: string;
  tryToolLabel: string;
  homeLabel: string;
  catLabel: string;
  featuredLabel: string;
  freeNoRegistrationLabel: string;
  stepByStepGuideLabel: string;
  tipsLabel: string;
  faqTitleLabel: string;
}

const CATEGORY_SLUG: Record<string, string> = {
  image: 'image-tools', pdf: 'pdf-tools', dev: 'dev-tools', light: 'utility-tools',
  calc: 'calc-tools', finance: 'finance-tools', encode: 'encode-tools',
  audio: 'audio-tools', game: 'game-tools', edit: 'image-tools',
};

export function BlogPostLayout({
  content, post, toolData, locale, toolName,
  backLabel, tryToolLabel, homeLabel, catLabel, featuredLabel,
  freeNoRegistrationLabel, stepByStepGuideLabel, tipsLabel, faqTitleLabel,
}: Props) {
  const catSlug = CATEGORY_SLUG[post.category] ?? `${post.category}-tools`;

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 pt-28 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
        <Link href={`/${locale}`} className="hover:text-slate-300 transition-colors">{homeLabel}</Link>
        <span>/</span>
        <Link href={`/${locale}/blog`} className="hover:text-slate-300 transition-colors">{backLabel}</Link>
        <span>/</span>
        <Link href={`/${locale}/tools/${catSlug}`} className="hover:text-slate-300 transition-colors">{catLabel}</Link>
        <span>/</span>
        <span className="text-slate-300 line-clamp-1">{toolName}</span>
      </nav>

      {/* Article header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
            {catLabel}
          </span>
          {post.featured && (
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border text-violet-400 bg-violet-500/10 border-violet-500/20">
              {featuredLabel}
            </span>
          )}
          <span className="text-slate-600 text-xs">{post.publishedAt}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50 tracking-tight leading-tight mb-4">
          {content.title}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">{content.intro}</p>
      </header>

      {/* Try Tool CTA banner */}
      <div className="mb-10 p-5 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${toolData.iconBgClass} flex items-center justify-center border flex-shrink-0`}>
            <span className={`material-symbols-outlined text-lg ${toolData.colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {toolData.icon}
            </span>
          </div>
          <div>
            <p className="text-slate-200 font-semibold text-sm">{toolName}</p>
            <p className="text-slate-500 text-xs">{freeNoRegistrationLabel}</p>
          </div>
        </div>
        <Link
          href={`/${locale}/tools/${post.toolId}`}
          className="btn-primary text-sm py-2 px-5 flex items-center gap-2 flex-shrink-0"
        >
          {tryToolLabel}
          <span className="material-symbols-outlined text-base">open_in_new</span>
        </Link>
      </div>

      {/* Steps */}
      {content.steps.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-5">{stepByStepGuideLabel}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {content.steps.map((step, i) => (
              <div key={i} className="relative p-5 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-400 text-sm font-bold">{i + 1}</span>
                  </div>
                </div>
                <h3 className="text-slate-200 font-semibold text-sm mb-1.5">{step.heading}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      {content.tips && content.tips.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-5">{tipsLabel}</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            {content.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-lg mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      {content.faqs && content.faqs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-5">{faqTitleLabel}</h2>
          <FAQAccordion items={content.faqs} />
        </section>
      )}

      {/* Conclusion */}
      {content.conclusion && (
        <section className="mb-10 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-slate-300 leading-relaxed">{content.conclusion}</p>
          <Link
            href={`/${locale}/tools/${post.toolId}`}
            className="mt-4 inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5"
          >
            {tryToolLabel}
            <span className="material-symbols-outlined text-base">open_in_new</span>
          </Link>
        </section>
      )}
    </div>
  );
}

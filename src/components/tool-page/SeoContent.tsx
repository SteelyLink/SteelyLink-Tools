import { getTranslations, getMessages } from 'next-intl/server';

interface SeoSection {
  whatIs?: string;
  why?: string;
  useCases?: string;
  tips?: string;
}

interface Props {
  toolId: string;
  toolName: string;
  locale: string;
}

export async function SeoContent({ toolId, toolName, locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'Tool' });
  const messages = await getMessages({ locale });

  const toolSeo = (messages as Record<string, unknown>).ToolSeo as Record<string, SeoSection> | undefined;
  const seo: SeoSection = toolSeo?.[toolId] ?? {};

  const features = [
    { icon: 'lock',       title: t('privacyTitle'),    text: t('privacyText') },
    { icon: 'bolt',       title: t('instantTitle'),    text: t('instantText') },
    { icon: 'money_off',  title: t('freeTitle'),       text: t('freeText') },
    { icon: 'person_off', title: t('noRegisterTitle'), text: t('noRegisterText') },
    { icon: 'devices',    title: t('universalTitle'),  text: t('universalText') },
  ];

  return (
    <section className="mb-10 space-y-5">
      {/* What is this tool */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-lg font-bold text-slate-100 mb-3">{t('whatIs', { tool: toolName })}</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          {seo.whatIs ?? `${toolName} ${t('howItWorksDesc')}`}
        </p>
      </div>

      {/* Why use this tool */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-lg font-bold text-slate-100 mb-3">{t('whyUse', { tool: toolName })}</h2>
        {seo.why ? (
          <p className="text-slate-400 text-sm leading-relaxed mb-4">{seo.why}</p>
        ) : null}
        <ul className="space-y-2.5">
          {features.map((item) => (
            <li key={item.title} className="flex items-start gap-2.5">
              <span
                className="material-symbols-outlined text-indigo-400 text-base mt-0.5 flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
              <span className="text-slate-400 text-sm leading-relaxed">
                <strong className="text-slate-300">{item.title}</strong> — {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Use cases */}
      {seo.useCases && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-bold text-slate-100 mb-3">{t('howWorks')}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{seo.useCases}</p>
        </div>
      )}

      {/* Pro tips */}
      {seo.tips && (
        <div className="p-5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex gap-3">
          <span
            className="material-symbols-outlined text-indigo-400 text-xl flex-shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            tips_and_updates
          </span>
          <div>
            <p className="text-slate-200 font-semibold text-sm mb-1">{t('proTip')}</p>
            <p className="text-slate-400 text-sm leading-relaxed">{seo.tips}</p>
          </div>
        </div>
      )}

      {/* Generic how it works fallback (if no useCases) */}
      {!seo.useCases && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-bold text-slate-100 mb-3">{t('howWorks')}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {toolName} {t('howItWorksDesc')}
          </p>
        </div>
      )}
    </section>
  );
}

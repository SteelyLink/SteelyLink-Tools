'use client';

import { useTranslations } from 'next-intl';

interface Props {
  toolName: string;
  toolId: string;
}

export function HowToUse({ toolName, toolId }: Props) {
  const t = useTranslations('Tool');

  const stepIcons = ['upload_file', 'tune', 'download'];

  const steps = [1, 2, 3].map((n) => {
    const keyTitle = `steps_${toolId}_${n}`;
    const keyDesc = `steps_${toolId}_${n}Desc`;
    const fallbackTitle = `step${n}`;
    const fallbackDesc = `step${n}Desc`;

    // Use tool-specific translation if available (doesn't return raw key), else generic
    const titleRaw = t(keyTitle as Parameters<typeof t>[0]);
    const descRaw = t(keyDesc as Parameters<typeof t>[0]);
    const title = titleRaw === keyTitle ? t(fallbackTitle as Parameters<typeof t>[0]) : titleRaw;
    const desc = descRaw === keyDesc ? t(fallbackDesc as Parameters<typeof t>[0]) : descRaw;

    return {
      num: n,
      title,
      desc,
      icon: stepIcons[n - 1],
    };
  });

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-5">{t('howToUse')}</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {steps.map((step) => (
          <div key={step.num} className="relative p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-400 text-sm font-bold">{step.num}</span>
              </div>
              <span className="material-symbols-outlined text-indigo-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {step.icon}
              </span>
            </div>
            <h3 className="text-slate-200 font-semibold text-sm mb-1.5">{step.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

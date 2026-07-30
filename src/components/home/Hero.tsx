import { getTranslations } from 'next-intl/server';
import { ToolSearchBar } from './ToolSearchBar';

interface Props {
  locale: string;
}

export async function Hero({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'Home' });

  return (
    <section className="relative pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col items-center">
      {/* Background glow */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none will-change-transform" />

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {[
          { key: 'badge1', icon: 'cloud_off' },
          { key: 'badge2', icon: 'shield_lock' },
          { key: 'badge3', icon: 'bolt' },
        ].map(({ key, icon }) => (
          <div
            key={key}
            className="bg-glass border border-slate-700/50 rounded-full px-3 py-1 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-indigo-400 text-base leading-none">{icon}</span>
            <span className="text-sm text-slate-300">{t(key as 'badge1')}</span>
          </div>
        ))}
      </div>

      {/* Headline */}
      <h1 className="text-center font-bold text-slate-50 mb-6 tracking-tight text-4xl md:text-[56px] leading-[1.1] max-w-4xl">
        {t('title')}
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
          {t('titleHighlight')}
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-slate-400 text-lg max-w-2xl mx-auto text-center mb-10 leading-relaxed">
        {t('subtitle')}
      </p>

      {/* Search bar */}
      <ToolSearchBar locale={locale} placeholder={t('searchPlaceholder')} />

      {/* Trust strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl mt-16 border-y border-slate-800/50 py-8">
        {[
          { key: 'noAccount', icon: 'person_off' },
          { key: 'noCharges', icon: 'money_off' },
          { key: 'instant', icon: 'timer' },
          { key: 'browser', icon: 'public' },
        ].map(({ key, icon }) => (
          <div key={key} className="flex flex-col items-center text-center gap-2">
            <span
              className="material-symbols-outlined text-indigo-400 text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {icon}
            </span>
            <span className="text-slate-400 text-sm font-medium">{t(key as 'noAccount')}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

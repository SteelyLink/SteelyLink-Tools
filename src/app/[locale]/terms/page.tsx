import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Terms' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Terms' });

  const updated = 'May 7, 2026';

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
      <a
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-8"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        {t('backHome')}
      </a>

      <h1 className="text-3xl font-bold text-slate-100 mb-2">{t('title')}</h1>
      <p className="text-slate-500 text-sm mb-10">{t('lastUpdated', { date: updated })}</p>

      <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s1h')}</h2>
          <p>{t('s1p')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s2h')}</h2>
          <p>{t('s2p')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s3h')}</h2>
          <p className="mb-3">{t('s3p')}</p>
          <ul className="list-disc list-inside space-y-2 text-slate-400">
            <li>{t('s3li1')}</li>
            <li>{t('s3li2')}</li>
            <li>{t('s3li3')}</li>
            <li>{t('s3li4')}</li>
            <li>{t('s3li5')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s4h')}</h2>
          <p>{t('s4p')}</p>
          <p className="mt-3">{t('s4p2')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s5h')}</h2>
          <p>{t('s5p')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s6h')}</h2>
          <p>{t('s6p')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s7h')}</h2>
          <p>{t('s7p')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s9h')}</h2>
          <p>{t('s9p')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s10h')}</h2>
          <p>{t('s10p')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s11h')}</h2>
          <p>{t('s11p')}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-3">{t('s12h')}</h2>
          <p>{t('s12p')}</p>
        </section>
      </div>
    </div>
  );
}

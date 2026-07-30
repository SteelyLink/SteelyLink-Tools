import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { CategoryPage } from '@/components/tool-page/CategoryPage';
import { generateCategoryMeta } from '@/lib/utils/seo';

interface Props { params: Promise<{ locale: string }>; }

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });
  return generateCategoryMeta(locale, t('gameCategory'), t('gameCategoryDesc'), 'game-tools');
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CategoryPage category="game" locale={locale} />;
}

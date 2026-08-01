import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { pickMessages, SHELL_NAMESPACES } from '@/i18n/clientMessages';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlobalEffects } from '@/components/layout/GlobalEffects';
import { LangSetter } from '@/components/layout/LangSetter';

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: {
      template: `%s | ${t('siteName')}`,
      default: t('defaultTitle'),
    },
    description: t('defaultDescription'),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tools.steelylink.com'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  // Only the shell's client components (MobileMenu, AboutDropdown) read messages here.
  // Pages that need more — currently just tool pages — nest their own provider, so the
  // 600 KB bundle is never serialized into pages that don't use it. See clientMessages.ts.
  const messages = pickMessages(await getMessages(), SHELL_NAMESPACES);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LangSetter locale={locale} />
      <GlobalEffects />
      <Navbar locale={locale} />
      <main className="flex-grow">{children}</main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}

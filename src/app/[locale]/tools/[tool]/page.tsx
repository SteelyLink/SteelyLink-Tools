import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { toolRegistry } from '@/lib/tools/registry';
import { routing } from '@/i18n/routing';
import { pickToolMessages } from '@/i18n/clientMessages';
import { generateToolMeta, generateStructuredData, generateBreadcrumbSchema, generateHowToSchema } from '@/lib/utils/seo';
import { ToolPageWrapper } from '@/components/tool-page/ToolPageWrapper';
import type { ToolMode } from '@/types/tools';

interface Props {
  params: Promise<{ locale: string; tool: string }>;
}

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(toolRegistry).map((tool) => ({ locale, tool }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tool } = await params;
  const toolData = toolRegistry[tool as ToolMode];
  if (!toolData) return {};

  const t = await getTranslations({ locale, namespace: 'ToolNames' });
  const td = await getTranslations({ locale, namespace: 'ToolDescriptions' });

  const toolName = t(tool as ToolMode);
  const toolDescription = td(tool as ToolMode);

  return generateToolMeta(toolData, locale, toolName, toolDescription);
}

export default async function ToolPage({ params }: Props) {
  const { locale, tool } = await params;
  setRequestLocale(locale);
  const toolData = toolRegistry[tool as ToolMode];

  if (!toolData) notFound();

  const t = await getTranslations({ locale, namespace: 'ToolNames' });
  const td = await getTranslations({ locale, namespace: 'ToolDescriptions' });

  const toolName = t(tool as ToolMode);
  const toolDescription = td(tool as ToolMode);
  const structuredData = generateStructuredData(toolData, locale, toolName, toolDescription);

  const th = await getTranslations({ locale, namespace: 'Home' });
  const tt = await getTranslations({ locale, namespace: 'Tool' });

  const CATEGORY_SLUG: Record<string, string> = {
    image: 'image-tools', pdf: 'pdf-tools', dev: 'dev-tools',
    light: 'utility-tools', calc: 'calc-tools', finance: 'finance-tools',
    encode: 'encode-tools', audio: 'audio-tools', game: 'game-tools', edit: 'image-tools',
  };
  const CATEGORY_LABEL_KEY: Record<string, Parameters<typeof th>[0]> = {
    image: 'imageCategory', pdf: 'pdfCategory', dev: 'devCategory',
    light: 'lightCategory', calc: 'calcCategory', finance: 'financeCategory',
    encode: 'encodeCategory', audio: 'audioCategory', game: 'gameCategory', edit: 'editCategory',
  };
  const categorySlug = CATEGORY_SLUG[toolData.category] ?? `${toolData.category}-tools`;
  const categoryLabel = th(CATEGORY_LABEL_KEY[toolData.category] ?? 'imageCategory');

  const breadcrumbSchema = generateBreadcrumbSchema(locale, categoryLabel, categorySlug, toolName, tool);
  const howToSchema = generateHowToSchema(toolName, [
    { name: tt('step1'), text: tt('step1Desc') },
    { name: tt('step2'), text: tt('step2Desc') },
    { name: tt('step3'), text: tt('step3Desc') },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      {/*
        The locale layout only provides the `Nav` namespace, so tool pages supply the
        namespaces their own client components read (HowToUse, RelatedTools, the tool
        cores) — scoped to this tool. Doing it here rather than in the layout keeps the
        other ~600 KB of messages out of every non-tool page's HTML and RSC payload.
      */}
      <NextIntlClientProvider locale={locale} messages={pickToolMessages(await getMessages(), tool)}>
        <ToolPageWrapper
          tool={toolData}
          locale={locale}
          toolName={toolName}
          toolDescription={toolDescription}
        />
      </NextIntlClientProvider>
    </>
  );
}

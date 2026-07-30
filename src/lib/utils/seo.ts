import type { Metadata } from 'next';
import type { ToolDefinition } from '@/types/tools';
import type { FAQItem } from '@/components/tool-page/FAQAccordion';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tools.steelylink.com';
const SITE_NAME = 'SteelyLink Tools';

export function generateToolMeta(
  tool: ToolDefinition,
  locale: string,
  toolName: string,
  toolDescription: string
): Metadata {
  const toolUrl = `${SITE_URL}/${locale}/tools/${tool.id}`;
  const locales = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'es', 'ja'];

  const title = toolName;
  const ogTitle = `${toolName} | ${SITE_NAME}`;
  const description = toolDescription;

  const ogLocaleMap: Record<string, string> = {
    'zh-cn': 'zh_CN', 'zh-tw': 'zh_TW', 'zh-hk': 'zh_HK',
    ja: 'ja_JP', es: 'es_ES',
  };

  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] = `${SITE_URL}/${loc}/tools/${tool.id}`;
  });
  alternates['x-default'] = `${SITE_URL}/en/tools/${tool.id}`;

  return {
    title,
    description,
    keywords: tool.keywords.join(', '),
    alternates: {
      canonical: toolUrl,
      languages: alternates,
    },
    openGraph: {
      title: ogTitle,
      description,
      url: toolUrl,
      siteName: SITE_NAME,
      locale: ogLocaleMap[locale] ?? 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateHomeMetadata(locale: string, title: string, description: string): Metadata {
  const homeUrl = `${SITE_URL}/${locale}`;
  const locales = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'es', 'ja'];

  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] = `${SITE_URL}/${loc}`;
  });
  alternates['x-default'] = `${SITE_URL}/en`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: homeUrl,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url: homeUrl,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function generateStructuredData(tool: ToolDefinition, locale: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: `${SITE_URL}/${locale}/tools/${tool.id}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function generateBreadcrumbSchema(
  locale: string,
  categoryLabel: string,
  categorySlug: string,
  toolName: string,
  toolId: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: categoryLabel, item: `${SITE_URL}/${locale}/tools/${categorySlug}` },
      { '@type': 'ListItem', position: 3, name: toolName, item: `${SITE_URL}/${locale}/tools/${toolId}` },
    ],
  };
}

export function generateFaqSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function generateHowToSchema(toolName: string, steps: Array<{ name: string; text: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${toolName}`,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function generateBlogMeta(
  locale: string,
  title: string,
  description: string,
  slug: string,
): Metadata {
  const url = `${SITE_URL}/${locale}/blog/${slug}`;
  const locales = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'es', 'ja'];
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => { alternates[loc] = `${SITE_URL}/${loc}/blog/${slug}`; });
  alternates['x-default'] = `${SITE_URL}/en/blog/${slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: alternates },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
      },
    },
  };
}

export function generateBlogIndexMeta(locale: string, title: string, description: string): Metadata {
  const url = `${SITE_URL}/${locale}/blog`;
  const locales = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'es', 'ja'];
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => { alternates[loc] = `${SITE_URL}/${loc}/blog`; });
  alternates['x-default'] = `${SITE_URL}/en/blog`;
  return {
    title,
    description,
    alternates: { canonical: url, languages: alternates },
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

export function generateBlogPostingSchema(
  title: string,
  description: string,
  slug: string,
  locale: string,
  publishedAt: string,
  updatedAt?: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url: `${SITE_URL}/${locale}/blog/${slug}`,
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: locale,
  };
}

export function generateCategoryMeta(
  locale: string,
  categoryLabel: string,
  categoryDesc: string,
  categorySlug: string,
): Metadata {
  const url = `${SITE_URL}/${locale}/tools/${categorySlug}`;
  const locales = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'es', 'ja'];
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => { alternates[loc] = `${SITE_URL}/${loc}/tools/${categorySlug}`; });
  alternates['x-default'] = `${SITE_URL}/en/tools/${categorySlug}`;
  return {
    title: categoryLabel,
    description: categoryDesc,
    alternates: { canonical: url, languages: alternates },
    openGraph: {
      title: `${categoryLabel} | ${SITE_NAME}`,
      description: categoryDesc,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryLabel} | ${SITE_NAME}`,
      description: categoryDesc,
    },
    robots: { index: true, follow: true },
  };
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { blogPostList } from '@/data/blog/registry';
import { BlogGrid } from '@/components/blog/BlogGrid';
import { generateBlogIndexMeta } from '@/lib/utils/seo';
import type { ToolMode } from '@/types/tools';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  const tb = await getTranslations({ locale, namespace: 'Metadata' });
  const title = `${t('heroTitle')} | ${tb('siteName')}`;
  const desc = t('heroDesc', { count: blogPostList.length });
  return generateBlogIndexMeta(locale, title, desc);
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tn = await getTranslations({ locale, namespace: 'ToolNames' });
  const td = await getTranslations({ locale, namespace: 'ToolDescriptions' });
  const tb = await getTranslations({ locale, namespace: 'Blog' });

  const toolNames: Record<string, string> = {};
  const toolDescs: Record<string, string> = {};
  for (const post of blogPostList) {
    try {
      toolNames[post.toolId] = tn(post.toolId as ToolMode);
      toolDescs[post.toolId] = td(post.toolId as ToolMode);
    } catch {
      toolNames[post.toolId] = post.toolId;
      toolDescs[post.toolId] = '';
    }
  }

  const categoryLabels: Record<string, string> = {
    image:   tb('categoryImage'),
    pdf:     tb('categoryPdf'),
    dev:     tb('categoryDev'),
    calc:    tb('categoryCalc'),
    game:    tb('categoryGame'),
    audio:   tb('categoryAudio'),
    encode:  tb('categoryEncode'),
    finance: tb('categoryFinance'),
    light:   tb('categoryLight'),
  };

  return (
    <BlogGrid
      posts={blogPostList}
      locale={locale}
      toolNames={toolNames}
      toolDescs={toolDescs}
      heroTitle={tb('heroTitle')}
      heroDesc={tb('heroDesc', { count: blogPostList.length })}
      filterAllLabel={tb('filterAll')}
      tutorialsLabel={tb('tutorials')}
      featuredGuidesLabel={tb('featuredGuides')}
      categoryLabels={categoryLabels}
      readGuideLabel={tb('readGuide')}
      featuredBadgeLabel={tb('featuredBadge')}
      howToUseLabel={tb('howToUse')}
      previousLabel={tb('previous')}
      nextLabel={tb('next')}
    />
  );
}

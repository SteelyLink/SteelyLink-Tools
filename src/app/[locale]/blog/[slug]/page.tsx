import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { blogRegistry, blogPostList } from '@/data/blog/registry';
import { toolRegistry } from '@/lib/tools/registry';
import { getEnhancedContent } from '@/lib/blog/content';
import { generateAutoContent } from '@/lib/blog/generator';
import { generateBlogMeta, generateBlogPostingSchema, generateFaqSchema } from '@/lib/utils/seo';
import { BlogPostLayout } from '@/components/blog/BlogPostLayout';
import type { ToolMode } from '@/types/tools';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    blogPostList.map((post) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = blogRegistry[slug];
  if (!post) return {};

  const tn = await getTranslations({ locale, namespace: 'ToolNames' });
  const td = await getTranslations({ locale, namespace: 'ToolDescriptions' });
  const tb = await getTranslations({ locale, namespace: 'Blog' });
  let toolName = slug;
  let toolDesc = '';
  try { toolName = tn(post.toolId as ToolMode); } catch { /* use fallback */ }
  try { toolDesc = td(post.toolId as ToolMode); } catch { /* use fallback */ }

  const enhanced = await getEnhancedContent(slug, locale);
  const title = enhanced?.metaTitle ?? tb('articleMetaTitle', { tool: toolName });
  const description = enhanced?.metaDescription ?? (toolDesc
    ? tb('articleMetaDesc', { desc: toolDesc.slice(0, 140) })
    : `Step-by-step guide for ${toolName}. Free, browser-based, no registration required.`);
  return generateBlogMeta(locale, title, description, slug);
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = blogRegistry[slug];
  if (!post) notFound();

  const toolData = toolRegistry[post.toolId as ToolMode];
  if (!toolData) notFound();

  const tn   = await getTranslations({ locale, namespace: 'ToolNames' });
  const td   = await getTranslations({ locale, namespace: 'ToolDescriptions' });
  const tt   = await getTranslations({ locale, namespace: 'Tool' });
  const tb   = await getTranslations({ locale, namespace: 'Blog' });
  const th   = await getTranslations({ locale, namespace: 'Home' });
  const tnav = await getTranslations({ locale, namespace: 'Nav' });

  let toolName = post.toolId;
  let toolDesc = '';
  try { toolName = tn(post.toolId as ToolMode); } catch { /* use fallback */ }
  try { toolDesc = td(post.toolId as ToolMode); } catch { /* use fallback */ }

  const CATEGORY_HOME_KEY: Record<string, Parameters<typeof th>[0]> = {
    image: 'imageCategory', pdf: 'pdfCategory', dev: 'devCategory', light: 'lightCategory',
    calc: 'calcCategory', finance: 'financeCategory', encode: 'encodeCategory',
    audio: 'audioCategory', game: 'gameCategory', edit: 'editCategory',
  };
  const catLabel = th(CATEGORY_HOME_KEY[post.category] ?? 'lightCategory');

  const enhanced = await getEnhancedContent(slug, locale);
  const content = enhanced ?? generateAutoContent({
    toolId: post.toolId,
    toolName,
    toolDesc,
    toolData,
    tt: (key: string, values?: Record<string, string>) => {
      try {
        return tt(key as Parameters<typeof tt>[0], values as Record<string, string>);
      } catch {
        return key;
      }
    },
    tb: (key: string, values?: Record<string, string>) => {
      try {
        return tb(key as Parameters<typeof tb>[0], values as Record<string, string>);
      } catch {
        return key;
      }
    },
    locale,
  });

  const blogSchema = generateBlogPostingSchema(
    content.title,
    content.metaDescription,
    slug,
    locale,
    post.publishedAt,
  );

  const faqItems = (content.faqs ?? []).map((f) => ({ q: f.q, a: f.a }));
  const faqSchema = faqItems.length > 0 ? generateFaqSchema(faqItems) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <BlogPostLayout
        content={content}
        post={post}
        toolData={toolData}
        locale={locale}
        toolName={toolName}
        backLabel={tb('backToBlog')}
        tryToolLabel={tb('tryTool')}
        homeLabel={tnav('home')}
        catLabel={catLabel}
        featuredLabel={tb('featuredBadge')}
        freeNoRegistrationLabel={tb('freeNoRegistration')}
        stepByStepGuideLabel={tb('stepByStepGuide')}
        tipsLabel={tb('tipsAndPractices')}
        faqTitleLabel={tb('faqTitle')}
      />
    </>
  );
}

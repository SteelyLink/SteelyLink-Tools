import type { BlogPostContent } from '@/types/blog';

const CONTENT_FILES = [
  'image', 'image-extra', 'pdf', 'pdf-extra', 'dev', 'dev-extra',
  'game', 'game-extra', 'calc', 'calc-extra', 'utility',
] as const;

const localeCaches: Record<string, Record<string, BlogPostContent> | null> = {};

async function loadLocaleContent(locale: string): Promise<Record<string, BlogPostContent>> {
  const results = await Promise.allSettled(
    CONTENT_FILES.map((f) =>
      import(`@/data/blog/content/${locale}/${f}`).then((m) => m.default as Record<string, BlogPostContent>)
    )
  );
  const merged: Record<string, BlogPostContent> = {};
  for (const r of results) {
    if (r.status === 'fulfilled') Object.assign(merged, r.value);
  }
  return merged;
}

export async function getEnhancedContent(
  slug: string,
  locale: string
): Promise<BlogPostContent | null> {
  if (!localeCaches[locale]) {
    try {
      localeCaches[locale] = await loadLocaleContent(locale);
    } catch {
      localeCaches[locale] = null;
    }
  }
  return localeCaches[locale]?.[slug] ?? null;
}

import type { BlogPostMeta } from '@/types/blog';
import { toolRegistry } from '@/lib/tools/registry';
import type { ToolMode } from '@/types/tools';

export const FEATURED_TOOLS = new Set([
  'compress-image', 'remove-bg', 'png-to-jpg', 'resize-image', 'crop-image',
  'pdf-compress', 'pdf-to-word', 'merge-pdf',
  'json-formatter', 'base64', 'timestamp-converter',
  'cs2-to-valorant-sensitivity', 'aim-trainer', 'cps-test',
  'unit-converter', 'bmi-calculator', 'us-address-generator',
]);

export const blogRegistry: Record<string, BlogPostMeta> = Object.fromEntries(
  Object.keys(toolRegistry).map((toolId) => {
    const slug = `how-to-use-${toolId}`;
    const tool = toolRegistry[toolId as ToolMode];
    return [
      slug,
      {
        slug,
        toolId,
        category: tool.category,
        articleType: 'how-to' as const,
        publishedAt: '2026-05-10',
        featured: FEATURED_TOOLS.has(toolId),
      },
    ];
  })
);

export const blogPostList: BlogPostMeta[] = Object.values(blogRegistry);

export const blogPostsByCategory = blogPostList.reduce<Record<string, BlogPostMeta[]>>(
  (acc, post) => {
    if (!acc[post.category]) acc[post.category] = [];
    acc[post.category].push(post);
    return acc;
  },
  {}
);

export const featuredPosts = blogPostList.filter((p) => p.featured);

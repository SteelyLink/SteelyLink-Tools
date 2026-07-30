export interface BlogPostMeta {
  slug: string;
  toolId: string;
  category: string;
  articleType: 'how-to';
  publishedAt: string;
  featured?: boolean;
}

export interface BlogSection {
  heading: string;
  body: string;
}

export interface BlogPostContent {
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  intro: string;
  steps: BlogSection[];
  tips?: string[];
  faqs?: { q: string; a: string }[];
  conclusion?: string;
}

/**
 * Pre-build script: generates sitemap.xml, robots.txt, manifest.webmanifest,
 * feed.xml as static files in public/ so they work with `output: 'export'`.
 *
 * Run before `next build`: node scripts/generate-static.mjs
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ICON_VERSION } from './brand.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, '..', 'public');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tools.steelylink.com';

// --------------- helpers ---------------

async function loadRegistry() {
  const { readFileSync } = await import('fs');
  const content = readFileSync(join(__dirname, '..', 'messages', 'en.json'), 'utf8');
  return JSON.parse(content);
}

async function getToolIds() {
  // Read registry.ts to extract tool IDs — parse the toolRegistry keys
  const { readFileSync } = await import('fs');
  const registryPath = join(__dirname, '..', 'src', 'lib', 'tools', 'registry.ts');
  const content = readFileSync(registryPath, 'utf8');
  // Match toolRegistry entries: 'tool-id': {
  const matches = [...content.matchAll(/'([a-z0-9-]+)':\s*\{/g)];
  return matches.map(m => m[1]).filter(id =>
    !id.includes('formats') && !id.includes('max') && id.length > 2
  );
}

async function getBlogPosts() {
  // Blog posts are generated from tool IDs: slug = `how-to-use-${toolId}`
  const toolIds = await getToolIds();
  return toolIds.map(id => ({ slug: `how-to-use-${id}`, featured: false }));
}

const LOCALES = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'es', 'ja'];
const CATEGORY_SLUGS = [
  'image-tools', 'pdf-tools', 'dev-tools', 'utility-tools', 'calc-tools',
  'finance-tools', 'encode-tools', 'audio-tools', 'game-tools',
];

// --------------- sitemap.xml ---------------

async function generateSitemap() {
  const toolIds = await getToolIds();
  const blogPosts = await getBlogPosts();
  const now = new Date().toISOString().split('T')[0];

  const urls = [];

  // Home pages
  for (const locale of LOCALES) {
    urls.push(`  <url><loc>${SITE_URL}/${locale}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`);
  }

  // Tool pages
  for (const locale of LOCALES) {
    for (const tool of toolIds) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}/tools/${tool}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
    }
  }

  // Category pages
  for (const locale of LOCALES) {
    for (const slug of CATEGORY_SLUGS) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}/tools/${slug}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
    }
  }

  // Blog index
  for (const locale of LOCALES) {
    urls.push(`  <url><loc>${SITE_URL}/${locale}/blog</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
  }

  // Blog posts
  for (const locale of LOCALES) {
    for (const post of blogPosts) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}/blog/${post.slug}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>${post.featured ? '0.7' : '0.6'}</priority></url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  writeFileSync(join(PUBLIC, 'sitemap.xml'), xml, 'utf8');
  console.log(`✓ sitemap.xml (${urls.length} URLs)`);
}

// --------------- robots.txt ---------------

function generateRobots() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /_next/',
    '',
    'User-agent: GPTBot',
    'Allow: /',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: anthropic-ai',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    '',
    'User-agent: Claude-Web',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: Gemini',
    'Allow: /',
    '',
    'User-agent: Applebot-Extended',
    'Allow: /',
    '',
    'User-agent: YouBot',
    'Allow: /',
    '',
    'User-agent: cohere-ai',
    'Allow: /',
    '',
    'User-agent: AhrefsBot',
    'Disallow: /',
    '',
    'User-agent: SemrushBot',
    'Disallow: /',
    '',
    'User-agent: DotBot',
    'Disallow: /',
    '',
    'User-agent: MJ12bot',
    'Disallow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ];

  writeFileSync(join(PUBLIC, 'robots.txt'), lines.join('\n'), 'utf8');
  console.log('✓ robots.txt');
}

// --------------- manifest.webmanifest ---------------

function generateManifest() {
  const manifest = {
    name: 'SteelyLink Tools',
    short_name: 'SteelyLink Tools',
    description: 'Fast, free, privacy-first browser tools. 110 tools for image, PDF, dev, calculator, gaming, audio, and more. No login required.',
    start_url: '/en',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#6366f1',
    orientation: 'any',
    // The opaque tiles only. The favicons deliberately aren't listed: they're the mark on
    // transparency, which is right for a browser tab and wrong for a home screen, where
    // the launcher composites whatever is behind them.
    //
    // Nothing here declares `maskable`: the mark sits 12% in from the edge, which survives
    // a rounded-rect mask but not the circle Android may apply, and a wrongly-declared
    // maskable icon gets its corners cropped.
    icons: [
      { src: `/apple-touch-icon.png?v=${ICON_VERSION}`, sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: `/icon-192.png?v=${ICON_VERSION}`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `/icon-512.png?v=${ICON_VERSION}`, sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    categories: ['utilities', 'productivity'],
  };

  writeFileSync(join(PUBLIC, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✓ manifest.webmanifest');
}

// --------------- feed.xml ---------------

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function generateFeed() {
  const en = await loadRegistry();
  const blogPosts = await getBlogPosts();
  const toolNames = en.ToolNames || {};
  const toolDescs = en.ToolDescriptions || {};

  const items = blogPosts.slice(0, 100).map((post) => {
    const toolId = post.slug.replace('how-to-use-', '');
    const url = `${SITE_URL}/en/blog/${post.slug}`;
    const name = toolNames[toolId] || toolId;
    const title = `How to Use ${name}`;
    const desc = toolDescs[toolId] || `Step-by-step guide for ${name}.`;
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(desc)}</description>
      <category>utility</category>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SteelyLink Tools — Tool Guides &amp; Tutorials</title>
    <link>${SITE_URL}/en/blog</link>
    <description>Step-by-step guides for 110+ free browser tools. No signup required.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>noreply@steelylink.com (SteelyLink Tools)</managingEditor>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  writeFileSync(join(PUBLIC, 'feed.xml'), xml, 'utf8');
  console.log(`✓ feed.xml (${blogPosts.length} items)`);
}

// --------------- run all ---------------

async function main() {
  console.log('Generating static files...\n');
  generateRobots();
  generateManifest();
  await generateSitemap();
  await generateFeed();
  console.log('\nDone!');
}

main().catch(console.error);

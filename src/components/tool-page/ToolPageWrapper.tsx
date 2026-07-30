import { getTranslations } from 'next-intl/server';
import type { ToolDefinition } from '@/types/tools';
import { ImageConverterCore } from '@/components/tools/ImageConverterCore';
import { ImageEditorCore } from '@/components/tools/ImageEditorCore';
import { ImageCropResizeCore } from '@/components/tools/ImageCropResizeCore';
import { DevToolCore } from '@/components/tools/DevToolCore';
import { LightToolCore } from '@/components/tools/LightToolCore';
import { PDFToolCore } from '@/components/tools/PDFToolCore';
import { TextEncoderCore } from '@/components/tools/TextEncoderCore';
import { NotepadCore } from '@/components/tools/NotepadCore';
import { CalculatorCore } from '@/components/tools/CalculatorCore';
import { AudioCore } from '@/components/tools/AudioCore';
import { ImageEditingCore } from '@/components/tools/ImageEditingCore';
import { GamingCore } from '@/components/tools/GamingCore';
import { VideoGifCore } from '@/components/tools/VideoGifCore';
import { TechBadge } from '@/components/tools/TechBadge';
import { HowToUse } from './HowToUse';
import { SeoContent } from './SeoContent';
import { FAQ } from './FAQ';
import { RelatedTools } from './RelatedTools';
import { RelatedArticles } from '@/components/blog/RelatedArticles';

interface Props {
  tool: ToolDefinition;
  locale: string;
  toolName: string;
  toolDescription: string;
}

// Image formats that identify a converter mode (e.g. "png-to-jpg", "svg-to-png")
const IMAGE_FORMATS = new Set(['png', 'jpg', 'webp', 'svg', 'avif', 'heic']);

type BadgeMode = 'ai-bg' | 'converter';

function getBadgeMode(id: string): BadgeMode | null {
  if (id === 'remove-bg') return 'ai-bg';
  if (id === 'compress-image' || parseConverterMode(id) !== null) return 'converter';
  return null;
}

function parseConverterMode(id: string): { from: string; to: string } | null {
  const parts = id.split('-to-');
  if (parts.length === 2 && IMAGE_FORMATS.has(parts[0]) && IMAGE_FORMATS.has(parts[1])) {
    return { from: parts[0], to: parts[1] };
  }
  return null;
}

function ToolComponent({ tool }: { tool: ToolDefinition }) {
  switch (tool.category) {
    case 'image':
    case 'edit': {
      if (tool.id === 'video-to-gif' || tool.id === 'mp4-to-gif') {
        return <VideoGifCore mode={tool.id} />;
      }
      const converter = parseConverterMode(tool.id as string);
      if (converter) {
        return <ImageConverterCore defaultFrom={converter.from} defaultTo={converter.to} />;
      }
      if (tool.id === 'crop-image') return <ImageCropResizeCore defaultMode="crop" />;
      if (tool.id === 'resize-image') return <ImageCropResizeCore defaultMode="resize" />;
      if (['remove-bg', 'add-watermark', 'drawing-canvas', 'image-batch'].includes(tool.id as string)) {
        return <ImageEditingCore mode={tool.id as Parameters<typeof ImageEditingCore>[0]['mode']} />;
      }
      return (
        <ImageEditorCore
          mode={tool.id as Parameters<typeof ImageEditorCore>[0]['mode']}
          maxFileSizeMB={tool.maxFileSizeMB}
          acceptedFormats={tool.acceptedFormats}
        />
      );
    }
    case 'pdf':
      return <PDFToolCore mode={tool.id as Parameters<typeof PDFToolCore>[0]['mode']} />;
    case 'dev':
      return <DevToolCore mode={tool.id as Parameters<typeof DevToolCore>[0]['mode']} />;
    case 'light':
      return <LightToolCore mode={tool.id as Parameters<typeof LightToolCore>[0]['mode']} />;
    case 'calc':
    case 'finance':
      return <CalculatorCore mode={tool.id} />;
    case 'encode':
      if (tool.id === 'online-notepad') return <NotepadCore />;
      return <TextEncoderCore mode={tool.id} />;
    case 'audio':
      return <AudioCore mode={tool.id as Parameters<typeof AudioCore>[0]['mode']} />;
    case 'game':
      return <GamingCore mode={tool.id as Parameters<typeof GamingCore>[0]['mode']} />;
    default:
      return null;
  }
}

export async function ToolPageWrapper({ tool, locale, toolName, toolDescription }: Props) {
  const t = await getTranslations({ locale, namespace: 'Tool' });
  const tn = await getTranslations({ locale, namespace: 'Nav' });
  const th = await getTranslations({ locale, namespace: 'Home' });
  const tb = await getTranslations({ locale, namespace: 'Blog' });

  const categoryLabelMap: Record<string, string> = {
    image:  th('imageCategory'),
    pdf:    th('pdfCategory'),
    dev:    th('devCategory'),
    light:  th('lightCategory'),
    calc:   th('calcCategory'),
    finance: th('financeCategory'),
    encode: th('encodeCategory'),
    audio:  th('audioCategory'),
    edit:   th('editCategory'),
    game:   th('gameCategory'),
  };
  const categoryLabel = categoryLabelMap[tool.category] ?? tool.category;

  const CATEGORY_SLUG: Record<string, string> = {
    image: 'image-tools', pdf: 'pdf-tools', dev: 'dev-tools',
    light: 'utility-tools', calc: 'calc-tools', finance: 'finance-tools',
    encode: 'encode-tools', audio: 'audio-tools', game: 'game-tools', edit: 'image-tools',
  };

  const wide = tool.category === 'image' || tool.category === 'edit';

  return (
    <div className={`${wide ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-6 md:px-8 pt-28 pb-20`}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <a href={`/${locale}`} className="hover:text-slate-300 transition-colors">{tn('home')}</a>
        <span>/</span>
        <a href={`/${locale}/tools/${CATEGORY_SLUG[tool.category] ?? tool.category + '-tools'}`} className="hover:text-slate-300 transition-colors">
          {categoryLabel}
        </a>
        <span>/</span>
        <span className="text-slate-300">{toolName}</span>
      </nav>

      {/* Tool header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.iconBgClass} flex items-center justify-center border`}>
            <span className={`material-symbols-outlined text-lg ${tool.colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {tool.icon}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              {t('free')}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              {th('badge1')}
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-50 tracking-tight">{toolName}</h1>
        <p className="text-slate-400 mt-2 leading-relaxed">{toolDescription}</p>
        {getBadgeMode(tool.id as string) && <TechBadge mode={getBadgeMode(tool.id as string)!} />}
      </div>

      {/* Main tool UI */}
      <div className="card-surface p-4 sm:p-6 mb-8">
        <ToolComponent tool={tool} />
      </div>

      {/* How to use */}
      <HowToUse toolName={toolName} toolId={tool.id} />

      {/* SEO content */}
      <SeoContent toolId={tool.id} toolName={toolName} locale={locale} />

      {/* FAQ */}
      <FAQ toolId={tool.id} toolName={toolName} locale={locale} />

      {/* Related article */}
      <RelatedArticles
        toolId={tool.id as string}
        locale={locale}
        toolName={toolName}
        sectionLabel={tb('relatedArticle')}
        tutorialLabel={tb('tutorial')}
        titleLabel={tb('relatedArticleTitle', { tool: toolName })}
      />

      {/* Related tools */}
      <RelatedTools tool={tool} locale={locale} />

    </div>
  );
}

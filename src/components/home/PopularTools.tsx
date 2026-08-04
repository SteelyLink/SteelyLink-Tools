import { getTranslations } from 'next-intl/server';
import { popularTools, toolRegistry } from '@/lib/tools/registry';

interface Props {
  locale: string;
}

export async function PopularTools({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'Home' });
  const tn = await getTranslations({ locale, namespace: 'ToolNames' });
  const td = await getTranslations({ locale, namespace: 'ToolDescriptions' });

  return (
    <section id="popular">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-title">{t('popularTitle')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('popularSubtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {popularTools.map((toolId) => {
          const tool = toolRegistry[toolId];
          const isImageConverter = toolId === 'png-to-jpg';
          return (
            <a
              key={toolId}
              href={`/${locale}/tools/${toolId}`}
              className="group flex items-start gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/30"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${tool.iconBgClass} flex items-center justify-center border`}>
                <span
                  className={`material-symbols-outlined text-lg ${tool.colorClass}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {tool.icon}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors truncate">
                  {isImageConverter ? t('imageConverterName') : tn(toolId)}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed line-clamp-2">
                  {isImageConverter ? t('imageConverterDesc') : td(toolId)}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* All tools section by category */}
      <AllToolsByCategory locale={locale} />
    </section>
  );
}

async function AllToolsByCategory({ locale }: { locale: string }) {
  const tn = await getTranslations({ locale, namespace: 'ToolNames' });
  const th = await getTranslations({ locale, namespace: 'Home' });
  const { toolsByCategory } = await import('@/lib/tools/registry');

  const sections = [
    { id: 'image-tools', key: 'image', labelKey: 'imageCategory', icon: 'image', color: 'text-indigo-400' },
    { id: 'pdf-tools', key: 'pdf', labelKey: 'pdfCategory', icon: 'picture_as_pdf', color: 'text-red-400' },
    { id: 'dev-tools', key: 'dev', labelKey: 'devCategory', icon: 'terminal', color: 'text-purple-400' },
    { id: 'utility-tools', key: 'light', labelKey: 'lightCategory', icon: 'apps', color: 'text-amber-400' },
    { id: 'calc-tools', key: 'calc', labelKey: 'calcCategory', icon: 'calculate', color: 'text-emerald-400' },
    { id: 'finance-tools', key: 'finance', labelKey: 'financeCategory', icon: 'account_balance', color: 'text-yellow-400' },
    { id: 'encode-tools', key: 'encode', labelKey: 'encodeCategory', icon: 'code', color: 'text-violet-400' },
    { id: 'audio-tools', key: 'audio', labelKey: 'audioCategory', icon: 'audio_file', color: 'text-pink-400' },
    { id: 'game-tools', key: 'game', labelKey: 'gameCategory', icon: 'sports_esports', color: 'text-green-400' },
  ] as const;

  return (
    <div className="mt-16 space-y-12">
      {sections.map((section) => {
        const GAME_MAIN_TOOLS = new Set(['sensitivity-converter', 'aim-trainer', 'cps-test', 'reaction-test']);
        const IMAGE_FORMAT_CONVERTERS = new Set([
          'jpg-to-png', 'webp-to-jpg', 'jpg-to-webp', 'webp-to-png', 'png-to-webp',
          'heic-to-jpg', 'heic-to-png', 'avif-to-jpg', 'avif-to-png', 'svg-to-png', 'svg-to-jpg',
          'mp4-to-gif',
        ]);
        const allTools = toolsByCategory[section.key];
        const tools = section.key === 'game'
          ? allTools.filter(t => GAME_MAIN_TOOLS.has(t.id))
          : section.key === 'image'
            ? allTools.filter(t => !IMAGE_FORMAT_CONVERTERS.has(t.id))
            : allTools;
        return (
          <div key={section.id} id={section.id}>
            <div className="flex items-center gap-2.5 mb-5">
              <span className={`material-symbols-outlined ${section.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {section.icon}
              </span>
              <h2 className="text-lg font-bold text-slate-200">{th(section.labelKey)}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {tools.map((tool) => (
                <a
                  key={tool.id}
                  href={`/${locale}/tools/${tool.id}`}
                  className="group flex items-center gap-2.5 p-3.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500/30 hover:bg-slate-800/50 transition-[border-color,background-color] duration-150"
                >
                  <span className={`material-symbols-outlined text-base ${tool.colorClass} flex-shrink-0`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {tool.icon}
                  </span>
                  <span className="text-slate-300 text-sm group-hover:text-white transition-colors truncate">
                    {tool.id === 'png-to-jpg' ? th('imageConverterName') : tn(tool.id)}
                  </span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

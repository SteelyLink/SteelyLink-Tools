import { getTranslations } from 'next-intl/server';
import { toolsByCategory } from '@/lib/tools/registry';

interface Props {
  locale: string;
}

export async function Footer({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'Footer' });
  const tn = await getTranslations({ locale, namespace: 'ToolNames' });

  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a
              href={`/${locale}`}
              className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-3 hover:text-white transition-colors"
            >
              <span
                className="material-symbols-outlined text-indigo-400 text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                widgets
              </span>
              SteelyLink Tools
            </a>
            <p className="text-slate-500 text-sm leading-relaxed">{t('tagline')}</p>
          </div>

          {/* Image Tools */}
          <div>
            <h3 className="text-slate-300 font-semibold text-sm mb-3">{t('imageTools')}</h3>
            <ul className="space-y-2">
              {toolsByCategory.image.slice(0, 5).map((tool) => (
                <li key={tool.id}>
                  <a
                    href={`/${locale}/tools/${tool.id}`}
                    className="text-slate-500 text-sm hover:text-indigo-400 transition-colors"
                  >
                    {tn(tool.id)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* PDF & Dev Tools */}
          <div>
            <h3 className="text-slate-300 font-semibold text-sm mb-3">{t('pdfTools')}</h3>
            <ul className="space-y-2">
              {toolsByCategory.pdf.map((tool) => (
                <li key={tool.id}>
                  <a
                    href={`/${locale}/tools/${tool.id}`}
                    className="text-slate-500 text-sm hover:text-indigo-400 transition-colors"
                  >
                    {tn(tool.id)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Dev Tools */}
          <div>
            <h3 className="text-slate-300 font-semibold text-sm mb-3">{t('devTools')}</h3>
            <ul className="space-y-2">
              {toolsByCategory.dev.slice(0, 4).map((tool) => (
                <li key={tool.id}>
                  <a
                    href={`/${locale}/tools/${tool.id}`}
                    className="text-slate-500 text-sm hover:text-indigo-400 transition-colors"
                  >
                    {tn(tool.id)}
                  </a>
                </li>
              ))}
              {toolsByCategory.light.slice(0, 2).map((tool) => (
                <li key={tool.id}>
                  <a
                    href={`/${locale}/tools/${tool.id}`}
                    className="text-slate-500 text-sm hover:text-indigo-400 transition-colors"
                  >
                    {tn(tool.id)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">{t('copyright', { year })}</p>
          <div className="flex gap-5 text-xs text-slate-500">
            <a href={`/${locale}/privacy`} className="hover:text-indigo-400 transition-colors">
              {t('privacy')}
            </a>
            <a href={`/${locale}/terms`} className="hover:text-indigo-400 transition-colors">
              {t('terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

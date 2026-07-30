'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const IMAGE_FORMATS = new Set(['png', 'jpg', 'webp', 'svg', 'avif', 'heic']);

interface TabDef {
  mode: string;
  label: string;
  icon: string;
  converterGroup: boolean;
  extraModes?: string[];
}

function isConverterMode(mode: string): boolean {
  const parts = mode.split('-to-');
  return parts.length === 2 && IMAGE_FORMATS.has(parts[0]) && IMAGE_FORMATS.has(parts[1]);
}

export function ImageTabBar({ mode }: { mode: string }) {
  const t = useTranslations('Tool');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const converter = isConverterMode(mode);

  const TABS: TabDef[] = [
    { mode: 'png-to-jpg',     label: t('tabConvert'),    icon: 'sync',                    converterGroup: true  },
    { mode: 'video-to-gif',   label: t('tabVideoToGif'), icon: 'animation',               converterGroup: false, extraModes: ['mp4-to-gif'] },
    { mode: 'compress-image', label: t('tabCompress'),   icon: 'compress',                converterGroup: false },
    { mode: 'remove-bg',      label: t('tabRemoveBg'),   icon: 'auto_fix_high',           converterGroup: false },
    { mode: 'resize-image',   label: t('tabResize'),     icon: 'photo_size_select_large', converterGroup: false },
    { mode: 'crop-image',     label: t('tabCrop'),       icon: 'crop',                    converterGroup: false },
    { mode: 'rotate-image',   label: t('tabRotate'),     icon: 'rotate_right',            converterGroup: false },
    { mode: 'image-filter',   label: t('tabFilter'),     icon: 'auto_fix_high',           converterGroup: false },
    { mode: 'add-watermark',  label: t('tabWatermark'),  icon: 'water_drop',              converterGroup: false },
    { mode: 'drawing-canvas', label: t('tabDraw'),       icon: 'brush',                   converterGroup: false },
    { mode: 'image-batch',    label: t('tabBatch'),      icon: 'burst_mode',              converterGroup: false },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
      {TABS.map(tab => {
        const active = tab.converterGroup
          ? converter
          : mode === tab.mode || (tab.extraModes?.includes(mode) ?? false);
        return (
          <Link
            key={tab.mode}
            href={`/${locale}/tools/${tab.mode}`}
            title={tab.label}
            className={`flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-semibold rounded-lg transition-all ${
              active
                ? 'bg-indigo-600 text-white shadow-md pointer-events-none'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="text-[9px] sm:text-sm leading-none">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

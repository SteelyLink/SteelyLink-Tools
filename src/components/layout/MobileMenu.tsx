'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { scrollToSection } from '@/lib/utils/scroll';
import { SectionLink } from './SectionLink';

interface Props {
  locale: string;
  navLinks: { href: string; label: string; sectionId?: string }[];
  getStartedLabel: string;
}

export function MobileMenu({ locale, navLinks, getStartedLabel }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Nav');

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-400 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 py-4 px-6 space-y-3 animate-fade-in">
          {navLinks.map((link) => {
            const className = 'block text-slate-300 hover:text-white py-2 transition-colors';
            return link.sectionId ? (
              <SectionLink
                key={link.label}
                {...link}
                sectionId={link.sectionId}
                className={className}
                onNavigate={() => setOpen(false)}
              />
            ) : (
              <a key={link.label} href={link.href} className={className}>
                {link.label}
              </a>
            );
          })}
          <button
            onClick={() => {
              setOpen(false);
              scrollToSection('categories');
            }}
            className="block w-full btn-primary text-center text-sm mt-2"
          >
            {getStartedLabel}
          </button>

          <div className="border-t border-slate-800 mt-4 pt-4">
            <p className="text-xs text-slate-500 mb-1">{t('author')}</p>
            <p className="text-sm font-semibold text-slate-200 mb-3">临客SteelyLink</p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Bilibili', url: 'https://space.bilibili.com/1331775678' },
                { name: 'Douyin', url: 'https://v.douyin.com/PbvM67ubT4s/' },
                { name: 'Xiaohongshu', url: 'https://xhslink.cn/m/3SBQU52B7eA' },
                { name: 'YouTube', url: 'https://www.youtube.com/@SteelyLink' },
                { name: 'Buy Me a Coffee', url: 'https://buymeacoffee.com/steelylink' },
                { name: 'Patreon', url: 'https://www.patreon.com/SteelyLink' },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

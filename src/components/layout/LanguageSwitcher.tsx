'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { routing } from '@/i18n/routing';

interface LocaleInfo { label: string; code: string }

const localeInfo: Record<string, LocaleInfo> = {
  en:      { label: 'English',    code: 'EN' },
  'zh-cn': { label: '中文（简体）', code: 'CN' },
  'zh-tw': { label: '中文（繁体）（中国台湾）', code: 'TW' },
  'zh-hk': { label: '中文（繁体）（中国香港）', code: 'HK' },
  es:      { label: 'Español',    code: 'ES' },
  ja:      { label: '日本語',     code: 'JP' },
};

interface Props {
  locale: string;
}

export function LanguageSwitcher({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(newLocale: string) {
    if (newLocale === locale) { setOpen(false); return; }
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    localStorage.setItem('preferred-locale', newLocale);
    document.cookie = `preferred-locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.push(newPath);
    setOpen(false);
  }

  const current = localeInfo[locale] ?? localeInfo.en;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        aria-label="Switch language"
      >
        <span className="text-xs font-bold font-mono text-slate-300 w-5 text-center">{current.code}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-max min-w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/40 py-1 z-50 animate-fade-in">
          {([...routing.locales] as string[]).map((loc) => {
            const info = localeInfo[loc] ?? localeInfo.en;
            return (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-slate-800 ${
                  loc === locale ? 'text-indigo-400 font-medium' : 'text-slate-300'
                }`}
              >
                <span className="text-xs font-bold font-mono w-5 text-center flex-shrink-0">{info.code}</span>
                <span className="whitespace-nowrap">{info.label}</span>
                {loc === locale && (
                  <svg className="w-3.5 h-3.5 ml-auto text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

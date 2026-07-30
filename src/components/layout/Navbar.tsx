import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { GetStartedButton } from './GetStartedButton';
import { AboutDropdown } from './AboutDropdown';
interface Props {
  locale: string;
}

export async function Navbar({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'Nav' });

  const navLinks = [
    { href: `/${locale}#categories`, label: t('tools') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}#popular`, label: t('resources') },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-slate-900/95 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href={`/${locale}`}
            className="text-xl font-bold tracking-tight text-slate-50 flex items-center gap-2 hover:text-white transition-colors"
          >
            <span
              className="material-symbols-outlined text-indigo-400 text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              widgets
            </span>
            <span>SteelyLink Tools</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <AboutDropdown />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <GetStartedButton
            label={t('getStarted')}
            className="hidden sm:inline-flex btn-primary text-sm py-2 px-4"
          />
          <MobileMenu locale={locale} navLinks={navLinks} getStartedLabel={t('getStarted')} />
        </div>
      </div>
    </nav>
  );
}

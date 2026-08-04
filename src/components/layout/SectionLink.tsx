'use client';

import { scrollToSection } from '@/lib/utils/scroll';

interface Props {
  href: string;
  sectionId: string;
  label: string;
  className?: string;
  onNavigate?: () => void;
}

/**
 * A navbar link that points at a section of the home page.
 *
 * The href deliberately carries no fragment. A fragment navigation stays within the
 * loaded document, so WebKit parses nothing and writes no icon entry for the new URL —
 * `/zh-hk#popular` drew a globe in Safari's history for exactly this reason. See the
 * note in src/app/layout.tsx. Scrolling leaves the URL untouched, so there is nothing
 * for WebKit to record and nothing to get wrong.
 *
 * Off the home page the section isn't in the document, so the click falls through and
 * the browser follows the href as a normal document load.
 */
export function SectionLink({ href, sectionId, label, className, onNavigate }: Props) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        if (scrollToSection(sectionId)) e.preventDefault();
        onNavigate?.();
      }}
    >
      {label}
    </a>
  );
}

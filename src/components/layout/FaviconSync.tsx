'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Re-declares the tab icon after a client-side navigation.
 *
 * WebKit resolves the icon once, while it parses the document, and doesn't look again on
 * a pushState navigation. The icon it holds is keyed per URL, so every page reached by a
 * link inside the app keeps whatever the entry document resolved — which is why the mark
 * appeared on a cold load of the home page and nowhere else, and why nothing done to the
 * artwork or the cache headers moved it.
 *
 * Replacing the <link> nodes is a mutation the icon loader does watch. The href has to
 * differ from the one already in the document or WebKit reads it as unchanged, so the two
 * forms are alternated rather than made unique — that keeps it at two cache entries per
 * file instead of one per navigation.
 */
export default function FaviconSync() {
  const pathname = usePathname();

  useEffect(() => {
    document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((link) => {
      const href = link.getAttribute('href') ?? '';
      const fresh = link.cloneNode(true) as HTMLLinkElement;
      fresh.setAttribute('href', href.includes('?') ? href.split('?')[0] : `${href}?r`);
      link.replaceWith(fresh);
    });
  }, [pathname]);

  return null;
}

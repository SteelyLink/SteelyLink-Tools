'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Re-declares the tab icon after a client-side navigation.
 *
 * WebKit resolves the icon while it parses the document and doesn't look again on a
 * pushState navigation, so every page reached by a link inside the app inherits whatever
 * the entry document resolved — which is why the mark appeared on a cold load of the home
 * page and nowhere else.
 *
 * Two rules here, both learned by breaking them:
 *
 *   The first render does nothing. The parser has already resolved the icon at that
 *   point, and touching the links only throws that away.
 *
 *   The href is never modified. Pointing a link at a fresh URL to force a re-fetch loses
 *   the icon outright rather than reloading it.
 *
 * So all this does is detach the existing nodes and reattach the same ones, in the same
 * order, one frame apart — the removal and the insertion land as two separate mutations,
 * which is what gives the icon loader something to react to.
 */
export default function FaviconSync() {
  const pathname = usePathname();
  const parsed = useRef(false);

  useEffect(() => {
    if (!parsed.current) {
      parsed.current = true;
      return;
    }

    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]'));
    if (links.length === 0) return;

    const clones = links.map((link) => link.cloneNode(true) as HTMLLinkElement);
    links.forEach((link) => link.remove());

    const frame = requestAnimationFrame(() => {
      clones.forEach((clone) => document.head.appendChild(clone));
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

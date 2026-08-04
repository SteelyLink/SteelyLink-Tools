/**
 * Smooth-scrolls a home-page section into view, clearing the fixed navbar.
 *
 * Returns false when the section isn't on the current page, so a caller that started
 * from a link can fall through and let the browser navigate instead.
 */
export function scrollToSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });

  // CategoryGridClient rings the grid when it sees this, once the scroll has landed.
  if (id === 'categories') {
    setTimeout(() => window.dispatchEvent(new CustomEvent('highlight-categories')), 500);
  }
  return true;
}

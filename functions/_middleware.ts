const SUPPORTED_LOCALES = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'es', 'ja'];

const SPANISH_COUNTRIES = new Set([
  'ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY',
  'GT', 'CU', 'DO', 'HN', 'SV', 'NI', 'CR', 'PA', 'GQ', 'PR',
]);

function localeFromCountry(cc: string): string {
  switch (cc.toUpperCase()) {
    case 'CN': return 'zh-cn';
    case 'TW': return 'zh-tw';
    case 'HK':
    case 'MO': return 'zh-hk';
    case 'JP': return 'ja';
    default:
      return SPANISH_COUNTRIES.has(cc.toUpperCase()) ? 'es' : 'en';
  }
}

function detectLocale(request: Request): string {
  // 1. Saved user preference cookie
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/preferred-locale=([a-z-]+)/);
  if (match && SUPPORTED_LOCALES.includes(match[1])) return match[1];

  // 2. Cloudflare IP geolocation
  // @ts-ignore — cf is available on Cloudflare Workers
  const country = (request as any).cf?.country || '';
  if (country && country !== 'XX') return localeFromCountry(country);

  // 3. Timezone cookie
  const tzMatch = cookie.match(/tz-locale=([a-z-]+)/);
  if (tzMatch && SUPPORTED_LOCALES.includes(tzMatch[1])) return tzMatch[1];

  // 4. Accept-Language
  const al = request.headers.get('accept-language') || '';
  const lang = al.split(',')[0]?.split(';')[0]?.trim().toLowerCase() || '';
  if (lang === 'zh-tw') return 'zh-tw';
  if (lang === 'zh-hk' || lang === 'zh-hant') return 'zh-hk';
  if (lang === 'zh' || lang.startsWith('zh-')) return 'zh-cn';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('es')) return 'es';
  return 'en';
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const { pathname } = url;

  // Only intercept root path — let everything else pass through to static files
  if (pathname === '/') {
    const locale = detectLocale(context.request);
    return Response.redirect(new URL(`/${locale}`, url.origin).toString(), 302);
  }

  return context.next();
};

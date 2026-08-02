/**
 * BIN lookup.
 *
 * This used to ask binlist.net first and return its answer whenever *any* field came
 * back, only falling through to handyapi when binlist gave nothing at all. Both halves
 * of that were wrong:
 *
 *   - binlist frequently answers with holes. BIN 601100 comes back with a scheme, a
 *     type and a country but `"bank": {}` — an empty object, so the issuer renders as
 *     unknown even though handyapi knows it is "DISCOVER ISSUER". Because the old
 *     `hasData` check only needed one field, the fallback that had the answer was
 *     never consulted.
 *   - the partial answer was then sent with `max-age=86400`, so a single unlucky
 *     lookup stuck for a day.
 *
 * Between those two, the same BIN could look complete on one device and half-unknown
 * on another. So: query the providers together, merge them field by field, and only
 * cache hard once the result actually has an issuer and a country.
 */

type Bank = { name?: string; url?: string; phone?: string; city?: string };
type Country = { name?: string; alpha2?: string; emoji?: string; currency?: string };

type BinInfo = {
  scheme: string | null;
  type: string | null;
  brand: string | null;
  category: string | null;
  prepaid: boolean | null;
  bank: Bank | null;
  country: Country | null;
};

const TIMEOUT_MS = 5000;
const COMPLETE_TTL = 604800; // 7 days — an issued BIN's bank and country don't move.
const PARTIAL_TTL = 300; // 5 minutes — long enough to absorb a retry, short enough to heal.

/** Treats empty strings, `{}` and provider placeholders as absent. */
function clean(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const lowered = trimmed.toLowerCase();
  if (lowered === 'null' || lowered === 'unknown' || lowered === 'n/a') return undefined;
  return trimmed;
}

const firstOf = (...values: unknown[]): string | null => {
  for (const value of values) {
    const c = clean(value);
    if (c) return c;
  }
  return null;
};

const lower = (value: unknown): string | undefined => clean(value)?.toLowerCase();

/**
 * Card network implied by the number itself. ISO/IEC 7812 issuer ranges are fixed, so
 * this is a guaranteed floor for the one field users always expect to see, even when
 * every provider is down or rate-limiting us.
 */
function schemeFromPrefix(bin: string): string | null {
  const n = (len: number) => Number(bin.slice(0, len));
  if (bin.startsWith('4')) return 'visa';
  if (n(2) >= 51 && n(2) <= 55) return 'mastercard';
  if (n(4) >= 2221 && n(4) <= 2720) return 'mastercard';
  if (n(2) === 34 || n(2) === 37) return 'amex';
  if (bin.startsWith('6011') || n(2) === 65 || (n(3) >= 644 && n(3) <= 649)) return 'discover';
  if (n(4) >= 3528 && n(4) <= 3589) return 'jcb';
  if (n(2) === 36 || n(2) === 38 || n(2) === 39 || (n(3) >= 300 && n(3) <= 305)) return 'diners club';
  if (n(2) === 62 || n(2) === 81) return 'unionpay';
  if (n(2) === 50 || (n(2) >= 56 && n(2) <= 58)) return 'maestro';
  return null;
}

async function getJson(url: string, headers: Record<string, string>): Promise<any | null> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null; // includes binlist's 429, which is common from a shared egress IP
    return await res.json();
  } catch {
    return null;
  }
}

const fromBinlist = (bin: string) =>
  getJson(`https://lookup.binlist.net/${bin}`, {
    'Accept-Version': '3',
    Accept: 'application/json',
  });

const fromHandyApi = (bin: string) =>
  getJson(`https://data.handyapi.com/bin/${bin}`, { Accept: 'application/json' });

function merge(bin: string, bl: any, ha: any): BinInfo {
  const haOk = ha && (ha.Status === 'SUCCESS' || ha.Scheme);
  const h = haOk ? ha : null;

  const bankName = firstOf(bl?.bank?.name, h?.Issuer);
  const bank: Bank = {};
  if (bankName) bank.name = bankName;
  const bankUrl = firstOf(bl?.bank?.url);
  if (bankUrl) bank.url = bankUrl;
  const bankPhone = firstOf(bl?.bank?.phone);
  if (bankPhone) bank.phone = bankPhone;
  const bankCity = firstOf(bl?.bank?.city);
  if (bankCity) bank.city = bankCity;

  const country: Country = {};
  // handyapi first for the name: binlist returns the ISO long form, e.g.
  // "United States of America (the)", which reads badly in a one-line result row.
  const countryName = firstOf(h?.Country?.Name, bl?.country?.name);
  if (countryName) country.name = countryName;
  const alpha2 = firstOf(bl?.country?.alpha2, h?.Country?.A2);
  if (alpha2) country.alpha2 = alpha2.toUpperCase();
  const emoji = firstOf(bl?.country?.emoji);
  if (emoji) country.emoji = emoji;
  const currency = firstOf(bl?.country?.currency, h?.Country?.Currency);
  if (currency) country.currency = currency;

  const prepaid =
    typeof bl?.prepaid === 'boolean'
      ? bl.prepaid
      : typeof h?.Prepaid === 'boolean'
        ? h.Prepaid
        : null;

  return {
    scheme: lower(bl?.scheme) ?? lower(h?.Scheme) ?? schemeFromPrefix(bin),
    type: lower(bl?.type) ?? lower(h?.Type) ?? null,
    brand: firstOf(bl?.brand, h?.CardTier),
    category: firstOf(h?.CardTier, bl?.brand),
    prepaid,
    bank: bank.name ? bank : null,
    country: country.alpha2 || country.name ? country : null,
  };
}

export const onRequest: PagesFunction = async (context) => {
  const bin = (context.params.bin as string).replace(/\D/g, '').slice(0, 8);

  if (bin.length < 6) {
    return Response.json(
      { error: 'Enter at least 6 digits' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // Normalised key so `/api/bin/411111` and `/api/bin/4111 11` share one entry, and so
  // a cached hit skips the upstream calls entirely — which also keeps us well under
  // binlist's per-IP rate limit, since every visitor shares this Worker's egress.
  const cacheKey = new Request(`${new URL(context.request.url).origin}/api/bin/${bin}`, {
    method: 'GET',
  });
  const cache = (globalThis as any).caches?.default;

  const cached = await cache?.match(cacheKey).catch(() => null);
  if (cached) return cached;

  const [bl, ha] = await Promise.all([fromBinlist(bin), fromHandyApi(bin)]);
  const info = merge(bin, bl, ha);

  // The prefix-derived scheme alone isn't a lookup result — it's arithmetic on the
  // digits the user just typed. Only claim a hit when a provider actually told us
  // something.
  if (!info.bank && !info.country && !info.type && !lower(bl?.scheme) && !lower(ha?.Scheme)) {
    return Response.json(
      { error: `No data found for BIN ${bin}. This BIN may not be in our database yet.` },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const complete = Boolean(info.scheme && info.bank?.name && info.country?.name);

  const response = Response.json(info, {
    headers: {
      'Cache-Control': `public, max-age=${complete ? COMPLETE_TTL : PARTIAL_TTL}`,
      'Access-Control-Allow-Origin': '*',
    },
  });

  if (complete && cache) {
    context.waitUntil(cache.put(cacheKey, response.clone()).catch(() => {}));
  }

  return response;
};

/**
 * BIN lookup.
 *
 * Three upstreams, and the whole design is about the fact that the accurate one is the
 * one that rations us. Measured against the live endpoints:
 *
 *   handyapi   — accurate, and the only source that gets Chinese issuers right. Meters
 *                per source IP: anonymously it serves about two requests before it
 *                answers HTTP 200 with `{"Status":"RATE LIMIT EXCEEDED"}`. The bucket
 *                refills within a second, so it's a burst limit, not a daily cap.
 *   binlist    — mixed. Returns `{"number":null,"country":{},"bank":{}}` for most
 *                UnionPay ranges, and 429s from the third request in a burst.
 *   antipublic — never meters us (15/15 in a burst), but it is the least trustworthy.
 *                For BINs it doesn't hold it returns a stub — `"bank":"NETWORK ONLY"`
 *                with the country defaulted to US — rather than a miss. BIN 621793 is
 *                Shanghai Pudong Development Bank; antipublic calls it a US network-only
 *                card, handyapi names it correctly.
 *
 * Every visitor shares one Cloudflare egress address per colo, so a colo's handyapi
 * burst quota is spent seconds after any traffic. That is the intermittent "unknown":
 * same BIN, same code, different answer depending on which colo you land on — and why
 * a VPN appeared to fix it. It moved the request to a colo with an unspent bucket.
 *
 * So:
 *
 *   1. Ask handyapi alone. It answers most lookups correctly, in one round trip.
 *   2. If it was rationed or came up short, fan out: binlist, antipublic, and a second
 *      handyapi attempt, all at once. The retry is free in wall-clock terms because it
 *      runs alongside the fallbacks, and the bucket has usually refilled by then.
 *   3. Merge by trust, not by whoever answered: handyapi, then binlist, then antipublic.
 *      antipublic's stub rows are dropped outright — a wrong bank and country is worse
 *      than a blank one.
 *   4. Cache at the edge. Complete results sit in the colo's cache for a week, so a BIN
 *      is paid for once and the quota goes to BINs nobody has looked up yet. Partial
 *      results are cached briefly, so an unresolvable BIN stops burning the quota on
 *      every page view without being stuck that way.
 *
 * Set HANDY_API_KEY in the Pages project to remove the rationing entirely; without it
 * the fallbacks carry whatever the burst limit drops.
 */

type Env = { HANDY_API_KEY?: string };

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
const PARTIAL_TTL = 900; // 15 minutes — long enough to stop hammering, short enough to heal.

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

const CONNECTORS = new Set(['of', 'and', 'the', 'for', 'da', 'de', 'del', 'du', 'van', 'von']);

/**
 * ALL CAPS reads badly in a result row and the providers disagree about it — antipublic
 * shouts everything, handyapi shouts the tier, binlist is mixed case.
 *
 * `keepAcronyms` leaves a lone all-caps token of four letters or fewer as it is, because
 * at that length it's an acronym rather than a word — "ICBC" and "HSBC" would be wrong
 * as "Icbc" and "Hsbc". Only issuer names get that treatment. Card tiers don't: they're
 * ordinary words, so "GOLD" alongside "World" and "Platinum" is just inconsistent.
 */
function titleCase(value: string | null, keepAcronyms = false): string | null {
  if (!value || value !== value.toUpperCase()) return value;
  if (keepAcronyms && !/\s/.test(value) && value.replace(/[^A-Za-z]/g, '').length <= 4) return value;
  return value.replace(/[A-Za-z]+/g, (word, at: number) => {
    const cased = word.length === 1 ? word : word[0] + word.slice(1).toLowerCase();
    return at > 0 && CONNECTORS.has(cased.toLowerCase()) ? cased.toLowerCase() : cased;
  });
}

// binlist spells UnionPay "china union pay", which looks like a different network next
// to the other two providers' "UNIONPAY".
const SCHEME_ALIASES: Record<string, string> = {
  'china union pay': 'unionpay',
  'union pay': 'unionpay',
  'american express': 'amex',
  'diners club international': 'diners club',
};

function normalizeScheme(scheme: string | undefined | null, bin: string): string | null {
  if (!scheme) return null;
  const name = SCHEME_ALIASES[scheme] ?? scheme;
  // Discover and UnionPay share the 622126-622925 acquiring range, and binlist reports
  // the whole of it as Discover. The issuer is still UnionPay — ISO 7812 assigns the
  // entire 62 IIN to it — and "Discover" on a China Merchants Bank card is just wrong.
  if (name === 'discover' && (bin.startsWith('62') || bin.startsWith('81'))) return 'unionpay';
  return name;
}

/**
 * Card network implied by the number itself. ISO/IEC 7812 issuer ranges are fixed, so
 * this is a guaranteed floor for the one field users always expect to see, even when
 * every provider is down or metering us.
 */
function schemeFromPrefix(bin: string): string | null {
  const n = (len: number) => Number(bin.slice(0, len));
  if (bin.startsWith('4')) return 'visa';
  if (n(2) >= 51 && n(2) <= 55) return 'mastercard';
  if (n(4) >= 2221 && n(4) <= 2720) return 'mastercard';
  if (n(2) === 34 || n(2) === 37) return 'amex';
  if (n(2) === 62 || n(2) === 81) return 'unionpay';
  if (bin.startsWith('6011') || n(2) === 65 || (n(3) >= 644 && n(3) <= 649)) return 'discover';
  if (n(4) >= 3528 && n(4) <= 3589) return 'jcb';
  if (n(2) === 36 || n(2) === 38 || n(2) === 39 || (n(3) >= 300 && n(3) <= 305)) return 'diners club';
  if (n(2) === 50 || (n(2) >= 56 && n(2) <= 58)) return 'maestro';
  return null;
}

async function getJson(url: string, headers: Record<string, string> = {}): Promise<any | null> {
  try {
    const res = await fetch(url, {
      // Some of these sit behind a WAF that challenges requests with no User-Agent.
      headers: { Accept: 'application/json', 'User-Agent': 'SteelyLink-Tools/1.0', ...headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null; // includes binlist's 429
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * antipublic answers for BINs it doesn't actually hold with a stub row rather than a
 * miss: a placeholder issuer and the country defaulted to US. Taking that at face value
 * is how BIN 621793 — Shanghai Pudong Development Bank — came back as a US card. The
 * network and card type on those rows are still right, so only the issuer and the
 * country are thrown away.
 */
const PLACEHOLDER_BANKS = new Set(['network only', 'unknown', 'not available']);

function sanitizeAntipublic(ap: any) {
  if (!ap || ap.error) return null;
  if (!PLACEHOLDER_BANKS.has(clean(ap.bank)?.toLowerCase() ?? '')) return ap;
  const { bank, country, country_name, country_flag, country_currencies, ...rest } = ap;
  return rest;
}

const fromAntipublic = (bin: string) =>
  getJson(`https://bins.antipublic.cc/bins/${bin}`).then(sanitizeAntipublic);

const fromBinlist = (bin: string) =>
  getJson(`https://lookup.binlist.net/${bin}`, { 'Accept-Version': '3' });

const fromHandyApi = (bin: string, key?: string) =>
  getJson(`https://data.handyapi.com/bin/${bin}`, key ? { 'x-api-key': key } : {});

/** handyapi signals its quota in the body, with a 200 status. */
const handyOk = (ha: any) => (ha && (ha.Status === 'SUCCESS' || ha.Scheme) ? ha : null);

function merge(bin: string, ap: any, bl: any, rawHa: any): BinInfo {
  const ha = handyOk(rawHa);

  const bank: Bank = {};
  const bankName = titleCase(firstOf(ha?.Issuer, bl?.bank?.name, ap?.bank), true);
  if (bankName) bank.name = bankName;
  const bankUrl = firstOf(bl?.bank?.url);
  if (bankUrl) bank.url = bankUrl;
  const bankPhone = firstOf(bl?.bank?.phone);
  if (bankPhone) bank.phone = bankPhone;
  const bankCity = firstOf(bl?.bank?.city);
  if (bankCity) bank.city = bankCity;

  // The country fields have to be picked as a set, not field by field. antipublic fills
  // the country of any 62* BIN in as CN because that's the UnionPay range — so BIN 625904
  // (Lotte Card, Korea) has handyapi saying "South Korea" and antipublic saying CN, and
  // taking the name from one and the code from the other renders a Chinese flag next to
  // the word Korea. So: rank the providers, take the first that names a country, and only
  // borrow a field from a lower-ranked one when it doesn't contradict.
  const countrySources: Country[] = [
    { name: titleCase(firstOf(ha?.Country?.Name)) ?? undefined, alpha2: firstOf(ha?.Country?.A2) ?? undefined },
    {
      // binlist returns the ISO long form, e.g. "United States of America (the)", which
      // reads badly in a one-line result row — so it ranks below handyapi for the name.
      name: titleCase(firstOf(bl?.country?.name)) ?? undefined,
      alpha2: firstOf(bl?.country?.alpha2) ?? undefined,
      emoji: firstOf(bl?.country?.emoji) ?? undefined,
      currency: firstOf(bl?.country?.currency) ?? undefined,
    },
    {
      name: titleCase(firstOf(ap?.country_name)) ?? undefined,
      alpha2: firstOf(ap?.country) ?? undefined,
      emoji: firstOf(ap?.country_flag) ?? undefined,
      currency: firstOf(ap?.country_currencies?.[0]) ?? undefined,
    },
  ].map((c) => ({ ...c, alpha2: c.alpha2?.toUpperCase() }));

  const primary = countrySources.find((c) => c.name || c.alpha2) ?? {};
  const country: Country = { ...primary };
  for (const source of countrySources) {
    if (source === primary) continue;
    if (primary.alpha2 && source.alpha2 && source.alpha2 !== primary.alpha2) continue;
    country.name ??= source.name;
    country.alpha2 ??= source.alpha2;
    country.emoji ??= source.emoji;
    country.currency ??= source.currency;
  }
  for (const key of Object.keys(country) as (keyof Country)[]) {
    if (!country[key]) delete country[key];
  }

  const prepaid =
    typeof ha?.Prepaid === 'boolean'
      ? ha.Prepaid
      : typeof bl?.prepaid === 'boolean'
        ? bl.prepaid
        : null;

  return {
    scheme: normalizeScheme(
      lower(ha?.Scheme) ?? lower(bl?.scheme) ?? lower(ap?.brand) ?? schemeFromPrefix(bin) ?? undefined,
      bin
    ),
    type: lower(ha?.Type) ?? lower(bl?.type) ?? lower(ap?.type) ?? null,
    brand: titleCase(firstOf(ha?.CardTier, bl?.brand, ap?.level)),
    category: titleCase(firstOf(ha?.CardTier, bl?.brand, ap?.level)),
    prepaid,
    bank: bank.name ? bank : null,
    country: country.alpha2 || country.name ? country : null,
  };
}

/** Everything the result row shows is filled in, so it's worth caching for a week. */
const isComplete = (info: BinInfo) =>
  Boolean(info.scheme && info.type && info.bank?.name && info.country?.name);

/** At least one provider recognised the number — as opposed to us guessing the network. */
const isFound = (info: BinInfo) => Boolean(info.type || info.bank || info.country || info.brand);

export const onRequest: PagesFunction<Env> = async (context) => {
  const bin = (context.params.bin as string).replace(/\D/g, '').slice(0, 8);

  if (bin.length < 6) {
    return Response.json(
      { error: 'Enter at least 6 digits' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // Normalised key so `/api/bin/411111` and `/api/bin/4111 11` share one entry, and so
  // a cached hit skips the upstream calls entirely.
  const cacheKey = new Request(`${new URL(context.request.url).origin}/api/bin/${bin}`, {
    method: 'GET',
  });
  const cache = (globalThis as any).caches?.default;

  const cached = await cache?.match(cacheKey).catch(() => null);
  if (cached) return cached;

  const key = context.env.HANDY_API_KEY;

  // handyapi alone first: it answers most lookups correctly in one round trip, and the
  // ones it answers completely never touch the other two.
  let ha = await fromHandyApi(bin, key);
  let info = merge(bin, null, null, ha);

  if (!isComplete(info)) {
    // Everything at once. The second handyapi attempt costs nothing in wall-clock terms
    // because it runs beside the fallbacks, and its burst bucket refills in under a
    // second — so a request rationed a moment ago usually succeeds here.
    const [bl, ap, retry] = await Promise.all([
      fromBinlist(bin),
      fromAntipublic(bin),
      handyOk(ha) ? Promise.resolve(null) : fromHandyApi(bin, key),
    ]);
    ha = handyOk(ha) ?? retry;
    info = merge(bin, ap, bl, ha);
  }

  if (!isFound(info)) {
    return Response.json(
      { error: `No data found for BIN ${bin}. This BIN may not be in our database yet.` },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const ttl = isComplete(info) ? COMPLETE_TTL : PARTIAL_TTL;
  const response = Response.json(info, {
    headers: {
      'Cache-Control': `public, max-age=${ttl}`,
      'Access-Control-Allow-Origin': '*',
    },
  });

  if (cache) context.waitUntil(cache.put(cacheKey, response.clone()).catch(() => {}));

  return response;
};

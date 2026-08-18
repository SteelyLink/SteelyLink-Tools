/**
 * BIN lookup.
 *
 * Two upstreams, and the whole design is about the fact that the accurate one is the one
 * that rations us. Measured against the live endpoints:
 *
 *   handyapi — accurate, and the only source that gets Chinese issuers right. Meters per
 *              source IP: anonymously it serves about two requests, then answers HTTP 200
 *              with `{"Status":"RATE LIMIT EXCEEDED"}` — note the 200, so a naive caller
 *              stores the refusal as data. Measured recovery is roughly 50 seconds, i.e.
 *              a per-minute window rather than a daily cap.
 *   binlist  — mixed. Returns `{"number":null,"country":{},"bank":{}}` for most UnionPay
 *              ranges, and 429s from the third request in a burst.
 *
 * Every visitor shares one Cloudflare egress address per colo, so a colo's handyapi burst
 * quota is spent seconds after any traffic. That is the intermittent "unknown": same BIN,
 * same code, different answer depending on which colo you land on — and why a VPN
 * appeared to fix it. It moved the request to a colo with an unspent bucket.
 *
 * These two are the whole list, deliberately. An unmetered third source is tempting when
 * the accurate one rations us, but the ones on offer are unaccountable — no homepage, no
 * documentation, no terms, no identifiable operator — and they buy the quota back by
 * answering BINs they don't hold with a stub row instead of a miss: a placeholder bank
 * name and a country defaulted to US. A wrong answer cached for a week is worse than a
 * blank field that heals in three minutes. Add a source here only if you can say who runs
 * it and what it does when it doesn't know.
 *
 * So:
 *
 *   1. Ask handyapi alone. It answers most lookups correctly, in one round trip.
 *   2. If it was rationed or came up short, ask binlist. There is deliberately no retry
 *      of handyapi inside the same request: at a ~50 second window a retry milliseconds
 *      later is guaranteed to be refused too, so it would only add an upstream call and
 *      latency to a request that is already on its slow path.
 *   3. Merge by trust, not by whoever answered: handyapi first, binlist second.
 *   4. Fall back to the card number itself. ISO/IEC 7812 issuer ranges are fixed, so the
 *      network is derivable offline and that field is never empty.
 *   5. Cache at the edge — this, not the fallbacks, is what makes the quota workable.
 *      Complete results sit in the colo's cache for a week, so a BIN is paid for once and
 *      the quota goes to BINs nobody has looked up yet. Partial results are held for a
 *      few minutes: long enough that a burst doesn't hammer a BIN nobody can resolve,
 *      short enough that it heals on the next window rather than being stuck blank.
 *
 * Set HANDY_API_KEY in the Pages project to raise the ceiling. A key meters per account
 * rather than per source IP, which is the part that matters here — one visitor's lookup
 * stops spending the whole colo's budget. It is still a ceiling, not an exemption: the
 * free tier is single-digit requests per minute and a few thousand a month, so the cache
 * below carries just as much weight with a key as without one. Without a key, bank and
 * country come back blank under burst rather than wrong, and heal on the partial TTL.
 */

type Env = { HANDY_API_KEY?: string };

type Bank = { name?: string; url?: string; phone?: string; city?: string };
type Country = { name?: string; alpha2?: string; emoji?: string; currency?: string };

type BinInfo = {
  scheme: string | null;
  type: string | null;
  /**
   * Card tier — "Gold", "Platinum", "World". One field, because the two providers put it
   * in different places: handyapi has a dedicated `CardTier`, binlist folds it into
   * `brand` ("Visa Gold"). Deliberately not also exposed as `brand`: that name reads like
   * the card network, and a caller that treats it as one renders "Gold" where "Visa"
   * belongs.
   */
  category: string | null;
  bank: Bank | null;
  country: Country | null;
};

const TIMEOUT_MS = 5000;
const COMPLETE_TTL = 604800; // 7 days — an issued BIN's bank and country don't move.
const PARTIAL_TTL = 180; // 3 minutes — just over one upstream rate-limit window.

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
 * Tokens to leave shouting when they appear inside an issuer name — "AMEX UK GLOBESTAR"
 * should title-case to "Amex UK Globestar", not "Amex Uk Globestar".
 *
 * This is a list rather than a rule about length. "Keep anything three letters or fewer"
 * looks like it would work and then turns "CAPITAL ONE, NATIONAL ASSOCIATION" into
 * "Capital ONE" — short words are not the same thing as initialisms, so the ones that
 * actually occur in issuer names are named here.
 */
const INITIALISMS = new Set([
  'UK', 'US', 'USA', 'UAE', 'EU', 'NA', 'SA', 'NV', 'BV', 'AG', 'AB', 'AS', 'OY', 'SPA',
  'PLC', 'LLC', 'PJSC', 'JSC', 'PSC', 'DAC', 'ASA',
  'ICBC', 'HSBC', 'BNP', 'DBS', 'UOB', 'OCBC', 'SBI', 'HDFC', 'ICICI', 'ANZ', 'NAB',
  'RBC', 'BMO', 'CIBC', 'TD', 'ING', 'KBC', 'BBVA', 'UBS', 'CTBC', 'IBK', 'KB', 'NH',
  'MUFG', 'SMBC', 'JCB', 'BOC', 'CCB', 'ABC', 'PSBC', 'CMB', 'CITIC', 'SPD', 'BOCOM',
]);

/**
 * ALL CAPS reads badly in a result row and the two providers disagree about it — handyapi
 * shouts the issuer and the tier, binlist is mixed case.
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
    if (INITIALISMS.has(word)) return word;
    const cased = word.length === 1 ? word : word[0] + word.slice(1).toLowerCase();
    return at > 0 && CONNECTORS.has(cased.toLowerCase()) ? cased.toLowerCase() : cased;
  });
}

/**
 * binlist reports countries by their full ISO 3166 name, which is not what anyone wants
 * in a one-line result row: "United States of America (the)", "United Kingdom of Great
 * Britain and Northern Ireland (the)", "Korea (the Republic of)". handyapi returns the
 * short form already, so this only shows when handyapi is rationed — which is exactly
 * when the row shouldn't also start looking broken.
 *
 * The parenthetical and the comma tail come off generically; the handful of names that
 * are still unwieldy after that are listed.
 */
const COUNTRY_SHORT_NAMES: Record<string, string> = {
  'united states of america': 'United States',
  'united kingdom of great britain and northern ireland': 'United Kingdom',
  'russian federation': 'Russia',
  'republic of korea': 'South Korea',
  'korea': 'South Korea',
  'syrian arab republic': 'Syria',
  'lao people\'s democratic republic': 'Laos',
  'viet nam': 'Vietnam',
  'brunei darussalam': 'Brunei',
  'czechia': 'Czech Republic',
  'macao': 'Macau',
};

function shortCountry(name: string | null): string | null {
  if (!name) return null;
  const trimmed = name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/,.*$/, '')
    .replace(/^the\s+/i, '')
    .trim();
  return COUNTRY_SHORT_NAMES[trimmed.toLowerCase()] ?? trimmed;
}

// binlist spells UnionPay "china union pay", which looks like a different network next
// to handyapi's "CHINA UNION PAY" normalised form.
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

const fromBinlist = (bin: string) =>
  getJson(`https://lookup.binlist.net/${bin}`, { 'Accept-Version': '3' });

const fromHandyApi = (bin: string, key?: string) =>
  getJson(`https://data.handyapi.com/bin/${bin}`, key ? { 'x-api-key': key } : {});

/** handyapi signals its quota in the body, with a 200 status. */
const handyOk = (ha: any) => (ha && (ha.Status === 'SUCCESS' || ha.Scheme) ? ha : null);

function merge(bin: string, bl: any, rawHa: any): BinInfo {
  const ha = handyOk(rawHa);

  const bank: Bank = {};
  const bankName = titleCase(firstOf(ha?.Issuer, bl?.bank?.name), true);
  if (bankName) bank.name = bankName;
  const bankUrl = firstOf(bl?.bank?.url);
  if (bankUrl) bank.url = bankUrl;
  const bankPhone = firstOf(bl?.bank?.phone);
  if (bankPhone) bank.phone = bankPhone;
  const bankCity = firstOf(bl?.bank?.city);
  if (bankCity) bank.city = bankCity;

  // The country fields have to be picked as a set, not field by field, or a name from one
  // provider ends up beside a code from another — which renders the wrong flag next to the
  // right country. So: rank the providers, take the first that names a country, and only
  // borrow a field from a lower-ranked one when it doesn't contradict.
  const countrySources: Country[] = [
    {
      name: shortCountry(titleCase(firstOf(ha?.Country?.Name))) ?? undefined,
      alpha2: firstOf(ha?.Country?.A2) ?? undefined,
    },
    {
      name: shortCountry(titleCase(firstOf(bl?.country?.name))) ?? undefined,
      alpha2: firstOf(bl?.country?.alpha2) ?? undefined,
      emoji: firstOf(bl?.country?.emoji) ?? undefined,
      currency: firstOf(bl?.country?.currency) ?? undefined,
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

  return {
    scheme: normalizeScheme(
      lower(ha?.Scheme) ?? lower(bl?.scheme) ?? schemeFromPrefix(bin) ?? undefined,
      bin
    ),
    type: lower(ha?.Type) ?? lower(bl?.type) ?? null,
    category: titleCase(firstOf(ha?.CardTier, bl?.brand)),
    bank: bank.name ? bank : null,
    country: country.alpha2 || country.name ? country : null,
  };
}

/** Everything the result row shows is filled in, so it's worth caching for a week. */
const isComplete = (info: BinInfo) =>
  Boolean(info.scheme && info.type && info.bank?.name && info.country?.name);

/** At least one provider recognised the number — as opposed to us guessing the network. */
const isFound = (info: BinInfo) => Boolean(info.type || info.bank || info.country || info.category);

/**
 * Whether handyapi declined to answer, as opposed to answering that it doesn't know.
 *
 * The difference decides what the caller is told when nothing was found: only handyapi is
 * authoritative enough for "this BIN doesn't exist" — binlist is documented above as
 * returning an empty stub for whole UnionPay ranges, so its silence proves nothing. A null
 * here is a timeout or a non-2xx; the rate limit arrives as HTTP 200 with the refusal in
 * the body, which is exactly the case a status check would miss.
 */
const handyRefused = (raw: any) =>
  raw === null ||
  (typeof raw?.Status === 'string' && raw.Status.toUpperCase().includes('RATE LIMIT'));

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
  // ones it answers completely never reach binlist at all.
  const ha = await fromHandyApi(bin, key);
  let info = merge(bin, null, ha);

  if (!isComplete(info)) {
    info = merge(bin, await fromBinlist(bin), ha);
  }

  if (!isFound(info)) {
    // Nothing came back — but "we asked and it isn't a card" and "we never got to ask"
    // need different advice, and the second one heals by itself in under a minute.
    if (handyRefused(ha)) {
      return Response.json(
        { error: 'Lookup is rate-limited right now. Try again in about a minute.' },
        { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } }
      );
    }
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

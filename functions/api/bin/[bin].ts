export const onRequest: PagesFunction = async (context) => {
  const bin = (context.params.bin as string).replace(/\D/g, '').slice(0, 8);

  if (bin.length < 6) {
    return Response.json({ error: 'Enter at least 6 digits' }, { status: 400 });
  }

  const headers = {
    'Cache-Control': 'public, max-age=86400',
    'Access-Control-Allow-Origin': '*',
  };

  // Primary: binlist.net
  try {
    const res = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { 'Accept-Version': '3', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data: any = await res.json();
      const hasData = data.scheme || data.type || data.brand || data.bank?.name || data.country?.name;
      if (hasData) {
        return Response.json(data, { headers });
      }
    }
  } catch {
    // fall through
  }

  // Secondary: handyapi
  try {
    const res2 = await fetch(`https://data.handyapi.com/bin/${bin}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (res2.ok) {
      const raw: any = await res2.json();
      if (raw.Status === 'SUCCESS' || raw.Scheme) {
        const normalized = {
          scheme: raw.Scheme?.toLowerCase() ?? null,
          type: raw.Type?.toLowerCase() ?? null,
          prepaid: raw.Prepaid ?? null,
          brand: raw.Scheme ?? null,
          bank: raw.Issuer ? { name: raw.Issuer } : null,
          country: raw.Country ? { name: raw.Country.Name, alpha2: raw.Country.A2 } : null,
          category: raw.CardTier ?? null,
        };
        const hasData2 = normalized.scheme || normalized.bank?.name || normalized.country?.name;
        if (hasData2) {
          return Response.json(normalized, { headers });
        }
      }
    }
  } catch {
    // fall through
  }

  return Response.json(
    { error: `No data found for BIN ${bin}. This BIN may not be in our database yet.` },
    { status: 404 }
  );
};

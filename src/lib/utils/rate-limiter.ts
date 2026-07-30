interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const records = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxCalls: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = records.get(key);

  if (!record || now - record.windowStart > windowMs) {
    records.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= maxCalls) return false;

  record.count++;
  return true;
}



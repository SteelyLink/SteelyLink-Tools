export interface JSONResult {
  formatted?: string;
  minified?: string;
  error?: string;
  isValid: boolean;
}

export function formatJSON(input: string): JSONResult {
  try {
    const parsed = JSON.parse(input);
    return {
      formatted: JSON.stringify(parsed, null, 2),
      minified: JSON.stringify(parsed),
      isValid: true,
    };
  } catch (e) {
    return { error: (e as Error).message, isValid: false };
  }
}

export function encodeBase64(input: string): string {
  try {
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    return btoa(input);
  }
}

export function decodeBase64(input: string): { result: string; error?: string } {
  try {
    return { result: decodeURIComponent(escape(atob(input.trim()))) };
  } catch {
    return { result: '', error: 'Invalid Base64 string' };
  }
}

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map(v => v.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function generateUUID(): string {
  return uuidv4();
}

export function generateMultipleUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => uuidv4());
}

export interface TimestampResult {
  unix: number;
  unixMs: number;
  iso: string;
  local: string;
  utc: string;
  relative: string;
  error?: string;
}

export function convertTimestamp(input: string): TimestampResult {
  try {
    let date: Date;
    const trimmed = input.trim();

    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      date = new Date(num < 1e12 ? num * 1000 : num);
    } else if (trimmed.toLowerCase() === 'now') {
      date = new Date();
    } else {
      date = new Date(trimmed);
    }

    if (isNaN(date.getTime())) throw new Error('Invalid date or timestamp');

    const now = Date.now();
    const diff = date.getTime() - now;
    const absDiff = Math.abs(diff);
    let relative: string;

    if (absDiff < 60000) {
      relative = 'just now';
    } else if (absDiff < 3600000) {
      const mins = Math.round(absDiff / 60000);
      relative = diff < 0 ? `${mins} minutes ago` : `in ${mins} minutes`;
    } else if (absDiff < 86400000) {
      const hours = Math.round(absDiff / 3600000);
      relative = diff < 0 ? `${hours} hours ago` : `in ${hours} hours`;
    } else {
      const days = Math.round(absDiff / 86400000);
      relative = diff < 0 ? `${days} days ago` : `in ${days} days`;
    }

    return {
      unix: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime(),
      iso: date.toISOString(),
      local: date.toLocaleString(),
      utc: date.toUTCString(),
      relative,
    };
  } catch (e) {
    return {
      unix: 0,
      unixMs: 0,
      iso: '',
      local: '',
      utc: '',
      relative: '',
      error: (e as Error).message,
    };
  }
}

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export function generatePassword(options: PasswordOptions): string {
  let charset = '';
  const upper = options.excludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = options.excludeAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  const nums = options.excludeAmbiguous ? '23456789' : '0123456789';
  const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (options.uppercase) charset += upper;
  if (options.lowercase) charset += lower;
  if (options.numbers) charset += nums;
  if (options.symbols) charset += syms;
  if (!charset) charset = lower;

  const array = new Uint8Array(options.length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join('');
}

export interface WordStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMin: number;
  readingTimeSec: number;
}

export function countWords(text: string): WordStats {
  if (!text.trim()) {
    return { words: 0, characters: 0, charactersNoSpaces: 0, sentences: 0, paragraphs: 0, readingTimeMin: 0, readingTimeSec: 0 };
  }

  const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = (text.match(/[.!?]+(?:\s|$)/g) || []).length || 0;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length || 1;
  const totalSeconds = Math.round((words / 200) * 60);
  const readingTimeMin = Math.floor(totalSeconds / 60);
  const readingTimeSec = totalSeconds % 60;

  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTimeMin, readingTimeSec };
}

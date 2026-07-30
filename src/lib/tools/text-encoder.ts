// Universal Text Encoding/Decoding Library
// Pure functions, browser-only, handles UTF-8, emoji, multi-byte characters

export type EncodingType =
  | 'text' | 'hex' | 'binary' | 'octal' | 'decimal'
  | 'base64' | 'url' | 'html-entity' | 'unicode' | 'ascii'
  | 'rot13' | 'morse';

// ─── Morse Code Table ───────────────────────────────────────────────────────

const MORSE_ENCODE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
  ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-',
  '@': '.--.-.', ' ': '/',
};

const MORSE_DECODE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_ENCODE).map(([k, v]) => [v, k])
);

// ─── Individual Converters ──────────────────────────────────────────────────

/** Get UTF-16 code units (handles surrogate pairs correctly via spread) */
function getCodePoints(text: string): number[] {
  return [...text].map((ch) => ch.codePointAt(0)!);
}

export function textToHex(text: string): string {
  return getCodePoints(text)
    .map((cp) => cp.toString(16).padStart(cp > 0xffff ? 8 : 4, '0'))
    .join(' ');
}

export function hexToText(hex: string): string {
  const tokens = hex.trim().replace(/0x/gi, ' ').split(/[\s,]+/).filter(Boolean);
  return tokens.map((t) => String.fromCodePoint(parseInt(t, 16))).join('');
}

export function textToBinary(text: string): string {
  return getCodePoints(text)
    .map((cp) => cp.toString(2).padStart(cp > 0xffff ? 21 : 8, '0'))
    .join(' ');
}

export function binaryToText(binary: string): string {
  const tokens = binary.trim().split(/[\s,]+/).filter(Boolean);
  return tokens.map((t) => String.fromCodePoint(parseInt(t, 2))).join('');
}

export function textToOctal(text: string): string {
  return getCodePoints(text)
    .map((cp) => cp.toString(8))
    .join(' ');
}

export function octalToText(octal: string): string {
  const tokens = octal.trim().split(/[\s,]+/).filter(Boolean);
  return tokens.map((t) => String.fromCodePoint(parseInt(t, 8))).join('');
}

export function textToDecimal(text: string): string {
  return getCodePoints(text).join(' ');
}

export function decimalToText(decimal: string): string {
  const tokens = decimal.trim().split(/[\s,]+/).filter(Boolean);
  return tokens.map((t) => String.fromCodePoint(parseInt(t, 10))).join('');
}

export function textToBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    // fallback for environments that don't have unescape
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }
}

export function base64ToText(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64.trim())));
  } catch {
    throw new Error('Invalid Base64 string');
  }
}

export function textToUrl(text: string): string {
  return encodeURIComponent(text);
}

export function urlToText(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    throw new Error('Invalid URL-encoded string');
  }
}

export function textToHtmlEntity(text: string): string {
  return getCodePoints(text)
    .map((cp) => {
      if (cp === 0x26) return '&amp;';
      if (cp === 0x3c) return '&lt;';
      if (cp === 0x3e) return '&gt;';
      if (cp === 0x22) return '&quot;';
      if (cp === 0x27) return '&#39;';
      if (cp > 127) return `&#${cp};`;
      return String.fromCodePoint(cp);
    })
    .join('');
}

export function htmlEntityToText(html: string): string {
  const namedEntities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>',
    '&quot;': '"', '&apos;': "'", '&nbsp;': ' ',
    '&copy;': '©', '&reg;': '®', '&trade;': '™',
    '&euro;': '€', '&pound;': '£', '&yen;': '¥',
    '&cent;': '¢', '&mdash;': '—', '&ndash;': '–',
    '&hellip;': '…', '&laquo;': '«', '&raquo;': '»',
  };
  return html
    .replace(/&[a-z]+;/gi, (m) => namedEntities[m.toLowerCase()] ?? m)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

export function textToUnicode(text: string): string {
  return getCodePoints(text)
    .map((cp) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ');
}

export function unicodeToText(unicode: string): string {
  const tokens = unicode
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  return tokens
    .map((t) => {
      const cleaned = t.replace(/^U\+/i, '').replace(/^\\u/i, '');
      const cp = parseInt(cleaned, 16);
      if (isNaN(cp)) throw new Error(`Invalid Unicode token: ${t}`);
      return String.fromCodePoint(cp);
    })
    .join('');
}

export function textToAscii(text: string): string {
  return getCodePoints(text)
    .map((cp) => {
      if (cp > 127) throw new Error(`Character '${String.fromCodePoint(cp)}' is not ASCII`);
      return cp.toString();
    })
    .join(' ');
}

export function asciiToText(ascii: string): string {
  const tokens = ascii.trim().split(/[\s,]+/).filter(Boolean);
  return tokens
    .map((t) => {
      const n = parseInt(t, 10);
      if (isNaN(n) || n < 0 || n > 127) throw new Error(`Invalid ASCII value: ${t}`);
      return String.fromCharCode(n);
    })
    .join('');
}

export function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
  });
}

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((ch) => {
      const code = MORSE_ENCODE[ch];
      if (code === undefined) throw new Error(`No Morse code for character: '${ch}'`);
      return code;
    })
    .join(' ');
}

export function morseToText(morse: string): string {
  return morse
    .trim()
    .split(/\s+\/\s+|\s{3,}/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((sym) => {
          if (!sym) return '';
          const ch = MORSE_DECODE[sym];
          if (ch === undefined) throw new Error(`Unknown Morse symbol: '${sym}'`);
          return ch;
        })
        .join('')
    )
    .join(' ');
}

// ─── Decode to intermediate text ────────────────────────────────────────────

function decodeToText(input: string, from: EncodingType): string {
  switch (from) {
    case 'text':        return input;
    case 'hex':         return hexToText(input);
    case 'binary':      return binaryToText(input);
    case 'octal':       return octalToText(input);
    case 'decimal':     return decimalToText(input);
    case 'base64':      return base64ToText(input);
    case 'url':         return urlToText(input);
    case 'html-entity': return htmlEntityToText(input);
    case 'unicode':     return unicodeToText(input);
    case 'ascii':       return asciiToText(input);
    case 'rot13':       return rot13(input);          // rot13 is its own inverse
    case 'morse':       return morseToText(input);
    default:            return input;
  }
}

function encodeFromText(text: string, to: EncodingType): string {
  switch (to) {
    case 'text':        return text;
    case 'hex':         return textToHex(text);
    case 'binary':      return textToBinary(text);
    case 'octal':       return textToOctal(text);
    case 'decimal':     return textToDecimal(text);
    case 'base64':      return textToBase64(text);
    case 'url':         return textToUrl(text);
    case 'html-entity': return textToHtmlEntity(text);
    case 'unicode':     return textToUnicode(text);
    case 'ascii':       return textToAscii(text);
    case 'rot13':       return rot13(text);
    case 'morse':       return textToMorse(text);
    default:            return text;
  }
}

// ─── Auto-detect encoding ────────────────────────────────────────────────────

export function detectEncoding(input: string): EncodingType {
  const trimmed = input.trim();

  // Base64
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length % 4 === 0 && trimmed.length > 4) {
    return 'base64';
  }
  // URL-encoded
  if (/%[0-9A-Fa-f]{2}/.test(trimmed)) return 'url';
  // HTML entities
  if (/&(#\d+|#x[0-9a-f]+|[a-z]+);/i.test(trimmed)) return 'html-entity';
  // Unicode escape: U+XXXX
  if (/U\+[0-9A-Fa-f]{4}/i.test(trimmed)) return 'unicode';
  // Morse code
  if (/^[.\-/ ]+$/.test(trimmed) && (trimmed.includes('.') || trimmed.includes('-'))) {
    return 'morse';
  }
  // Binary: only 0/1 and spaces
  if (/^[01 ]+$/.test(trimmed) && /^[01]{4,}/.test(trimmed.replace(/ /g, ''))) return 'binary';
  // Hex: groups of hex digits
  if (/^([0-9a-fA-F]{2,8}[\s,]?)+$/.test(trimmed)) return 'hex';
  // Octal: only 0-7
  if (/^([0-7]{1,6}[\s,]?)+$/.test(trimmed)) return 'octal';
  // Decimal: space-separated numbers
  if (/^(\d{1,6}[\s,]?)+$/.test(trimmed)) return 'decimal';

  return 'text';
}

// ─── Main convert function ───────────────────────────────────────────────────

export function convert(
  input: string,
  from: EncodingType,
  to: EncodingType
): { result: string; error?: string } {
  if (!input) return { result: '' };
  try {
    const intermediate = decodeToText(input, from);
    const result = encodeFromText(intermediate, to);
    return { result };
  } catch (e) {
    return { result: '', error: (e as Error).message };
  }
}

export const ENCODING_LABELS: Record<EncodingType, string> = {
  text: 'Plain Text',
  hex: 'Hexadecimal',
  binary: 'Binary',
  octal: 'Octal',
  decimal: 'Decimal (ASCII codes)',
  base64: 'Base64',
  url: 'URL Encoded',
  'html-entity': 'HTML Entities',
  unicode: 'Unicode (U+XXXX)',
  ascii: 'ASCII Codes',
  rot13: 'ROT13',
  morse: 'Morse Code',
};

export const ALL_ENCODING_TYPES: EncodingType[] = [
  'text', 'hex', 'binary', 'octal', 'decimal',
  'base64', 'url', 'html-entity', 'unicode', 'ascii',
  'rot13', 'morse',
];

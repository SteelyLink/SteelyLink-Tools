// Data Formatter / Validator Library
// Pure functions (except hashText which uses SubtleCrypto async API)

// ─── JSON ────────────────────────────────────────────────────────────────────

export function validateJSON(input: string): {
  valid: boolean;
  error?: string;
  line?: number;
  col?: number;
} {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    const msg = (e as Error).message;
    // Try to extract line/col from the error message
    const lineMatch = msg.match(/line (\d+)/i);
    const colMatch = msg.match(/column (\d+)/i) || msg.match(/position (\d+)/i);
    return {
      valid: false,
      error: msg,
      line: lineMatch ? parseInt(lineMatch[1]) : undefined,
      col: colMatch ? parseInt(colMatch[1]) : undefined,
    };
  }
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

function parseCSVRow(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuote = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === delimiter) {
        cells.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  cells.push(cur);
  return cells;
}

function escapeCSVCell(value: string, delimiter: string): string {
  if (value.includes('"') || value.includes(delimiter) || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function formatCSV(
  input: string,
  delimiter = ','
): { result: string; rows: number; cols: number; error?: string } {
  try {
    const lines = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const parsed = lines.filter((l) => l.trim() !== '').map((l) => parseCSVRow(l, delimiter));
    if (parsed.length === 0) return { result: '', rows: 0, cols: 0 };

    const maxCols = Math.max(...parsed.map((r) => r.length));
    const normalized = parsed.map((row) => {
      while (row.length < maxCols) row.push('');
      return row;
    });

    const result = normalized
      .map((row) => row.map((c) => escapeCSVCell(c.trim(), delimiter)).join(delimiter))
      .join('\n');

    return { result, rows: normalized.length, cols: maxCols };
  } catch (e) {
    return { result: '', rows: 0, cols: 0, error: (e as Error).message };
  }
}

export function validateCSV(
  input: string
): { valid: boolean; rows: number; cols: number; issues: string[] } {
  const issues: string[] = [];
  const lines = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((l) => l.trim());
  if (lines.length === 0) return { valid: false, rows: 0, cols: 0, issues: ['Empty input'] };

  const parsed = lines.map((l) => parseCSVRow(l, ','));
  const colCounts = parsed.map((r) => r.length);
  const expectedCols = colCounts[0];

  colCounts.forEach((count, idx) => {
    if (count !== expectedCols) {
      issues.push(`Row ${idx + 1}: expected ${expectedCols} columns, got ${count}`);
    }
  });

  // Check unclosed quotes
  lines.forEach((line, idx) => {
    const quoteCount = (line.match(/"/g) || []).length;
    const escapedPairs = (line.match(/""/g) || []).length;
    if ((quoteCount - escapedPairs * 2) % 2 !== 0) {
      issues.push(`Row ${idx + 1}: possible unclosed quote`);
    }
  });

  return {
    valid: issues.length === 0,
    rows: parsed.length,
    cols: expectedCols,
    issues,
  };
}

// ─── XML ─────────────────────────────────────────────────────────────────────

export function validateXML(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: 'Empty input' };

  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'application/xml');
      const err = doc.querySelector('parsererror');
      if (err) return { valid: false, error: err.textContent || 'XML parse error' };
      return { valid: true };
    }
    // Fallback: basic structural check
    return basicXMLValidate(trimmed);
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

function basicXMLValidate(xml: string): { valid: boolean; error?: string } {
  const stack: string[] = [];
  const tagPattern = /<\/?([a-zA-Z_][a-zA-Z0-9_:.-]*)(?:\s[^>]*)?\/?>/g;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(xml)) !== null) {
    const full = match[0];
    const name = match[1];
    if (full.endsWith('/>')) continue; // self-closing
    if (full.startsWith('</')) {
      if (stack[stack.length - 1] !== name) {
        return { valid: false, error: `Mismatched tag: </${name}>` };
      }
      stack.pop();
    } else {
      stack.push(name);
    }
  }
  if (stack.length > 0) return { valid: false, error: `Unclosed tag: <${stack[stack.length - 1]}>` };
  return { valid: true };
}

export function formatXML(input: string): { result: string; error?: string } {
  const validation = validateXML(input);
  if (!validation.valid) return { result: '', error: validation.error };

  try {
    let result = '';
    let indent = 0;
    const pad = (n: number) => '  '.repeat(n);

    // Tokenize
    const tokens = input
      .replace(/>\s*</g, '><')
      .trim()
      .split(/(?<=>)(?=<)/);

    for (const token of tokens) {
      if (!token.trim()) continue;

      if (token.startsWith('<?') || token.startsWith('<!')) {
        // Processing instruction / doctype / comment
        result += pad(indent) + token.trim() + '\n';
      } else if (token.startsWith('</')) {
        indent = Math.max(0, indent - 1);
        result += pad(indent) + token.trim() + '\n';
      } else if (token.endsWith('/>')) {
        result += pad(indent) + token.trim() + '\n';
      } else if (token.startsWith('<') && !token.includes('</')) {
        result += pad(indent) + token.trim() + '\n';
        if (!token.match(/<[^>]+\/>/)) indent++;
      } else {
        // Mixed content: opening tag + text content + closing tag
        result += pad(indent) + token.trim() + '\n';
      }
    }
    return { result: result.trimEnd() };
  } catch (e) {
    return { result: '', error: (e as Error).message };
  }
}

// ─── YAML ─────────────────────────────────────────────────────────────────────

export function formatYAML(input: string): { result: string; error?: string } {
  try {
    // YAML formatting: normalize indentation (2 spaces), fix spacing
    const lines = input.split('\n');
    const result = lines.map((line) => {
      // Normalize list items
      return line
        .replace(/^\s*-\s+/, (m) => m.trimStart())
        // Ensure colon-key spacing
        .replace(/^(\s*[^:#\s][^:]*):([^ \n])/, '$1: $2');
    });
    // Re-indent: detect current indentation unit and normalize to 2 spaces
    const indentedResult = normalizeYAMLIndent(result);
    return { result: indentedResult.join('\n') };
  } catch (e) {
    return { result: '', error: (e as Error).message };
  }
}

function normalizeYAMLIndent(lines: string[]): string[] {
  // Find smallest indentation unit
  const indentSizes = lines
    .filter((l) => /^\s+/.test(l))
    .map((l) => l.match(/^(\s+)/)?.[1].length ?? 0)
    .filter((n) => n > 0);
  const minIndent = indentSizes.length > 0 ? Math.min(...indentSizes) : 2;
  const targetIndent = 2;

  return lines.map((line) => {
    const match = line.match(/^(\s*)(.*)/);
    if (!match) return line;
    const [, spaces, rest] = match;
    if (!spaces) return rest;
    const level = Math.round(spaces.length / minIndent);
    return ' '.repeat(level * targetIndent) + rest;
  });
}

// ─── Markdown to HTML ────────────────────────────────────────────────────────

export function markdownToHTML(input: string): string {
  let html = input;

  // Escape HTML entities first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trimEnd()}</code></pre>`;
  });

  // Headings
  html = html.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, text) => {
    const level = hashes.length;
    return `<h${level}>${text.trim()}</h${level}>`;
  });

  // Horizontal rule
  html = html.replace(/^[-*_]{3,}\s*$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/((?:^[-*+]\s+.+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map((l) => `<li>${l.replace(/^[-*+]\s+/, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\.\s+.+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map((l) => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Links and images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraphs (double newline)
  html = html.replace(/\n\n+/g, '\n</p>\n<p>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p>(<(h[1-6]|ul|ol|pre|hr|blockquote)[^>]*>)/g, '$1');
  html = html.replace(/(<\/(h[1-6]|ul|ol|pre|hr|blockquote)>)<\/p>/g, '$1');

  // Line breaks
  html = html.replace(/\n/g, '<br>\n');

  return html;
}

// ─── Lorem Ipsum Generator ───────────────────────────────────────────────────

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
];

let _seed = 42;
function pseudoRand(): number {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
  return (_seed >>> 0) / 0x100000000;
}

export function generateLorem(paragraphs: number, wordsPerParagraph: number): string {
  _seed = paragraphs * 31 + wordsPerParagraph * 17;
  return Array.from({ length: paragraphs }, () => {
    const words: string[] = [];
    for (let i = 0; i < wordsPerParagraph; i++) {
      const idx = Math.floor(pseudoRand() * LOREM_WORDS.length);
      words.push(LOREM_WORDS[idx]);
    }
    // Capitalize first word, add period
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    // Add occasional commas and periods mid-paragraph
    let text = '';
    words.forEach((w, i) => {
      if (i === 0) { text += w; return; }
      const prev = words[i - 1];
      if (i > 0 && i % Math.floor(wordsPerParagraph / 3) === 0 && i < wordsPerParagraph - 1) {
        text += ', ' + w;
      } else {
        text += ' ' + w;
      }
    });
    return text + '.';
  }).join('\n\n');
}

// ─── Case Converter ──────────────────────────────────────────────────────────

export type CaseType =
  | 'upper' | 'lower' | 'title' | 'sentence'
  | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant';

export function convertCase(text: string, targetCase: CaseType): string {
  // Tokenize: split on whitespace, underscores, hyphens, camelCase boundaries
  const words = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_\-]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());

  switch (targetCase) {
    case 'upper':    return text.toUpperCase();
    case 'lower':    return text.toLowerCase();
    case 'title':    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    case 'sentence': {
      const joined = words.join(' ');
      return joined.charAt(0).toUpperCase() + joined.slice(1);
    }
    case 'camel':
      return words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
    case 'pascal':
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    case 'snake':    return words.join('_');
    case 'kebab':    return words.join('-');
    case 'constant': return words.join('_').toUpperCase();
    default:         return text;
  }
}

// ─── Hash ─────────────────────────────────────────────────────────────────────

// Pure-JS MD5 implementation (RFC 1321)
function md5(input: string): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function md5blks(s: string): number[] {
    const nblk = ((s.length + 8) >> 6) + 1;
    const blks: number[] = new Array(nblk * 16).fill(0);
    for (let i = 0; i < s.length; i++) {
      blks[i >> 2] |= s.charCodeAt(i) << ((i % 4) * 8);
    }
    blks[s.length >> 2] |= 0x80 << ((s.length % 4) * 8);
    blks[nblk * 16 - 2] = s.length * 8;
    return blks;
  }

  const utf8 = unescape(encodeURIComponent(input));
  const x = md5blks(utf8);
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d;
    a = md5ff(a,b,c,d,x[i+ 0], 7,-680876936); d=md5ff(d,a,b,c,x[i+ 1],12,-389564586);
    c = md5ff(c,d,a,b,x[i+ 2],17, 606105819); b=md5ff(b,c,d,a,x[i+ 3],22,-1044525330);
    a = md5ff(a,b,c,d,x[i+ 4], 7,-176418897); d=md5ff(d,a,b,c,x[i+ 5],12,1200080426);
    c = md5ff(c,d,a,b,x[i+ 6],17,-1473231341);b=md5ff(b,c,d,a,x[i+ 7],22,-45705983);
    a = md5ff(a,b,c,d,x[i+ 8], 7,1770035416); d=md5ff(d,a,b,c,x[i+ 9],12,-1958414417);
    c = md5ff(c,d,a,b,x[i+10],17,-42063);     b=md5ff(b,c,d,a,x[i+11],22,-1990404162);
    a = md5ff(a,b,c,d,x[i+12], 7,1804603682); d=md5ff(d,a,b,c,x[i+13],12,-40341101);
    c = md5ff(c,d,a,b,x[i+14],17,-1502002290);b=md5ff(b,c,d,a,x[i+15],22,1236535329);

    a = md5gg(a,b,c,d,x[i+ 1], 5,-165796510); d=md5gg(d,a,b,c,x[i+ 6], 9,-1069501632);
    c = md5gg(c,d,a,b,x[i+11],14, 643717713); b=md5gg(b,c,d,a,x[i+ 0],20,-373897302);
    a = md5gg(a,b,c,d,x[i+ 5], 5,-701558691); d=md5gg(d,a,b,c,x[i+10], 9, 38016083);
    c = md5gg(c,d,a,b,x[i+15],14,-660478335); b=md5gg(b,c,d,a,x[i+ 4],20,-405537848);
    a = md5gg(a,b,c,d,x[i+ 9], 5, 568446438); d=md5gg(d,a,b,c,x[i+14], 9,-1019803690);
    c = md5gg(c,d,a,b,x[i+ 3],14,-187363961); b=md5gg(b,c,d,a,x[i+ 8],20,1163531501);
    a = md5gg(a,b,c,d,x[i+13], 5,-1444681467);d=md5gg(d,a,b,c,x[i+ 2], 9,-51403784);
    c = md5gg(c,d,a,b,x[i+ 7],14,1735328473); b=md5gg(b,c,d,a,x[i+12],20,-1926607734);

    a = md5hh(a,b,c,d,x[i+ 5], 4,-378558);    d=md5hh(d,a,b,c,x[i+ 8],11,-2022574463);
    c = md5hh(c,d,a,b,x[i+11],16,1839030562); b=md5hh(b,c,d,a,x[i+14],23,-35309556);
    a = md5hh(a,b,c,d,x[i+ 1], 4,-1530992060);d=md5hh(d,a,b,c,x[i+ 4],11,1272893353);
    c = md5hh(c,d,a,b,x[i+ 7],16,-155497632); b=md5hh(b,c,d,a,x[i+10],23,-1094730640);
    a = md5hh(a,b,c,d,x[i+13], 4, 681279174); d=md5hh(d,a,b,c,x[i+ 0],11,-358537222);
    c = md5hh(c,d,a,b,x[i+ 3],16,-722521979); b=md5hh(b,c,d,a,x[i+ 6],23,76029189);
    a = md5hh(a,b,c,d,x[i+ 9], 4,-640364487); d=md5hh(d,a,b,c,x[i+12],11,-421815835);
    c = md5hh(c,d,a,b,x[i+15],16,530742520);  b=md5hh(b,c,d,a,x[i+ 2],23,-995338651);

    a = md5ii(a,b,c,d,x[i+ 0], 6,-198630844); d=md5ii(d,a,b,c,x[i+ 7],10,1126891415);
    c = md5ii(c,d,a,b,x[i+14],15,-1416354905);b=md5ii(b,c,d,a,x[i+ 5],21,-57434055);
    a = md5ii(a,b,c,d,x[i+12], 6,1700485571); d=md5ii(d,a,b,c,x[i+ 3],10,-1894986606);
    c = md5ii(c,d,a,b,x[i+10],15,-1051523);   b=md5ii(b,c,d,a,x[i+ 1],21,-2054922799);
    a = md5ii(a,b,c,d,x[i+ 8], 6,1873313359); d=md5ii(d,a,b,c,x[i+15],10,-30611744);
    c = md5ii(c,d,a,b,x[i+ 6],15,-1560198380);b=md5ii(b,c,d,a,x[i+13],21,1309151649);
    a = md5ii(a,b,c,d,x[i+ 4], 6,-145523070); d=md5ii(d,a,b,c,x[i+11],10,-1120210379);
    c = md5ii(c,d,a,b,x[i+ 2],15, 718787259); b=md5ii(b,c,d,a,x[i+ 9],21,-343485551);

    a = safeAdd(a, olda); b = safeAdd(b, oldb);
    c = safeAdd(c, oldc); d = safeAdd(d, oldd);
  }

  const buf = new ArrayBuffer(16);
  const view = new DataView(buf);
  [a, b, c, d].forEach((v, i) => view.setInt32(i * 4, v, true));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashText(
  text: string,
  algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> {
  if (algorithm === 'MD5') return md5(text);

  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Regex Tester ─────────────────────────────────────────────────────────────

export interface RegexResult {
  matches: { match: string; index: number; groups: string[] }[];
  count: number;
  replaced?: string;
  error?: string;
}

export function testRegex(
  pattern: string,
  flags: string,
  input: string,
  replacement?: string
): RegexResult {
  if (!pattern) return { matches: [], count: 0 };
  try {
    // Ensure global flag for finding all matches
    const flagSet = new Set(flags.split(''));
    flagSet.add('g');
    const re = new RegExp(pattern, [...flagSet].join(''));

    const matches: RegexResult['matches'] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(input)) !== null) {
      matches.push({
        match: m[0],
        index: m.index,
        groups: m.slice(1),
      });
      if (!re.global) break;
    }

    let replaced: string | undefined;
    if (replacement !== undefined) {
      const re2 = new RegExp(pattern, flags);
      replaced = input.replace(re2, replacement);
    }

    return { matches, count: matches.length, replaced };
  } catch (e) {
    return { matches: [], count: 0, error: (e as Error).message };
  }
}

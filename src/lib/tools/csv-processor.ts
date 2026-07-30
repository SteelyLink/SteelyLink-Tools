// RFC 4180 compliant CSV processor

export type Delimiter = ',' | ';' | '\t' | '|';

export interface ParseOptions {
  delimiter?: Delimiter;
  trimSpaces?: boolean;
  maxRows?: number;
}

export interface ParseResult {
  rows: string[][];
  delimiter: Delimiter;
  truncated: boolean;
  totalLineCount: number;
}

export interface FormatOptions {
  inputDelimiter?: Delimiter;
  outputDelimiter?: Delimiter;
  trimSpaces?: boolean;
  fillMissingCols?: boolean;
  addBOM?: boolean;
}

export interface ValidationIssue {
  row: number;
  col?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  rowCount: number;
  colCount: number;
  issues: ValidationIssue[];
  duplicateHeaders: string[];
  emptyRowIndices: number[];
}

// Score-based delimiter auto-detection
export function detectDelimiter(text: string): Delimiter {
  const sample = text.slice(0, 8192);
  const candidates: Delimiter[] = [',', ';', '\t', '|'];

  // For each delimiter, parse 5 lines and score consistency
  const scores: Record<string, number> = {};

  for (const delim of candidates) {
    const lines = sample.split('\n').slice(0, 10).filter(l => l.trim().length > 0);
    if (lines.length < 2) { scores[delim] = 0; continue; }

    const counts = lines.map(line => {
      let count = 0;
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQuote = !inQuote; }
        else if (!inQuote && line[i] === delim) count++;
      }
      return count;
    });

    const first = counts[0];
    if (first === 0) { scores[delim] = 0; continue; }

    // Score = (consistency across lines) * count_in_first_line
    const consistent = counts.filter(c => c === first).length;
    scores[delim] = (consistent / counts.length) * (first + 1);
  }

  let best: Delimiter = ',';
  let bestScore = -1;
  for (const delim of candidates) {
    if (scores[delim] > bestScore) {
      bestScore = scores[delim];
      best = delim;
    }
  }
  return best;
}

// RFC 4180 parser — handles quoted fields, embedded newlines, escaped quotes
export function parseCSVText(text: string, options: ParseOptions = {}): ParseResult {
  const MAX_ROWS = options.maxRows ?? 5000;
  const trim = options.trimSpaces ?? false;
  const detectedDelim = options.delimiter ?? detectDelimiter(text);
  const delim = detectedDelim;

  const rows: string[][] = [];
  let pos = 0;
  const len = text.length;
  let truncated = false;
  let lineCount = 0;

  while (pos < len) {
    if (rows.length >= MAX_ROWS) {
      // Count remaining lines for totalLineCount
      while (pos < len) {
        if (text[pos] === '\n') lineCount++;
        pos++;
      }
      truncated = true;
      break;
    }

    const row: string[] = [];
    let fieldStart = true;

    while (pos <= len) {
      // End of input
      if (pos === len) {
        if (fieldStart && row.length > 0) row.push(''); // trailing delimiter → empty last field
        if (row.length > 0) rows.push(row);
        lineCount++;
        pos++;
        break;
      }

      const ch = text[pos];

      // Quoted field
      if (fieldStart && ch === '"') {
        pos++; // skip opening quote
        let field = '';
        while (pos < len) {
          if (text[pos] === '"') {
            if (pos + 1 < len && text[pos + 1] === '"') {
              field += '"';
              pos += 2;
            } else {
              pos++; // skip closing quote
              break;
            }
          } else {
            field += text[pos++];
          }
        }
        row.push(trim ? field.trim() : field);
        fieldStart = false;

        // After closing quote: expect delimiter or newline
        if (pos < len && text[pos] === delim) {
          pos++;
          fieldStart = true;
        } else if (pos < len && (text[pos] === '\r' || text[pos] === '\n')) {
          if (text[pos] === '\r' && pos + 1 < len && text[pos + 1] === '\n') pos++;
          pos++;
          lineCount++;
          rows.push(row);
          break;
        }
      } else if (ch === delim) {
        // Empty field before delimiter
        if (fieldStart) row.push('');
        pos++;
        fieldStart = true;
      } else if (ch === '\r' || ch === '\n') {
        if (fieldStart) row.push('');
        else { /* last field already pushed */ }
        // Flush last unquoted field if fieldStart is false and nothing pushed
        if (text[pos] === '\r' && pos + 1 < len && text[pos + 1] === '\n') pos++;
        pos++;
        lineCount++;
        rows.push(row);
        break;
      } else {
        // Unquoted field
        let field = '';
        while (pos < len && text[pos] !== delim && text[pos] !== '\r' && text[pos] !== '\n') {
          field += text[pos++];
        }
        row.push(trim ? field.trim() : field);
        fieldStart = false;

        if (pos < len && text[pos] === delim) {
          pos++;
          fieldStart = true;
        } else if (pos < len && (text[pos] === '\r' || text[pos] === '\n')) {
          if (text[pos] === '\r' && pos + 1 < len && text[pos + 1] === '\n') pos++;
          pos++;
          lineCount++;
          rows.push(row);
          break;
        }
        // pos === len handled by outer while
      }
    }
  }

  // Filter truly empty lines (single empty string from blank line)
  const cleaned = rows.filter(r => !(r.length === 1 && r[0] === ''));

  return {
    rows: cleaned,
    delimiter: delim,
    truncated,
    totalLineCount: lineCount,
  };
}

// Escape a single field per RFC 4180
export function escapeCSVField(field: string, delimiter: Delimiter): string {
  const needsQuote = field.includes('"') || field.includes(delimiter) || field.includes('\n') || field.includes('\r');
  if (!needsQuote) return field;
  return '"' + field.replace(/"/g, '""') + '"';
}

// Re-serialize rows back to CSV text
function serializeRows(rows: string[][], delimiter: Delimiter, addBOM: boolean): string {
  const lines = rows.map(row => row.map(f => escapeCSVField(f, delimiter)).join(delimiter));
  const body = lines.join('\r\n');
  return addBOM ? '﻿' + body : body;
}

// Format: normalize delimiter, trim, fill missing columns
export function formatCSVData(rows: string[][], options: FormatOptions = {}): string {
  const outDelim = options.outputDelimiter ?? ',';
  const trim = options.trimSpaces ?? false;
  const fill = options.fillMissingCols ?? false;
  const bom = options.addBOM ?? false;

  const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);

  const normalized = rows.map(row => {
    const r = trim ? row.map(f => f.trim()) : [...row];
    if (fill && r.length < maxCols) {
      while (r.length < maxCols) r.push('');
    }
    return r;
  });

  return serializeRows(normalized, outDelim, bom);
}

// Validate parsed rows
export function validateCSVData(rows: string[][], options: { allowEmptyFields?: boolean } = {}): ValidationResult {
  const issues: ValidationIssue[] = [];
  const emptyRowIndices: number[] = [];

  if (rows.length === 0) {
    return { valid: false, rowCount: 0, colCount: 0, issues: [{ row: 0, message: 'File is empty', severity: 'error' }], duplicateHeaders: [], emptyRowIndices: [] };
  }

  const headerRow = rows[0];
  const colCount = headerRow.length;

  // Duplicate header check
  const seen = new Set<string>();
  const duplicateHeaders: string[] = [];
  for (const h of headerRow) {
    const key = h.trim().toLowerCase();
    if (seen.has(key)) duplicateHeaders.push(h);
    else seen.add(key);
  }
  if (duplicateHeaders.length > 0) {
    issues.push({ row: 1, message: `Duplicate header(s): ${duplicateHeaders.join(', ')}`, severity: 'warning' });
  }

  // Row consistency check
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (row.every(f => f.trim() === '')) {
      emptyRowIndices.push(i);
      issues.push({ row: rowNum, message: `Row ${rowNum} is empty`, severity: 'warning' });
      continue;
    }

    if (row.length !== colCount) {
      issues.push({
        row: rowNum,
        message: `Row ${rowNum} has ${row.length} column(s), expected ${colCount}`,
        severity: 'error',
      });
    }

    if (!options.allowEmptyFields) {
      for (let c = 0; c < row.length; c++) {
        if (row[c].trim() === '') {
          issues.push({ row: rowNum, col: c + 1, message: `Row ${rowNum}, Col ${c + 1} is empty`, severity: 'warning' });
        }
      }
    }
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    rowCount: rows.length,
    colCount,
    issues,
    duplicateHeaders,
    emptyRowIndices,
  };
}

// Build a Set of row indices that have issues (for table highlighting)
export function getIssueRowSet(issues: ValidationIssue[]): Set<number> {
  const s = new Set<number>();
  for (const issue of issues) s.add(issue.row - 1); // convert to 0-indexed
  return s;
}

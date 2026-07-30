// Calculator utility library
// Pure functions, no side effects

// ─── Base Number Conversion ──────────────────────────────────────────────────

export function convertBase(
  value: string,
  fromBase: number,
  toBase: number
): { result: string; error?: string } {
  if (!value.trim()) return { result: '' };
  try {
    const n = parseInt(value.trim(), fromBase);
    if (isNaN(n)) return { result: '', error: `Invalid number for base ${fromBase}` };
    return { result: n.toString(toBase).toUpperCase() };
  } catch (e) {
    return { result: '', error: (e as Error).message };
  }
}

// ─── Random Number Generator ─────────────────────────────────────────────────

export function generateRandom(
  min: number,
  max: number,
  count: number,
  decimals: number
): number[] {
  const factor = Math.pow(10, decimals);
  return Array.from({ length: count }, () => {
    const raw = Math.random() * (max - min) + min;
    return Math.round(raw * factor) / factor;
  });
}

// ─── Binary Arithmetic ───────────────────────────────────────────────────────

export function binaryCalc(
  a: string,
  b: string,
  op: '+' | '-' | '*' | '/'
): { result: string; decimal: number; error?: string } {
  const na = parseInt(a.trim().replace(/\s/g, ''), 2);
  const nb = parseInt(b.trim().replace(/\s/g, ''), 2);
  if (isNaN(na)) return { result: '', decimal: 0, error: 'Invalid binary number A' };
  if (isNaN(nb)) return { result: '', decimal: 0, error: 'Invalid binary number B' };
  let result: number;
  switch (op) {
    case '+': result = na + nb; break;
    case '-': result = na - nb; break;
    case '*': result = na * nb; break;
    case '/':
      if (nb === 0) return { result: '', decimal: 0, error: 'Division by zero' };
      result = Math.trunc(na / nb);
      break;
  }
  return { result: result.toString(2), decimal: result };
}

// ─── Boolean Logic ───────────────────────────────────────────────────────────

export function booleanCalc(
  a: boolean,
  b: boolean,
  op: 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR'
): boolean {
  switch (op) {
    case 'AND':  return a && b;
    case 'OR':   return a || b;
    case 'XOR':  return a !== b;
    case 'NAND': return !(a && b);
    case 'NOR':  return !(a || b);
    case 'XNOR': return a === b;
  }
}

export function evaluateBooleanExpression(
  expr: string
): { result: boolean | null; steps: string[]; error?: string } {
  const steps: string[] = [];
  try {
    let e = expr.trim();
    // Normalize
    e = e
      .replace(/\bAND\b/gi, '&&')
      .replace(/\bOR\b/gi, '||')
      .replace(/\bXOR\b/gi, '^')
      .replace(/\bNOT\b/gi, '!')
      .replace(/\bNAND\b/gi, '!&&')
      .replace(/\bNOR\b/gi, '!||')
      .replace(/\bTRUE\b/gi, 'true')
      .replace(/\bFALSE\b/gi, 'false')
      .replace(/\b1\b/g, 'true')
      .replace(/\b0\b/g, 'false');

    steps.push(`Normalized: ${e}`);

    // Safe eval using Function constructor (subset of JS boolean logic only)
    // Validate: only allow safe tokens
    const safePattern = /^[\s\(\)!&|^truefals0-9]+$/;
    if (!safePattern.test(e)) {
      return { result: null, steps, error: 'Expression contains invalid characters' };
    }

    // eslint-disable-next-line no-new-func
    const fn = new Function(`return !!(${e})`);
    const result = fn() as boolean;
    steps.push(`Result: ${result}`);
    return { result, steps };
  } catch (err) {
    return { result: null, steps, error: (err as Error).message };
  }
}

// ─── Bitwise Operations ──────────────────────────────────────────────────────

export function bitwiseCalc(
  a: number,
  b: number,
  op: 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT'
): { result: number; binary: string; hex: string } {
  let result: number;
  switch (op) {
    case 'AND':    result = a & b; break;
    case 'OR':     result = a | b; break;
    case 'XOR':    result = a ^ b; break;
    case 'NOT':    result = ~a; break;
    case 'LSHIFT': result = a << b; break;
    case 'RSHIFT': result = a >> b; break;
  }
  return {
    result,
    binary: result < 0
      ? '-' + Math.abs(result).toString(2)
      : result.toString(2),
    hex: result < 0
      ? '-' + Math.abs(result).toString(16).toUpperCase()
      : result.toString(16).toUpperCase(),
  };
}

// ─── IP / Subnet Calculator ──────────────────────────────────────────────────

export interface IPInfo {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  hosts: number;
  cidr: string;
  subnetMask: string;
  wildcardMask: string;
  ipClass: string;
}

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.');
}

export function calculateIP(
  ip: string,
  cidr: number
): { result: IPInfo; error?: string } {
  const ipMatch = ip.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipMatch) return { result: {} as IPInfo, error: 'Invalid IP address' };
  if (cidr < 0 || cidr > 32) return { result: {} as IPInfo, error: 'CIDR must be 0–32' };

  const parts = [1, 2, 3, 4].map((i) => parseInt(ipMatch[i]));
  if (parts.some((p) => p > 255)) return { result: {} as IPInfo, error: 'Invalid IP octets' };

  const ipInt = ipToInt(ip.trim());
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const networkInt = (ipInt & mask) >>> 0;
  const broadcastInt = (networkInt | wildcard) >>> 0;
  const hosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : wildcard - 1;
  const firstHost = cidr >= 31 ? networkInt : networkInt + 1;
  const lastHost = cidr >= 31 ? broadcastInt : broadcastInt - 1;

  // Determine class
  const first = (ipInt >>> 24) & 0xff;
  let ipClass = 'E';
  if (first < 128) ipClass = 'A';
  else if (first < 192) ipClass = 'B';
  else if (first < 224) ipClass = 'C';
  else if (first < 240) ipClass = 'D (Multicast)';

  return {
    result: {
      network: intToIp(networkInt),
      broadcast: intToIp(broadcastInt),
      firstHost: intToIp(firstHost),
      lastHost: intToIp(lastHost),
      hosts,
      cidr: `${intToIp(networkInt)}/${cidr}`,
      subnetMask: intToIp(mask),
      wildcardMask: intToIp(wildcard),
      ipClass,
    },
  };
}

// ─── Time Difference ─────────────────────────────────────────────────────────

export interface TimeDiff {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalSeconds: number;
}

export function calcTimeDiff(
  date1: string,
  date2: string
): { result: TimeDiff; error?: string } {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1.getTime())) return { result: {} as TimeDiff, error: 'Invalid start date' };
  if (isNaN(d2.getTime())) return { result: {} as TimeDiff, error: 'Invalid end date' };

  const [start, end] = d1 <= d2 ? [d1, d2] : [d2, d1];
  const totalMs = end.getTime() - start.getTime();
  const totalSeconds = Math.floor(totalMs / 1000);
  const totalHours = Math.floor(totalMs / 3_600_000);
  const totalDays = Math.floor(totalMs / 86_400_000);

  // Component breakdown
  let y = end.getFullYear() - start.getFullYear();
  let mo = end.getMonth() - start.getMonth();
  let d = end.getDate() - start.getDate();
  let h = end.getHours() - start.getHours();
  let mi = end.getMinutes() - start.getMinutes();
  let s = end.getSeconds() - start.getSeconds();

  if (s < 0) { s += 60; mi--; }
  if (mi < 0) { mi += 60; h--; }
  if (h < 0) { h += 24; d--; }
  if (d < 0) {
    mo--;
    const daysInPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    d += daysInPrevMonth;
  }
  if (mo < 0) { mo += 12; y--; }

  return { result: { years: y, months: mo, days: d, hours: h, minutes: mi, seconds: s, totalDays, totalHours, totalSeconds } };
}

// ─── Date Calculator ─────────────────────────────────────────────────────────

export function addToDate(
  date: string,
  value: number,
  unit: 'days' | 'months' | 'years'
): { result: string; error?: string } {
  const d = new Date(date);
  if (isNaN(d.getTime())) return { result: '', error: 'Invalid date' };
  switch (unit) {
    case 'days':   d.setDate(d.getDate() + value); break;
    case 'months': d.setMonth(d.getMonth() + value); break;
    case 'years':  d.setFullYear(d.getFullYear() + value); break;
  }
  return { result: d.toISOString().slice(0, 10) };
}

// ─── BMI Calculator ──────────────────────────────────────────────────────────

export interface BMIResult {
  bmi: number;
  category: string;
  healthyRange: string;
}

export function calcBMI(
  weight: number,
  height: number,
  unit: 'metric' | 'imperial'
): BMIResult {
  let bmi: number;
  if (unit === 'metric') {
    // weight kg, height cm
    const h = height / 100;
    bmi = weight / (h * h);
  } else {
    // weight lbs, height inches
    bmi = (703 * weight) / (height * height);
  }
  bmi = Math.round(bmi * 10) / 10;

  let category: string;
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else if (bmi < 35) category = 'Obese (Class I)';
  else if (bmi < 40) category = 'Obese (Class II)';
  else category = 'Obese (Class III)';

  // Healthy range for the given height
  let healthyRange: string;
  if (unit === 'metric') {
    const h = height / 100;
    const low = Math.round(18.5 * h * h * 10) / 10;
    const high = Math.round(24.9 * h * h * 10) / 10;
    healthyRange = `${low}–${high} kg`;
  } else {
    const low = Math.round((18.5 * height * height) / 703 * 10) / 10;
    const high = Math.round((24.9 * height * height) / 703 * 10) / 10;
    healthyRange = `${low}–${high} lbs`;
  }

  return { bmi, category, healthyRange };
}

// ─── Loan Calculator ─────────────────────────────────────────────────────────

export interface LoanResult {
  monthly: number;
  total: number;
  interest: number;
  schedule: {
    month: number;
    payment: number;
    principal: number;
    interestPmt: number;
    balance: number;
  }[];
}

export function calcLoan(
  principal: number,
  rate: number, // annual %
  years: number
): LoanResult {
  const monthlyRate = rate / 100 / 12;
  const n = years * 12;

  let monthly: number;
  if (monthlyRate === 0) {
    monthly = principal / n;
  } else {
    monthly =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);
  }
  monthly = Math.round(monthly * 100) / 100;

  const schedule: LoanResult['schedule'] = [];
  let balance = principal;
  for (let i = 1; i <= n; i++) {
    const interestPmt = Math.round(balance * monthlyRate * 100) / 100;
    const principalPmt = Math.round((monthly - interestPmt) * 100) / 100;
    balance = Math.round((balance - principalPmt) * 100) / 100;
    if (balance < 0) balance = 0;
    schedule.push({
      month: i,
      payment: monthly,
      principal: principalPmt,
      interestPmt,
      balance,
    });
  }

  const total = Math.round(monthly * n * 100) / 100;
  const interest = Math.round((total - principal) * 100) / 100;

  return { monthly, total, interest, schedule };
}

// ─── String Analysis ─────────────────────────────────────────────────────────

export interface StringAnalysis {
  length: number;
  bytes: number;
  words: number;
  lines: number;
  unique: number;
  mostFrequent: { char: string; count: number }[];
}

export function analyzeString(text: string): StringAnalysis {
  const length = [...text].length; // code-point length
  const bytes = new TextEncoder().encode(text).length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const lines = text === '' ? 0 : text.split('\n').length;

  const freq: Map<string, number> = new Map();
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }
  const unique = freq.size;
  const mostFrequent = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([char, count]) => ({ char, count }));

  return { length, bytes, words, lines, unique, mostFrequent };
}

// ─── Matrix Operations ───────────────────────────────────────────────────────

export function matrixAdd(
  a: number[][],
  b: number[][]
): { result: number[][] | null; error?: string } {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    return { result: null, error: 'Matrices must have the same dimensions' };
  }
  const result = a.map((row, i) => row.map((val, j) => val + b[i][j]));
  return { result };
}

export function matrixMultiply(
  a: number[][],
  b: number[][]
): { result: number[][] | null; error?: string } {
  const ra = a.length, ca = a[0].length;
  const rb = b.length, cb = b[0].length;
  if (ca !== rb) {
    return { result: null, error: `Cannot multiply ${ra}×${ca} by ${rb}×${cb} matrix` };
  }
  const result: number[][] = Array.from({ length: ra }, () =>
    Array(cb).fill(0)
  );
  for (let i = 0; i < ra; i++) {
    for (let j = 0; j < cb; j++) {
      for (let k = 0; k < ca; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return { result };
}

export function matrixTranspose(a: number[][]): number[][] {
  const rows = a.length;
  const cols = a[0]?.length ?? 0;
  return Array.from({ length: cols }, (_, j) =>
    Array.from({ length: rows }, (_, i) => a[i][j])
  );
}

export function parseMatrix(text: string): { matrix: number[][] | null; error?: string } {
  const lines = text
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { matrix: null, error: 'Empty input' };

  const matrix: number[][] = [];
  let colCount = -1;
  for (const line of lines) {
    const nums = line.split(/[\s,;|]+/).filter(Boolean).map(Number);
    if (nums.some(isNaN)) return { matrix: null, error: `Non-numeric value in: "${line}"` };
    if (colCount === -1) colCount = nums.length;
    else if (nums.length !== colCount) return { matrix: null, error: 'Rows must have equal column counts' };
    matrix.push(nums);
  }
  return { matrix };
}

export function matrixToString(m: number[][]): string {
  const cols = m[0]?.length ?? 0;
  const colWidths = Array.from({ length: cols }, (_, j) =>
    Math.max(...m.map((row) => String(Math.round(row[j] * 1000) / 1000).length))
  );
  return m
    .map((row) =>
      row
        .map((v, j) => String(Math.round(v * 1000) / 1000).padStart(colWidths[j]))
        .join('  ')
    )
    .join('\n');
}

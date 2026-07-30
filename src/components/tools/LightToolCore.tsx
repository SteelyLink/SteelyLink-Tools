'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { countWords, generatePassword, type PasswordOptions } from '@/lib/tools/dev-processor';
import type { LightMode } from '@/types/tools';

interface Props {
  mode: LightMode;
}

function clipboardWrite(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

function MapEmbed({ lat, lng, zoom = 13, className }: { lat: number; lng: number; zoom?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    let cancelled = false;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      if (cancelled || !ref.current) return;

      const pinIcon = L.divIcon({
        html: '<svg width="28" height="40" viewBox="0 0 28 40" fill="none"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#EF4444"/><circle cx="14" cy="14" r="6" fill="white"/></svg>',
        className: '',
        iconSize: [28, 40],
        iconAnchor: [14, 40],
      });

      const map = L.map(ref.current, { center: [lat, lng], zoom });

      L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
        subdomains: [],
      }).addTo(map);

      L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [lat, lng, zoom]);

  return <div ref={ref} className={className} />;
}

function WordCounter() {
  const t = useTranslations('Tool');
  const [text, setText] = useState('');
  const stats = countWords(text);

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('wordCounterPlaceholder')}
        className="input-field w-full px-4 py-3 text-sm min-h-[240px] resize-none block"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: t('statWords'), value: stats.words.toLocaleString(), icon: 'title', color: 'text-indigo-400' },
          { label: t('statCharacters'), value: stats.characters.toLocaleString(), icon: 'format_size', color: 'text-blue-400' },
          { label: t('statNoSpaces'), value: stats.charactersNoSpaces.toLocaleString(), icon: 'space_bar', color: 'text-violet-400' },
          { label: t('statSentences'), value: stats.sentences.toLocaleString(), icon: 'segment', color: 'text-emerald-400' },
          { label: t('statParagraphs'), value: stats.paragraphs.toLocaleString(), icon: 'view_agenda', color: 'text-teal-400' },
          {
            label: t('statReadingTime'),
            value: stats.readingTimeMin > 0
              ? `${stats.readingTimeMin}m ${stats.readingTimeSec}s`
              : stats.readingTimeSec > 0 ? `${stats.readingTimeSec}s` : '—',
            icon: 'schedule',
            color: 'text-amber-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <span className={`material-symbols-outlined text-2xl ${stat.color} mb-1.5 block`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {stat.icon}
            </span>
            <p className="text-slate-100 text-xl font-bold">{stat.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
      {text && (
        <button onClick={() => setText('')} className="btn-ghost text-sm">
          {t('clearText')}
        </button>
      )}
    </div>
  );
}

function QRCodeGenerator() {
  const t = useTranslations('Tool');
  const [input, setInput] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [size, setSize] = useState(256);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!input.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(input, {
        width: size,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(url);
    } catch {
      setError('Failed to generate QR code.');
    } finally {
      setGenerating(false);
    }
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-slate-400 text-sm font-medium mb-2 block">{t('qrUrlOrText')}</label>
        <input
          type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generate()}
          placeholder="https://example.com or any text..."
          className="input-field w-full px-4 py-3 text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">{t('qrSize')}</label>
          <div className="flex gap-2">
            {[128, 256, 512].map((s) => (
              <button key={s} onClick={() => setSize(s)}
                className={`px-3 py-2 text-xs rounded-lg border transition-all ${size === s ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                {s}px
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={!input || generating}
          className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-60">
          <span className="material-symbols-outlined text-lg">qr_code</span>
          {generating ? t('generatingDots') : t('generate')}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {qrDataUrl && (
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-2xl animate-fade-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR Code" className="w-40 h-40 flex-shrink-0" loading="lazy" decoding="async" />
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-slate-800 text-sm font-medium break-all">{input}</p>
            <button onClick={download} className="btn-primary text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-base">download</span>
              {t('downloadPng')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordGeneratorTool() {
  const t = useTranslations('Tool');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: true,
  });
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const generate = () => {
    const newPasswords = Array.from({ length: 5 }, () => generatePassword(options));
    setPasswords(newPasswords);
  };

  const copy = async (pwd: string, idx: number) => {
    await clipboardWrite(pwd);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => { generate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOpt = (key: keyof PasswordOptions) => {
    if (typeof options[key] === 'boolean') {
      setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const strength = [options.uppercase, options.lowercase, options.numbers, options.symbols].filter(Boolean).length;
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const strengthLabels = [t('pwWeak'), t('pwFair'), t('pwGood'), t('pwStrong')];

  return (
    <div className="space-y-5">
      {/* Length slider */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-slate-400 text-sm font-medium">{t('pwLength')}</label>
          <span className="text-indigo-400 font-bold">{options.length}</span>
        </div>
        <input
          type="range" min={8} max={64} value={options.length}
          onChange={(e) => setOptions((p) => ({ ...p, length: Number(e.target.value) }))}
          className="w-full accent-indigo-500"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'uppercase', label: t('pwUppercase') },
          { key: 'lowercase', label: t('pwLowercase') },
          { key: 'numbers',   label: t('pwNumbers') },
          { key: 'symbols',   label: t('pwSymbols') },
          { key: 'excludeAmbiguous', label: t('pwExcludeAmbiguous') },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox"
              checked={options[key as keyof PasswordOptions] as boolean}
              onChange={() => toggleOpt(key as keyof PasswordOptions)}
              className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
            />
            <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{label}</span>
          </label>
        ))}
      </div>

      {/* Strength indicator */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-slate-700'}`} />
          ))}
        </div>
        <span className={`text-xs font-medium ${strengthColors[strength - 1]?.replace('bg-', 'text-') || 'text-slate-500'}`}>
          {strengthLabels[strength - 1] || t('pwVeryWeak')}
        </span>
      </div>

      <button onClick={generate} className="btn-primary flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">refresh</span>
        {t('generatePasswords')}
      </button>

      {passwords.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          {passwords.map((pwd, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl group">
              <span className="text-slate-200 text-sm font-mono break-all mr-3">{pwd}</span>
              <button onClick={() => copy(pwd, i)}
                className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
                <span className="material-symbols-outlined text-sm">{copied === i ? 'check' : 'content_copy'}</span>
                {copied === i ? t('copied') : t('copy')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string | React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-slate-200 text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

// ─── Timezone Converter ───────────────────────────────────────────────────────

const TIMEZONES = [
  // Americas
  { city: 'Honolulu',       zh: '火奴鲁鲁',        tz: 'Pacific/Honolulu' },
  { city: 'Anchorage',      zh: '安克雷奇',        tz: 'America/Anchorage' },
  { city: 'Vancouver',      zh: '温哥华',          tz: 'America/Vancouver' },
  { city: 'Los Angeles',    zh: '洛杉矶',          tz: 'America/Los_Angeles' },
  { city: 'Phoenix',        zh: '凤凰城',          tz: 'America/Phoenix' },
  { city: 'Denver',         zh: '丹佛',            tz: 'America/Denver' },
  { city: 'Mexico City',    zh: '墨西哥城',        tz: 'America/Mexico_City' },
  { city: 'Chicago',        zh: '芝加哥',          tz: 'America/Chicago' },
  { city: 'Miami',          zh: '迈阿密',          tz: 'America/New_York' },
  { city: 'New York',       zh: '纽约',            tz: 'America/New_York' },
  { city: 'Toronto',        zh: '多伦多',          tz: 'America/Toronto' },
  { city: 'Montreal',       zh: '蒙特利尔',        tz: 'America/Toronto' },
  { city: 'Bogota',         zh: '波哥大',          tz: 'America/Bogota' },
  { city: 'Lima',           zh: '利马',            tz: 'America/Lima' },
  { city: 'Caracas',        zh: '加拉加斯',        tz: 'America/Caracas' },
  { city: 'Santiago',       zh: '圣地亚哥',        tz: 'America/Santiago' },
  { city: 'Sao Paulo',      zh: '圣保罗',          tz: 'America/Sao_Paulo' },
  { city: 'Buenos Aires',   zh: '布宜诺斯艾利斯',   tz: 'America/Argentina/Buenos_Aires' },
  // Europe
  { city: 'Lisbon',         zh: '里斯本',          tz: 'Europe/Lisbon' },
  { city: 'London',         zh: '伦敦',            tz: 'Europe/London' },
  { city: 'Casablanca',     zh: '卡萨布兰卡',      tz: 'Africa/Casablanca' },
  { city: 'Madrid',         zh: '马德里',          tz: 'Europe/Madrid' },
  { city: 'Paris',          zh: '巴黎',            tz: 'Europe/Paris' },
  { city: 'Berlin',         zh: '柏林',            tz: 'Europe/Berlin' },
  { city: 'Amsterdam',      zh: '阿姆斯特丹',      tz: 'Europe/Amsterdam' },
  { city: 'Rome',           zh: '罗马',            tz: 'Europe/Rome' },
  { city: 'Vienna',         zh: '维也纳',          tz: 'Europe/Vienna' },
  { city: 'Warsaw',         zh: '华沙',            tz: 'Europe/Warsaw' },
  { city: 'Stockholm',      zh: '斯德哥尔摩',      tz: 'Europe/Stockholm' },
  { city: 'Oslo',           zh: '奥斯陆',          tz: 'Europe/Oslo' },
  { city: 'Copenhagen',     zh: '哥本哈根',        tz: 'Europe/Copenhagen' },
  { city: 'Helsinki',       zh: '赫尔辛基',        tz: 'Europe/Helsinki' },
  { city: 'Athens',         zh: '雅典',            tz: 'Europe/Athens' },
  { city: 'Kyiv',           zh: '基辅',            tz: 'Europe/Kyiv' },
  { city: 'Bucharest',      zh: '布加勒斯特',      tz: 'Europe/Bucharest' },
  { city: 'Istanbul',       zh: '伊斯坦布尔',      tz: 'Europe/Istanbul' },
  { city: 'Moscow',         zh: '莫斯科',          tz: 'Europe/Moscow' },
  // Africa
  { city: 'Lagos',          zh: '拉各斯',          tz: 'Africa/Lagos' },
  { city: 'Cape Town',      zh: '开普敦',          tz: 'Africa/Johannesburg' },
  { city: 'Nairobi',        zh: '内罗毕',          tz: 'Africa/Nairobi' },
  { city: 'Cairo',          zh: '开罗',            tz: 'Africa/Cairo' },
  { city: 'Addis Ababa',    zh: '亚的斯亚贝巴',    tz: 'Africa/Addis_Ababa' },
  // Middle East
  { city: 'Jerusalem',      zh: '耶路撒冷',        tz: 'Asia/Jerusalem' },
  { city: 'Baghdad',        zh: '巴格达',          tz: 'Asia/Baghdad' },
  { city: 'Riyadh',         zh: '利雅得',          tz: 'Asia/Riyadh' },
  { city: 'Dubai',          zh: '迪拜',            tz: 'Asia/Dubai' },
  { city: 'Tehran',         zh: '德黑兰',          tz: 'Asia/Tehran' },
  // South & Central Asia
  { city: 'Karachi',        zh: '卡拉奇',          tz: 'Asia/Karachi' },
  { city: 'Tashkent',       zh: '塔什干',          tz: 'Asia/Tashkent' },
  { city: 'Almaty',         zh: '阿拉木图',        tz: 'Asia/Almaty' },
  { city: 'Mumbai',         zh: '孟买',            tz: 'Asia/Kolkata' },
  { city: 'Colombo',        zh: '科伦坡',          tz: 'Asia/Colombo' },
  { city: 'Dhaka',          zh: '达卡',            tz: 'Asia/Dhaka' },
  { city: 'Yangon',         zh: '仰光',            tz: 'Asia/Yangon' },
  // Southeast Asia
  { city: 'Bangkok',        zh: '曼谷',            tz: 'Asia/Bangkok' },
  { city: 'Ho Chi Minh',    zh: '胡志明市',        tz: 'Asia/Ho_Chi_Minh' },
  { city: 'Jakarta',        zh: '雅加达',          tz: 'Asia/Jakarta' },
  { city: 'Kuala Lumpur',   zh: '吉隆坡',          tz: 'Asia/Kuala_Lumpur' },
  { city: 'Singapore',      zh: '新加坡',          tz: 'Asia/Singapore' },
  { city: 'Manila',         zh: '马尼拉',          tz: 'Asia/Manila' },
  // East Asia
  { city: 'Beijing',        zh: '北京',            tz: 'Asia/Shanghai' },
  { city: 'Shanghai',       zh: '上海',            tz: 'Asia/Shanghai' },
  { city: 'Hong Kong',      zh: '香港',            tz: 'Asia/Hong_Kong' },
  { city: 'Taipei',         zh: '台北',            tz: 'Asia/Taipei' },
  { city: 'Seoul',          zh: '首尔',            tz: 'Asia/Seoul' },
  { city: 'Tokyo',          zh: '东京',            tz: 'Asia/Tokyo' },
  { city: 'Osaka',          zh: '大阪',            tz: 'Asia/Tokyo' },
  // Russia
  { city: 'Novosibirsk',    zh: '新西伯利亚',      tz: 'Asia/Novosibirsk' },
  { city: 'Vladivostok',    zh: '海参崴',          tz: 'Asia/Vladivostok' },
  // Oceania
  { city: 'Perth',          zh: '珀斯',            tz: 'Australia/Perth' },
  { city: 'Adelaide',       zh: '阿德莱德',        tz: 'Australia/Adelaide' },
  { city: 'Melbourne',      zh: '墨尔本',          tz: 'Australia/Melbourne' },
  { city: 'Sydney',         zh: '悉尼',            tz: 'Australia/Sydney' },
  { city: 'Guam',           zh: '关岛',            tz: 'Pacific/Guam' },
  { city: 'Auckland',       zh: '奥克兰',          tz: 'Pacific/Auckland' },
  { city: 'Fiji',           zh: '苏瓦',            tz: 'Pacific/Fiji' },
];

function tzFmt(date: Date, tz: string, opts: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en', { timeZone: tz, ...opts }).format(date);
}

function getOffset(tz: string): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' })
    .formatToParts(new Date());
  return parts.find(p => p.type === 'timeZoneName')?.value ?? '';
}

function TimezoneConverter() {
  const t = useTranslations('Tool');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const isZh = locale.startsWith('zh');

  const [now, setNow] = useState(new Date());
  // selectedCities stores city English names (unique), not tz strings
  const [selectedCities, setSelectedCities] = useState<string[]>([
    'New York', 'London', 'Shanghai', 'Tokyo',
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const displayDate = useCustom && customDate ? new Date(customDate) : now;
  const validDisplay = !isNaN(displayDate.getTime());

  const q = searchQuery.toLowerCase();
  const filteredTzs = TIMEZONES.filter(
    ({ city, zh, tz }) =>
      city.toLowerCase().includes(q) ||
      zh.includes(searchQuery) ||
      tz.toLowerCase().includes(q)
  );

  const getCityName = (entry: typeof TIMEZONES[0]) => isZh ? entry.zh : entry.city;

  return (
    <div className="space-y-5">
      {/* Custom datetime toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setUseCustom(v => !v)}
        >
          <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${useCustom ? 'bg-indigo-600' : 'bg-slate-600'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${useCustom ? 'left-6' : 'left-1'}`} />
          </div>
          <span className="text-sm text-slate-300">{t('tzDateTimePicker')}</span>
        </div>
        {useCustom && (
          <input type="datetime-local" value={customDate} onChange={(e) => setCustomDate(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 rounded-lg text-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        )}
      </div>

      {/* City cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {selectedCities.map(cityName => {
          const entry = TIMEZONES.find(c => c.city === cityName);
          if (!entry) return null;
          return (
            <div key={cityName} className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative">
              <button onClick={() => setSelectedCities(p => p.filter(c => c !== cityName))}
                className="absolute top-2 right-2 text-slate-600 hover:text-red-400 transition-colors">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
              <p className="text-slate-300 text-sm font-medium">{getCityName(entry)}</p>
              <p className="text-slate-500 text-[10px] mb-2">{getOffset(entry.tz)}</p>
              {validDisplay ? (
                <>
                  <p className="text-slate-100 text-2xl font-bold font-mono tracking-wider">
                    {tzFmt(displayDate, entry.tz, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {tzFmt(displayDate, entry.tz, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </>
              ) : <p className="text-slate-500 text-sm">Invalid date</p>}
            </div>
          );
        })}
      </div>

      {/* Add city */}
      <div className="space-y-2">
        <label className="text-slate-400 text-sm font-medium block">{t('tzAddCity')}</label>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('tzSearchTimezone')} className="input-field w-full px-4 py-2 text-sm" />
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
          {filteredTzs.length === 0
            ? <p className="text-slate-500 text-sm px-4 py-3">{t('tzNoResults')}</p>
            : filteredTzs.map((entry) => (
              <button key={entry.city}
                onClick={() => { if (!selectedCities.includes(entry.city)) setSelectedCities(p => [...p, entry.city]); setSearchQuery(''); }}
                disabled={selectedCities.includes(entry.city)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors disabled:opacity-40 text-left">
                <span className="text-slate-300">
                  {getCityName(entry)}
                  {isZh && <span className="text-slate-500 text-xs ml-1.5">{entry.city}</span>}
                </span>
                <span className="text-slate-500 text-xs flex-shrink-0 ml-2">{getOffset(entry.tz)}</span>
              </button>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── IP Lookup ────────────────────────────────────────────────────────────────

interface IPData {
  ip: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  org: string;
}

function IPLookup() {
  const t = useTranslations('Tool');
  const [ipInput, setIpInput] = useState('');
  const [data, setData] = useState<IPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOwn, setIsOwn] = useState(false);

  const lookup = async (ip = '') => {
    const url = ip.trim() ? `https://ipinfo.io/${ip.trim()}/json` : 'https://ipinfo.io/json';
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message ?? 'Lookup failed');
      const [lat, lng] = (json.loc ?? '0,0').split(',').map(Number);
      setData({
        ip: json.ip,
        city: json.city ?? '',
        region: json.region ?? '',
        country: json.country ?? '',
        latitude: lat,
        longitude: lng,
        timezone: json.timezone ?? '',
        org: json.org ?? '',
      });
      setIsOwn(!ip.trim());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { lookup(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const trimmed = ipInput.trim();
    if (trimmed && !/^[0-9a-f:.]+$/i.test(trimmed)) { setError(t('ipInvalidFormat')); return; }
    lookup(trimmed);
  };

  const ipVersion = (ip: string) => (ip.includes(':') ? 'IPv6' : 'IPv4');

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input type="text" value={ipInput} onChange={(e) => setIpInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={t('ipEnterAddress')}
          className="input-field flex-1 px-4 py-2 text-sm font-mono" />
        <button onClick={handleSearch} disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? t('ipDetecting') : t('ipLookupBtn')}
        </button>
        <button onClick={() => { setIpInput(''); lookup(); }} disabled={loading}
          className="btn-secondary px-3" title={t('ipLookupMy')}>
          <span className="material-symbols-outlined text-base">my_location</span>
        </button>
      </div>

      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl">{error}</p>}

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-4 justify-center">
          <svg className="animate-spin w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t('ipDetecting')}
        </div>
      )}

      {data && (
        <div className="animate-fade-in space-y-3">
          {isOwn && (
            <p className="text-emerald-400 text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">my_location</span>
              {t('ipLookupMy')}
            </p>
          )}
          <div className="card-surface p-4 space-y-0">
            <InfoRow label="IP"               value={data.ip} mono />
            <InfoRow label={t('ipType')}      value={ipVersion(data.ip)} />
            <InfoRow label={t('ipCountry')}   value={data.country || '—'} />
            <InfoRow label={t('ipRegion')}    value={data.region || '—'} />
            <InfoRow label={t('ipCity')}      value={data.city || '—'} />
            <InfoRow label={t('ipTimezone')}   value={data.timezone || '—'} />
            <InfoRow label={t('ipISP')}       value={data.org || '—'} />
            <InfoRow label={t('ipCoords')}    value={`${data.latitude}, ${data.longitude}`} mono />
          </div>
          <MapEmbed lat={data.latitude} lng={data.longitude} zoom={12} className="w-full h-[220px] rounded-xl border border-slate-700 overflow-hidden" />
        </div>
      )}
    </div>
  );
}

// ─── OCR Tool ─────────────────────────────────────────────────────────────────

// Compress to JPEG data-URI, downscaling so the result stays under 1 MB (OCR.space free-tier limit).
async function compressForOCR(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 2400;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        const s = MAX / Math.max(w, h);
        w = Math.round(w * s); h = Math.round(h * s);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      // Try quality 0.9; reduce if data-URI exceeds ~1.3 MB of base64 (≈ 975 KB binary)
      let q = 0.9, b64 = canvas.toDataURL('image/jpeg', q);
      while (b64.length > 1_300_000 && q > 0.3) { q -= 0.1; b64 = canvas.toDataURL('image/jpeg', q); }
      resolve(b64);
    };
    img.src = url;
  });
}

function OCRTool() {
  const t = useTranslations('Tool');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [lang, setLang] = useState<'chs' | 'cht' | 'eng'>('chs');
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setImageFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setText(''); setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) handleFile(file);
  };

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const process = async () => {
    if (!imageFile) return;
    setProcessing(true); setError(''); setText('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);
    try {
      const b64 = await compressForOCR(imageFile);
      const form = new FormData();
      form.append('base64Image', b64);
      form.append('language', lang);
      form.append('apikey', 'helloworld');
      form.append('OCREngine', '2');
      form.append('scale', 'true');
      form.append('detectOrientation', 'true');
      form.append('isOverlayRequired', 'false');
      const res = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.IsErroredOnProcessing) throw new Error(json.ErrorMessage?.[0] ?? 'OCR failed');
      const parsed: string = json.ParsedResults?.[0]?.ParsedText ?? '';
      if (!parsed.trim()) throw new Error(t('ocrNoText'));
      setText(parsed);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg.includes('abort') ? t('ocrTimeout') : msg);
    } finally {
      clearTimeout(timer);
      setProcessing(false);
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ocr-result.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async () => {
    await clipboardWrite(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 text-xs flex items-center gap-2">
        <span className="material-symbols-outlined text-sm text-indigo-400">cloud</span>
        {t('ocrNote')}
      </div>
      {/* Language selector */}
      <div>
        <label className="text-slate-400 text-xs mb-1.5 block">{t('ocrLanguage')}</label>
        <div className="flex gap-2 flex-wrap">
          {([['chs', 'ocrLangZhCn'], ['cht', 'ocrLangZhTw'], ['eng', 'ocrLangEn']] as const).map(([v, key]) => (
            <button key={v} onClick={() => setLang(v)}
              className={`px-4 py-2 text-sm rounded-lg border transition-all ${lang === v ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
              {t(key)}
            </button>
          ))}
        </div>
      </div>
      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all">
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {previewUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={previewUrl} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" loading="lazy" decoding="async" />
          : (
            <div className="space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-600">document_scanner</span>
              <p className="text-slate-400 text-sm">{t('upload')}</p>
              <p className="text-slate-600 text-xs">JPG, PNG, WebP</p>
            </div>
          )
        }
      </div>
      <button onClick={process} disabled={!imageFile || processing}
        className="btn-primary flex items-center gap-2 disabled:opacity-50">
        {processing
          ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          : <span className="material-symbols-outlined text-base">document_scanner</span>
        }
        {processing ? t('ocrProcessing') : t('ocrProcess')}
      </button>
      {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl">{error}</p>}
      {text && (
        <div className="animate-fade-in space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-slate-400 text-sm font-medium">{t('ocrExtractedText')}</label>
            <div className="flex gap-2">
              <button onClick={copyText} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{copied ? 'check' : 'content_copy'}</span>
                {copied ? t('copied') : t('copy')}
              </button>
              <button onClick={downloadTxt} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>
                {t('ocrDownloadTxt')}
              </button>
            </div>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            className="input-field w-full px-4 py-3 text-sm font-mono min-h-[200px] resize-y" />
          <p className="text-slate-500 text-xs">{text.length} characters</p>
        </div>
      )}
    </div>
  );
}

// ─── US Address Generator ────────────────────────────────────────────────────

const US_STATES: { abbr: string; name: string; taxFree: boolean; areaCodes: string[]; lat: number; lng: number; cities: string[]; streets: string[] }[] = [
  { abbr: 'AL', name: 'Alabama', taxFree: false, areaCodes: ['205','251','256','334','938'], lat: 32.377716, lng: -86.300568, cities: ['Birmingham','Montgomery','Huntsville','Mobile','Tuscaloosa'], streets: ['Main St','Oak Ave','Elm St','Pine Dr','Maple Ln'] },
  { abbr: 'AK', name: 'Alaska', taxFree: true, areaCodes: ['907'], lat: 61.216313, lng: -149.894852, cities: ['Anchorage','Fairbanks','Juneau','Sitka','Wasilla'], streets: ['Northern Lights Blvd','Glacier Ave','Tundra Rd','Eagle Dr','Bear Ln'] },
  { abbr: 'AZ', name: 'Arizona', taxFree: false, areaCodes: ['480','520','602','623','928'], lat: 33.448376, lng: -112.074036, cities: ['Phoenix','Tucson','Mesa','Chandler','Scottsdale'], streets: ['Camelback Rd','Desert View Dr','Cactus Ln','Sunset Blvd','Canyon Way'] },
  { abbr: 'AR', name: 'Arkansas', taxFree: false, areaCodes: ['479','501','870'], lat: 34.746613, lng: -92.288986, cities: ['Little Rock','Fort Smith','Fayetteville','Springdale','Jonesboro'], streets: ['Main St','Oak St','Market Ave','Hillside Dr','River Rd'] },
  { abbr: 'CA', name: 'California', taxFree: false, areaCodes: ['209','213','310','323','408','415','510','530','559','619','626','650','661','707','714','760','805','818','831','858','909','916','925','949','951'], lat: 34.052235, lng: -118.243683, cities: ['Los Angeles','San Francisco','San Diego','San Jose','Sacramento'], streets: ['Sunset Blvd','Hollywood Dr','Pacific Ave','Mission St','Golden Gate Way'] },
  { abbr: 'CO', name: 'Colorado', taxFree: false, areaCodes: ['303','719','720','970'], lat: 39.739236, lng: -104.990251, cities: ['Denver','Colorado Springs','Aurora','Fort Collins','Boulder'], streets: ['Mountain View Rd','Aspen Dr','Elk Ln','Summit Ave','Rocky Blvd'] },
  { abbr: 'CT', name: 'Connecticut', taxFree: false, areaCodes: ['203','475','860','959'], lat: 41.763710, lng: -72.685093, cities: ['Hartford','New Haven','Bridgeport','Stamford','Waterbury'], streets: ['Main St','Church St','Elm St','Park Ave','Colony Rd'] },
  { abbr: 'DE', name: 'Delaware', taxFree: true, areaCodes: ['302'], lat: 39.157307, lng: -75.519722, cities: ['Wilmington','Dover','Newark','Middletown','Smyrna'], streets: ['Market St','King St','Delaware Ave','State Rd','Blue Hen Dr'] },
  { abbr: 'FL', name: 'Florida', taxFree: false, areaCodes: ['239','305','321','352','386','407','561','727','754','772','786','813','850','863','904','941','954'], lat: 25.761681, lng: -80.191788, cities: ['Miami','Orlando','Tampa','Jacksonville','Fort Lauderdale'], streets: ['Ocean Dr','Palm Ave','Biscayne Blvd','Sunshine St','Coral Way'] },
  { abbr: 'GA', name: 'Georgia', taxFree: false, areaCodes: ['229','404','470','478','678','706','762','770','912'], lat: 33.748992, lng: -84.387985, cities: ['Atlanta','Savannah','Augusta','Columbus','Macon'], streets: ['Peachtree St','Magnolia Ave','Dogwood Ln','Piedmont Rd','Azalea Dr'] },
  { abbr: 'HI', name: 'Hawaii', taxFree: false, areaCodes: ['808'], lat: 21.307442, lng: -157.857376, cities: ['Honolulu','Hilo','Kailua','Kaneohe','Pearl City'], streets: ['Kalakaua Ave','Ala Moana Blvd','Kamehameha Hwy','King St','Beretania St'] },
  { abbr: 'ID', name: 'Idaho', taxFree: false, areaCodes: ['208','986'], lat: 43.615019, lng: -116.202316, cities: ['Boise','Meridian','Nampa','Idaho Falls','Pocatello'], streets: ['Main St','Capitol Blvd','Eagle Rd','River St','Mountain Home Dr'] },
  { abbr: 'IL', name: 'Illinois', taxFree: false, areaCodes: ['217','224','309','312','331','618','630','708','773','779','815','847','872'], lat: 41.878113, lng: -87.629799, cities: ['Chicago','Aurora','Naperville','Rockford','Springfield'], streets: ['Michigan Ave','State St','Lake Shore Dr','Wacker Dr','Madison St'] },
  { abbr: 'IN', name: 'Indiana', taxFree: false, areaCodes: ['219','260','317','463','574','765','812','930'], lat: 39.768403, lng: -86.158068, cities: ['Indianapolis','Fort Wayne','Evansville','South Bend','Carmel'], streets: ['Meridian St','College Ave','Washington St','Market St','Capitol Ave'] },
  { abbr: 'IA', name: 'Iowa', taxFree: false, areaCodes: ['319','515','563','641','712'], lat: 41.590939, lng: -93.620866, cities: ['Des Moines','Cedar Rapids','Davenport','Sioux City','Iowa City'], streets: ['Grand Ave','Locust St','Court Ave','Walnut St','University Ave'] },
  { abbr: 'KS', name: 'Kansas', taxFree: false, areaCodes: ['316','620','785','913'], lat: 39.049011, lng: -95.677956, cities: ['Wichita','Overland Park','Kansas City','Topeka','Olathe'], streets: ['Main St','Douglas Ave','Central Ave','Broadway Blvd','Kellogg Dr'] },
  { abbr: 'KY', name: 'Kentucky', taxFree: false, areaCodes: ['270','364','502','606','859'], lat: 38.186722, lng: -84.875374, cities: ['Louisville','Lexington','Bowling Green','Owensboro','Covington'], streets: ['Bardstown Rd','Main St','Broadway','New Circle Rd','Nicholasville Rd'] },
  { abbr: 'LA', name: 'Louisiana', taxFree: false, areaCodes: ['225','318','337','504','985'], lat: 29.951065, lng: -90.071533, cities: ['New Orleans','Baton Rouge','Shreveport','Lafayette','Lake Charles'], streets: ['Bourbon St','Canal St','Magazine St','Royal St','Tchoupitoulas St'] },
  { abbr: 'ME', name: 'Maine', taxFree: false, areaCodes: ['207'], lat: 44.310623, lng: -69.779490, cities: ['Portland','Lewiston','Bangor','Auburn','South Portland'], streets: ['Congress St','Forest Ave','Main St','Ocean Ave','Pine St'] },
  { abbr: 'MD', name: 'Maryland', taxFree: false, areaCodes: ['240','301','410','443','667'], lat: 39.290386, lng: -76.612190, cities: ['Baltimore','Frederick','Rockville','Gaithersburg','Annapolis'], streets: ['Charles St','Pratt St','Light St','Howard St','Calvert St'] },
  { abbr: 'MA', name: 'Massachusetts', taxFree: false, areaCodes: ['339','351','413','508','617','774','781','857','978'], lat: 42.360082, lng: -71.058880, cities: ['Boston','Worcester','Springfield','Cambridge','Lowell'], streets: ['Beacon St','Boylston St','Commonwealth Ave','Newbury St','Tremont St'] },
  { abbr: 'MI', name: 'Michigan', taxFree: false, areaCodes: ['231','248','269','313','517','586','616','734','810','906','947','989'], lat: 42.331427, lng: -83.045754, cities: ['Detroit','Grand Rapids','Ann Arbor','Lansing','Flint'], streets: ['Woodward Ave','Michigan Ave','Grand River Ave','Fort St','Gratiot Ave'] },
  { abbr: 'MN', name: 'Minnesota', taxFree: false, areaCodes: ['218','320','507','612','651','763','952'], lat: 44.977753, lng: -93.265015, cities: ['Minneapolis','Saint Paul','Rochester','Duluth','Bloomington'], streets: ['Hennepin Ave','Nicollet Mall','Lake St','University Ave','Lyndale Ave'] },
  { abbr: 'MS', name: 'Mississippi', taxFree: false, areaCodes: ['228','601','662','769'], lat: 32.298757, lng: -90.184810, cities: ['Jackson','Gulfport','Southaven','Hattiesburg','Biloxi'], streets: ['Capitol St','State St','Hardy St','Pass Rd','Beach Blvd'] },
  { abbr: 'MO', name: 'Missouri', taxFree: false, areaCodes: ['314','417','573','636','660','816'], lat: 38.627003, lng: -90.199402, cities: ['Kansas City','Saint Louis','Springfield','Columbia','Independence'], streets: ['Market St','Broadway','Main St','Lindell Blvd','Grand Blvd'] },
  { abbr: 'MT', name: 'Montana', taxFree: true, areaCodes: ['406'], lat: 46.879682, lng: -110.362566, cities: ['Billings','Missoula','Great Falls','Bozeman','Helena'], streets: ['Main St','Broadway','Grand Ave','Central Ave','Last Chance Gulch'] },
  { abbr: 'NE', name: 'Nebraska', taxFree: false, areaCodes: ['308','402','531'], lat: 40.808075, lng: -96.699654, cities: ['Omaha','Lincoln','Bellevue','Grand Island','Kearney'], streets: ['Dodge St','Farnam St','O St','Cornhusker Hwy','Center St'] },
  { abbr: 'NV', name: 'Nevada', taxFree: false, areaCodes: ['702','725','775'], lat: 36.169941, lng: -115.139832, cities: ['Las Vegas','Henderson','Reno','North Las Vegas','Sparks'], streets: ['Las Vegas Blvd','Flamingo Rd','Sahara Ave','Desert Inn Rd','Charleston Blvd'] },
  { abbr: 'NH', name: 'New Hampshire', taxFree: true, areaCodes: ['603'], lat: 43.207106, lng: -71.537994, cities: ['Manchester','Nashua','Concord','Dover','Rochester'], streets: ['Elm St','Main St','Pleasant St','South St','Bridge St'] },
  { abbr: 'NJ', name: 'New Jersey', taxFree: false, areaCodes: ['201','551','609','732','848','856','862','908','973'], lat: 40.058324, lng: -74.405661, cities: ['Newark','Jersey City','Paterson','Elizabeth','Trenton'], streets: ['Broad St','Market St','Main St','Central Ave','Park Ave'] },
  { abbr: 'NM', name: 'New Mexico', taxFree: false, areaCodes: ['505','575'], lat: 35.106766, lng: -106.629181, cities: ['Albuquerque','Las Cruces','Rio Rancho','Santa Fe','Roswell'], streets: ['Central Ave','Lomas Blvd','Menaul Blvd','Paseo Del Norte','Cerrillos Rd'] },
  { abbr: 'NY', name: 'New York', taxFree: false, areaCodes: ['212','315','347','516','518','585','607','631','646','716','718','845','914','917','929'], lat: 40.712776, lng: -74.005974, cities: ['New York','Buffalo','Rochester','Syracuse','Albany'], streets: ['Broadway','5th Ave','Park Ave','Madison Ave','Lexington Ave'] },
  { abbr: 'NC', name: 'North Carolina', taxFree: false, areaCodes: ['252','336','704','743','828','910','919','980','984'], lat: 35.779590, lng: -78.638179, cities: ['Charlotte','Raleigh','Greensboro','Durham','Winston-Salem'], streets: ['Tryon St','Trade St','Hillsborough St','Market St','Main St'] },
  { abbr: 'ND', name: 'North Dakota', taxFree: false, areaCodes: ['701'], lat: 46.808327, lng: -100.783739, cities: ['Fargo','Bismarck','Grand Forks','Minot','West Fargo'], streets: ['Main Ave','Broadway','University Dr','13th Ave S','DeMers Ave'] },
  { abbr: 'OH', name: 'Ohio', taxFree: false, areaCodes: ['216','220','234','330','380','419','440','513','567','614','740','937'], lat: 39.961176, lng: -82.998794, cities: ['Columbus','Cleveland','Cincinnati','Toledo','Akron'], streets: ['High St','Broad St','Main St','State St','Neil Ave'] },
  { abbr: 'OK', name: 'Oklahoma', taxFree: false, areaCodes: ['405','539','580','918'], lat: 35.467560, lng: -97.516428, cities: ['Oklahoma City','Tulsa','Norman','Broken Arrow','Edmond'], streets: ['Classen Blvd','Western Ave','May Ave','Penn Ave','Memorial Rd'] },
  { abbr: 'OR', name: 'Oregon', taxFree: true, areaCodes: ['458','503','541','971'], lat: 45.515232, lng: -122.678383, cities: ['Portland','Salem','Eugene','Gresham','Hillsboro'], streets: ['Burnside St','Hawthorne Blvd','Division St','Alberta St','Belmont St'] },
  { abbr: 'PA', name: 'Pennsylvania', taxFree: false, areaCodes: ['215','267','272','412','484','570','610','717','724','814','878'], lat: 39.952583, lng: -75.165222, cities: ['Philadelphia','Pittsburgh','Allentown','Erie','Reading'], streets: ['Market St','Broad St','Walnut St','Chestnut St','Spruce St'] },
  { abbr: 'RI', name: 'Rhode Island', taxFree: false, areaCodes: ['401'], lat: 41.824009, lng: -71.412834, cities: ['Providence','Warwick','Cranston','Pawtucket','East Providence'], streets: ['Broad St','Westminster St','Thayer St','Hope St','Wickenden St'] },
  { abbr: 'SC', name: 'South Carolina', taxFree: false, areaCodes: ['803','843','854','864'], lat: 34.000710, lng: -81.034814, cities: ['Columbia','Charleston','North Charleston','Mount Pleasant','Rock Hill'], streets: ['Main St','King St','Meeting St','Gervais St','Assembly St'] },
  { abbr: 'SD', name: 'South Dakota', taxFree: false, areaCodes: ['605'], lat: 43.549988, lng: -96.700327, cities: ['Sioux Falls','Rapid City','Aberdeen','Brookings','Watertown'], streets: ['Main Ave','Minnesota Ave','Phillips Ave','St Joseph St','Mount Rushmore Rd'] },
  { abbr: 'TN', name: 'Tennessee', taxFree: false, areaCodes: ['423','615','629','731','865','901','931'], lat: 36.162664, lng: -86.781602, cities: ['Nashville','Memphis','Knoxville','Chattanooga','Clarksville'], streets: ['Broadway','Music Row','Beale St','Church St','Commerce St'] },
  { abbr: 'TX', name: 'Texas', taxFree: false, areaCodes: ['210','214','254','281','325','346','361','409','430','432','469','512','682','713','726','737','806','817','830','832','903','915','936','940','956','972','979'], lat: 29.760427, lng: -95.369804, cities: ['Houston','San Antonio','Dallas','Austin','Fort Worth'], streets: ['Main St','Travis St','Lamar Blvd','Congress Ave','Westheimer Rd'] },
  { abbr: 'UT', name: 'Utah', taxFree: false, areaCodes: ['385','435','801'], lat: 40.760780, lng: -111.891047, cities: ['Salt Lake City','West Valley City','Provo','West Jordan','Orem'], streets: ['State St','Main St','Temple Ave','University Blvd','Highland Dr'] },
  { abbr: 'VT', name: 'Vermont', taxFree: false, areaCodes: ['802'], lat: 44.262436, lng: -72.580536, cities: ['Burlington','South Burlington','Rutland','Essex Junction','Barre'], streets: ['Church St','Main St','College St','Pearl St','Williston Rd'] },
  { abbr: 'VA', name: 'Virginia', taxFree: false, areaCodes: ['276','434','540','571','703','757','804'], lat: 37.540725, lng: -77.436048, cities: ['Virginia Beach','Norfolk','Chesapeake','Richmond','Newport News'], streets: ['Broad St','Main St','Atlantic Ave','Grace St','Cary St'] },
  { abbr: 'WA', name: 'Washington', taxFree: false, areaCodes: ['206','253','360','425','509','564'], lat: 47.606209, lng: -122.332069, cities: ['Seattle','Spokane','Tacoma','Vancouver','Bellevue'], streets: ['Pike St','Pine St','Broadway','Aurora Ave','Rainier Ave'] },
  { abbr: 'WV', name: 'West Virginia', taxFree: false, areaCodes: ['304','681'], lat: 38.349820, lng: -81.632622, cities: ['Charleston','Huntington','Morgantown','Parkersburg','Wheeling'], streets: ['Capitol St','Virginia St','High St','Market St','Quarrier St'] },
  { abbr: 'WI', name: 'Wisconsin', taxFree: false, areaCodes: ['262','414','534','608','715','920'], lat: 43.074722, lng: -89.384444, cities: ['Milwaukee','Madison','Green Bay','Kenosha','Racine'], streets: ['State St','Wisconsin Ave','Water St','Broadway','National Ave'] },
  { abbr: 'WY', name: 'Wyoming', taxFree: false, areaCodes: ['307'], lat: 41.140259, lng: -104.820236, cities: ['Cheyenne','Casper','Laramie','Gillette','Rock Springs'], streets: ['Central Ave','Lincolnway','2nd St','Grand Ave','Yellowstone Rd'] },
  { abbr: 'DC', name: 'District of Columbia', taxFree: false, areaCodes: ['202'], lat: 38.907192, lng: -77.036873, cities: ['Washington'], streets: ['Pennsylvania Ave','Constitution Ave','K St','M St','Connecticut Ave'] },
];

const TAX_FREE_STATES = US_STATES.filter(s => s.taxFree).map(s => s.abbr);

const FIRST_NAMES_MALE = ['James','Robert','John','Michael','David','William','Richard','Joseph','Thomas','Christopher','Charles','Daniel','Matthew','Anthony','Mark','Donald','Steven','Andrew','Paul','Joshua','Kenneth','Kevin','Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan','Jacob','Nicholas','Gary','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Benjamin','Samuel','Raymond','Gregory','Frank','Alexander','Patrick','Jack','Dennis','Jerry'];
const FIRST_NAMES_FEMALE = ['Mary','Patricia','Jennifer','Linda','Barbara','Elizabeth','Susan','Jessica','Sarah','Karen','Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Dorothy','Kimberly','Emily','Donna','Michelle','Carol','Amanda','Melissa','Deborah','Stephanie','Rebecca','Sharon','Laura','Cynthia','Kathleen','Amy','Angela','Shirley','Anna','Brenda','Pamela','Emma','Nicole','Helen','Samantha','Katherine','Christine','Debra','Rachel','Carolyn','Janet','Catherine','Maria','Heather'];
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts'];

const SUFFIXES = ['Ave','St','Blvd','Dr','Ln','Way','Ct','Pl','Rd','Cir'];

function rand<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

interface AddressData {
  name: string;
  gender: 'Male' | 'Female';
  phone: string;
  street: string;
  city: string;
  state: string;
  stateAbbr: string;
  zip: string;
  taxFree: boolean;
  lat: number;
  lng: number;
}

function generateAddress(stateFilter?: string): AddressData {
  const stateData = stateFilter
    ? US_STATES.find(s => s.abbr === stateFilter) ?? rand(US_STATES)
    : rand(US_STATES);

  const isMale = Math.random() > 0.5;
  const firstName = isMale ? rand(FIRST_NAMES_MALE) : rand(FIRST_NAMES_FEMALE);
  const lastName = rand(LAST_NAMES);

  const houseNum = randInt(100, 9999);
  const streetName = rand(stateData.streets);
  const streetSuffix = streetName.includes(' ') && SUFFIXES.some(s => streetName.endsWith(s)) ? '' : '';
  const street = `${houseNum} ${streetName}${streetSuffix}`;

  const city = rand(stateData.cities);
  const areaCode = rand(stateData.areaCodes);
  const phone = `(${areaCode}) ${randInt(200, 999)}-${String(randInt(0, 9999)).padStart(4, '0')}`;
  const zip = String(randInt(10000, 99999));

  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;

  return {
    name: `${firstName} ${lastName}`,
    gender: isMale ? 'Male' : 'Female',
    phone,
    street,
    city,
    state: stateData.name,
    stateAbbr: stateData.abbr,
    zip,
    taxFree: stateData.taxFree,
    lat: stateData.lat + latOffset,
    lng: stateData.lng + lngOffset,
  };
}

function USAddressGenerator() {
  const t = useTranslations('Tool');
  const [stateFilter, setStateFilter] = useState('');
  const [address, setAddress] = useState<AddressData | null>(null);
  const [copiedField, setCopiedField] = useState('');

  const generate = () => {
    setAddress(generateAddress(stateFilter || undefined));
    setCopiedField('');
  };

  useEffect(() => { generate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const copyField = async (field: string, value: string) => {
    await clipboardWrite(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const copyAll = async () => {
    if (!address) return;
    const text = [
      `${t('usAddrName')}: ${address.name}`,
      `${t('usAddrGender')}: ${address.gender === 'Male' ? t('usAddrMale') : t('usAddrFemale')}`,
      `${t('usAddrPhone')}: ${address.phone}`,
      `${t('usAddrStreet')}: ${address.street}`,
      `${t('usAddrCity')}: ${address.city}`,
      `${t('usAddrState')}: ${address.state} (${address.stateAbbr})${address.taxFree ? ` [${t('usAddrTaxFree')}]` : ''}`,
      `${t('usAddrZip')}: ${address.zip}`,
    ].join('\n');
    await clipboardWrite(text);
    setCopiedField('all');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const CopyableRow = ({ field, label, value, badge }: { field: string; label: string; value: string; badge?: React.ReactNode }) => (
    <button
      onClick={() => copyField(field, value)}
      className="w-full flex items-center justify-between py-3 px-4 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 transition-colors text-left group"
    >
      <span className="text-slate-400 text-sm flex items-center gap-2">
        {label}
        {badge}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-slate-200 text-sm font-medium font-mono">{value}</span>
        <span className={`material-symbols-outlined text-sm transition-colors ${
          copiedField === field ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'
        }`}>
          {copiedField === field ? 'check' : 'content_copy'}
        </span>
      </span>
    </button>
  );

  const genderLabel = address?.gender === 'Male' ? t('usAddrMale') : t('usAddrFemale');

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-slate-400 text-xs mb-1.5 block">{t('usAddrSelectState')}</label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg text-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{t('usAddrRandomState')}</option>
            {US_STATES.map(s => (
              <option key={s.abbr} value={s.abbr}>
                {s.name} ({s.abbr}){s.taxFree ? ` ★ ${t('usAddrTaxFree')}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={generate} className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-base">refresh</span>
            {t('usAddrGenerate')}
          </button>
          <button onClick={copyAll} className="btn-secondary flex items-center gap-2">
            <span className="material-symbols-outlined text-base">{copiedField === 'all' ? 'check' : 'content_copy'}</span>
            {copiedField === 'all' ? t('copied') : t('usAddrCopyAll')}
          </button>
        </div>
      </div>

      {/* Copied toast */}
      {copiedField && (
        <div className="animate-fade-in flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          {t('usAddrCopiedToast')}
        </div>
      )}

      {address && (
        <div className="animate-fade-in space-y-4">
          {/* Info card */}
          <div className="card-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{t('usAddrGeneratedInfo')}</p>
              {address.taxFree && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ★ {t('usAddrTaxFree')}
                </span>
              )}
            </div>
            <CopyableRow field="name" label={t('usAddrName')} value={address.name} />
            <CopyableRow field="gender" label={t('usAddrGender')} value={genderLabel} />
            <CopyableRow field="phone" label={t('usAddrPhone')} value={address.phone} />
            <CopyableRow field="street" label={t('usAddrStreet')} value={address.street} />
            <CopyableRow field="city" label={t('usAddrCity')} value={address.city} />
            <CopyableRow
              field="state"
              label={t('usAddrState')}
              value={`${address.state} (${address.stateAbbr})`}
              badge={address.taxFree ? (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {t('usAddrTaxFree')}
                </span>
              ) : undefined}
            />
            <CopyableRow field="zip" label={t('usAddrZip')} value={address.zip} />
          </div>

          {/* Map */}
          <div className="card-surface overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">map</span>
                {t('usAddrMap')}
              </p>
            </div>
            <MapEmbed key={`${address.lat}-${address.lng}`} lat={address.lat} lng={address.lng} zoom={14} className="aspect-video w-full" />
          </div>
        </div>
      )}
    </div>
  );
}

export function LightToolCore({ mode }: Props) {
  const t = useTranslations('Tool');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  const LIGHT_TABS: { mode: LightMode; label: string; icon: string }[] = [
    { mode: 'word-counter',       label: t('tabWordCounter'), icon: 'text_fields' },
    { mode: 'qr-code',            label: t('tabQrCode'),      icon: 'qr_code_2' },
    { mode: 'password-generator', label: t('tabPassword'),    icon: 'password' },
    { mode: 'timezone-converter', label: t('tabTimezone'),    icon: 'schedule' },
    { mode: 'ip-lookup',          label: t('tabIPLookup'),    icon: 'travel_explore' },
    { mode: 'ocr-tool',           label: t('tabOCR'),         icon: 'document_scanner' },
    { mode: 'us-address-generator', label: t('tabUSAddress'), icon: 'location_on' },
  ];

  let content: React.ReactNode;
  switch (mode) {
    case 'word-counter':       content = <WordCounter />; break;
    case 'qr-code':            content = <QRCodeGenerator />; break;
    case 'password-generator': content = <PasswordGeneratorTool />; break;
    case 'timezone-converter': content = <TimezoneConverter />; break;
    case 'ip-lookup':          content = <IPLookup />; break;
    case 'ocr-tool':              content = <OCRTool />; break;
    case 'us-address-generator':  content = <USAddressGenerator />; break;
    default:                      content = null;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {LIGHT_TABS.map(tab => (
          <Link
            key={tab.mode}
            href={`/${locale}/tools/${tab.mode}`}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === tab.mode
                ? 'bg-indigo-600 text-white shadow-md pointer-events-none'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </div>
      {content}
    </div>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { OG_IMAGES, TWITTER_IMAGES } from '@/lib/utils/seo';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://tools.steelylink.com'),
  title: 'SteelyLink Tools',
  description: 'Fast, free, and private browser-based tools. No login, no upload required.',
  openGraph: {
    title: 'SteelyLink Tools',
    description: 'Fast, free, and private browser-based tools. No login, no upload required.',
    images: OG_IMAGES,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SteelyLink Tools',
    description: 'Fast, free, and private browser-based tools. No login, no upload required.',
    images: TWITTER_IMAGES,
  },
  manifest: '/manifest.webmanifest',
  // The icon links are deliberately NOT declared here — see the <head> below.
  appleWebApp: {
    title: 'SteelyLink Tools',
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

const TZ_LOCALE_SCRIPT = `(function(){try{
if(document.cookie.indexOf('preferred-locale=')!==-1)return;
var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
var L={
'Asia/Shanghai':'zh-cn','Asia/Chongqing':'zh-cn','Asia/Harbin':'zh-cn',
'Asia/Urumqi':'zh-cn','Asia/Kashgar':'zh-cn',
'Asia/Taipei':'zh-tw',
'Asia/Hong_Kong':'zh-hk','Asia/Macau':'zh-hk',
'Asia/Tokyo':'ja',
'Europe/Madrid':'es','Atlantic/Canary':'es','Africa/Ceuta':'es',
'America/Mexico_City':'es','America/Cancun':'es','America/Monterrey':'es',
'America/Merida':'es','America/Chihuahua':'es','America/Hermosillo':'es',
'America/Mazatlan':'es','America/Bahia_Banderas':'es','America/Tijuana':'es',
'America/Matamoros':'es','America/Ojinaga':'es',
'America/Bogota':'es','America/Santiago':'es','America/Lima':'es',
'America/Caracas':'es','America/Guayaquil':'es','America/La_Paz':'es',
'America/Asuncion':'es','America/Montevideo':'es',
'America/Guatemala':'es','America/Havana':'es','America/Santo_Domingo':'es',
'America/Tegucigalpa':'es','America/El_Salvador':'es','America/Managua':'es',
'America/Costa_Rica':'es','America/Panama':'es','America/Puerto_Rico':'es',
'America/Punta_Arenas':'es','Pacific/Easter':'es','Pacific/Galapagos':'es'
};
var locale=L[tz];
if(!locale&&tz.indexOf('America/Argentina/')===0)locale='es';
if(!locale)return;
document.cookie='tz-locale='+locale+';path=/;max-age=31536000;SameSite=Lax';
}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={inter.className}>
      <head>
        {/*
          Hand-written rather than declared through `metadata.icons`, because metadata is
          emitted at the very end of <head> — behind the stylesheet, ten async script tags
          and every og/twitter meta, tag 44 of 50 — and because the client router re-renders
          the tags it owns on every navigation, tearing the <link> nodes down and recreating
          them. Here they are the first thing the page contributes to <head>, and as plain
          JSX in a root layout that never remounts they are static nodes for the life of the
          tab.

          Three things about this list are specifically about Safari, which is the only
          engine that has trouble with it:

          Raster last. Safari does not render SVG favicons (support arrives very late in its
          release history, so any device a visitor is actually holding may not have it). When
          it has to choose, it takes the last candidate it was given, so the last `icon` here
          is the .ico. `sizes="any"` on the SVG is what keeps Chrome and Firefox choosing it
          anyway — they select by size, and "any" outranks a fixed pixel size.

          No `?v=`. Safari's own fallback, when it can't resolve a declared icon, is to
          request /favicon.ico at the origin root. A version query means the declared URL and
          the URL Safari probes are two different cache entries for the same bytes, and a bad
          or empty entry under one of them is invisible from the other. They're unified here,
          and freshness is handled by a short max-age in public/_headers instead — see the
          note there about why stale-while-revalidate came off these.

          The `icon` entries are the mark on transparency, so a tab adopts the browser's own
          light or dark chrome; `apple-touch-icon` is the opaque tile, because iOS draws that
          onto a home screen and would composite transparency onto white. See brand.mjs.
        */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
        <link rel="icon" href="/favicon.png" sizes="64x64" type="image/png" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" type="image/png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/*
          The icon font uses `font-display: block`, so first paint of every icon waits
          on it. Preloading starts the download with the HTML instead of after the CSS
          has been fetched and parsed, which removes a full round trip — the difference
          is visible on high-latency connections.
        */}
        <link
          rel="preload"
          href="/fonts/material-symbols-outlined.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: TZ_LOCALE_SCRIPT }} />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

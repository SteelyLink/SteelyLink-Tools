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
          Why the site navigates with plain <a> and never next/link:

          WebKit's icon store is keyed by the full page URL — fragment included — and an
          entry is only written while a document is parsed. There is no host-level fallback,
          so a URL Safari never parsed has no icon at all and draws a globe. Client-side
          routing changes the URL without a parse, which is why every page except the
          landing one showed a globe on iOS while Chrome looked fine: Chrome's favicon
          service has an explicit fallback_to_host and was covering for us.

          Scripting around it is not possible. Icon links are read once during parse and
          every later change is ignored — inserting one from script does nothing, and
          removing the parsed link to reinsert it loses the icon outright. Both were tried
          on device, 4c81390 and 1265b7d.

          So navigation has to be real document loads. That is also cheaper here: a page is
          8-18 KB of HTML against 27 KB for its RSC payload, and it drops the prefetch storm
          that 104 home-page links used to trigger on a mobile scroll. The only cost is
          re-running hydration against the already-cached JS.

          favicon.ico exists and is deliberately not declared — an engine that can't read an
          SVG favicon fetches it from the origin root on its own, as do bookmarks and
          start-page favourites, so declaring it only adds a second candidate.

          The `icon` is the mark on transparency, so a tab adopts the browser's own light or
          dark chrome; `apple-touch-icon` is the opaque tile, because iOS draws that onto a
          home screen and would composite transparency onto white. See brand.mjs.
        */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/*
          267 bytes, preloaded because WebKit starts its icon load only once the document
          has finished parsing, at the lowest priority any request gets. On a first visit
          the file isn't cached yet, so that fetch queues behind every other resource — and
          if it hasn't landed by the time you navigate away, no icon entry is written and
          the tab keeps the globe. The second visit hits cache and the icon appears, which
          is the "only works the second time" symptom. Preloading starts the fetch with the
          HTML instead, so the icon load is a cache hit whenever it runs.
        */}
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
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

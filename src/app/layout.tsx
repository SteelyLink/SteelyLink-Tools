import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { FAVICON_DATA_URI } from '@/lib/brand/favicon';
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
          Hand-written rather than declared through `metadata.icons`, so the links land at
          the top of <head> instead of behind fifty other tags, and so the client router
          doesn't own the nodes.

          They have to be here, in the parsed markup, and nowhere else. WebKit reads icon
          links once, while it parses the document, and ignores every later change: a link
          inserted from script is not picked up, and removing the parsed one to reinsert it
          loses the icon outright. Both were tried on device (4c81390, 1265b7d) and both
          failed, so there is no scripted route to changing a tab icon on iOS.

          The icon is inlined as a data URI rather than fetched. A favicon is normally a
          separate request at the lowest priority the browser has, and when that request is
          slow or times out Safari draws a globe and doesn't retry — which is what made a
          fresh load of the same page show the mark on some visits and not others, with no
          deploy in between and nothing in the file to explain it. Inlined there is no
          request to lose, and first paint is one round trip shorter. It's 297 characters.
          FAVICON_DATA_URI is generated from the same glyph as public/favicon.svg so the two
          can't drift; run `npm run brand:build` after changing the mark.

          One candidate, deliberately. favicon.ico exists and is not declared: an engine
          that can't read an SVG favicon requests /favicon.ico at the origin root on its
          own, as do bookmarks and start-page favourites, so declaring it buys nothing.

          The `icon` is the mark on transparency, so a tab adopts the browser's own light or
          dark chrome; `apple-touch-icon` is the opaque tile, because iOS draws that onto a
          home screen and would composite transparency onto white. See brand.mjs.
        */}
        <link rel="icon" href={FAVICON_DATA_URI} type="image/svg+xml" />
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

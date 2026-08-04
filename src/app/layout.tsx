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
          Hand-written rather than declared through `metadata.icons`, for two reasons that
          both showed up as a missing icon in the iOS Safari tab bar.

          Position. Metadata is emitted at the very end of <head>, after the stylesheet,
          ten async script tags and every og/twitter meta — the icon was the 44th tag in
          the document. Safari issues that fetch last and at low priority, and on iOS it
          gives up on the tab icon if it hasn't resolved by the time the page paints. That
          is why a cold first visit showed nothing and a reload showed the icon: by then it
          was in the favicon cache and discovery order no longer mattered. Here the links
          are the first thing in the head the page itself contributes.

          Persistence. Tags the metadata API owns are re-rendered by the client router on
          every navigation, so the <link> nodes are torn down and recreated. Safari resolves
          a tab icon when the document is parsed and does not re-resolve for a same-document
          URL change, so once those nodes churn the icon is simply gone — which is why it
          survived on the page that was loaded from the network and vanished on every page
          reached by clicking a link. As plain JSX in the root layout, which never remounts,
          they are static DOM nodes for the lifetime of the tab.

          The three `icon` entries are the mark on transparency, so a tab adopts the
          browser's own light or dark chrome; `apple-touch-icon` is the opaque tile, because
          iOS draws that onto a home screen and would composite transparency onto white.
          See scripts/brand.mjs.

          `?v=` busts the 30-day cache for clients still holding older artwork. Keep the
          number in step with ICON_VERSION in scripts/brand.mjs.
        */}
        <link rel="icon" href="/favicon.ico?v=4" sizes="32x32" type="image/x-icon" />
        <link rel="icon" href="/favicon.png?v=4" sizes="64x64" type="image/png" />
        <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png?v=4"
          sizes="180x180"
          type="image/png"
        />
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

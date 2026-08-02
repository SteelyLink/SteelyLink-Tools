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
  // Every one of these is the same opaque, square tile (scripts/generate-icons.mjs).
  // iOS Link Presentation does not always choose the apple entry when it draws the
  // share card, so a favicon with a transparent background would still get composited
  // onto white — which is exactly the white frame this set removes.
  //
  // `?v=` busts the 30-day icon cache for clients still holding the old artwork.
  // Keep the number in step with ICON_VERSION in scripts/brand.mjs.
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.png?v=2', sizes: '64x64', type: 'image/png' },
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
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

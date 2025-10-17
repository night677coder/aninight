import { Inter } from 'next/font/google'
import './globals.css'
import { NextUiProvider } from "./NextUiProvider";
// import NextTopLoader from 'nextjs-toploader';
import Search from '@/components/search/Search'
import GoToTop from '@/components/GoToTop';
// import localFont from 'next/font/local';
import Footer from '@/components/Footer';
import Script from "next/script";
import { getAuthSession } from './api/auth/[...nextauth]/route';
import { Toaster } from 'sonner'
import Changelogs from '../components/Changelogs';
import MobileNavButton from '@/components/MobileNavButton';
import MobileBottomNav from '@/components/navbar/MobileBottomNav';
import { AuthProvider } from './SessionProvider';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] })
// const myfont = localFont({ src: "../static-fonts/28 Days Later.ttf" })

const APP_NAME = "VoidAnime";
const APP_DEFAULT_TITLE = "VoidAnime - Watch Anime Online & Read Manga Free";
const APP_DESCRIPTION = "Watch anime online and read manga free on VoidAnime. Stream the latest anime episodes with English subtitles and dubs. Discover trending anime, popular manga, seasonal releases, and classic series. Your ultimate destination for anime streaming and manga reading.";

export const metadata = {
  metadataBase: new URL('https://voidanime.live'),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: '%s | VoidAnime'
  },
  description: APP_DESCRIPTION,
  keywords: [
    // Anime keywords
    'watch anime online',
    'anime streaming',
    'anime free',
    'watch anime',
    'anime episodes',
    'anime subbed',
    'anime dubbed',
    'latest anime',
    'trending anime',
    'popular anime',
    'seasonal anime',
    'anime series',
    'anime online free',
    'stream anime',
    'anime website',
    'best anime site',
    'anime streaming site',
    'watch anime online free',
    'anime english sub',
    'anime english dub',
    'new anime episodes',
    'anime releases',
    'anime catalog',
    'anime list',
    'top anime',
    'anime recommendations',
    // Manga keywords
    'read manga online',
    'manga free',
    'read manga',
    'manga online',
    'manga reader',
    'manga chapters',
    'latest manga',
    'trending manga',
    'popular manga',
    'manga series',
    'manga online free',
    'manga website',
    'best manga site',
    'manga streaming',
    'manga catalog',
    'manga list',
    'top manga',
    'manga recommendations',
    // Brand keywords
    'voidanime',
    'void anime',
    'anilist tracker',
    'anime tracker',
    'manga tracker',
  ],
  authors: [{ name: 'VoidAnime' }],
  creator: 'VoidAnime',
  publisher: 'VoidAnime',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    url: 'https://voidanime.live',
    locale: 'en_US',
    images: [
      {
        url: 'https://voidanime.live/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'VoidAnime Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    images: ['https://voidanime.live/android-chrome-512x512.png'],
    creator: '@voidanime',
  },
  alternates: {
    canonical: 'https://voidanime.live',
  },
  verification: {
    google: '9Cj5Gd0-OuGDtGb4HpRqNfBXy3FuFCcFNWSvTPOlTzE',
  },
};


export default async function RootLayout({ children }) {
  const session = await getAuthSession();

  return (
    <html lang="en" className='dark text-foreground bg-background' suppressHydrationWarning={true}>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-W661D2QCV3"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-W661D2QCV3');`}
      </Script>
      <head>
        <meta name="google-site-verification" content="9Cj5Gd0-OuGDtGb4HpRqNfBXy3FuFCcFNWSvTPOlTzE" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        {/* <script src="https://kit.fontawesome.com/c189d5d7c5.js" crossOrigin="anonymous" async></script> */}
      </head>
      <Script
        src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
        strategy="afterInteractive"
      />
      <Script id="cast-init" strategy="afterInteractive">
        {`
          window['__onGCastApiAvailable'] = function(isAvailable) {
            if (isAvailable) {
              try {
                const castContext = cast.framework.CastContext.getInstance();
                castContext.setOptions({
                  receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                  autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
                });
              } catch (error) {
                console.log('Cast initialization:', error.message);
              }
            }
          };
        `}
      </Script>
      <body className={inter.className}>
        <AuthProvider session={session}>
          <ThemeProvider>
            <NextUiProvider>
              {children}
            </NextUiProvider>
          </ThemeProvider>
        </AuthProvider>
        {/* <NextTopLoader color="#1a365d" className="z-[99999]" /> */}
        <Toaster richColors={true} closeButton={true} theme="dark" />
        <Search />
        <Changelogs />
        <MobileNavButton />
        <MobileBottomNav />
        <GoToTop />
        <Footer />
      </body>
    </html>
  )
}

import { Inter } from 'next/font/google'
import './globals.css'
import { NextUiProvider } from "./NextUiProvider";
// import NextTopLoader from 'nextjs-toploader';
import GoToTop from '@/components/GoToTop';
// import localFont from 'next/font/local';
import Footer from '@/components/Footer';
import Script from "next/script";
import { getAuthSession } from './api/auth/[...nextauth]/route';
import { Toaster } from 'sonner'
import { AuthProvider } from './SessionProvider';
import ThemeProvider from '@/components/ThemeProvider';
import PWAInstallButton from '@/components/PWAInstallButton';

const inter = Inter({ subsets: ['latin'] })
// const myfont = localFont({ src: "../static-fonts/28 Days Later.ttf" })

const APP_NAME = "AniNight";
const APP_DEFAULT_TITLE = "AniNight - Watch Anime Online & Read Manga Free";
const APP_DESCRIPTION = "Watch anime online and read manga free on AniNight. Stream the latest anime episodes with English subtitles and dubs. Discover trending anime, popular manga, seasonal releases, and classic series. Your ultimate destination for anime streaming and manga reading.";

export const metadata = {
  metadataBase: new URL('https://night677coder.github.io/aninight'),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: '%s | AniNight'
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
    'aninight',
    'ani night',
    'anilist tracker',
    'anime tracker',
    'manga tracker',
  ],
  authors: [{ name: 'AniNight' }],
  creator: 'AniNight',
  publisher: 'AniNight',
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
    url: 'https://night677coder.github.io/aninight',
    locale: 'en_US',
    images: [
      {
        url: 'https://night677coder.github.io/aninight/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'AniNight Logo',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    images: ['https://night677coder.github.io/aninight/android-chrome-512x512.png'],
    creator: '@aninight',
  },
  alternates: {
    canonical: 'https://night677coder.github.io/aninight',
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
      
      {/* Google AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script id="google-adsense" strategy="afterInteractive">
        {`
          (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-9097893369149135",
            enable_page_level_ads: true
          });
        `}
      </Script>
      <head>
        {/* Google Search & SEO Meta Tags */}
        <meta name="google-site-verification" content="9Cj5Gd0-OuGDtGb4HpRqNfBXy3FuFCcFNWSvTPOlTzE" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="google" content="nositelinkssearchbox" />
        <meta name="google-site-verification" content="9Cj5Gd0-OuGDtGb4HpRqNfBXy3FuFCcFNWSvTPOlTzE" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="AniNight" />
        <meta name="apple-mobile-web-app-title" content="AniNight" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "AniNight",
              "alternateName": "Ani Night",
              "url": "https://night677coder.github.io/aninight",
              "description": "Watch anime online and read manga free on AniNight. Stream the latest anime episodes with English subtitles and dubs. Discover trending anime, popular manga, seasonal releases, and classic series.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://night677coder.github.io/aninight/anime/catalog?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "AniNight",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://night677coder.github.io/aninight/android-chrome-512x512.png",
                  "width": 512,
                  "height": 512
                }
              },
              "sameAs": [
                "https://twitter.com/aninight",
                "https://github.com/night677coder"
              ]
            })
          }}
        />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/luffu.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="canonical" href="https://night677coder.github.io/aninight" />
        <link rel="alternate" type="application/rss+xml" title="AniNight RSS Feed" href="https://night677coder.github.io/aninight/rss.xml" />
        {/* <script src="https://kit.fontawesome.com/c189d5d7c5.js" crossOrigin="anonymous" async></script> */}
      </head>
      <Script
        id="prevent-context-menu"
        strategy="beforeInteractive"
      >
        {`
          document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
          });
        `}
      </Script>
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
        <GoToTop />
        <PWAInstallButton />
        <Footer />
      </body>
    </html>
  )
}

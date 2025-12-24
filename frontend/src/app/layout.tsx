/**
 * Root Layout for Next.js 14 App Router
 * 
 * This is the root layout component that wraps all pages in the application.
 * It provides global functionality including:
 * - HTML structure and metadata
 * - Global styles and fonts
 * - Theme provider (dark mode support)
 * - Authentication provider
 * - State management providers (Redux, React Query)
 * - Cart, Wishlist, and Modal providers
 * - Toast notifications
 * - Analytics integration
 * - Progressive Web App (PWA) support
 * - Accessibility features
 * - SEO optimization
 * 
 * Features:
 * - Server Components support
 * - Streaming with Suspense boundaries
 * - Progressive enhancement
 * - Optimal loading performance
 * - Metadata API integration
 * - Google Analytics
 * - Structured data for SEO
 * - Web vitals tracking
 * - Error boundaries
 * - Loading states
 * - Responsive typography
 * - Custom scrollbar
 * - Smooth scrolling
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/layout
 */

import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, Roboto, Playfair_Display, Poppins } from 'next/font/google';
import Script from 'next/script';
import { headers } from 'next/headers';

// Import providers
import { GlobalProvider } from '@/components/providers';

// Import layout components
import { BackToTop } from '@/components/common';
import { LoadingScreen } from '@/components/common';

// Import utilities
import { cn } from '@/lib/utils';

// Import global styles
import '@/styles/force-light.css'; // Force light mode
import '@/styles/globals.css';

/**
 * Font Configurations
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  fallback: ['serif'],
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

/**
 * Application Metadata
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://vardhmantextiles.com'),

  title: {
    default: 'Vardhman Textiles - Premium Quality Textiles & Home Decor',
    template: '%s | Vardhman Textiles',
  },

  description: 'Discover premium quality textiles, bedsheets, towels, curtains, and home decor products. Shop from India\'s leading textile manufacturer with 50+ years of excellence.',

  keywords: [
    'textiles',
    'bedsheets',
    'towels',
    'curtains',
    'home decor',
    'cotton fabrics',
    'blankets',
    'table linen',
    'pillow covers',
    'Vardhman Mills',
    'textile manufacturer',
    'premium textiles',
    'Indian textiles',
  ],

  authors: [
    {
      name: 'Vardhman Textiles',
      url: 'https://vardhmantextiles.com',
    },
  ],

  creator: 'Vardhman Textiles',
  publisher: 'Vardhman Textiles',

  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://vardhmantextiles.com',
    siteName: 'Vardhman Textiles',
    title: 'Vardhman Textiles - Premium Quality Textiles & Home Decor',
    description: 'Discover premium quality textiles, bedsheets, towels, curtains, and home decor products from India\'s leading textile manufacturer.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vardhman Textiles - Premium Textiles',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@vardhmantextiles',
    creator: '@vardhmantextiles',
    title: 'Vardhman Textiles - Premium Quality Textiles',
    description: 'Shop premium textiles, bedsheets, towels, and home decor from India\'s leading manufacturer.',
    images: ['/images/twitter-image.jpg'],
  },

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

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || '',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || '',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },

  alternates: {
    canonical: 'https://vardhmantextiles.com',
    languages: {
      'en-IN': 'https://vardhmantextiles.com/en-IN',
      'hi-IN': 'https://vardhmantextiles.com/hi-IN',
    },
  },

  category: 'E-commerce',

  manifest: '/manifest.json',

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#0066cc' },
    ],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vardhman Textiles',
  },

  applicationName: 'Vardhman Textiles',

  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Vardhman',
    'msapplication-TileColor': '#0066cc',
    'msapplication-config': '/browserconfig.xml',
  },
};

/**
 * Viewport Configuration
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a202c' },
  ],
  colorScheme: 'light dark',
};

/**
 * Root Layout Component Props
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root Layout Component
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  // Get headers for user agent detection (if needed)
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  // Detect device type
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  const isTablet = /Tablet|iPad/i.test(userAgent);

  // Environment variables
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtagId = process.env.NEXT_PUBLIC_GTAG_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      style={{ colorScheme: 'light' }}
      className={cn(
        'scroll-smooth',
        inter.variable,
        roboto.variable,
        playfairDisplay.variable,
        poppins.variable
      )}
    >
      <head>
        {/* Google Tag Manager */}
        {isProduction && gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}

        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />

        {/* DNS Prefetch for faster resource loading */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Vardhman Textiles',
              url: 'https://vardhmantextiles.com',
              logo: 'https://vardhmantextiles.com/images/logo.png',
              description: 'Premium quality textiles and home decor manufacturer',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
                addressRegion: 'Punjab',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-XXX-XXX-XXXX',
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['English', 'Hindi'],
              },
              sameAs: [
                'https://www.facebook.com/vardhmantextiles',
                'https://www.instagram.com/vardhmantextiles',
                'https://twitter.com/vardhmantextiles',
                'https://www.linkedin.com/company/vardhmantextiles',
              ],
            }),
          }}
        />

        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Vardhman Textiles',
              url: 'https://vardhmantextiles.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://vardhmantextiles.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>

      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          'text-gray-900',
          'selection:bg-blue-600 selection:text-white',
          isMobile && 'mobile-device',
          isTablet && 'tablet-device'
        )}
        suppressHydrationWarning
      >
        {/* Google Tag Manager (noscript) */}
        {isProduction && gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        )}

        {/* Skip to Main Content Link (Accessibility) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>

        {/* Global Providers Wrapper - Contains all providers: QueryProvider, ThemeProvider, AuthProvider, NotificationProvider, ModalProvider, CartProvider, WishlistProvider */}
        <GlobalProvider
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
            enableSystem: false
          }}
        >
          {/* Main Content with Loading Boundary */}
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <LoadingScreen variant="spinner" message="Loading Vardhman Textiles..." />
              </div>
            }
          >
            {children}
          </Suspense>

          {/* Back to Top Button */}
          <BackToTop />
        </GlobalProvider>

        {/* Google Analytics */}
        {isProduction && gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}

        {/* Google Tag Manager */}
        {isProduction && gtagId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtagId}');
            `}
          </Script>
        )}

        {/* Facebook Pixel */}
        {isProduction && fbPixelId && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        {/* Service Worker Registration (PWA) - TEMPORARILY DISABLED */}
        {/* {isProduction && (
          <Script id="service-worker" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `}
          </Script>
        )} */}

        {/* Web Vitals Tracking - TEMPORARILY DISABLED */}
        {/* {isProduction && (
          <Script id="web-vitals" strategy="afterInteractive">
            {`
              function sendToAnalytics(metric) {
                const body = JSON.stringify(metric);
                const url = '/api/analytics/web-vitals';
                
                if (navigator.sendBeacon) {
                  navigator.sendBeacon(url, body);
                } else {
                  fetch(url, { body, method: 'POST', keepalive: true });
                }
              }
              
              // Report Web Vitals
              if (typeof window !== 'undefined') {
                import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                  getCLS(sendToAnalytics);
                  getFID(sendToAnalytics);
                  getFCP(sendToAnalytics);
                  getLCP(sendToAnalytics);
                  getTTFB(sendToAnalytics);
                });
              }
            `}
          </Script>
        )} */}

        {/* Development Only: React DevTools */}
        {isDevelopment && (
          <Script id="react-devtools" strategy="lazyOnload">
            {`
              console.log('%c🚀 Vardhman Textiles - Development Mode', 'color: #0066cc; font-size: 16px; font-weight: bold;');
              console.log('%cReact DevTools is available', 'color: #61dafb; font-size: 12px;');
            `}
          </Script>
        )}

        {/* Accessibility: Reduced Motion Support */}
        <Script id="reduced-motion" strategy="beforeInteractive">
          {`
            (function() {
              const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
              if (mediaQuery.matches) {
                document.documentElement.classList.add('reduce-motion');
              }
              
              mediaQuery.addEventListener('change', (e) => {
                if (e.matches) {
                  document.documentElement.classList.add('reduce-motion');
                } else {
                  document.documentElement.classList.remove('reduce-motion');
                }
              });
            })();
          `}
        </Script>

        {/* Color Scheme Detection - FORCED LIGHT MODE */}
        <Script id="color-scheme" strategy="beforeInteractive">
          {`
            (function() {
              // FORCE LIGHT MODE - always remove dark class
              document.documentElement.classList.remove('dark');
            })();
          `}
        </Script>
      </body>
    </html>
  );
}

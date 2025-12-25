
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { ChefHat, User } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import Script from 'next/script';
import type { Viewport } from 'next'
import AdMobInit from "@/components/AdMobInit";
import { AuthProvider } from "@/hooks/use-auth";
import { Capacitor } from '@capacitor/core';


export const viewport: Viewport = {
  themeColor: '#4CAF50',
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meal Genna",
  description: "Instant Meal Ideas, Zero Hassle",
  manifest: '/manifest.ts',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-17507715969" strategy="afterInteractive"></Script>
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17507715969');
          `}
        </Script>
        <Script id="google-ads-conversion-snippet" strategy="afterInteractive">
          {`
            function gtag_report_conversion(url, enhanced_conversion_data) {
              var callback = function () {
                if (typeof(url) != 'undefined') {
                  window.location = url;
                }
              };
              gtag('event', 'conversion', {
                  'send_to': 'AW-17507715969/fFGWCK7A_MAbEIGXqpxB',
                  'transaction_id': '',
                  'event_callback': callback,
                  'enhanced_conversion_data': enhanced_conversion_data
              });
              return false;
            }
          `}
        </Script>
        <meta name="google-adsense-account" content="ca-pub-6191158195654090" />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WDJBSQ72');
          `}
        </Script>
        
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6191158195654090"
          crossOrigin="anonymous"
          strategy="afterInteractive"
          data-ad-host-channel="DISABLE_AUTO_ADS"
        />
        <Script src="https://js.stripe.com/v3/" strategy="lazyOnload" />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WDJBSQ72"
        height="0" width="0" style={{display:"none", visibility:"hidden"}}></iframe></noscript>
        <AdMobInit />

        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <AuthProvider>
              <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="container flex h-14 items-center">
                    <Link href="/" className="mr-auto flex items-center">
                      <ChefHat className="h-6 w-6 mr-2 text-primary" />
                      <span className="font-bold">MealGenna</span>
                    </Link>
                    <nav className="flex items-center gap-2">
                      <Link href="/account" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Account</span>
                      </Link>
                      <ModeToggle />
                    </nav>
                  </div>
              </header>
              <main className="flex-1">{children}</main>
              <footer className="py-6 md:px-8 md:py-8 border-t">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                  <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MealGenna. All rights reserved.</p>
                  <nav className="flex gap-4 sm:gap-6">
                      <Link href="/about" className="text-sm hover:underline">About Us</Link>
                      <Link href="/blog" className="text-sm hover:underline">Blog</Link>
                      <Link href="/terms" className="text-sm hover:underline">Terms & Conditions</Link>
                      <Link href="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
                      <Link href="/contact" className="text-sm hover-underline">Contact Us</Link>
                  </nav>
                </div>
              </footer>
              <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

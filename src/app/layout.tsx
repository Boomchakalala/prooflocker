import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import CookieConsent from "@/components/CookieConsent";
import { getSiteUrl, getAbsoluteUrl } from "@/lib/config";

const interTight = Inter_Tight({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "ProofLocker — Lock Claims On-Chain. Prove It With Receipts.",
  description: "Lock claims on-chain. Resolve with evidence. Build math-backed reputation. Proof of Reputational Observation — powered by Constellation DAG.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon.ico" },
    ],
    apple: "/favicons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Build Your Reputation. Claims With Receipts.",
    description: "Lock claims on-chain. Resolve with evidence. Build math-backed reputation. Proof of Reputational Observation.",
    url: siteUrl,
    type: "website",
    siteName: "ProofLocker",
    images: [
      {
        url: getAbsoluteUrl("/favicons/icon-512.png"),
        width: 512,
        height: 512,
        alt: "ProofLocker",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Build Your Reputation. Claims With Receipts.",
    description: "Lock claims on-chain. Resolve with evidence. Build math-backed reputation. Proof of Reputational Observation.",
    images: [getAbsoluteUrl("/favicons/icon-512.png")],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" />
      </head>
      <body
        className={`${interTight.variable} ${montserrat.variable} ${jetbrainsMono.variable} antialiased bg-[#1A0033] text-[#F5F5F5]`}
      >
        {/* Google Analytics 4 - Load gtag.js */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="ga4" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        <AuthProvider>
          <ToastProvider>
            <AnalyticsTracker />
            {children}
            <CookieConsent />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import AuthDebugPanel from "@/components/AuthDebugPanel";
import EnvIndicator from "@/components/EnvIndicator";
import { getSiteUrl, getAbsoluteUrl } from "@/lib/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "ProofLocker",
  description: "Time-stamped prediction proofs. Claim later. Share receipts.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "ProofLocker",
    description: "Time-stamped prediction proofs. Claim later. Share receipts.",
    url: siteUrl,
    type: "website",
    siteName: "ProofLocker",
    images: [
      {
        url: getAbsoluteUrl("/og.png"),
        width: 1200,
        height: 630,
        alt: "ProofLocker - Time-stamped prediction proofs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProofLocker",
    description: "Time-stamped prediction proofs. Claim later. Share receipts.",
    images: [getAbsoluteUrl("/og.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        {/* Google Analytics 4 - Load gtag.js */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
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
          <AnalyticsTracker />
          {children}
          <AuthDebugPanel />
        </AuthProvider>
        <EnvIndicator />
      </body>
    </html>
  );
}

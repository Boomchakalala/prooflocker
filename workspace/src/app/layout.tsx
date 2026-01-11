import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProofLocker",
  description: "Time-stamped prediction proofs. Claim later. Share receipts.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "ProofLocker",
    description: "Time-stamped prediction proofs. Claim later. Share receipts.",
    type: "website",
    siteName: "ProofLocker",
  },
  twitter: {
    card: "summary",
    title: "ProofLocker",
    description: "Time-stamped prediction proofs. Claim later. Share receipts.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

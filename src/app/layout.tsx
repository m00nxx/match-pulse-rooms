import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "Match Pulse Rooms",
    template: "%s · Match Pulse Rooms",
  },
  description:
    "A live, explainable second screen for football: feel momentum, read the market, and call the next moment without wagering.",
  applicationName: "Match Pulse Rooms",
  keywords: [
    "football",
    "fan experience",
    "live scores",
    "sports data",
    "TxLINE",
    "Solana",
  ],
  openGraph: {
    title: "Match Pulse Rooms",
    description:
      "See why a match feels alive. Explainable momentum, fan calls, and TxLINE signals in one room.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Match Pulse Rooms",
    description:
      "The explainable live room for every football moment.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

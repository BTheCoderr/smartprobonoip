import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PartnerTrackingInit } from "@/components/PartnerTrackingInit";
import { GtmProvider } from "@/components/analytics/GtmProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SmartProBono — Legal + IP Preparation",
    template: "%s | SmartProBono",
  },
  description:
    "Prepare for legal and intellectual-property conversations with clearer facts, documents, questions, and professional handoffs. Educational preparation only — not legal advice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <SiteNav />
        <PartnerTrackingInit />
        <GtmProvider />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

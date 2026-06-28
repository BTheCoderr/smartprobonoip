import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PartnerTrackingInit } from "@/components/PartnerTrackingInit";
import { GtmProvider } from "@/components/analytics/GtmProvider";
import { gtmContainerId } from "@/lib/analytics/gtm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartProBonoIP — IP Readiness Checker",
  description:
    "The digital front door for overlooked inventors. Organize your idea before reaching an expert.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = gtmContainerId();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <SiteNav />
        <PartnerTrackingInit />
        <GtmProvider />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

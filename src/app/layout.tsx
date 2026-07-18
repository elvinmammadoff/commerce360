import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://orbittify.com"),
  title: {
    default: "Orbittify — 360° product visuals from a single photo",
    template: "%s · Orbittify",
  },
  description:
    "Turn one product photo into a 360° viewer, orbit video, 72 studio frames, and marketplace-ready images. Built for furniture, electronics, and home brands.",
  applicationName: "Orbittify",
  openGraph: {
    title: "Orbittify",
    description:
      "Generate premium product visuals from a single photo — 360° viewers, orbit videos, and marketplace image sets.",
    siteName: "Orbittify",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}

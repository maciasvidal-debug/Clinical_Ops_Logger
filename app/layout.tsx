import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { I18nProvider } from "@/lib/i18n";
import { HtmlLang } from "@/components/layout/HtmlLang";
import { ServiceWorkerRegistry } from "@/components/pwa/ServiceWorkerRegistry";
import "./globals.css"; // Global styles

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "SiteFlow Clinical Ops Logger",
  description: "Time & Activity Logging for Clinical Operations",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SiteFlow",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased text-neutral-900 bg-neutral-50 selection:bg-indigo-500/30 selection:text-indigo-900 min-h-screen">
        <I18nProvider>
          <HtmlLang />
          <ServiceWorkerRegistry />
          {children}
        </I18nProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

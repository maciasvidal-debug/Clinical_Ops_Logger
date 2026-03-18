import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { I18nProvider } from "@/lib/i18n";
import { HtmlLang } from "@/components/layout/HtmlLang";
import "./globals.css"; // Global styles


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
    <html lang="en">
      <body suppressHydrationWarning>
        <I18nProvider>
          <HtmlLang />
          {children}
        </I18nProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

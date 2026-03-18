import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { I18nProvider } from "@/lib/i18n";
import { HtmlLang } from "@/components/layout/HtmlLang";
import "./globals.css"; // Global styles

export const metadata: Metadata = {
  title: "SiteFlow Clinical Ops Logger",
  description: "Time & Activity Logging for Clinical Operations",
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

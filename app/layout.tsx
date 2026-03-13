import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";
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
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

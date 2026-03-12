import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"; // Global styles

export const metadata: Metadata = {
  title: "SiteFlow Clinical Ops Logger",
  description: "A web application to streamline the logging of activities and billable hours for clinical trial site operations teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

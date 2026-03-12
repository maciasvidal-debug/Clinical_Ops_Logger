import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"; // Global styles

export const metadata: Metadata = {
  title: "Clinical Ops Logger",
  description: "Clinical Operations Logging Application",
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

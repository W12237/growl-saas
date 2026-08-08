import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agency OS — AI-Powered Agency Operating System",
  description: "The premium operating system for modern marketing agencies. Manage clients, projects, campaigns, finances, and AI workflows in one unified platform.",
  keywords: "agency management, project management, CRM, AI marketing, campaign management, agency OS",
  authors: [{ name: "Growl Agency" }],
  icons: {
    icon: "/growl-logo-bg.png",
    shortcut: "/growl-logo-bg.png",
    apple: "/growl-logo-bg.png",
  },
};

import ThemeProvider from '@/components/ThemeProvider';
import SecurityManager from '@/components/SecurityManager';
import { LanguageProvider } from '@/lib/i18n';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/growl-logo-bg.png" type="image/png" />
        <link rel="apple-touch-icon" href="/growl-logo-bg.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        <LanguageProvider>
          <ThemeProvider>
            <SecurityManager />
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

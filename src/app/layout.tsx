import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AutoTheme } from "@/components/theme/auto-theme";
import "./globals.css";

const SCRIPT_TEMA_INICIAL = `
(function () {
  try {
    var hora = new Date().getHours();
    var escuro = hora < 6 || hora >= 18;
    document.documentElement.classList.toggle("dark", escuro);
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Advance",
  description: "Dashboard da Social Advance",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Social Advance",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="tema-automatico"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }}
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Social Advance" />
        <meta name="theme-color" content="#1a1a2e" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <AutoTheme />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
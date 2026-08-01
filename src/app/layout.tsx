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
      </head>
      <body className="min-h-screen flex flex-col">
        <AutoTheme />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
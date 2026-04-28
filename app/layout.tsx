import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smartpedia.bandhannova.in"),
  title: {
    default: "BandhanNova Smartpedia — Your Personal Knowledge Engine",
    template: "%s | Smartpedia",
  },
  description:
    "Search, understand, and own the world's knowledge. AI-powered answers in 4 modes — Quick, Detailed, ELI5, and Academic. Built by BandhanNova Platforms.",
  keywords: [
    "BandhanNova",
    "Smartpedia",
    "knowledge engine",
    "AI search",
    "AI answers",
    "learn",
    "research",
    "ELI5",
    "academic search",
    "knowledge AI",
    "smart search engine",
    "Indian AI platform",
  ],
  authors: [{ name: "BandhanNova Platforms", url: "https://www.bandhannova.in" }],
  creator: "BandhanNova Platforms",
  publisher: "BandhanNova Platforms",
  openGraph: {
    title: "BandhanNova Smartpedia — Your Personal Knowledge Engine",
    description:
      "Search, understand, and own the world's knowledge with AI-powered answers in 4 modes.",
    type: "website",
    siteName: "BandhanNova Smartpedia",
    locale: "en_IN",
    url: "https://smartpedia.bandhannova.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "BandhanNova Smartpedia",
    description:
      "Your Personal Knowledge Engine — AI-powered answers in 4 modes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dark mode FOUC prevention */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('smartpedia-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "BandhanNova Smartpedia",
              description: "AI-powered knowledge engine with 4 answer modes",
              url: "https://smartpedia.bandhannova.in",
              applicationCategory: "SearchApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              creator: {
                "@type": "Organization",
                name: "BandhanNova Platforms",
                url: "https://www.bandhannova.in",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

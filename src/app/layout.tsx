import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

/* ─── SEO Metadata ─────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL("https://econoquest.app"),
  title: {
    default: "EconoQuest — Run the World Economy",
    template: "%s | EconoQuest",
  },
  description:
    "EconoQuest is an open-source economic simulation. Set monetary policy, manage trade, trigger crises, and learn how the global economy actually works.",
  keywords: [
    "economic simulation",
    "macroeconomics game",
    "fiscal policy simulator",
    "trade war game",
    "central bank simulator",
    "economics education",
    "gdp simulator",
    "inflation game",
    "econoquest",
  ],
  authors: [{ name: "EconoQuest" }],
  creator: "EconoQuest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://econoquest.app",
    siteName: "EconoQuest",
    title: "EconoQuest — Run the World Economy",
    description:
      "Set interest rates. Trigger trade wars. Watch the economy respond. A high-fidelity macroeconomic simulation built for learners and strategists.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EconoQuest — The World Economy Is Yours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EconoQuest — Run the World Economy",
    description:
      "Set interest rates. Trigger trade wars. Watch the economy respond.",
    images: ["/og-image.png"],
    creator: "@econoquest",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f2ebe0",
  width: "device-width",
  initialScale: 1,
};

/* ─── Root Layout ───────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        {/* Fonts: Bebas Neue (display) + DM Mono (mono/body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "EconoQuest",
              url: "https://econoquest.app",
              description:
                "A high-fidelity macroeconomic simulation for learners and strategists.",
              applicationCategory: "EducationApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#f2ebe0",
          fontFamily: "'DM Mono', 'Courier New', monospace",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </body>
    </html>
  );
}

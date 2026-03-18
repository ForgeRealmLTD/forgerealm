import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// ✅ Google Fonts with local fallbacks & swap behavior


// Display font for brand/title usage (modern, business-friendly)

// ✅ Safe site URL for metadata
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forgerealm.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ForgeRealm | Sustainable 3D Printing & Custom Models",
    template: "%s | ForgeRealm",
  },
  description:
    "UK-based creators of sustainable 3D-printed models and custom prints. Eco-friendly PLA, PETG options, and bespoke designs.",
  keywords: [
    "3D printing",
    "custom 3D prints",
    "PLA",
    "PETG",
    "eco-friendly",
    "Leeds",
    "UK",
    "figurines",
    "lamp shades",
    "dice holders",
  ],
  authors: [{ name: "ForgeRealm" }],
  creator: "ForgeRealm",
  publisher: "ForgeRealm",
  category: "3D Printing",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "ForgeRealm | Sustainable 3D Printing & Custom Models",
    description:
      "Custom, sustainable 3D prints made in the UK. Eco materials and bespoke work.",
    siteName: "ForgeRealm",
    images: [
      {
        url: "/fr.png",
        width: 1200,
        height: 630,
        alt: "ForgeRealm brand preview",
      },
    ],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    site: "@forgerealm",
    creator: "@forgerealm",
    title: "ForgeRealm | Sustainable 3D Printing",
    description:
      "Custom, sustainable 3D prints using PLA and PETG. Leeds, UK.",
    images: [
      {
        url: "/fr.png",
        alt: "ForgeRealm brand preview",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/headfrlogorv.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ✅ No manual preconnects — handled automatically by next/font */}
      <head>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>

      {/* ✅ Hydration mismatch permanently suppressed here */}
      <body
        suppressHydrationWarning
        className="antialiased"
      >
        {/* Accessibility: Skip to main content */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-black focus:text-white focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to content
        </a>

        <main id="main-content" role="main">
          {children}
        </main>

        {/* ✅ JSON-LD: Organization Schema */}
        <Script id="ld-org" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ForgeRealm",
            url: siteUrl,
            logo: new URL("/fr.png", siteUrl).toString(),
            sameAs: [
              "https://www.instagram.com/",
              "https://www.facebook.com/",
              "https://twitter.com/",
            ],
          })}
        </Script>

        {/* ✅ JSON-LD: WebSite Schema */}
        <Script id="ld-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ForgeRealm",
            url: siteUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteUrl}/?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>

        {/* ✅ External component loader */}
      </body>
    </html>
  );
}

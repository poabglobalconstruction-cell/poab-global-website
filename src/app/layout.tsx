import type { Metadata, Viewport } from "next";
import "./globals.css";
import { COMPANY_INFO, SITE_URL } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/seo/schema";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A1931",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  title: {
    default: `Building Construction Company in Ibadan | ${COMPANY_INFO.shortName}`,
    template: `%s | ${COMPANY_INFO.shortName}`,
  },
  description: `${COMPANY_INFO.name} (RC ${COMPANY_INFO.cacNumber}) delivers residential and commercial building construction from foundation to finish across Ibadan, Lagos, and Nigeria.`,
  keywords: [
    "POAB Global Construction",
    "Building Contractor Nigeria",
    "Construction Company Ibadan",
    "Construction Company Oyo State",
    "Construction Company Lagos",
    "Foundation to finish building",
    "Residential building contractor Nigeria",
    "Bungalow construction Nigeria",
    "Duplex builder Nigeria",
    "Building renovation Nigeria",
    "Perimeter fencing Nigeria",
    "Commercial construction Nigeria",
    "Civil engineering Nigeria",
  ],
  authors: [{ name: COMPANY_INFO.name, url: SITE_URL }],
  creator: COMPANY_INFO.name,
  publisher: COMPANY_INFO.name,
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    title: `Building Construction Company in Ibadan | ${COMPANY_INFO.shortName}`,
    description: `${COMPANY_INFO.name} (RC ${COMPANY_INFO.cacNumber}) delivers residential and commercial building construction from foundation to finish across Ibadan, Lagos, and Nigeria.`,
    siteName: COMPANY_INFO.name,
    images: [
      {
        url: "/brand/poab-logo.svg",
        width: 800,
        height: 600,
        alt: `${COMPANY_INFO.name} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Building Construction Company in Ibadan | ${COMPANY_INFO.shortName}`,
    description: `${COMPANY_INFO.name} (RC ${COMPANY_INFO.cacNumber}) delivers residential and commercial building construction from foundation to finish across Ibadan, Lagos, and Nigeria.`,
    images: ["/brand/poab-logo.svg"],
  },
  icons: {
    icon: [
      { url: "/brand/poab-pillar.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/brand/poab-pillar.svg", type: "image/svg+xml" },
    ],
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
  const rootSchema = {
    "@context": "https://schema.org",
    "@graph": [getOrganizationSchema(), getWebsiteSchema()],
  };

  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-sans bg-poab-stone-light text-poab-charcoal antialiased">
        <JsonLd data={rootSchema} />
        {children}
      </body>
    </html>
  );
}

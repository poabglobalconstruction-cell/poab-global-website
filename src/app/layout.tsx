import type { Metadata, Viewport } from "next";
import "./globals.css";
import { COMPANY_INFO, SITE_URL } from "@/lib/constants";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071B2D",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  title: {
    default: `${COMPANY_INFO.name} | Foundation to Finish Construction`,
    template: `%s | ${COMPANY_INFO.name}`,
  },
  description: `${COMPANY_INFO.name} (RC ${COMPANY_INFO.cacNumber}). ${COMPANY_INFO.tagline}. Hands-on site engineering delivering residential, commercial, and renovation projects across Lagos, Ibadan, and Nationwide.`,
  keywords: [
    "POAB Global Construction",
    "Building Contractor Nigeria",
    "Construction Company Ibadan",
    "Construction Company Lagos",
    "Foundation to finish building",
    "Bungalow construction Nigeria",
    "Duplex builder Nigeria",
    "Building Construction Nigeria",
    "Property development Nigeria",
  ],
  authors: [{ name: COMPANY_INFO.name }],
  creator: COMPANY_INFO.name,
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    title: `${COMPANY_INFO.name} | ${COMPANY_INFO.tagline}`,
    description: `Complete building delivery from foundation to finishing. 11 years of hands-on site engineering experience. RC ${COMPANY_INFO.cacNumber}.`,
    siteName: COMPANY_INFO.name,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-sans bg-poab-stone-light text-poab-charcoal antialiased">
        {children}
      </body>
    </html>
  );
}

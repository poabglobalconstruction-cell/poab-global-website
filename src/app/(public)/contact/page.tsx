import React from "react";
import type { Metadata } from "next";
import { getPublicContactSettings } from "@/lib/contact-settings";
import { ContactClient } from "./ContactClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Contact POAB Global Construction | Request a Building Quote",
  },
  description:
    "Contact POAB Global Construction Company Ltd. Head office in Ibadan, Oyo State, with site operations in Lagos and nationwide. Request a site assessment or building consultation.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact POAB Global Construction | Request a Building Quote",
    description:
      "Contact POAB Global Construction Company Ltd. Head office in Ibadan, Oyo State, with site operations in Lagos and nationwide. Request a site assessment or building consultation.",
    url: "/contact",
    type: "website",
    images: [{ url: "/brand/poab-logo.svg", width: 800, height: 600, alt: "Contact POAB Global Construction" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact POAB Global Construction | Request a Building Quote",
    description:
      "Contact POAB Global Construction Company Ltd. Head office in Ibadan, Oyo State, with site operations in Lagos and nationwide. Request a site assessment or building consultation.",
    images: ["/brand/poab-logo.svg"],
  },
};

export default async function ContactPage() {
  const contact = await getPublicContactSettings();
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ContactClient contact={contact} />
    </>
  );
}

import { COMPANY_INFO, SITE_URL } from "@/lib/constants";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["GeneralContractor", "Organization"],
    "@id": `${SITE_URL}/#organization`,
    name: COMPANY_INFO.name,
    alternateName: COMPANY_INFO.shortName,
    legalName: COMPANY_INFO.name,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/brand/poab-logo.svg`,
      width: "800",
      height: "600",
    },
    image: `${SITE_URL}/brand/poab-logo.svg`,
    description: `${COMPANY_INFO.name} (RC ${COMPANY_INFO.cacNumber}) provides complete building delivery from foundation to finishing across Ibadan, Oyo State, Lagos, and Nationwide in Nigeria.`,
    email: COMPANY_INFO.officialEmail,
    taxID: COMPANY_INFO.rcNumber,
    founder: {
      "@type": "Person",
      name: "Oriowo Abiola Idris",
      jobTitle: "Founder & CEO",
      description: "Construction engineering practitioner with 11 years of hands-on site engineering experience in Nigeria.",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ibadan",
      addressRegion: "Oyo State",
      addressCountry: "NG",
    },
    areaServed: [
      { "@type": "AdministrativeArea", "name": "Ibadan" },
      { "@type": "AdministrativeArea", "name": "Oyo State" },
      { "@type": "AdministrativeArea", "name": "Lagos" },
      { "@type": "AdministrativeArea", "name": "Ogun State" },
      { "@type": "Country", "name": "Nigeria" },
    ],
    knowsAbout: [
      "Residential Building Construction",
      "Duplex and Bungalow Construction",
      "Commercial Building Construction",
      "Structural Renovation and Remodeling",
      "Site Excavation and Foundation Casting",
      "Perimeter Fencing",
      "Turnkey Building Finishing",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Building Construction & Contracting Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Residential Building Construction",
            description: "Turnkey delivery of bungalows, duplexes, luxury homes, and multi-unit residences.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Commercial Building Construction",
            description: "Purpose-built business plazas, commercial properties, and corporate facilities.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Structural Renovation & Finishing",
            description: "Remodeling, structural upgrades, and turnkey finishing including screeding, tiling, and installations.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Foundation & Perimeter Site Works",
            description: "Site survey setting out, trench excavation, foundation blockwork casting, and perimeter fencing.",
          },
        },
      ],
    },
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: COMPANY_INFO.name,
    alternateName: COMPANY_INFO.shortName,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "en-NG",
  };
}

export function getBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

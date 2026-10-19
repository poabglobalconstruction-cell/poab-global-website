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

export function getProjectSchema(
  project: {
    title: string;
    slug: string;
    short_description: string;
    cover_image_path?: string | null;
    location: string;
    project_type: string;
    created_at: string;
    updated_at: string;
  },
  images?: Array<{ storage_path: string }>,
  videos?: Array<{
    title: string;
    caption?: string | null;
    created_at: string;
    duration_seconds?: number | null;
    thumbnail_path?: string | null;
  }>
) {
  const primaryImage =
    project.cover_image_path ||
    (images && images.length > 0 ? images[0].storage_path : `${SITE_URL}/brand/poab-logo.svg`);

  const videoObjects = (videos || []).map((v) => ({
    "@type": "VideoObject",
    name: v.title,
    description: v.caption || v.title,
    uploadDate: v.created_at,
    thumbnailUrl: v.thumbnail_path || primaryImage,
    contentUrl: `${SITE_URL}/projects/${project.slug}`,
    ...(v.duration_seconds && v.duration_seconds > 0
      ? { duration: `PT${v.duration_seconds}S` }
      : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@type": ["CreativeWork", "Thing"],
    "@id": `${SITE_URL}/projects/${project.slug}#project`,
    name: project.title,
    headline: project.title,
    description: project.short_description,
    url: `${SITE_URL}/projects/${project.slug}`,
    image: primaryImage,
    creator: {
      "@id": `${SITE_URL}/#organization`,
    },
    locationCreated: {
      "@type": "Place",
      name: project.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: project.location,
        addressCountry: "NG",
      },
    },
    datePublished: project.created_at,
    dateModified: project.updated_at,
    ...(videoObjects.length > 0 ? { video: videoObjects } : {}),
  };
}

export function getPropertySchema(
  property: {
    title: string;
    slug: string;
    description: string;
    location: string;
    property_type: string;
    status: string;
    price?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    size_sqm?: number | null;
    created_at: string;
    updated_at: string;
  },
  images?: Array<{ storage_path: string; is_primary?: boolean }>,
  videos?: Array<{
    title: string;
    caption?: string | null;
    created_at: string;
    duration_seconds?: number | null;
    thumbnail_path?: string | null;
  }>
) {
  const imageList = (images || [])
    .map((img) => img.storage_path)
    .filter(Boolean);

  const fallbackImage = `${SITE_URL}/brand/poab-logo.svg`;
  const primaryImage = imageList.length > 0 ? imageList[0] : fallbackImage;

  const availability =
    property.status === "Available"
      ? "https://schema.org/InStock"
      : property.status === "Under Offer"
      ? "https://schema.org/PreOrder"
      : "https://schema.org/Sold";

  const videoObjects = (videos || []).map((v) => ({
    "@type": "VideoObject",
    name: v.title,
    description: v.caption || v.title,
    uploadDate: v.created_at,
    thumbnailUrl: v.thumbnail_path || primaryImage,
    contentUrl: `${SITE_URL}/properties/${property.slug}`,
    ...(v.duration_seconds && v.duration_seconds > 0
      ? { duration: `PT${v.duration_seconds}S` }
      : {}),
  }));

  const isLand = property.property_type.toLowerCase() === "land";

  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateListing", "Offer"],
    "@id": `${SITE_URL}/properties/${property.slug}#listing`,
    name: property.title,
    description: property.description.slice(0, 300),
    url: `${SITE_URL}/properties/${property.slug}`,
    ...(property.price
      ? {
          price: property.price,
          priceCurrency: "NGN",
        }
      : {}),
    availability,
    offeredBy: {
      "@id": `${SITE_URL}/#organization`,
    },
    itemOffered: {
      "@type": isLand ? "Place" : "SingleFamilyResidence",
      name: property.title,
      description: property.description.slice(0, 300),
      address: {
        "@type": "PostalAddress",
        addressLocality: property.location,
        addressCountry: "NG",
      },
      ...(property.bedrooms && !isLand ? { numberOfBedrooms: property.bedrooms } : {}),
      ...(property.bathrooms && !isLand ? { numberOfBathroomsTotal: property.bathrooms } : {}),
      ...(property.size_sqm
        ? {
            floorSize: {
              "@type": "QuantitativeValue",
              value: property.size_sqm,
              unitCode: "MTK",
            },
          }
        : {}),
      image: imageList.length > 0 ? imageList : [fallbackImage],
    },
    ...(videoObjects.length > 0 ? { video: videoObjects } : {}),
  };
}

export function getServicesCatalogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/services#service`,
    name: "Building Construction, Renovation & Property Services",
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    serviceType: "General Contracting & Building Construction",
    areaServed: [
      { "@type": "AdministrativeArea", name: "Ibadan" },
      { "@type": "AdministrativeArea", name: "Oyo State" },
      { "@type": "AdministrativeArea", name: "Lagos" },
      { "@type": "AdministrativeArea", name: "Ogun State" },
      { "@type": "Country", name: "Nigeria" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "POAB Core Construction Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Turnkey Building Construction",
            description: "Turnkey delivery of bungalows, duplexes, luxury homes, and multi-unit residences from excavation to finish.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Renovation & Finishing",
            description: "Structural restoration, space reconfiguration, uncompleted carcass completion, and modern interior/exterior finishing.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Site & Perimeter Works",
            description: "Sub-structure casting, perimeter security boundary fencing, site clearing, setting out, and retaining walls.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Property Sales & Acquisition Support",
            description: "Seller representation, buyer advisory, and verified property marketing across Ibadan, Lagos, and Nigeria.",
          },
        },
      ],
    },
  };
}

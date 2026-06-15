import type { Property } from "./mock/mock-properties";

export const SITE = {
  name: "Ilocos Sur Property",
  tagline: "Ilocos Sur's #1 Property Platform",
  description:
    "Browse verified houses, lots, condos, and commercial properties across Ilocos Sur — Vigan, Candon, Narvacan, and more. Connect with trusted local sellers.",
  locale: "en_PH",
  email: "ilocossurproperty@gmail.com",
  facebook: "https://www.facebook.com/people/Ilocos-Sur-Property/61589026535906/",
  instagram: "https://www.instagram.com/ilocossurproperty/",
} as const;

export function getSiteUrl(): string {
  return (process.env.EXPO_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export function formatPageTitle(pageTitle?: string): string {
  if (!pageTitle) return `${SITE.name} — ${SITE.tagline}`;
  return `${pageTitle} | ${SITE.name}`;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `₱${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  return `₱${price.toLocaleString("en-PH")}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function propertySeoDescription(property: Property): string {
  const city = property.location?.city;
  const type = capitalize(property.type);
  const price = formatPrice(property.price);
  const location = [property.location?.barangay, city, "Ilocos Sur"].filter(Boolean).join(", ");
  const status = capitalize(property.status);
  return `${property.title} — ${type} for sale in ${location}. Listed at ${price}. Status: ${status}. View photos, amenities, and contact the agent on Ilocos Sur Property.`;
}

export function propertyDetailPath(id: string | number): string {
  return `/details/${id}`;
}

export function organizationJsonLd() {
  const url = getSiteUrl() || undefined;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE.name,
    description: SITE.description,
    ...(url ? { url } : {}),
    email: SITE.email,
    sameAs: [SITE.facebook, SITE.instagram],
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Ilocos Sur",
      containedInPlace: { "@type": "Country", name: "Philippines" },
    },
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl() || undefined;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    description: SITE.description,
    ...(url ? { url } : {}),
    potentialAction: {
      "@type": "SearchAction",
      target: url ? `${url}/properties` : "/properties",
      "query-input": "required name=search_term_string",
    },
  };
}

export function propertyListingJsonLd(property: Property) {
  const path = propertyDetailPath(property.id);
  const url = getSiteUrl() ? absoluteUrl(path) : path;
  const image = property.media?.find((m) => m.isPrimary)?.url ?? property.media?.[0]?.url;
  const address = property.location;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.details ?? propertySeoDescription(property),
    url,
    ...(image ? { image } : {}),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "PHP",
      availability:
        property.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    ...(address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: address.address,
            addressLocality: address.city,
            addressRegion: address.province ?? "Ilocos Sur",
            addressCountry: address.country ?? "PH",
          },
        }
      : {}),
  };
}

/** Not a screen — satisfies Expo Router when this module sits under `app/`. */
export default function SeoConstantsRouteStub(): null {
  return null;
}

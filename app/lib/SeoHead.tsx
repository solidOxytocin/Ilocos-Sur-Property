import Head from "expo-router/head";
import {
  DEFAULT_OG_IMAGE,
  SITE,
  absoluteUrl,
  formatPageTitle,
  getSiteUrl,
} from "../constants/seo";

type SeoHeadProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export default function SeoHead({
  title,
  description = SITE.description,
  path,
  image,
  type = "website",
  noIndex = false,
  jsonLd,
}: SeoHeadProps) {
  const fullTitle = formatPageTitle(title);
  const canonicalPath = path ?? "/";
  const canonical = getSiteUrl() ? absoluteUrl(canonicalPath) : undefined;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : absoluteUrl(image)
    : getSiteUrl()
      ? absoluteUrl(DEFAULT_OG_IMAGE)
      : undefined;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noIndex ? "noindex,nofollow" : "index,follow"}
      />
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

      {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      ) : null}
    </Head>
  );
}

/** Not a screen — satisfies Expo Router when this module sits under `app/`. */
export function SeoHeadRouteStub(): null {
  return null;
}

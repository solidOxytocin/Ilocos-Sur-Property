import fs from "node:fs";
import path from "node:path";

const siteUrl = (process.env.EXPO_PUBLIC_SITE_URL || "https://ilocossurproperty.com").replace(
  /\/$/,
  ""
);

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/properties", priority: "0.9", changefreq: "daily" },
];

async function fetchPropertyIds(): Promise<string[]> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const res = await fetch(`${apiUrl}/property/getAll?limit=500`);
    if (!res.ok) return [];
    const json = await res.json();
    const rows = Array.isArray(json) ? json : (json?.data ?? []);
    return rows
      .filter((p: { id?: number }) => p?.id != null)
      .map((p: { id: number }) => String(p.id));
  } catch {
    return [];
  }
}

function urlEntry(loc: string, priority: string, changefreq: string) {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  const publicDir = path.join(process.cwd(), "public");
  fs.mkdirSync(publicDir, { recursive: true });

  const propertyIds = await fetchPropertyIds();
  const urls = [
    ...staticPages.map((p) =>
      urlEntry(`${siteUrl}${p.path === "/" ? "" : p.path}`, p.priority, p.changefreq)
    ),
    ...propertyIds.map((id) =>
      urlEntry(`${siteUrl}/details/${id}`, "0.7", "weekly")
    ),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);
  console.log(`Generated SEO files for ${siteUrl} (${propertyIds.length} property URLs)`);
}

main();

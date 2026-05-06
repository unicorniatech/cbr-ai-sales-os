import type { MetadataRoute } from "next";

const baseUrl = "https://cbr-ai-sales-os.vercel.app";

const sectionSlugs = [
  "cumbres-de-bendicion",
  "mision",
  "vision",
  "lotes-200m2",
  "calle-principal",
  "terrenos-patrimoniales",
  "claridad-documental",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...sectionSlugs.map((slug) => ({
      url: `${baseUrl}/secciones/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: slug === "cumbres-de-bendicion" ? 0.9 : 0.7,
    })),
  ];
}

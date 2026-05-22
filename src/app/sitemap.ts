import type { MetadataRoute } from "next";
import { activeTenant } from "./config/tenants";
import { editableContentDefaults, mergeEditableSections, type EditableSection } from "./lib/editable-content";
import { isSupabaseConfigured, supabaseRest } from "./lib/server/supabase-rest";

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

type ContentSectionRow = {
  section_id: string;
  title: string;
  copy: string;
  page_copy: string | null;
  image_url: string;
  media: EditableSection["media"] | null;
  link: string;
};

async function getSectionLinks() {
  if (!isSupabaseConfigured()) {
    return editableContentDefaults
      .filter((section) => !section.id.startsWith("casa"))
      .map((section) => section.link);
  }

  try {
    const rows = await supabaseRest<ContentSectionRow[]>({
      path: "content_sections",
      query: new URLSearchParams({
        select: "section_id,title,copy,page_copy,image_url,media,link",
        tenant_id: `eq.${activeTenant.id}`,
        order: "sort_order.asc",
      }).toString(),
    });
    const sections = mergeEditableSections(
      rows.map((row) => ({
        id: row.section_id,
        title: row.title,
        copy: row.copy,
        pageCopy: row.page_copy ?? row.copy,
        image: row.image_url,
        media: row.media ?? [],
        link: row.link,
      })),
    );

    return sections
      .filter((section) => !section.id.startsWith("casa"))
      .map((section) => section.link);
  } catch {
    return editableContentDefaults
      .filter((section) => !section.id.startsWith("casa"))
      .map((section) => section.link);
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const dynamicSectionSlugs = (await getSectionLinks())
    .filter((link) => link.startsWith("/secciones/"))
    .map((link) => link.split("/").filter(Boolean).at(-1))
    .filter((slug): slug is string => Boolean(slug));
  const allSectionSlugs = [...new Set([...sectionSlugs, ...dynamicSectionSlugs])];

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/proyectos`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    ...allSectionSlugs.map((slug) => ({
      url: `${baseUrl}/secciones/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: slug === "cumbres-de-bendicion" ? 0.9 : 0.7,
    })),
  ];
}

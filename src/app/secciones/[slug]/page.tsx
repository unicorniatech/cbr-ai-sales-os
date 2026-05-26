import type { Metadata } from "next";
import {
  editableContentDefaults,
  getVisiblePageCopy,
  mergeEditableSections,
  type EditableSection,
} from "@/app/lib/editable-content";
import { activeTenant } from "@/app/config/tenants";
import { isSupabaseConfigured, supabaseRest } from "@/app/lib/server/supabase-rest";
import { SectionClientPage } from "./section-client";

const staticSlugs = [
  "cumbres-de-bendicion",
  "mision",
  "vision",
  "lotes-200m2",
  "calle-principal",
  "terrenos-patrimoniales",
  "claridad-documental",
  "casas-familiares",
  "casas-descanso",
  "casas-inversion",
  "casas-proceso",
];

export function generateStaticParams() {
  return staticSlugs.map((slug) => ({ slug }));
}

type ContentSectionRow = {
  section_id: string;
  title: string;
  copy: string;
  page_copy: string | null;
  image_url: string;
  media: EditableSection["media"] | null;
  link: string;
};

function getSectionSlug(section: EditableSection) {
  return section.link.split("/").filter(Boolean).at(-1) ?? section.id;
}

async function getSectionsForMetadata() {
  if (!isSupabaseConfigured()) return editableContentDefaults;

  try {
    const rows = await supabaseRest<ContentSectionRow[]>({
      path: "content_sections",
      query: new URLSearchParams({
        select: "section_id,title,copy,page_copy,image_url,media,link",
        tenant_id: `eq.${activeTenant.id}`,
        order: "sort_order.asc",
      }).toString(),
    });

    return mergeEditableSections(
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
  } catch {
    return editableContentDefaults;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sections = await getSectionsForMetadata();
  const section = sections.find((item) => getSectionSlug(item) === slug) ?? sections[0];
  const isLandPage = section.id === "proyecto" || section.id.startsWith("terreno-") || section.title.toLowerCase().includes("terreno");
  const title = isLandPage
    ? `${section.title} | Terrenos en Morelos`
    : `${section.title} | ${activeTenant.brand}`;
  const visibleCopy = getVisiblePageCopy(section) || section.copy;
  const description = `${visibleCopy} ${isLandPage ? "Terrenos en Morelos, Jojutla y zona sur con precio, ubicación, fotos, videos y atención directa." : ""}`.slice(0, 300);

  return {
    title,
    description,
    alternates: {
      canonical: `/secciones/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/secciones/${slug}`,
      images: section.image
        ? [
            {
              url: section.image,
              alt: section.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <SectionClientPage slug={slug || editableContentDefaults[0].id} />;
}

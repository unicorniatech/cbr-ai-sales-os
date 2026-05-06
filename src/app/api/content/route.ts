import { NextResponse } from "next/server";
import { activeTenant } from "@/app/config/tenants";
import {
  editableContentDefaults,
  mergeEditableSections,
  type EditableSection,
} from "@/app/lib/editable-content";
import { isSupabaseConfigured, supabaseRest } from "@/app/lib/server/supabase-rest";

type ContentSectionRow = {
  tenant_id: string;
  section_id: string;
  title: string;
  copy: string;
  image_url: string;
  link: string;
  sort_order: number;
};

function toClientSection(row: ContentSectionRow): EditableSection {
  return {
    id: row.section_id,
    title: row.title,
    copy: row.copy,
    image: row.image_url,
    link: row.link,
  };
}

function toRow(section: EditableSection, index: number): ContentSectionRow {
  return {
    tenant_id: activeTenant.id,
    section_id: section.id,
    title: section.title,
    copy: section.copy,
    image_url: section.image,
    link: section.link,
    sort_order: index,
  };
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      sections: editableContentDefaults,
    });
  }

  try {
    const query = new URLSearchParams({
      tenant_id: `eq.${activeTenant.id}`,
      order: "sort_order.asc",
    }).toString();
    const rows = await supabaseRest<ContentSectionRow[]>({
      path: "content_sections",
      query,
    });

    return NextResponse.json({
      configured: true,
      sections: mergeEditableSections(rows.map(toClientSection)),
    });
  } catch (error) {
    console.error("Content fetch failed", error);
    return NextResponse.json({
      configured: false,
      sections: editableContentDefaults,
      error: "Content fetch failed",
    });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { sections?: EditableSection[] };
  const sections = mergeEditableSections(body.sections ?? []);

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      stored: false,
      sections,
    });
  }

  try {
    const rows = await supabaseRest<ContentSectionRow[]>({
      path: "content_sections",
      method: "POST",
      query: "on_conflict=tenant_id,section_id",
      body: sections.map(toRow),
      prefer: "resolution=merge-duplicates,return=representation",
    });

    return NextResponse.json({
      configured: true,
      stored: true,
      sections: mergeEditableSections(rows.map(toClientSection)),
    });
  } catch (error) {
    console.error("Content save failed", error);
    return NextResponse.json(
      {
        configured: true,
        stored: false,
        sections,
        error: "Content save failed",
      },
      { status: 502 },
    );
  }
}

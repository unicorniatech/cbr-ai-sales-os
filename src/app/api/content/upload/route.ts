import { NextResponse } from "next/server";
import { activeTenant } from "@/app/config/tenants";
import {
  getSupabasePublicUrl,
  isSupabaseConfigured,
  SUPABASE_CONTENT_BUCKET,
  supabaseStorageUpload,
} from "@/app/lib/server/supabase-rest";

function getExtension(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type.split("/")[1] || "jpg";
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const sectionId = String(formData.get("sectionId") || "content");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing file" },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only images are allowed" },
      { status: 400 },
    );
  }

  const extension = getExtension(file);
  const safeSectionId = sectionId.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const path = `${activeTenant.id}/${safeSectionId}-${Date.now()}.${extension}`;

  try {
    await supabaseStorageUpload({
      bucket: SUPABASE_CONTENT_BUCKET,
      path,
      file: await file.arrayBuffer(),
      contentType: file.type,
    });

    return NextResponse.json({
      imageUrl: getSupabasePublicUrl(`${SUPABASE_CONTENT_BUCKET}/${path}`),
    });
  } catch (error) {
    console.error("Content image upload failed", error);
    return NextResponse.json(
      { error: "Content image upload failed" },
      { status: 502 },
    );
  }
}

type SupabaseMethod = "GET" | "POST" | "PATCH" | "DELETE";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const SUPABASE_CONTENT_BUCKET = "cbr-content";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function getSupabasePublicUrl(path: string) {
  if (!supabaseUrl) {
    throw new Error("Supabase is not configured");
  }

  return `${supabaseUrl}/storage/v1/object/public/${path}`;
}

export async function supabaseRest<T>({
  path,
  method = "GET",
  body,
  query,
  prefer = "return=representation",
}: {
  path: string;
  method?: SupabaseMethod;
  body?: unknown;
  query?: string;
  prefer?: string;
}): Promise<T> {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured");
  }

  const url = new URL(`/rest/v1/${path}`, supabaseUrl);
  if (query) {
    url.search = query;
  }

  const response = await fetch(url, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Supabase request failed");
  }

  return (await response.json()) as T;
}

export async function supabaseStorageUpload({
  bucket,
  path,
  file,
  contentType,
}: {
  bucket: string;
  path: string;
  file: ArrayBuffer;
  contentType: string;
}) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured");
  }

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucket}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: file,
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Supabase storage upload failed");
  }
}

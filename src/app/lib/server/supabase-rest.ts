type SupabaseMethod = "GET" | "POST" | "PATCH" | "DELETE";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export async function supabaseRest<T>({
  path,
  method = "GET",
  body,
  query,
}: {
  path: string;
  method?: SupabaseMethod;
  body?: unknown;
  query?: string;
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
      Prefer: "return=representation",
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

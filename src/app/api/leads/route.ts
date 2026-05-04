import { NextResponse } from "next/server";
import { activeTenant } from "@/app/config/tenants";
import { isSupabaseConfigured, supabaseRest } from "@/app/lib/server/supabase-rest";

type LeadPayload = {
  id?: string;
  tenantId?: string;
  name?: string;
  phone?: string;
  interest?: string;
  source?: string;
  temperature?: string;
  stage?: string;
  budget?: string;
  lastContact?: string;
  nextAction?: string;
  score?: number;
  notes?: string;
  createdAt?: string;
};

function generateLeadId(): string {
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `CBR-${timestamp}${random}`;
}

function normalizeLead(payload: LeadPayload) {
  return {
    id: payload.id || generateLeadId(),
    tenant_id: payload.tenantId || activeTenant.id,
    name: payload.name?.trim() || "Sin nombre",
    phone: payload.phone?.trim() || "Sin teléfono",
    interest: payload.interest || activeTenant.project.name,
    source: payload.source || "Landing",
    temperature: payload.temperature || "hot",
    stage: payload.stage || "Nuevo",
    budget: payload.budget || "Por definir",
    last_contact: payload.lastContact || "Ahora",
    next_action: payload.nextAction || "Primer contacto por WhatsApp",
    score: typeof payload.score === "number" ? payload.score : 85,
    notes: payload.notes || "Lead capturado desde la landing",
    created_at: payload.createdAt || new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  const payload = (await request.json()) as LeadPayload;
  const lead = normalizeLead(payload);

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      stored: false,
      reason: "Supabase is not configured",
      lead,
    });
  }

  try {
    const [storedLead] = await supabaseRest<typeof lead[]>({
      path: "leads",
      method: "POST",
      body: lead,
    });

    return NextResponse.json({ stored: true, lead: storedLead });
  } catch (error) {
    console.error("Lead persistence failed", error);
    return NextResponse.json(
      {
        stored: false,
        reason: "Lead persistence failed",
        lead,
      },
      { status: 502 },
    );
  }
}

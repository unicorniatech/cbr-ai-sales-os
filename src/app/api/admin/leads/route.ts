import { NextResponse } from "next/server";
import { activeTenant } from "@/app/config/tenants";
import { isSupabaseConfigured, supabaseRest } from "@/app/lib/server/supabase-rest";

type SupabaseLead = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  interest: string;
  source: "Landing" | "Asesor IA" | "WhatsApp" | "Referido";
  temperature: "hot" | "warm" | "cold";
  stage: "Nuevo" | "Contactado" | "Calificado" | "Visita" | "Apartado";
  budget: string;
  last_contact: string;
  next_action: string;
  score: number;
  notes: string;
  created_at: string;
};

function toClientLead(lead: SupabaseLead) {
  return {
    id: lead.id,
    tenantId: lead.tenant_id,
    name: lead.name,
    phone: lead.phone,
    interest: lead.interest,
    source: lead.source,
    temperature: lead.temperature,
    stage: lead.stage,
    budget: lead.budget,
    lastContact: lead.last_contact,
    nextAction: lead.next_action,
    score: lead.score,
    notes: lead.notes,
    createdAt: lead.created_at,
  };
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      configured: false,
      leads: [],
    });
  }

  try {
    const query = new URLSearchParams({
      tenant_id: `eq.${activeTenant.id}`,
      order: "created_at.desc",
      limit: "100",
    }).toString();
    const leads = await supabaseRest<SupabaseLead[]>({
      path: "leads",
      query,
    });

    return NextResponse.json({
      configured: true,
      leads: leads.map(toClientLead),
    });
  } catch (error) {
    console.error("Admin leads fetch failed", error);
    return NextResponse.json(
      {
        configured: true,
        leads: [],
        error: "Admin leads fetch failed",
      },
      { status: 502 },
    );
  }
}

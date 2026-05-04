import { activeTenant, type TenantId } from "../config/tenants";

type LeadTemperature = "hot" | "warm" | "cold";
type LeadStage = "Nuevo" | "Contactado" | "Calificado" | "Visita" | "Apartado";
type LeadSource = "Landing" | "Asesor IA" | "WhatsApp" | "Referido";

export type StoredLead = {
  id: string;
  tenantId: TenantId;
  name: string;
  phone: string;
  interest: string;
  source: LeadSource;
  temperature: LeadTemperature;
  stage: LeadStage;
  budget: string;
  lastContact: string;
  nextAction: string;
  score: number;
  notes: string;
  createdAt: string;
};

const STORAGE_KEY = "cbr-leads-v1";

function generateId(): string {
  const prefix = "CBR";
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}${random}`;
}

function getLeadsFromStorage(): StoredLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredLead[];
  } catch {
    return [];
  }
}

function saveLeads(leads: StoredLead[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function persistLeadRemotely(lead: StoredLead): void {
  if (typeof window === "undefined") return;

  fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  }).catch(() => {
    // Local storage remains the offline-safe source when the backend is unavailable.
  });
}

export function captureLead({
  name,
  phone,
  interest,
  notes = "",
  source,
}: {
  name: string;
  phone: string;
  interest: string;
  notes?: string;
  source: LeadSource;
}): StoredLead {
  const leads = getLeadsFromStorage();

  const newLead: StoredLead = {
    id: generateId(),
    tenantId: activeTenant.id,
    name: name.trim() || "Sin nombre",
    phone: phone.trim() || "Sin teléfono",
    interest: interest || "No especificado",
    source,
    temperature: "hot",
    stage: "Nuevo",
    budget: "Por definir",
    lastContact: "Ahora",
    nextAction: "Primer contacto por WhatsApp",
    score: 85,
    notes: notes.trim() || `Capturado desde ${source}`,
    createdAt: new Date().toISOString(),
  };

  saveLeads([newLead, ...leads]);
  persistLeadRemotely(newLead);
  return newLead;
}

export async function fetchRemoteLeads(): Promise<StoredLead[]> {
  try {
    const response = await fetch("/api/admin/leads", { cache: "no-store" });
    if (!response.ok) return [];
    const data = (await response.json()) as { leads?: StoredLead[] };
    return data.leads ?? [];
  } catch {
    return [];
  }
}

export function getAllLeads(): StoredLead[] {
  return getLeadsFromStorage();
}

export function clearLeads(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getLeadCount(): number {
  return getLeadsFromStorage().length;
}

export const STORAGE_KEY_EXPORT = STORAGE_KEY;
export type { LeadTemperature, LeadStage, LeadSource };

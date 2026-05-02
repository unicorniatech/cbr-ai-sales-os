"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Flame,
  LayoutDashboard,
  ListFilter,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  UsersRound,
} from "lucide-react";

type LeadTemperature = "hot" | "warm" | "cold";
type LeadStage = "Nuevo" | "Contactado" | "Calificado" | "Visita" | "Apartado";
type LeadSource = "Landing" | "Asesor IA" | "WhatsApp" | "Referido";

type Lead = {
  id: string;
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
};

const leads: Lead[] = [
  {
    id: "CBR-1048",
    name: "Mariana López",
    phone: "777 118 2049",
    interest: "Cumbres de Bendición",
    source: "Asesor IA",
    temperature: "hot",
    stage: "Visita",
    budget: "$95,000",
    lastContact: "Hace 12 min",
    nextAction: "Confirmar visita a Jojutla",
    score: 92,
    notes: "Pregunta por calle principal y documentos. Quiere avanzar esta semana.",
  },
  {
    id: "CBR-1047",
    name: "Roberto Sánchez",
    phone: "734 202 1881",
    interest: "Lote residencial",
    source: "Landing",
    temperature: "warm",
    stage: "Calificado",
    budget: "$85,000",
    lastContact: "Hace 38 min",
    nextAction: "Enviar ubicación y plan de pagos",
    score: 74,
    notes: "Busca terreno para construir en 2027. Le interesa mensualidad baja.",
  },
  {
    id: "CBR-1046",
    name: "Daniela Vargas",
    phone: "777 509 4420",
    interest: "Inversión",
    source: "WhatsApp",
    temperature: "hot",
    stage: "Apartado",
    budget: "$95,000",
    lastContact: "Hace 1 h",
    nextAction: "Solicitar comprobante y expediente",
    score: 96,
    notes: "Ya pidió datos para apartado. Alta intención.",
  },
  {
    id: "CBR-1045",
    name: "Jorge Pérez",
    phone: "735 918 7712",
    interest: "Casa",
    source: "Referido",
    temperature: "cold",
    stage: "Contactado",
    budget: "Por definir",
    lastContact: "Ayer",
    nextAction: "Reactivar con opciones de terreno",
    score: 39,
    notes: "Pidió información general, no respondió segunda llamada.",
  },
  {
    id: "CBR-1044",
    name: "Paola Méndez",
    phone: "777 330 9910",
    interest: "Terreno patrimonial",
    source: "Landing",
    temperature: "warm",
    stage: "Nuevo",
    budget: "$85,000",
    lastContact: "Hace 2 h",
    nextAction: "Primer contacto por WhatsApp",
    score: 68,
    notes: "Descargó info del proyecto y preguntó por medidas.",
  },
  {
    id: "CBR-1043",
    name: "Carlos Jiménez",
    phone: "777 402 8391",
    interest: "Cumbres de Bendición",
    source: "Asesor IA",
    temperature: "cold",
    stage: "Nuevo",
    budget: "Por definir",
    lastContact: "Hace 3 días",
    nextAction: "Enviar mensaje corto de reactivación",
    score: 28,
    notes: "Solo preguntó ubicación. Sin respuesta posterior.",
  },
];

const activities = [
  "Asesor IA calificó a Mariana López como lead caliente",
  "Daniela Vargas avanzó a Apartado",
  "Roberto Sánchez solicitó ubicación por WhatsApp",
  "Paola Méndez abrió la información de medidas",
  "Carlos Jiménez entró a secuencia de reactivación",
];

const temperatureStyles = {
  hot: {
    label: "Caliente",
    icon: Flame,
    className: "border-[#d8b86f]/45 bg-[#d8b86f]/12 text-[#f3d99a]",
  },
  warm: {
    label: "Tibio",
    icon: Sparkles,
    className: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
  },
  cold: {
    label: "Frío",
    icon: Snowflake,
    className: "border-white/15 bg-white/[0.055] text-white/58",
  },
};

const stages: LeadStage[] = ["Nuevo", "Contactado", "Calificado", "Visita", "Apartado"];

function StatCard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  trend: string;
  icon: typeof UsersRound;
}) {
  const positive = !trend.startsWith("-");

  return (
    <div className="border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <span className="grid size-11 place-items-center border border-[#d8b86f]/35 bg-[#d8b86f]/10 text-[#f3d99a]">
          <Icon size={22} />
        </span>
      </div>
      <div className="mt-5 flex items-center gap-2 text-sm">
        {positive ? (
          <ArrowUpRight size={16} className="text-emerald-300" />
        ) : (
          <ArrowDownRight size={16} className="text-rose-300" />
        )}
        <span className={positive ? "text-emerald-200" : "text-rose-200"}>{trend}</span>
        <span className="text-white/38">vs. semana pasada</span>
      </div>
    </div>
  );
}

function TemperatureBadge({ value }: { value: LeadTemperature }) {
  const style = temperatureStyles[value];
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-2 border px-2.5 py-1 text-xs ${style.className}`}>
      <Icon size={13} />
      {style.label}
    </span>
  );
}

function PipelineColumn({ stage, items }: { stage: LeadStage; items: Lead[] }) {
  return (
    <div className="min-w-[230px] border border-white/10 bg-white/[0.025]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm font-medium text-white">{stage}</p>
        <span className="text-xs text-white/42">{items.length}</span>
      </div>
      <div className="space-y-3 p-3">
        {items.map((lead) => (
          <article key={lead.id} className="border border-white/10 bg-[#06111f] p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{lead.name}</p>
                <p className="mt-1 text-xs text-white/45">{lead.interest}</p>
              </div>
              <span className="text-xs font-semibold text-[#f3d99a]">{lead.score}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <TemperatureBadge value={lead.temperature} />
              <span className="text-xs text-white/38">{lead.lastContact}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function LeadDetailPanel({ selectedLead }: { selectedLead: Lead }) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/38">
            Lead seleccionado
          </p>
          <h1 className="mt-3 text-2xl font-semibold">{selectedLead.name}</h1>
          <p className="mt-1 text-sm text-white/45">{selectedLead.id}</p>
        </div>
        <TemperatureBadge value={selectedLead.temperature} />
      </div>

      <div className="space-y-3 border-y border-white/10 py-4 text-sm">
        <p className="flex items-center justify-between gap-4">
          <span className="text-white/42">Teléfono</span>
          <span className="text-white">{selectedLead.phone}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-white/42">Interés</span>
          <span className="text-white">{selectedLead.interest}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-white/42">Etapa</span>
          <span className="text-white">{selectedLead.stage}</span>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-white/42">Presupuesto</span>
          <span className="text-white">{selectedLead.budget}</span>
        </p>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/38">Notas</p>
        <p className="text-sm leading-7 text-white/68">{selectedLead.notes}</p>
      </div>

      <div className="mt-5 grid gap-3">
        <button className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#d8b86f] px-4 text-sm font-semibold text-[#07111f] transition hover:bg-[#f3d99a]">
          <Phone size={17} />
          Llamar lead
        </button>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/10 px-4 text-sm text-white/70 transition hover:border-[#d8b86f]/60 hover:text-[#f3d99a]">
          <MessageCircle size={17} />
          WhatsApp
        </button>
      </div>
    </div>
  );
}

function TasksPanel() {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <p className="font-semibold">Próximas tareas</p>
      <div className="mt-4 space-y-4">
        {[
          ["Hoy 12:30", "Enviar ubicación a Roberto"],
          ["Hoy 16:00", "Confirmar visita con Mariana"],
          ["Mañana", "Reactivar cold leads sin respuesta"],
        ].map(([time, task]) => (
          <div key={task} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center border border-[#d8b86f]/35 bg-[#d8b86f]/10 text-[#f3d99a]">
              <CalendarClock size={16} />
            </span>
            <div>
              <p className="text-sm text-white/75">{task}</p>
              <p className="mt-1 text-xs text-white/35">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealtimeReadyPanel() {
  return (
    <div className="border border-white/10 bg-[#071321] p-5">
      <div className="flex items-center gap-3 text-[#f3d99a]">
        <ShieldCheck size={20} />
        <p className="font-semibold">Preparado para realtime</p>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/58">
        La UI ya separa leads, actividad, pipeline y detalle. El siguiente paso es
        conectar Supabase: tabla de leads, eventos en vivo, auth de admin y acciones.
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-white/42">
        <BadgeCheck size={15} className="text-[#f3d99a]" />
        Frontend listo para backend
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0].id);
  const [filter, setFilter] = useState<"all" | LeadTemperature>("all");
  const [query, setQuery] = useState("");

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? leads[0];
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesFilter = filter === "all" || lead.temperature === filter;
      const searchable = `${lead.name} ${lead.phone} ${lead.interest} ${lead.source}`.toLowerCase();
      return matchesFilter && searchable.includes(query.toLowerCase());
    });
  }, [filter, query]);

  const hotLeads = leads.filter((lead) => lead.temperature === "hot").length;
  const coldLeads = leads.filter((lead) => lead.temperature === "cold").length;
  const expectedPipeline = leads.reduce((sum, lead) => {
    const value = lead.budget.includes("95") ? 95000 : lead.budget.includes("85") ? 85000 : 0;
    return sum + value;
  }, 0);

  return (
    <main className="min-h-screen bg-[#030a16] text-white">
      <div className="border-b border-white/10 bg-[#030a16]/92 px-5 py-4 backdrop-blur lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center border border-[#d8b86f]/40 bg-[#d8b86f]/10 text-[#f3d99a]">
              <LayoutDashboard size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold">CBR Sales OS</p>
              <p className="text-xs text-white/45">Admin dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button className="hidden min-h-10 items-center gap-2 border border-white/10 bg-white/[0.045] px-4 text-xs uppercase tracking-[0.18em] text-white/68 transition hover:border-[#d8b86f]/55 hover:text-[#f3d99a] sm:inline-flex">
              <Bot size={16} />
              Asesor IA activo
            </button>
            <button className="grid size-10 place-items-center border border-white/10 bg-white/[0.045] text-white/68 transition hover:border-[#d8b86f]/55 hover:text-[#f3d99a]">
              <Bell size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-5 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 2xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="hidden border border-white/10 bg-white/[0.025] p-4 lg:block">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-white/38">Operación</p>
          {["Dashboard", "Leads", "Pipeline", "Tareas", "Asesor IA", "Reportes"].map((item, index) => (
            <button
              key={item}
              className={`mb-2 flex min-h-11 w-full items-center justify-between px-3 text-sm transition ${
                index === 0
                  ? "bg-[#d8b86f] text-[#07111f]"
                  : "text-white/62 hover:bg-white/[0.055] hover:text-white"
              }`}
            >
              {item}
              <ChevronRight size={15} />
            </button>
          ))}
          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/38">Automatización</p>
            <div className="mt-4 space-y-3 text-sm text-white/58">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-300" />
                Lead scoring activo
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-300" />
                Secuencia cold leads
              </p>
              <p className="flex items-center gap-2">
                <Clock3 size={16} className="text-[#f3d99a]" />
                Supabase pendiente
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Leads activos" value={String(leads.length)} trend="+18%" icon={UsersRound} />
            <StatCard label="Calientes" value={String(hotLeads)} trend="+11%" icon={Flame} />
            <StatCard label="Cold leads" value={String(coldLeads)} trend="-7%" icon={Snowflake} />
            <StatCard
              label="Pipeline"
              value={new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
                maximumFractionDigits: 0,
              }).format(expectedPipeline)}
              trend="+23%"
              icon={CircleDollarSign}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="border border-white/10 bg-white/[0.025]">
              <div className="flex flex-col gap-4 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold">Leads en tiempo real</p>
                  <p className="mt-1 text-sm text-white/42">
                    Vista preparada para Supabase realtime y asignación comercial.
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["all", "hot", "warm", "cold"] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => setFilter(value)}
                      className={`min-h-9 px-3 text-xs uppercase tracking-[0.15em] transition ${
                        filter === value
                          ? "bg-[#d8b86f] text-[#07111f]"
                          : "border border-white/10 text-white/52 hover:border-[#d8b86f]/60 hover:text-[#f3d99a]"
                      }`}
                    >
                      {value === "all" ? "Todos" : temperatureStyles[value].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-white/10 p-4">
                <label className="flex min-h-11 items-center gap-3 border border-white/10 bg-[#06111f] px-3 text-white/55">
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="Buscar por nombre, teléfono, interés o fuente"
                  />
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-white/38">
                    <tr>
                      <th className="px-4 py-4 font-medium">Lead</th>
                      <th className="px-4 py-4 font-medium">Interés</th>
                      <th className="px-4 py-4 font-medium">Estado</th>
                      <th className="px-4 py-4 font-medium">Fuente</th>
                      <th className="px-4 py-4 font-medium">Siguiente acción</th>
                      <th className="px-4 py-4 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="cursor-pointer border-b border-white/10 transition hover:bg-white/[0.035]"
                      >
                        <td className="px-4 py-4">
                          <p className="font-medium text-white">{lead.name}</p>
                          <p className="mt-1 text-xs text-white/42">{lead.phone}</p>
                        </td>
                        <td className="px-4 py-4 text-white/65">{lead.interest}</td>
                        <td className="px-4 py-4">
                          <TemperatureBadge value={lead.temperature} />
                        </td>
                        <td className="px-4 py-4 text-white/55">{lead.source}</td>
                        <td className="px-4 py-4 text-white/65">{lead.nextAction}</td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-[#f3d99a]">{lead.score}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.025] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold">Actividad live</p>
                <span className="inline-flex items-center gap-2 text-xs text-emerald-200">
                  <span className="size-2 bg-emerald-300" />
                  Simulado
                </span>
              </div>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity} className="flex gap-3">
                    <span className="mt-1 grid size-8 shrink-0 place-items-center border border-white/10 bg-[#06111f] text-[#f3d99a]">
                      {index % 2 === 0 ? <Bot size={15} /> : <MessageCircle size={15} />}
                    </span>
                    <div>
                      <p className="text-sm leading-6 text-white/72">{activity}</p>
                      <p className="mt-1 text-xs text-white/35">Hace {index + 1} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <p className="font-semibold">Pipeline comercial</p>
                <p className="mt-1 text-sm text-white/42">Arrastre visual preparado para CRM real.</p>
              </div>
              <button className="hidden min-h-10 items-center gap-2 border border-white/10 px-4 text-xs uppercase tracking-[0.18em] text-white/58 transition hover:border-[#d8b86f]/60 hover:text-[#f3d99a] sm:inline-flex">
                <ListFilter size={15} />
                Filtrar
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto p-4">
              {stages.map((stage) => (
                <PipelineColumn
                  key={stage}
                  stage={stage}
                  items={leads.filter((lead) => lead.stage === stage)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2 2xl:hidden">
            <LeadDetailPanel selectedLead={selectedLead} />
            <div className="space-y-6">
              <TasksPanel />
              <RealtimeReadyPanel />
            </div>
          </div>
        </section>

        <aside className="hidden space-y-6 2xl:block">
          <LeadDetailPanel selectedLead={selectedLead} />
          <TasksPanel />
          <RealtimeReadyPanel />
        </aside>
      </div>
    </main>
  );
}

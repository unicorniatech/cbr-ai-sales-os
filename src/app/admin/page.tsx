"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CirclePlus,
  Trash2,
  Flame,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  SquarePen,
  Snowflake,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { fetchRemoteLeads, getAllLeads, type StoredLead } from "../lib/lead-store";
import {
  editableContentDefaults,
  getSectionDetails,
  getVisiblePageCopy,
  mergeEditableSections,
  withSectionDetails,
  withVisiblePageCopy,
  type EditableSection,
  type EditableMedia,
} from "../lib/editable-content";

type LeadTemperature = "hot" | "warm" | "cold";
type Lead = StoredLead;

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

const ADMIN_EMAIL = "carmen.castrejon@cbr.mx";
const ADMIN_PASSWORD = "C@strejon2208";
const ADMIN_SESSION_KEY = "cbr-admin-session-v1";

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

function LeadDetailPanel({ selectedLead }: { selectedLead?: Lead }) {
  if (!selectedLead) {
    return (
      <div className="border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm leading-7 text-white/48">
        Aún no hay leads. Cuando hagas una prueba desde el chatbot, aparecerá aquí con sus datos y conversación.
      </div>
    );
  }

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

function ConversationPanel({ selectedLead }: { selectedLead?: Lead }) {
  const transcript = selectedLead?.notes?.trim();

  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center border border-[#d8b86f]/35 bg-[#d8b86f]/10 text-[#f3d99a]">
          <MessageCircle size={16} />
        </span>
        <div>
          <p className="font-semibold">Transcripción</p>
          <p className="mt-1 text-xs text-white/38">Lo que el visitante habló antes de dejar sus datos.</p>
        </div>
      </div>
      <pre className="mt-4 max-h-[420px] overflow-y-auto whitespace-pre-wrap border border-white/10 bg-[#06111f] p-4 text-sm leading-7 text-white/66">
        {transcript || "Sin transcripción todavía."}
      </pre>
    </div>
  );
}

type Tab = "leads" | "content";
type ContentEditorTab = "terrenos" | "proyectos";

const contentEditorTabs: Array<{
  id: ContentEditorTab;
  label: string;
  description: string;
  sectionIds: string[];
}> = [
  {
    id: "terrenos",
    label: "#inicio",
    description: "Home principal, terrenos, misión, visión, valores y contacto.",
    sectionIds: [
      "proyecto",
      "terrenos-200m2",
      "calle-principal",
      "terrenos-patrimoniales",
      "claridad-documental",
      "mision",
      "vision",
      "valores",
      "ubicacion-contacto",
    ],
  },
  {
    id: "proyectos",
    label: "Terrenos",
    description: "Landing /proyectos y subpáginas de cada terreno o locación.",
    sectionIds: ["otros-proyectos-intro", "proyecto"],
  },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
}

function supportsTechnicalDetails(sectionId: string) {
  return (
    sectionId === "proyecto" ||
    sectionId === "terrenos-200m2" ||
    sectionId === "calle-principal" ||
    sectionId === "terrenos-patrimoniales" ||
    sectionId === "claridad-documental" ||
    sectionId.startsWith("terreno-")
  );
}

function LeadsView({
  leads,
  selectedLeadId,
  onSelectLead,
}: {
  leads: Lead[];
  selectedLeadId: string;
  onSelectLead: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | LeadTemperature>("all");
  const [query, setQuery] = useState("");

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesFilter = filter === "all" || lead.temperature === filter;
      const searchable = `${lead.name} ${lead.phone} ${lead.interest} ${lead.source}`.toLowerCase();
      return matchesFilter && searchable.includes(query.toLowerCase());
    });
  }, [filter, query, leads]);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? leads[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(360px,420px)_1fr]">
      <div className="space-y-6 xl:order-first">
        <LeadDetailPanel selectedLead={selectedLead} />
        <ConversationPanel selectedLead={selectedLead} />
      </div>

      {/* Leads Table */}
      <div className="border border-white/10 bg-white/[0.025]">
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold">Todos los leads</p>
            <p className="mt-1 text-sm text-white/42">{filteredLeads.length} resultados</p>
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
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-white/38">
              <tr>
                <th className="px-4 py-4 font-medium">Lead</th>
                <th className="px-4 py-4 font-medium">Interés</th>
                <th className="px-4 py-4 font-medium">Estado</th>
                <th className="px-4 py-4 font-medium">Etapa</th>
                <th className="px-4 py-4 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-white/42">
                    No hay leads todavía. Haz una prueba desde el chatbot y aparecerá aquí.
                  </td>
                </tr>
              )}
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className={`cursor-pointer border-b border-white/10 transition hover:bg-white/[0.035] ${
                    selectedLead?.id === lead.id ? "bg-white/[0.055]" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{lead.name}</p>
                    <p className="mt-1 text-xs text-white/42">{lead.phone}</p>
                  </td>
                  <td className="px-4 py-4 text-white/65">{lead.interest}</td>
                  <td className="px-4 py-4">
                    <TemperatureBadge value={lead.temperature} />
                  </td>
                  <td className="px-4 py-4 text-white/65">{lead.stage}</td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-[#f3d99a]">{lead.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ContentEditorView() {
  const [sections, setSections] = useState<EditableSection[]>(editableContentDefaults);
  const [activeEditorTab, setActiveEditorTab] = useState<ContentEditorTab>("terrenos");
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSectionId, setUploadingSectionId] = useState("");
  const [error, setError] = useState("");
  const [deletedSectionIds, setDeletedSectionIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/content", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { sections?: EditableSection[] }) => {
        if (!isMounted) return;
        setSections(mergeEditableSections(data.sections ?? []));
      })
      .catch(() => {
        if (!isMounted) return;
        setError("No pude cargar contenido desde Supabase. Mostrando contenido base.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSection = (id: string, key: keyof EditableSection, value: string) => {
    setSections((current) =>
      current.map((section) =>
        section.id === id
          ? key === "pageCopy"
            ? withVisiblePageCopy(section, value)
            : { ...section, [key]: value }
          : section,
      ),
    );
    setSaved(false);
  };

  const updateSectionDetail = (sectionId: string, detailId: string, key: "label" | "value", value: string) => {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) return section;

        const nextDetails = getSectionDetails(section).map((detail) =>
          detail.id === detailId ? { ...detail, [key]: value } : detail,
        );

        return withSectionDetails(section, nextDetails);
      }),
    );
    setSaved(false);
  };

  const saveContent = async () => {
    setIsSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections, deletedSectionIds }),
      });

      if (!response.ok) throw new Error("Save failed");
      const data = (await response.json()) as { sections?: EditableSection[]; stored?: boolean };
      setSections(mergeEditableSections(data.sections ?? sections));
      setDeletedSectionIds([]);
      setSaved(true);

      if (!data.stored) {
        setError("Supabase no está configurado todavía; no se pudo publicar de forma persistente.");
      }
    } catch {
      setError("No pude guardar en Supabase. Revisa tabla content_sections y permisos.");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async (sectionId: string, file?: File) => {
    if (!file) return;

    setUploadingSectionId(sectionId);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sectionId", sectionId);

      const response = await fetch("/api/content/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = (await response.json()) as { imageUrl?: string };
      if (!data.imageUrl) throw new Error("Missing image url");
      updateSection(sectionId, "image", data.imageUrl);
    } catch {
      setError("No pude subir la imagen. Revisa que el bucket cbr-content exista en Supabase.");
    } finally {
      setUploadingSectionId("");
    }
  };

  const uploadMedia = async (sectionId: string, file?: File) => {
    if (!file) return;

    setUploadingSectionId(`${sectionId}-gallery`);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sectionId", `${sectionId}-gallery`);

      const response = await fetch("/api/content/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = (await response.json()) as { url?: string; type?: EditableMedia["type"] };
      if (!data.url || !data.type) throw new Error("Missing media url");
      const newMedia: EditableMedia = {
        id: `${sectionId}-${Date.now()}`,
        url: data.url,
        type: data.type,
      };

      setSections((current) =>
        current.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                media: [
                  ...(section.media ?? []),
                  newMedia,
                ],
              }
            : section,
        ),
      );
      setSaved(false);
    } catch {
      setError("No pude subir el archivo. Revisa el bucket cbr-content o el tamaño del video.");
    } finally {
      setUploadingSectionId("");
    }
  };

  const removeMedia = (sectionId: string, mediaId: string) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              media: (section.media ?? []).filter((item) => item.id !== mediaId),
            }
          : section,
      ),
    );
    setSaved(false);
  };

  const addLandSection = () => {
    const baseTitle = "Nuevo terreno";
    const existingLandCount = sections.filter((section) => section.id.startsWith("terreno-")).length + 1;
    const slug = slugify(`${baseTitle}-${existingLandCount}`);
    const id = `terreno-${slug}`;

    setSections((current) => [
      ...current,
      {
        id,
        title: `${baseTitle} ${existingLandCount}`,
        copy: "Describe aquí la ubicación, precio y oportunidad principal de este terreno.",
        pageCopy:
          "Agrega aquí la información completa del terreno: ubicación, medidas, precio, condiciones de pago, documentación disponible, planos, referencias, fotos y próximos pasos para agendar visita.",
        image: "",
        media: [],
        link: `/secciones/${slug}`,
      },
    ]);
    setActiveEditorTab("proyectos");
    setDeletedSectionIds((current) => current.filter((sectionId) => sectionId !== id));
    setSaved(false);
  };

  const removeCustomSection = (sectionId: string) => {
    setSections((current) => current.filter((section) => section.id !== sectionId));
    setDeletedSectionIds((current) => [...new Set([...current, sectionId])]);
    setSaved(false);
  };

  const activeEditorConfig = contentEditorTabs.find((tab) => tab.id === activeEditorTab) ?? contentEditorTabs[0];
  const visibleSections = sections.filter(
    (section) =>
      activeEditorConfig.sectionIds.includes(section.id) ||
      (activeEditorTab === "proyectos" && section.id.startsWith("terreno-")),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border border-white/10 bg-white/[0.025] p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">Editor de frontend</p>
          <p className="mt-1 text-sm text-white/42">
            Edita textos, enlaces, fotos y subpáginas. El hero queda bloqueado para proteger la primera impresión.
          </p>
        </div>
        <button
          onClick={saveContent}
          disabled={isSaving || isLoading}
          className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#d8b86f] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#07111f]"
        >
          <SquarePen size={16} />
          {isSaving ? "Guardando..." : "Guardar y publicar"}
        </button>
        {activeEditorTab === "proyectos" && (
          <button
            type="button"
            onClick={addLandSection}
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#d8b86f]/35 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f3d99a] transition hover:bg-[#d8b86f] hover:text-[#07111f]"
          >
            <CirclePlus size={16} />
            Agregar terreno
          </button>
        )}
      </div>

      {saved && (
        <div className="border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-100">
          Cambios guardados en Supabase. El sitio público los leerá automáticamente.
        </div>
      )}
      {error && (
        <div className="border border-rose-300/25 bg-rose-300/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="border border-white/10 bg-white/[0.025] p-3">
        <div className="grid gap-2 md:grid-cols-3">
          {contentEditorTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveEditorTab(tab.id)}
              className={`min-h-16 border p-3 text-left transition ${
                activeEditorTab === tab.id
                  ? "border-[#d8b86f]/60 bg-[#d8b86f]/12 text-[#f3d99a]"
                  : "border-white/10 bg-[#06111f] text-white/62 hover:border-[#d8b86f]/35 hover:text-white"
              }`}
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className="mt-1 block text-xs leading-5 text-white/42">{tab.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5">
        {visibleSections.map((section) => (
          <article key={section.id} className="grid gap-5 border border-white/10 bg-white/[0.025] p-5 lg:grid-cols-[220px_1fr]">
            <div className="flex min-h-36 items-center justify-center overflow-hidden border border-white/10 bg-[#06111f]">
              {section.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={section.image} alt={section.title} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="text-white/30" size={34} />
              )}
            </div>
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border border-[#d8b86f]/35 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#f3d99a] transition hover:bg-[#d8b86f] hover:text-[#07111f]">
                  <ImageIcon size={15} />
                  {uploadingSectionId === section.id ? "Subiendo..." : "Cambiar foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={Boolean(uploadingSectionId)}
                    onChange={(event) => uploadImage(section.id, event.target.files?.[0])}
                  />
                </label>
                <span className="text-xs text-white/35">JPG, PNG o WebP. Se publica al guardar.</span>
                {(section.id.startsWith("terreno-") || section.id.startsWith("casa-")) && (
                  <button
                    type="button"
                    onClick={() => removeCustomSection(section.id)}
                    className="ml-auto inline-flex min-h-10 items-center justify-center gap-2 border border-rose-300/25 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-rose-100 transition hover:bg-rose-300/10"
                  >
                    <Trash2 size={15} />
                    {section.id.startsWith("casa-") ? "Borrar casa" : "Borrar terreno"}
                  </button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-white/58">
                  Título
                  <input
                    value={section.title}
                    onChange={(event) => updateSection(section.id, "title", event.target.value)}
                    className="min-h-11 border border-white/10 bg-[#06111f] px-3 text-white outline-none focus:border-[#d8b86f]"
                  />
                </label>
                <label className="grid gap-2 text-sm text-white/58">
                  Link de subpágina
                  <input
                    value={section.link}
                    onChange={(event) => updateSection(section.id, "link", event.target.value)}
                    className="min-h-11 border border-white/10 bg-[#06111f] px-3 text-white outline-none focus:border-[#d8b86f]"
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm text-white/58">
                Texto corto en la página principal
                <textarea
                  value={section.copy}
                  onChange={(event) => updateSection(section.id, "copy", event.target.value)}
                  className="min-h-28 resize-none border border-white/10 bg-[#06111f] px-3 py-3 text-white outline-none focus:border-[#d8b86f]"
                />
              </label>
              <label className="grid gap-2 text-sm text-white/58">
                Texto amplio de subpágina
                <textarea
                  value={getVisiblePageCopy(section)}
                  onChange={(event) => updateSection(section.id, "pageCopy", event.target.value)}
                  className="min-h-40 resize-none border border-white/10 bg-[#06111f] px-3 py-3 text-white outline-none focus:border-[#d8b86f]"
                />
              </label>
              {supportsTechnicalDetails(section.id) && (
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-sm font-medium text-white">Ficha técnica de subpágina</p>
                    <p className="mt-1 text-xs text-white/38">Estos datos aparecen en los cuadros de precio, ubicación, superficie y visita.</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {getSectionDetails(section).map((detail) => (
                      <div key={detail.id} className="grid gap-2 border border-white/10 bg-[#06111f] p-3">
                        <input
                          value={detail.label}
                          onChange={(event) => updateSectionDetail(section.id, detail.id, "label", event.target.value)}
                          className="min-h-9 border border-white/10 bg-[#030a16] px-3 text-sm text-[#f3d99a] outline-none focus:border-[#d8b86f]"
                          placeholder="Etiqueta"
                        />
                        <input
                          value={detail.value}
                          onChange={(event) => updateSectionDetail(section.id, detail.id, "value", event.target.value)}
                          className="min-h-10 border border-white/10 bg-[#030a16] px-3 text-white outline-none focus:border-[#d8b86f]"
                          placeholder="Valor"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">Carrusel de subpágina</p>
                    <p className="mt-1 text-xs text-white/38">Agrega tantas fotos o videos como necesites.</p>
                  </div>
                  <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 bg-[#d8b86f] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#07111f]">
                    <CirclePlus size={15} />
                    {uploadingSectionId === `${section.id}-gallery` ? "Subiendo..." : "Agregar foto/video"}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      disabled={Boolean(uploadingSectionId)}
                      onChange={(event) => uploadMedia(section.id, event.target.files?.[0])}
                    />
                  </label>
                </div>
                {(section.media ?? []).length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {(section.media ?? []).map((item) => (
                      <div key={item.id} className="overflow-hidden border border-white/10 bg-[#06111f]">
                        <div className="aspect-video bg-black">
                          {item.type === "video" ? (
                            <video src={item.url} className="h-full w-full object-cover" controls muted />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.url} alt={section.title} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedia(section.id, item.id)}
                          className="flex min-h-9 w-full items-center justify-center gap-2 text-xs text-rose-100 transition hover:bg-rose-300/10"
                        >
                          <Trash2 size={14} />
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-white/15 p-4 text-sm text-white/38">
                    Aún no hay fotos o videos extra.
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "authenticated");
      onSuccess();
      return;
    }

    setError("Correo o contraseña incorrectos.");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#030a16] px-6 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/35">
        <span className="grid size-12 place-items-center border border-[#d8b86f]/40 bg-[#d8b86f]/10 text-[#f3d99a]">
          <KeyRound size={22} />
        </span>
        <h1 className="mt-6 text-3xl font-semibold">Acceso administrativo</h1>
        <p className="mt-2 text-sm leading-6 text-white/52">
          Panel privado para editar contenido, revisar leads y preparar el sitio de CBR.
        </p>
        <div className="mt-7 grid gap-4">
          <label className="grid gap-2 text-sm text-white/58">
            Correo
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 border border-white/10 bg-[#06111f] px-3 text-white outline-none focus:border-[#d8b86f]"
              type="email"
              autoComplete="email"
              placeholder="carmen.castrejon@cbr.mx"
            />
          </label>
          <label className="grid gap-2 text-sm text-white/58">
            Contraseña
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 border border-white/10 bg-[#06111f] px-3 text-white outline-none focus:border-[#d8b86f]"
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
            />
          </label>
        </div>
        {error && <p className="mt-4 border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
        <button
          type="submit"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#d8b86f] px-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#07111f]"
        >
          Entrar al tablero
          <KeyRound size={16} />
        </button>
      </form>
    </main>
  );
}

function AdminShell({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("leads");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [capturedLeads, setCapturedLeads] = useState<StoredLead[]>(() => getAllLeads());

  const refreshLeads = useCallback(async () => {
    const remoteLeads = await fetchRemoteLeads();
    const localLeads = getAllLeads();
    const merged = [...remoteLeads, ...localLeads].filter(
      (lead, index, list) => list.findIndex((item) => item.id === lead.id) === index,
    );
    setCapturedLeads(merged);
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchRemoteLeads().then((remoteLeads) => {
      if (!isMounted) return;
      const localLeads = getAllLeads();
      const merged = [...remoteLeads, ...localLeads].filter(
        (lead, index, list) => list.findIndex((item) => item.id === lead.id) === index,
      );
      setCapturedLeads(merged);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const allLeads = useMemo(() => {
    return capturedLeads;
  }, [capturedLeads]);

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "leads", label: "Leads", icon: UsersRound },
    { id: "content", label: "Contenido", icon: SquarePen },
  ];

  return (
    <main className="min-h-screen bg-[#030a16] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030a16]/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center border border-[#d8b86f]/40 bg-[#d8b86f]/10 text-[#f3d99a]">
              <LayoutDashboard size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold">Patrimonio OS</p>
              <p className="text-xs text-white/45">Workspace CBR</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {allLeads.length > 0 && (
              <span className="hidden text-sm text-white/50 md:inline">
                {allLeads.length} lead{allLeads.length === 1 ? "" : "s"}
              </span>
            )}
            <button
              onClick={refreshLeads}
              className="grid size-10 place-items-center border border-white/10 bg-white/[0.045] text-white/68 transition hover:border-[#d8b86f]/55 hover:text-[#f3d99a]"
              title="Actualizar leads"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={onLogout}
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-white/10 bg-white/[0.045] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/68 transition hover:border-rose-300/55 hover:text-rose-200"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 bg-[#030a16]/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] gap-1 px-5 lg:px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm transition ${
                activeTab === tab.id
                  ? "border-[#d8b86f] text-[#f3d99a]"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1600px] p-5 lg:p-8">
        {activeTab === "leads" && (
          <LeadsView leads={allLeads} selectedLeadId={selectedLeadId} onSelectLead={setSelectedLeadId} />
        )}
        {activeTab === "content" && <ContentEditorView />}
      </div>
    </main>
  );
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  useEffect(() => {
    const checkSession = window.setTimeout(() => {
      setIsAuthenticated(sessionStorage.getItem(ADMIN_SESSION_KEY) === "authenticated");
      setHasCheckedSession(true);
    }, 0);

    return () => window.clearTimeout(checkSession);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  if (!hasCheckedSession) {
    return <main className="min-h-screen bg-[#030a16]" />;
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <AdminShell onLogout={handleLogout} />;
}

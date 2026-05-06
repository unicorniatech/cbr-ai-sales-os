"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, MapPin, MessageCircle } from "lucide-react";
import { activeTenant, formatCurrency } from "@/app/config/tenants";
import {
  editableContentDefaults,
  getEditableSectionMap,
  type EditableSection,
} from "@/app/lib/editable-content";

const project = activeTenant.project;
const defaultContentMap = getEditableSectionMap(editableContentDefaults);

const slugToSectionId: Record<string, string> = {
  "cumbres-de-bendicion": "proyecto",
  mision: "mision",
  vision: "vision",
  "lotes-200m2": "terrenos-200m2",
  "calle-principal": "calle-principal",
  "terrenos-patrimoniales": "terrenos-patrimoniales",
  "claridad-documental": "claridad-documental",
};

const defaultPoints: Record<string, string[]> = {
  "cumbres-de-bendicion": [
    `${project.lots} por lote`,
    `Medidas de ${project.dimensions}`,
    `Enganche de ${formatCurrency(project.downPayment)}`,
    `Mensualidades de ${formatCurrency(project.monthlyPayment)}`,
    `Precio estándar de ${formatCurrency(project.standardPrice)}`,
    `Precio sobre calle principal de ${formatCurrency(project.mainStreetPrice)}`,
  ],
  mision: ["Servicio profesional", "Proceso transparente", "Eficiencia operativa", "Seguridad jurídica y financiera"],
  vision: ["Liderazgo regional", "Calidad de desarrollos", "Seriedad en operaciones", "Valor y plusvalía"],
  "lotes-200m2": ["200 m2", "10x20 m", "Limpios", "Delimitados"],
  "calle-principal": [`Precio ${formatCurrency(project.mainStreetPrice)}`, "Ubicación destacada", "Enganche definido", "Mensualidad clara"],
  "terrenos-patrimoniales": ["Trato directo", "Claridad documental", "Proyecto local", "Acompañamiento profesional"],
  "claridad-documental": activeTenant.trustItems,
};

export function SectionClientPage({ slug }: { slug: string }) {
  const [contentMap, setContentMap] = useState(defaultContentMap);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const sectionId = slugToSectionId[slug] ?? "proyecto";
  const content = contentMap[sectionId] ?? contentMap.proyecto;
  const media = content.media?.length
    ? content.media
    : content.image
      ? [{ id: `${content.id}-image`, url: content.image, type: "image" as const }]
      : [];
  const activeMedia = media[activeMediaIndex] ?? media[0];
  const points = useMemo(() => defaultPoints[slug] ?? defaultPoints["cumbres-de-bendicion"], [slug]);

  const goToPrevious = () => {
    setActiveMediaIndex((current) => (current === 0 ? media.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveMediaIndex((current) => (current + 1) % media.length);
  };

  useEffect(() => {
    let isMounted = true;

    fetch("/api/content", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { sections?: EditableSection[] }) => {
        if (!isMounted) return;
        setContentMap(getEditableSectionMap(data.sections ?? editableContentDefaults));
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const resetIndex = window.setTimeout(() => setActiveMediaIndex(0), 0);
    return () => window.clearTimeout(resetIndex);
  }, [sectionId]);

  return (
    <main className="min-h-screen bg-[#030a16] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/58 transition hover:text-[#f3d99a]">
          <ArrowLeft size={16} />
          Volver al sitio
        </Link>
        <div className="mt-16 border-y border-white/10 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">Información</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-tight sm:text-7xl">{content.title}</h1>
          <p className="mt-8 text-lg leading-8 text-white/68">{content.copy}</p>
        </div>
        {activeMedia && (
          <div className="mt-10">
            <div className="relative h-[360px] overflow-hidden border border-white/10 bg-black sm:h-[520px]">
              {activeMedia.type === "video" ? (
                <video src={activeMedia.url} className="h-full w-full object-contain" controls playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeMedia.url} alt={content.title} className="h-full w-full object-cover" />
              )}
              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center border border-white/15 bg-[#030a16]/75 text-white backdrop-blur transition hover:text-[#f3d99a]"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center border border-white/15 bg-[#030a16]/75 text-white backdrop-blur transition hover:text-[#f3d99a]"
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>
            {media.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMediaIndex(index)}
                    className={`h-20 w-28 shrink-0 overflow-hidden border transition ${
                      activeMediaIndex === index ? "border-[#d8b86f]" : "border-white/10"
                    }`}
                    aria-label={`Ver archivo ${index + 1}`}
                  >
                    {item.type === "video" ? (
                      <video src={item.url} className="h-full w-full object-cover" muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {points.map((point) => (
            <div key={point} className="flex gap-4 border border-white/10 bg-white/[0.035] p-5">
              <CheckCircle2 className="mt-1 shrink-0 text-[#d8b86f]" size={20} />
              <p className="text-white/72">{point}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-5 border border-white/10 bg-[#071321] p-6 sm:grid-cols-2">
          <p className="flex gap-3 text-white/68">
            <MapPin className="shrink-0 text-[#d8b86f]" size={20} />
            {activeTenant.contact.address}
          </p>
          <a
            href={activeTenant.contact.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-[#d8b86f] px-5 py-3 text-sm font-semibold text-[#07111f]"
          >
            WhatsApp {activeTenant.contact.whatsapp}
            <MessageCircle size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}

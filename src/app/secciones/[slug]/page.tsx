import Link from "next/link";
import { ArrowLeft, CheckCircle2, MapPin, MessageCircle } from "lucide-react";
import { activeTenant, formatCurrency } from "@/app/config/tenants";

const project = activeTenant.project;

const sectionContent = {
  "cumbres-de-bendicion": {
    eyebrow: "Proyecto destacado",
    title: "Cumbres de Bendición",
    copy:
      "Proyecto de terrenos en Ampliación Lázaro Cárdenas, Jojutla, Morelos. Lotes de 200 m2, totalmente limpios y delimitados, con enganche accesible y mensualidades claras.",
    points: [
      `${project.lots} por lote`,
      `Medidas de ${project.dimensions}`,
      `Enganche de ${formatCurrency(project.downPayment)}`,
      `Mensualidades de ${formatCurrency(project.monthlyPayment)}`,
      `Precio estándar de ${formatCurrency(project.standardPrice)}`,
      `Precio sobre calle principal de ${formatCurrency(project.mainStreetPrice)}`,
    ],
  },
  mision: {
    eyebrow: "Identidad",
    title: "Misión",
    copy: activeTenant.mission,
    points: ["Servicio profesional", "Proceso transparente", "Eficiencia operativa", "Seguridad jurídica y financiera"],
  },
  vision: {
    eyebrow: "Identidad",
    title: "Visión",
    copy: activeTenant.vision,
    points: ["Liderazgo regional", "Calidad de desarrollos", "Seriedad en operaciones", "Valor y plusvalía"],
  },
  "lotes-200m2": {
    eyebrow: "Terrenos",
    title: "Lotes de 200 m2",
    copy:
      "Terrenos de 10x20 m pensados para compradores que buscan iniciar patrimonio con medidas claras, delimitación visible y precio definido.",
    points: ["200 m2", "10x20 m", "Limpios", "Delimitados"],
  },
  "calle-principal": {
    eyebrow: "Terrenos",
    title: "Lotes sobre calle principal",
    copy:
      "Los lotes sobre calle principal tienen mayor exposición dentro del proyecto y precio de $95,000 MXN, manteniendo el mismo esquema de enganche y mensualidades.",
    points: [`Precio ${formatCurrency(project.mainStreetPrice)}`, "Ubicación destacada", "Enganche definido", "Mensualidad clara"],
  },
  "terrenos-patrimoniales": {
    eyebrow: "Patrimonio",
    title: "Terrenos patrimoniales",
    copy:
      "Una opción para familias que desean convertir su esfuerzo en tierra propia, con acompañamiento directo y documentación disponible para revisión.",
    points: ["Trato directo", "Claridad documental", "Proyecto local", "Acompañamiento profesional"],
  },
  "claridad-documental": {
    eyebrow: "Confianza",
    title: "Claridad documental",
    copy:
      "La operación se basa en legalidad, revisión documental y comunicación directa para que cada cliente entienda el proceso antes de avanzar.",
    points: activeTenant.trustItems,
  },
};

export function generateStaticParams() {
  return Object.keys(sectionContent).map((slug) => ({ slug }));
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = sectionContent[slug as keyof typeof sectionContent] ?? sectionContent["cumbres-de-bendicion"];

  return (
    <main className="min-h-screen bg-[#030a16] text-white">
      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/58 transition hover:text-[#f3d99a]">
          <ArrowLeft size={16} />
          Volver al sitio
        </Link>
        <div className="mt-16 border-y border-white/10 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b86f]">{content.eyebrow}</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-tight sm:text-7xl">{content.title}</h1>
          <p className="mt-8 text-lg leading-8 text-white/68">{content.copy}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {content.points.map((point) => (
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

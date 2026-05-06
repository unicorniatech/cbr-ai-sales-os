import { activeTenant } from "../config/tenants";

export type EditableSection = {
  id: string;
  title: string;
  copy: string;
  pageCopy: string;
  image: string;
  media: EditableMedia[];
  link: string;
};

export type EditableMedia = {
  id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
};

export const editableContentDefaults: EditableSection[] = [
  {
    id: "proyecto",
    title: activeTenant.project.name,
    copy: activeTenant.subtitle,
    pageCopy:
      "Cumbres de Bendición es el proyecto destacado de Grupo Inmobiliario Castrejón Rodríguez en Ampliación Lázaro Cárdenas, Jojutla, Morelos. Los lotes son de 200 m2, con medidas de 10x20 m, totalmente limpios y delimitados. El esquema de venta permite iniciar con enganche de $10,000 MXN y mensualidades de $2,000 MXN, con precio estándar de $85,000 MXN y opción sobre calle principal de $95,000 MXN.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82",
    media: [
      {
        id: "proyecto-main",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82",
        type: "image",
      },
    ],
    link: "/secciones/cumbres-de-bendicion",
  },
  {
    id: "terrenos-200m2",
    title: "Lotes de 200 m2",
    copy: "Terrenos de 10x20 m, totalmente limpios y delimitados para iniciar patrimonio con claridad.",
    pageCopy:
      "Cada lote cuenta con 200 m2 de superficie y medidas de 10x20 m. Son terrenos limpios y delimitados, pensados para compradores que buscan una adquisición clara, ordenada y con acompañamiento directo durante el proceso.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    media: [
      {
        id: "lotes-main",
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
        type: "image",
      },
    ],
    link: "/secciones/lotes-200m2",
  },
  {
    id: "calle-principal",
    title: "Lotes sobre calle principal",
    copy: "Ubicaciones con mayor exposición dentro del proyecto, con precio definido de $95,000 MXN.",
    pageCopy:
      "Los lotes sobre calle principal ofrecen una ubicación destacada dentro del proyecto. Mantienen el esquema de enganche y mensualidades, con precio definido de $95,000 MXN para quienes buscan mayor exposición y acceso dentro del desarrollo.",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
    media: [
      {
        id: "calle-main",
        url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
        type: "image",
      },
    ],
    link: "/secciones/calle-principal",
  },
  {
    id: "terrenos-patrimoniales",
    title: "Terrenos patrimoniales",
    copy: "Oportunidades en Jojutla para familias que buscan invertir con trato directo y documentación revisable.",
    pageCopy:
      "Comprar tierra es una decisión patrimonial. Grupo Inmobiliario Castrejón Rodríguez acompaña a familias que desean convertir su esfuerzo en un terreno propio, con información clara, trato directo y documentación disponible para revisión.",
    image: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
    media: [
      {
        id: "patrimonio-main",
        url: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
        type: "image",
      },
    ],
    link: "/secciones/terrenos-patrimoniales",
  },
  {
    id: "claridad-documental",
    title: "Claridad documental",
    copy: "Terrenos claros, medibles y listos para revisión con acompañamiento profesional durante el proceso.",
    pageCopy:
      "La operación se basa en legalidad, comunicación directa y revisión documental. La prioridad es que cada cliente conozca las condiciones, pagos, ubicación y documentación antes de tomar una decisión.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82",
    media: [
      {
        id: "documental-main",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82",
        type: "image",
      },
    ],
    link: "/secciones/claridad-documental",
  },
  {
    id: "mision",
    title: "Misión",
    copy: activeTenant.mission,
    pageCopy: activeTenant.mission,
    image: "",
    media: [],
    link: "/secciones/mision",
  },
  {
    id: "vision",
    title: "Visión",
    copy: activeTenant.vision,
    pageCopy: activeTenant.vision,
    image: "",
    media: [],
    link: "/secciones/vision",
  },
  {
    id: "valores",
    title: "Valores clave",
    copy: activeTenant.values.join(", "),
    pageCopy:
      "Nuestros valores clave son transparencia, seguridad jurídica, honestidad y compromiso con el patrimonio familiar. Estos principios guían la atención, la documentación y el acompañamiento en cada operación.",
    image: "",
    media: [],
    link: "/secciones/claridad-documental",
  },
  {
    id: "ubicacion-contacto",
    title: "Ubicación y contacto",
    copy: `${activeTenant.contact.address}. WhatsApp: ${activeTenant.contact.whatsapp}`,
    pageCopy:
      `Atendemos en ${activeTenant.contact.address}. También puedes escribirnos por WhatsApp al ${activeTenant.contact.whatsapp} para solicitar información del proyecto, precios, ubicación y documentación disponible.`,
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1300&q=80",
    media: [
      {
        id: "ubicacion-main",
        url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1300&q=80",
        type: "image",
      },
    ],
    link: "/#contacto",
  },
];

export function mergeEditableSections(sections: EditableSection[]) {
  return editableContentDefaults.map((defaultSection) => ({
    ...defaultSection,
    ...sections.find((section) => section.id === defaultSection.id),
    media:
      sections.find((section) => section.id === defaultSection.id)?.media ??
      defaultSection.media ??
      [],
  }));
}

export function getEditableSectionMap(sections: EditableSection[]) {
  return Object.fromEntries(mergeEditableSections(sections).map((section) => [section.id, section]));
}

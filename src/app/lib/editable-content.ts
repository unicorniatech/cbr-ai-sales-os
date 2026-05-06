import { activeTenant } from "../config/tenants";

export type EditableSection = {
  id: string;
  title: string;
  copy: string;
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
    image: "",
    media: [],
    link: "/secciones/mision",
  },
  {
    id: "vision",
    title: "Visión",
    copy: activeTenant.vision,
    image: "",
    media: [],
    link: "/secciones/vision",
  },
  {
    id: "valores",
    title: "Valores clave",
    copy: activeTenant.values.join(", "),
    image: "",
    media: [],
    link: "/secciones/claridad-documental",
  },
  {
    id: "ubicacion-contacto",
    title: "Ubicación y contacto",
    copy: `${activeTenant.contact.address}. WhatsApp: ${activeTenant.contact.whatsapp}`,
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

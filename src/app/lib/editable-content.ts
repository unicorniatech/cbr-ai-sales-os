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

export type EditableDetail = {
  id: string;
  label: string;
  value: string;
};

export type EditableMedia = {
  id: string;
  url: string;
  type: "image" | "video";
  caption?: string;
};

const DETAILS_MARKER_START = "<!--CBR_DETAILS:";
const DETAILS_MARKER_END = "-->";

const defaultDetailsBySectionId: Record<string, EditableDetail[]> = {
  proyecto: [
    { id: "location", label: "Ubicación", value: activeTenant.project.location },
    { id: "price", label: "Precio", value: `$${activeTenant.project.standardPrice.toLocaleString("es-MX")} MXN` },
    { id: "surface", label: "Superficie", value: `${activeTenant.project.lots} · ${activeTenant.project.dimensions}` },
    { id: "visit", label: "Visita", value: "Agenda por WhatsApp con trato directo." },
  ],
  "terrenos-200m2": [
    { id: "location", label: "Ubicación", value: activeTenant.project.location },
    { id: "price", label: "Precio", value: `$${activeTenant.project.standardPrice.toLocaleString("es-MX")} MXN` },
    { id: "surface", label: "Superficie", value: `${activeTenant.project.lots} · ${activeTenant.project.dimensions}` },
    { id: "visit", label: "Visita", value: "Información y recorrido disponibles con asesor." },
  ],
  "calle-principal": [
    { id: "location", label: "Ubicación", value: "Lotes sobre calle principal dentro del proyecto." },
    { id: "price", label: "Precio", value: `$${activeTenant.project.mainStreetPrice.toLocaleString("es-MX")} MXN` },
    { id: "surface", label: "Superficie", value: `${activeTenant.project.lots} · ${activeTenant.project.dimensions}` },
    { id: "visit", label: "Visita", value: "Agenda revisión de ubicación y documentación." },
  ],
};

const genericLandDetails: EditableDetail[] = [
  { id: "location", label: "Ubicación", value: "Por definir" },
  { id: "price", label: "Precio", value: "Por definir" },
  { id: "surface", label: "Superficie", value: "Por definir" },
  { id: "visit", label: "Visita / documentación", value: "Por definir" },
];

export function getVisiblePageCopy(section: EditableSection) {
  const markerIndex = section.pageCopy.indexOf(DETAILS_MARKER_START);
  return (markerIndex >= 0 ? section.pageCopy.slice(0, markerIndex) : section.pageCopy).trim();
}

export function getSectionDetails(section: EditableSection) {
  const markerIndex = section.pageCopy.indexOf(DETAILS_MARKER_START);

  if (markerIndex >= 0) {
    const detailsStart = markerIndex + DETAILS_MARKER_START.length;
    const detailsEnd = section.pageCopy.indexOf(DETAILS_MARKER_END, detailsStart);
    const encodedDetails = detailsEnd >= 0 ? section.pageCopy.slice(detailsStart, detailsEnd) : "";

    try {
      const parsed = JSON.parse(encodedDetails) as EditableDetail[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((detail, index) => ({
          id: detail.id || `detail-${index}`,
          label: detail.label || "Detalle",
          value: detail.value || "Por definir",
        }));
      }
    } catch {
      return defaultDetailsBySectionId[section.id] ?? (section.id.startsWith("terreno-") ? genericLandDetails : []);
    }
  }

  return defaultDetailsBySectionId[section.id] ?? (section.id.startsWith("terreno-") ? genericLandDetails : []);
}

export function withVisiblePageCopy(section: EditableSection, pageCopy: string) {
  const details = getSectionDetails(section);
  return withSectionDetails({ ...section, pageCopy }, details);
}

export function withSectionDetails(section: EditableSection, details: EditableDetail[]) {
  const visibleCopy = getVisiblePageCopy(section) || section.copy;
  return {
    ...section,
    pageCopy: `${visibleCopy}\n\n${DETAILS_MARKER_START}${JSON.stringify(details)}${DETAILS_MARKER_END}`,
  };
}

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
  {
    id: "casas-intro",
    title: "Casas en Morelos",
    copy:
      "Opciones habitacionales para familias que buscan comprar con claridad, trato directo y acompañamiento profesional.",
    pageCopy:
      "Esta línea presenta casas y oportunidades habitacionales atendidas por Grupo Inmobiliario Castrejón Rodríguez. Cada propiedad puede documentarse con fotografías, videos, descripción amplia, ubicación, condiciones de venta y datos de contacto para seguimiento.",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1500&q=82",
    media: [
      {
        id: "casas-intro-main",
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1500&q=82",
        type: "image",
      },
    ],
    link: "/casas",
  },
  {
    id: "casas-familiares",
    title: "Casas familiares",
    copy:
      "Espacios pensados para vivir, crecer y construir patrimonio familiar con una compra seria y acompañada.",
    pageCopy:
      "Las casas familiares se presentan con información clara para compradores que necesitan entender ubicación, distribución, precio, documentación y próximos pasos antes de decidir. El objetivo es dar una ruta simple para solicitar asesoría y revisar cada propiedad con calma.",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=82",
    media: [
      {
        id: "casas-familiares-main",
        url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=82",
        type: "image",
      },
    ],
    link: "/secciones/casas-familiares",
  },
  {
    id: "casas-descanso",
    title: "Casas de descanso",
    copy:
      "Propiedades para quienes buscan un lugar tranquilo en Morelos, con información directa y proceso ordenado.",
    pageCopy:
      "Las casas de descanso pueden mostrar fotografías, videos, características del entorno, amenidades, condiciones de visita y datos de contacto. Esta sección está preparada para que el cliente pueda editar el contenido desde el tablero conforme agregue inventario real.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=82",
    media: [
      {
        id: "casas-descanso-main",
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=82",
        type: "image",
      },
    ],
    link: "/secciones/casas-descanso",
  },
  {
    id: "casas-inversion",
    title: "Casas como inversión",
    copy:
      "Opciones para compradores que buscan plusvalía, renta o un activo residencial con revisión documental.",
    pageCopy:
      "Esta sección permite comunicar oportunidades residenciales con enfoque de inversión. La información puede incluir precio, condiciones, zona, potencial de uso, documentación y seguimiento con asesor humano.",
    image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1400&q=82",
    media: [
      {
        id: "casas-inversion-main",
        url: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1400&q=82",
        type: "image",
      },
    ],
    link: "/secciones/casas-inversion",
  },
  {
    id: "casas-proceso",
    title: "Proceso de compra",
    copy:
      "Revisión de información, documentación disponible, visita y acompañamiento hasta el siguiente paso.",
    pageCopy:
      "El proceso de compra de casas debe sentirse claro para el comprador: resolver dudas, revisar documentación disponible, programar visita, confirmar condiciones y avanzar con acompañamiento directo. Esta sección ayuda a explicar esa ruta de manera sencilla.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=82",
    media: [
      {
        id: "casas-proceso-main",
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=82",
        type: "image",
      },
    ],
    link: "/secciones/casas-proceso",
  },
  {
    id: "otros-proyectos-intro",
    title: "Terrenos",
    copy:
      "Explora desarrollos, locaciones y oportunidades de terrenos disponibles en Morelos.",
    pageCopy:
      "Cada terreno puede tener su propia página con ubicación, precio, planos, fotografías, videos y detalles importantes para revisar antes de agendar una visita.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1500&q=82",
    media: [
      {
        id: "otros-proyectos-main",
        url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1500&q=82",
        type: "image",
      },
    ],
    link: "/proyectos",
  },
];

export function mergeEditableSections(sections: EditableSection[]) {
  const mergedDefaults = editableContentDefaults.map((defaultSection) => ({
    ...defaultSection,
    ...sections.find((section) => section.id === defaultSection.id),
    media:
      sections.find((section) => section.id === defaultSection.id)?.media ??
      defaultSection.media ??
      [],
  }));
  const customSections = sections.filter(
    (section) => !editableContentDefaults.some((defaultSection) => defaultSection.id === section.id),
  );

  return [...mergedDefaults, ...customSections];
}

export function getEditableSectionMap(sections: EditableSection[]) {
  return Object.fromEntries(mergeEditableSections(sections).map((section) => [section.id, section]));
}

import {
  Landmark,
  Ruler,
  Trees,
  type LucideIcon,
} from "lucide-react";

export type TenantId = "cbr";

export type KnowledgeItem = {
  id: string;
  keywords: string[];
  answer: string;
};

export type ProjectConfig = {
  name: string;
  location: string;
  lots: string;
  dimensions: string;
  description: string;
  downPayment: number;
  monthlyPayment: number;
  standardPrice: number;
  mainStreetPrice: number;
};

export type PropertyTypeConfig = {
  title: string;
  copy: string;
  icon: LucideIcon;
  image: string;
};

export type TenantConfig = {
  id: TenantId;
  platformName: string;
  brand: string;
  slogan: string;
  logoUrl: string;
  ownerWhatsapp?: string;
  agent: {
    name: string;
    role: string;
    tone: string;
    greeting: string;
    fallback: string;
  };
  project: ProjectConfig;
  contact: {
    address: string;
    whatsapp: string;
    whatsappHref: string;
    whatsappNumber: string;
  };
  mission: string;
  vision: string;
  values: string[];
  subtitle: string;
  storySteps: string[];
  propertyTypes: PropertyTypeConfig[];
  trustItems: string[];
  knowledgeBase: KnowledgeItem[];
  quickActions: Array<{
    label: string;
    prompt: string;
  }>;
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);

const cbrProject: ProjectConfig = {
  name: "Cumbres de Bendición",
  location: "Ampliación Lázaro Cárdenas, Jojutla, Morelos",
  lots: "200 m2",
  dimensions: "10x20 m",
  description: "Terrenos limpios, delimitados y listos para iniciar patrimonio.",
  downPayment: 10000,
  monthlyPayment: 2000,
  standardPrice: 85000,
  mainStreetPrice: 95000,
};

export const tenants: Record<TenantId, TenantConfig> = {
  cbr: {
    id: "cbr",
    platformName: "Patrimonio OS",
    brand: "Grupo Inmobiliario Castrejón Rodríguez",
    slogan: "Tu inversión segura con la seriedad que nos distingue",
    logoUrl: "/brand/CBR-LOGO.webp",
    contact: {
      address: "Calle 20 de noviembre, colonia Lázaro Cárdenas, Jojutla, Morelos",
      whatsapp: "+52 1 777 266 2208",
      whatsappNumber: "5217772662208",
      whatsappHref: "https://wa.me/5217772662208",
    },
    mission:
      "Brindar soluciones integrales en el sector inmobiliario, facilitando la adquisición de terrenos mediante un servicio profesional, transparente y eficiente que garantice la seguridad jurídica y financiera de nuestros clientes.",
    vision:
      "Posicionarnos como la inmobiliaria líder en la región, reconocida por la calidad de nuestros desarrollos, la seriedad en nuestras operaciones y el compromiso de generar valor y plusvalía en cada proyecto.",
    values: ["Transparencia", "Seguridad Jurídica", "Honestidad", "Compromiso con el Patrimonio Familiar"],
    subtitle:
      "En Castrejón Bienes Raíces, entendemos que tu inversión es el fruto de tu esfuerzo. Por ello, garantizamos claridad absoluta en cada paso del proceso, con documentación disponible para revisión y un trato directo basado en la legalidad y la confianza. No solo vendemos tierra, aseguramos tu futuro.",
    agent: {
      name: "Asesor IA CBR",
      role: "Asesor inmobiliario digital",
      tone: "Serio, claro, cálido y orientado a calificar compradores reales.",
      greeting:
        "¡Hola! Soy tu asesor virtual de CBR. Puedo orientarte sobre precios, ubicación, medidas, documentación y planes de pago.",
      fallback:
        "Puedo ayudarte con precios, ubicación, medidas, claridad documental o tomar tus datos para que un asesor te contacte por WhatsApp.",
    },
    project: cbrProject,
    storySteps: [
      "Convierte tu terreno en tu futuro hogar",
      "Terrenos limpios y delimitados en Morelos",
      "Compra con claridad, documentación y trato directo",
      "Grupo Inmobiliario Castrejón Rodríguez",
    ],
    propertyTypes: [
      {
        title: "Lotes de 200 m2",
        copy: "Terrenos de 10x20 m, totalmente limpios y delimitados para iniciar patrimonio con claridad.",
        icon: Ruler,
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Lotes sobre calle principal",
        copy: "Ubicaciones con mayor exposición dentro del proyecto, con precio definido de $95,000 MXN.",
        icon: Landmark,
        image:
          "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Terrenos patrimoniales",
        copy: "Oportunidades en Jojutla para familias que buscan invertir con trato directo y documentación revisable.",
        icon: Trees,
        image:
          "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Proyecto delimitado",
        copy: "Terrenos claros, medibles y listos para revisión con acompañamiento profesional durante el proceso.",
        icon: Landmark,
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82",
      },
    ],
    trustItems: [
      "Información documental desde el primer contacto",
      "Terrenos delimitados y ubicaciones verificables",
      "Acompañamiento directo durante la decisión de compra",
      "Pagos claros, enganches definidos y seguimiento formal",
    ],
    knowledgeBase: [
      {
        id: "pricing",
        keywords: ["precio", "cuesta", "costo", "vale", "mensualidad", "enganche"],
        answer: `En ${cbrProject.name}, el precio estandar es ${formatCurrency(
          cbrProject.standardPrice,
        )}. El enganche inicial es ${formatCurrency(
          cbrProject.downPayment,
        )} y las mensualidades son de ${formatCurrency(
          cbrProject.monthlyPayment,
        )}. Los lotes sobre calle principal tienen precio de ${formatCurrency(
          cbrProject.mainStreetPrice,
        )}.`,
      },
      {
        id: "location",
        keywords: ["ubicacion", "ubicación", "donde", "jojutla", "morelos"],
        answer: `${cbrProject.name} esta en ${cbrProject.location}. Es una zona pensada para compradores que buscan terreno delimitado, precio claro y trato directo en Morelos.`,
      },
      {
        id: "lot-size",
        keywords: ["medida", "mide", "metros", "tamano", "tamaño", "lote"],
        answer: `Los lotes son de ${cbrProject.lots}, con medidas de ${cbrProject.dimensions}. Se entregan limpios y delimitados.`,
      },
      {
        id: "legal",
        keywords: ["documento", "legal", "papeles", "claridad", "contrato"],
        answer:
          "El enfoque comercial es comprar con claridad: información documental desde el primer contacto, terrenos delimitados, pagos claros y acompañamiento directo durante la decisión.",
      },
      {
        id: "handoff",
        keywords: ["asesor", "contacto", "whatsapp", "cita", "visita"],
        answer:
          "Puedo tomar tus datos aquí mismo para que un asesor te contacte. Usa la opción 'Dejar mis datos' y te muestro el formulario rápido.",
      },
    ],
    quickActions: [
      { label: "Precios", prompt: "Quiero saber precios, enganche y mensualidades." },
      { label: "Ubicación", prompt: "Donde esta ubicado Cumbres de Bendición?" },
      { label: "Documentación", prompt: "Que claridad documental ofrecen?" },
      { label: "Calcular plan", prompt: "Calcula mi plan de pagos." },
      { label: "Dejar mis datos", prompt: "Quiero dejar mis datos." },
    ],
  },
};

export const activeTenant = tenants.cbr;

import {
  Home as HomeIcon,
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
    agent: {
      name: "Asesor IA CBR",
      role: "Asesor inmobiliario digital",
      tone: "Serio, claro, cálido y orientado a calificar compradores reales.",
      greeting:
        "¡Hola! Soy tu asesor virtual de CBR. Puedo orientarte sobre precios, ubicación, medidas, documentación y planes de pago.",
      fallback:
        "Puedo ayudarte con precios, ubicación, medidas, claridad documental o tomar tus datos para que un asesor te contacte.",
    },
    project: cbrProject,
    storySteps: [
      "Convierte tu terreno en tu futuro hogar",
      "Terrenos, casas e inversiones en Morelos",
      "Compra con claridad, documentación y trato directo",
      "Grupo Inmobiliario Castrejón Rodríguez",
    ],
    propertyTypes: [
      {
        title: "Lotes residenciales",
        copy: "Superficies de 200 m2 para construir a tu ritmo, con pagos mensuales accesibles.",
        icon: Ruler,
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Casas en desarrollo",
        copy: "Opciones habitacionales para compradores que buscan avanzar con claridad y trato directo.",
        icon: HomeIcon,
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Terrenos patrimoniales",
        copy: "Ubicaciones con potencial en Morelos para familias, inversionistas y constructores.",
        icon: Trees,
        image:
          "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
      },
      {
        title: "Oportunidades de inversión",
        copy: "Activos inmobiliarios con información clara para decidir con confianza.",
        icon: Landmark,
        image:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
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
        id: "membership",
        keywords: ["membresia", "membresía", "tanda", "ahorro", "100", "cien", "mensual", "club"],
        answer:
          "La Membresía de Patrimonio OS no es para consumir contenido: es para crear patrimonio. Empiezas con aportaciones pequeñas, construyes disciplina, aprendes, desbloqueas oportunidades y avanzas hacia un terreno con guía local, mexicana y asistida por IA. La agencia paga la plataforma; el comprador usa la experiencia para comprometerse con su futuro.",
      },
      {
        id: "terrain-vision",
        keywords: ["enchula", "enchúlame", "foto", "imagen", "terreno", "visualizar", "diseno", "diseño"],
        answer:
          "Podemos ayudarte a imaginar el potencial del terreno con una visualización: más verde, más limpio, con casa económica, iluminación, parque o fachada. Es inspiración visual, no promesa de obra ni aval técnico.",
      },
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
      { label: "Membresía", prompt: "Explícame la Membresía de Patrimonio OS." },
      { label: "Precios", prompt: "Quiero saber precios, enganche y mensualidades." },
      { label: "Enchúlame", prompt: "Quiero enchular una foto de mi terreno." },
      { label: "Ubicación", prompt: "Donde esta ubicado Cumbres de Bendición?" },
      { label: "Documentación", prompt: "Que claridad documental ofrecen?" },
      { label: "Calcular plan", prompt: "Calcula mi plan de pagos." },
      { label: "Dejar mis datos", prompt: "Quiero dejar mis datos." },
    ],
  },
};

export const activeTenant = tenants.cbr;

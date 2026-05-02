"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Calculator,
  CheckCircle,
  FileText,
  MessageCircle,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { captureLead } from "../lib/lead-store";

type Role = "advisor" | "visitor";
type MessageKind = "text" | "lead-form" | "calculator";

type ChatMessage = {
  id: number;
  role: Role;
  text: string;
  kind?: MessageKind;
};

const projectFacts = {
  name: "Cumbres de Bendición",
  location: "Ampliación Lázaro Cárdenas, Jojutla, Morelos",
  lotSize: "200 m2",
  dimensions: "10x20 m",
  downPayment: 10000,
  monthlyPayment: 2000,
  standardPrice: 85000,
  mainStreetPrice: 95000,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);

const knowledgeBase = [
  {
    keywords: ["precio", "cuesta", "costo", "vale", "mensualidad", "enganche"],
    answer:
      `En ${projectFacts.name}, el precio estandar es ${formatCurrency(
        projectFacts.standardPrice,
      )}. El enganche inicial es ${formatCurrency(
        projectFacts.downPayment,
      )} y las mensualidades son de ${formatCurrency(projectFacts.monthlyPayment)}. Los lotes sobre calle principal tienen precio de ${formatCurrency(
        projectFacts.mainStreetPrice,
      )}.`,
  },
  {
    keywords: ["ubicacion", "ubicación", "donde", "jojutla", "morelos"],
    answer: `${projectFacts.name} esta en ${projectFacts.location}. Es una zona pensada para compradores que buscan terreno delimitado, precio claro y trato directo en Morelos.`,
  },
  {
    keywords: ["medida", "mide", "metros", "tamano", "tamaño", "lote"],
    answer: `Los lotes son de ${projectFacts.lotSize}, con medidas de ${projectFacts.dimensions}. Se entregan limpios y delimitados.`,
  },
  {
    keywords: ["documento", "legal", "papeles", "claridad", "contrato"],
    answer:
      "El enfoque comercial es comprar con claridad: informacion documental desde el primer contacto, terrenos delimitados, pagos claros y acompanamiento directo durante la decision.",
  },
  {
    keywords: ["asesor", "contacto", "whatsapp", "cita", "visita"],
    answer:
      "Puedo tomar tus datos aqui mismo para que un asesor te contacte. Usa la opcion 'Dejar mis datos' y te muestro el formulario rapido.",
  },
];

const quickActions = [
  { label: "Precios", prompt: "Quiero saber precios, enganche y mensualidades." },
  { label: "Ubicación", prompt: "Donde esta ubicado Cumbres de Bendición?" },
  { label: "Documentación", prompt: "Que claridad documental ofrecen?" },
  { label: "Calcular plan", prompt: "Calcula mi plan de pagos." },
  { label: "Dejar mis datos", prompt: "Quiero dejar mis datos." },
];

function getAdvisorReply(input: string, id: number): ChatMessage {
  const normalized = input.toLowerCase();

  if (["datos", "contacto", "whatsapp", "asesor", "cita"].some((word) => normalized.includes(word))) {
    return {
      id,
      role: "advisor",
      kind: "lead-form",
      text: "Claro. Dejame tus datos y el interes principal para preparar el seguimiento.",
    };
  }

  if (["calcula", "calcular", "plan", "pagos", "financiamiento"].some((word) => normalized.includes(word))) {
    return {
      id,
      role: "advisor",
      kind: "calculator",
      text: "Te dejo un calculo rapido con los datos iniciales del proyecto.",
    };
  }

  const match = knowledgeBase.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  );

  return {
    id,
    role: "advisor",
    text:
      match?.answer ??
      "Puedo ayudarte con precios, ubicacion, medidas, claridad documental o tomar tus datos para que un asesor te contacte.",
  };
}

function LeadCaptureMiniForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("Cumbres de Bendición");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    captureLead({
      name,
      phone,
      interest,
      source: "Asesor IA",
    });
    setSubmitted(true);
    setTimeout(onSuccess, 2000);
  };

  if (submitted) {
    return (
      <div className="mt-3 border border-[#d8b86f]/30 bg-[#d8b86f]/10 p-3 text-center">
        <CheckCircle className="mx-auto mb-2 size-6 text-[#d8b86f]" />
        <p className="text-sm text-white">¡Listo! Te contactaremos pronto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-3 border border-white/10 bg-[#06111f] p-3">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-h-10 border border-white/10 bg-[#030a16] px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#d8b86f]"
        placeholder="Nombre *"
      />
      <input
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="min-h-10 border border-white/10 bg-[#030a16] px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#d8b86f]"
        placeholder="WhatsApp *"
        type="tel"
      />
      <select
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
        className="min-h-10 border border-white/10 bg-[#030a16] px-3 text-sm text-white outline-none focus:border-[#d8b86f]"
      >
        <option>Cumbres de Bendición</option>
        <option>Terreno</option>
        <option>Casa</option>
        <option>Inversión</option>
      </select>
      <button
        type="submit"
        disabled={!name.trim() || !phone.trim()}
        className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#d8b86f] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#07111f] disabled:opacity-50"
      >
        Preparar seguimiento
        <ArrowRight size={14} />
      </button>
    </form>
  );
}

function PaymentCalculatorCard() {
  const remainingStandard = projectFacts.standardPrice - projectFacts.downPayment;
  const remainingMainStreet = projectFacts.mainStreetPrice - projectFacts.downPayment;
  const standardMonths = Math.ceil(remainingStandard / projectFacts.monthlyPayment);
  const mainStreetMonths = Math.ceil(remainingMainStreet / projectFacts.monthlyPayment);

  return (
    <div className="mt-3 space-y-3 border border-white/10 bg-[#06111f] p-3 text-sm">
      <div className="flex items-center gap-2 text-[#f3d99a]">
        <Calculator size={16} />
        <span className="font-medium">Plan estimado</span>
      </div>
      <div className="grid gap-2">
        <p>
          Lote estandar: {formatCurrency(projectFacts.downPayment)} de enganche y
          saldo aproximado de {formatCurrency(remainingStandard)}.
        </p>
        <p className="text-white/60">
          Con mensualidades de {formatCurrency(projectFacts.monthlyPayment)}, son
          aprox. {standardMonths} meses.
        </p>
        <p className="border-t border-white/10 pt-2 text-white/60">
          Calle principal: aprox. {mainStreetMonths} meses con el mismo enganche y
          mensualidad.
        </p>
      </div>
    </div>
  );
}

export function AdvisorChat() {
  const nextIdRef = useRef(2);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "advisor",
      text: "Hola, soy el asesor IA de CBR. Puedo orientarte sobre precios, ubicacion, medidas, documentacion y tomar tus datos.",
    },
  ]);

  const unreadLabel = useMemo(() => (isOpen ? "Cerrar asesor IA" : "Abrir asesor IA"), [isOpen]);

  const sendMessage = (value: string) => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      return;
    }

    const visitorId = nextIdRef.current;
    nextIdRef.current += 1;
    const advisorId = nextIdRef.current;
    nextIdRef.current += 1;

    const visitorMessage: ChatMessage = {
      id: visitorId,
      role: "visitor",
      text: cleanValue,
    };

    setMessages((current) => [
      ...current,
      visitorMessage,
      getAdvisorReply(cleanValue, advisorId),
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="mb-4 flex h-[min(680px,calc(100vh-120px))] w-[min(420px,calc(100vw-40px))] flex-col overflow-hidden border border-white/14 bg-[#030a16]/96 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center border border-[#d8b86f]/45 bg-[#d8b86f]/10 text-[#f3d99a]">
                <Bot size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Asesor IA CBR</p>
                <p className="text-xs text-white/48">KB local + funciones demo</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar asesor IA"
              onClick={() => setIsOpen(false)}
              className="grid size-9 place-items-center border border-white/10 text-white/70 transition hover:border-[#d8b86f]/60 hover:text-[#f3d99a]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "visitor" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "advisor" ? (
                  <span className="mt-1 grid size-7 shrink-0 place-items-center border border-[#d8b86f]/35 bg-[#d8b86f]/10 text-[#f3d99a]">
                    <Bot size={14} />
                  </span>
                ) : null}
                <div
                  className={`max-w-[82%] px-4 py-3 text-sm leading-6 ${
                    message.role === "visitor"
                      ? "bg-[#d8b86f] text-[#07111f]"
                      : "border border-white/10 bg-white/[0.055] text-white/78"
                  }`}
                >
                  <p>{message.text}</p>
                  {message.kind === "lead-form" ? (
                    <LeadCaptureMiniForm onSuccess={() => {
                      sendMessage("Listo, mis datos están guardados.");
                    }} />
                  ) : null}
                  {message.kind === "calculator" ? <PaymentCalculatorCard /> : null}
                </div>
                {message.role === "visitor" ? (
                  <span className="mt-1 grid size-7 shrink-0 place-items-center border border-white/10 bg-white/[0.06] text-white/70">
                    <UserRound size={14} />
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => sendMessage(action.prompt)}
                  className="shrink-0 border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/70 transition hover:border-[#d8b86f]/60 hover:text-[#f3d99a]"
                >
                  {action.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage(input);
                  }
                }}
                className="min-h-11 flex-1 border border-white/10 bg-[#06111f] px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#d8b86f]"
                placeholder="Pregunta sobre el proyecto..."
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                className="grid size-11 place-items-center bg-[#d8b86f] text-[#07111f] transition hover:bg-[#f3d99a]"
                aria-label="Enviar mensaje"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}

      <button
        type="button"
        aria-label={unreadLabel}
        onClick={() => setIsOpen((current) => !current)}
        className="group flex min-h-14 items-center gap-3 bg-[#d8b86f] px-5 text-sm font-semibold uppercase tracking-[0.16em] text-[#07111f] shadow-2xl shadow-black/35 transition hover:bg-[#f3d99a]"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        <span className="hidden sm:inline">Asesor IA</span>
      </button>

      {!isOpen ? (
        <div className="pointer-events-none absolute bottom-16 right-0 hidden w-72 border border-white/10 bg-[#030a16]/92 p-3 text-xs leading-5 text-white/62 shadow-xl shadow-black/30 backdrop-blur md:block">
          <div className="mb-2 flex items-center gap-2 text-[#f3d99a]">
            <FileText size={14} />
            <span>Pregunta por precios, ubicacion o documentos.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

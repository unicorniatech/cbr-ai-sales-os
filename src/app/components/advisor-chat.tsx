"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Calculator,
  CheckCircle,
  ChevronDown,
  ImagePlus,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { captureLead } from "../lib/lead-store";
import { activeTenant, formatCurrency } from "../config/tenants";

type Role = "advisor" | "visitor";
type MessageKind = "text" | "lead-form" | "calculator" | "membership" | "terrain-vision";
type AgentApiAction = "none" | "lead_form" | "calculator" | "membership_offer" | "terrain_vision" | "whatsapp_handoff";
type AgentApiResponse = {
  reply: string;
  action: AgentApiAction;
  leadTemperature: "hot" | "warm" | "cold";
  leadScore: number;
  shouldCaptureLead: boolean;
  nextStep: string;
  configured?: boolean;
};

type ChatMessage = {
  id: number;
  role: Role;
  text: string;
  kind?: MessageKind;
  timestamp?: string;
};

const projectFacts = activeTenant.project;
const knowledgeBase = activeTenant.knowledgeBase;
const quickActions = activeTenant.quickActions;

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

  if (["membresia", "membresía", "tanda", "ahorro", "club", "mensual"].some((word) => normalized.includes(word))) {
    return {
      id,
      role: "advisor",
      kind: "membership",
      text: "La Membresía de Patrimonio OS no es para consumir: es para crear patrimonio. Empiezas con poco, formas hábito y desbloqueas oportunidades con guía local e IA.",
    };
  }

  if (["enchula", "enchúlame", "foto", "imagen", "terreno", "visualizar"].some((word) => normalized.includes(word))) {
    return {
      id,
      role: "advisor",
      kind: "terrain-vision",
      text: "Va. Sube una foto y elige una intención visual para imaginar cómo podría mejorar el terreno.",
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
      activeTenant.agent.fallback,
  };
}

function getMessageKindFromAgent(response: AgentApiResponse): MessageKind | undefined {
  if (response.action === "calculator") return "calculator";
  if (response.action === "membership_offer") return "membership";
  if (response.action === "terrain_vision") return "terrain-vision";
  if (
    response.action === "lead_form" ||
    response.action === "whatsapp_handoff" ||
    response.shouldCaptureLead
  ) {
    return "lead-form";
  }

  return undefined;
}

async function requestAgentReply(
  message: string,
  history: ChatMessage[],
  id: number,
): Promise<ChatMessage> {
  const response = await fetch("/api/agent/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.slice(-8).map((item) => ({
        role: item.role,
        text: item.text,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("Agent request failed");
  }

  const data = (await response.json()) as AgentApiResponse;

  return {
    id,
    role: "advisor",
    kind: getMessageKindFromAgent(data),
    text: data.reply || activeTenant.agent.fallback,
  };
}

function LeadCaptureMiniForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(activeTenant.project.name);
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
        <option>{activeTenant.project.name}</option>
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

function MembershipCard() {
  return (
    <div className="mt-3 space-y-3 border border-[#d8b86f]/25 bg-[#06111f] p-3 text-sm">
      <div className="flex items-center gap-2 text-[#f3d99a]">
        <Sparkles size={16} />
        <span className="font-medium">Membresía Patrimonio</span>
      </div>
      <p className="text-white/68">
        Los primeros $100 pueden ir por nuestra cuenta. Tú continúas el hábito,
        aprendes, avanzas y desbloqueas oportunidades reales con agencias locales.
      </p>
      <button className="inline-flex min-h-10 w-full items-center justify-center gap-2 bg-[#d8b86f] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#07111f]">
        Quiero entrar a la lista
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

function TerrainVisionCard() {
  const chips = ["Más verde", "Casa económica", "Fachada moderna", "Parque", "Iluminación"];

  return (
    <div className="mt-3 space-y-3 border border-white/10 bg-[#06111f] p-3 text-sm">
      <div className="flex items-center gap-2 text-[#f3d99a]">
        <ImagePlus size={16} />
        <span className="font-medium">Enchúlame el terreno</span>
      </div>
      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/15 bg-[#030a16] px-3 text-center text-white/50">
        <ImagePlus size={20} className="text-[#f3d99a]" />
        <span>Sube una foto del terreno</span>
        <input type="file" accept="image/*" className="hidden" disabled />
      </label>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled
            className="rounded-full border border-[#d8b86f]/25 px-3 py-1 text-xs text-[#f3d99a]/75"
          >
            {chip}
          </button>
        ))}
      </div>
      <p className="text-xs leading-5 text-white/42">
        Próximo paso: conectar Gemini para generar la visualización. Por ahora queda preparado el flujo.
      </p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 px-1">
      <motion.span
        className="size-1.5 rounded-full bg-[#d8b86f]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.span
        className="size-1.5 rounded-full bg-[#d8b86f]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
      />
      <motion.span
        className="size-1.5 rounded-full bg-[#d8b86f]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isVisitor = message.role === "visitor";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-3 ${isVisitor ? "justify-end" : "justify-start"}`}
    >
      {!isVisitor && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg border border-[#d8b86f]/40 bg-gradient-to-br from-[#d8b86f]/20 to-[#d8b86f]/5 text-[#f3d99a]"
        >
          <Bot size={14} />
        </motion.span>
      )}

      <div className={`max-w-[85%] space-y-1 ${isVisitor ? "items-end" : "items-start"}`}>
        <div
          className={`relative px-4 py-3 text-sm leading-relaxed shadow-lg ${
            isVisitor
              ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#d8b86f] to-[#c4a55a] text-[#07111f]"
              : "rounded-2xl rounded-tl-sm border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] text-white/90 backdrop-blur-sm"
          }`}
        >
          <p className={message.kind ? "mb-2" : ""}>{message.text}</p>

          {message.kind === "lead-form" && (
            <LeadCaptureMiniForm onSuccess={() => {}} />
          )}
          {message.kind === "calculator" && <PaymentCalculatorCard />}
          {message.kind === "membership" && <MembershipCard />}
          {message.kind === "terrain-vision" && <TerrainVisionCard />}
        </div>

        <span className={`text-[10px] text-white/40 ${isVisitor ? "text-right" : "text-left"} block`}>
          {message.timestamp}
        </span>
      </div>

      {isVisitor && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white/60"
        >
          <UserRound size={14} />
        </motion.span>
      )}
    </motion.div>
  );
}

export function AdvisorChat() {
  const nextIdRef = useRef(2);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "advisor",
      text: `${activeTenant.agent.greeting}\n\nTe puedo orientar sobre:`,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [hasInteracted, setHasInteracted] = useState(false);

  const unreadLabel = useMemo(() => (isOpen ? "Cerrar chat" : "Abrir asesor IA"), [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (value: string) => {
    const cleanValue = value.trim();
    if (!cleanValue) return;

    setHasInteracted(true);
    const timestamp = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    const visitorId = nextIdRef.current++;
    const visitorMessage: ChatMessage = {
      id: visitorId,
      role: "visitor",
      text: cleanValue,
      timestamp,
    };

    setMessages((current) => [...current, visitorMessage]);
    setInput("");

    // Simulate typing
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
    setIsTyping(false);

    const advisorId = nextIdRef.current++;
    const history = [...messages, visitorMessage];
    let reply: ChatMessage;

    try {
      reply = await requestAgentReply(cleanValue, history, advisorId);
    } catch {
      reply = getAdvisorReply(cleanValue, advisorId);
    }

    reply.timestamp = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    setMessages((current) => [...current, reply]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-4 flex h-[min(600px,calc(100vh-140px))] w-[min(400px,calc(100vw-48px))] flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#030a16]/98 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#030a16] to-[#07111f] px-5 py-4">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#d8b86f] via-[#f3d99a] to-[#d8b86f]" />

              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.span
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 5 }}
                    className="grid size-10 place-items-center rounded-xl border border-[#d8b86f]/40 bg-gradient-to-br from-[#d8b86f]/25 to-[#d8b86f]/5 text-[#f3d99a]"
                  >
                    <Sparkles size={18} />
                  </motion.span>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#030a16] bg-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{activeTenant.agent.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    En línea
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label="Cerrar asesor IA"
                onClick={() => setIsOpen(false)}
                className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/50 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Welcome Banner */}
            {!hasInteracted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-b border-white/5 bg-gradient-to-r from-[#d8b86f]/10 to-transparent px-5 py-3"
              >
                <div className="flex flex-wrap gap-2">
                  {["💰 Precios", "📍 Ubicación", "📋 Documentos", "🧮 Plan de pagos"].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                />
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <span className="mt-1 grid size-8 place-items-center rounded-lg border border-[#d8b86f]/40 bg-gradient-to-br from-[#d8b86f]/20 to-[#d8b86f]/5 text-[#f3d99a]">
                    <Bot size={14} />
                  </span>
                  <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.03] px-4 py-3">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="border-t border-white/5 px-4 pt-3">
              <p className="mb-2 text-[10px] uppercase tracking-wider text-white/30">Sugerencias rápidas</p>
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => sendMessage(action.prompt)}
                    disabled={isTyping}
                    className="shrink-0 rounded-full border border-[#d8b86f]/30 bg-gradient-to-r from-[#d8b86f]/10 to-transparent px-4 py-2 text-xs text-[#f3d99a] transition hover:border-[#d8b86f]/60 hover:from-[#d8b86f]/20 disabled:opacity-50"
                  >
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-white/10 bg-[#030a16]/80 p-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    disabled={isTyping}
                    className="w-full rounded-xl border border-white/10 bg-[#06111f] py-3 pl-4 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d8b86f]/60 focus:ring-1 focus:ring-[#d8b86f]/20 disabled:opacity-50"
                    placeholder="Escribe tu pregunta..."
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={isTyping || !input.trim()}
                  className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#d8b86f] to-[#c4a55a] text-[#07111f] shadow-lg shadow-[#d8b86f]/20 transition hover:shadow-xl hover:shadow-[#d8b86f]/30 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send size={18} />
                </motion.button>
              </div>
              <p className="mt-2 text-center text-[10px] text-white/25">
                Powered by {activeTenant.platformName} • Respuestas instantáneas
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        aria-label={unreadLabel}
        onClick={() => setIsOpen((c) => !c)}
        className="group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#d8b86f] to-[#c4a55a] px-5 text-sm font-semibold uppercase tracking-[0.14em] text-[#07111f] shadow-2xl shadow-black/40 transition hover:shadow-xl"
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
        </motion.span>
        <span className="hidden sm:inline">{isOpen ? "Cerrar" : "Asesor IA"}</span>

        {/* Glow effect */}
        <span className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f3d99a]/0 via-[#f3d99a]/30 to-[#f3d99a]/0 opacity-0 transition-opacity group-hover:opacity-100" />
      </motion.button>

      {/* Tooltip */}
      {!isOpen && !hasInteracted && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="pointer-events-none absolute bottom-20 right-0 w-64 rounded-xl border border-white/10 bg-[#030a16]/95 p-4 text-sm text-white/70 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          <div className="absolute -bottom-2 right-6 size-4 rotate-45 border-b border-r border-white/10 bg-[#030a16]" />
          <div className="flex items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#d8b86f]/20 text-[#f3d99a]">
              <Sparkles size={14} />
            </span>
            <div>
              <p className="font-medium text-white">¿Tienes preguntas?</p>
              <p className="mt-1 text-xs text-white/50">Te ayudo con precios, ubicación y más.</p>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/30"
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

import { NextResponse } from "next/server";
import { activeTenant } from "@/app/config/tenants";

type IncomingMessage = {
  role: "advisor" | "visitor";
  text: string;
};

type AgentAction = "none" | "lead_form" | "calculator" | "membership_offer" | "terrain_vision" | "whatsapp_handoff";

type AgentResponse = {
  reply: string;
  action: AgentAction;
  leadTemperature: "hot" | "warm" | "cold";
  leadScore: number;
  shouldCaptureLead: boolean;
  nextStep: string;
};

const fallbackResponse: AgentResponse = {
  reply: activeTenant.agent.fallback,
  action: "none",
  leadTemperature: "warm",
  leadScore: 50,
  shouldCaptureLead: false,
  nextStep: "Responder pregunta del visitante.",
};

function getLocalAdvisorResponse(message: string): AgentResponse {
  const normalized = message.toLowerCase();
  const match = activeTenant.knowledgeBase.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (["calcula", "calcular", "plan", "pagos", "financiamiento"].some((word) => normalized.includes(word))) {
    return {
      ...fallbackResponse,
      reply: "Te dejo un cálculo rápido con los datos iniciales del proyecto.",
      action: "calculator",
      leadScore: 72,
      shouldCaptureLead: false,
      nextStep: "Mostrar plan de pagos estimado.",
    };
  }

  if (["membresia", "membresía", "tanda", "ahorro", "100", "cien", "mensual", "club"].some((word) => normalized.includes(word))) {
    return {
      ...fallbackResponse,
      reply:
        "La Membresía de Patrimonio OS es una forma mexicana y local de avanzar hacia patrimonio. No pagas para consumir contenido: aportas para crear. La idea es empezar con poco, formar hábito, aprender, desbloquear oportunidades y recibir guía para moverte hacia un terreno o una casa con claridad.",
      action: "membership_offer",
      leadTemperature: "warm",
      leadScore: 78,
      shouldCaptureLead: true,
      nextStep: "Explicar membresía y ofrecer captura para lista de interesados.",
    };
  }

  if (["enchula", "enchúlame", "foto", "imagen", "visualizar", "diseno", "diseño"].some((word) => normalized.includes(word))) {
    return {
      ...fallbackResponse,
      reply:
        "Sí. La idea es subir una foto del terreno y generar una visión de cómo podría mejorar: más verde, limpio, iluminado, con fachada o con una casa sencilla. Es una herramienta para imaginar posibilidades, no una promesa de construcción.",
      action: "terrain_vision",
      leadTemperature: "warm",
      leadScore: 82,
      shouldCaptureLead: true,
      nextStep: "Mostrar herramienta Enchúlame el terreno.",
    };
  }

  if (["datos", "contacto", "whatsapp", "asesor", "cita", "visita", "apartar"].some((word) => normalized.includes(word))) {
    return {
      ...fallbackResponse,
      reply: "Claro. Déjame tus datos y el interés principal para preparar el seguimiento con un asesor.",
      action: "lead_form",
      leadTemperature: "hot",
      leadScore: 88,
      shouldCaptureLead: true,
      nextStep: "Capturar datos y preparar contacto por WhatsApp.",
    };
  }

  return {
    ...fallbackResponse,
    reply: match?.answer ?? activeTenant.agent.fallback,
    action: match ? "none" : "lead_form",
    leadTemperature: match ? "warm" : "cold",
    leadScore: match ? 60 : 45,
    shouldCaptureLead: !match,
    nextStep: match
      ? "Responder con información del proyecto."
      : "Ofrecer captura de datos para seguimiento humano.",
  };
}

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: {
      type: "string",
      description: "Respuesta breve, clara y comercial en español.",
    },
    action: {
      type: "string",
      enum: ["none", "lead_form", "calculator", "membership_offer", "terrain_vision", "whatsapp_handoff"],
      description: "Acción de UI o handoff que debe activar el frontend.",
    },
    leadTemperature: {
      type: "string",
      enum: ["hot", "warm", "cold"],
      description: "Temperatura estimada del prospecto.",
    },
    leadScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
      description: "Score comercial estimado del lead.",
    },
    shouldCaptureLead: {
      type: "boolean",
      description: "Si conviene pedir datos de contacto.",
    },
    nextStep: {
      type: "string",
      description: "Siguiente acción recomendada para CRM o asesor humano.",
    },
  },
  required: [
    "reply",
    "action",
    "leadTemperature",
    "leadScore",
    "shouldCaptureLead",
    "nextStep",
  ],
};

function buildSystemPrompt() {
  const project = activeTenant.project;
  const kb = activeTenant.knowledgeBase
    .map((item) => `- ${item.id}: ${item.answer}`)
    .join("\n");

  return `
Eres ${activeTenant.agent.name}, ${activeTenant.agent.role}.
Marca: ${activeTenant.brand}
Tono: ${activeTenant.agent.tone}

Objetivo:
- Ayudar al visitante con información inmobiliaria clara.
- Calificar intención de compra sin presionar de forma agresiva.
- Capturar leads cuando haya intención, duda concreta, interés en precio, visita, ubicación, documentos o pagos.
- Sugerir handoff a WhatsApp cuando el lead está listo para visita, apartado, llamada o contacto humano.
- Explicar la Membresía como una forma mexicana de compromiso patrimonial: no se paga para consumir, se aporta para crear, aprender y avanzar.
- Presentar "Enchúlame el terreno" cuando el usuario quiera subir foto, imaginar mejoras, diseño, fachada, casa, parque o visualización.
- Nunca inventes disponibilidad, condiciones legales, promesas de plusvalía garantizada o datos no dados.
- Si falta información, responde con honestidad y ofrece conectar con asesor.

Proyecto principal:
- Nombre: ${project.name}
- Ubicación: ${project.location}
- Lotes: ${project.lots}
- Medidas: ${project.dimensions}
- Enganche: ${project.downPayment} MXN
- Mensualidad: ${project.monthlyPayment} MXN
- Precio estándar: ${project.standardPrice} MXN
- Precio calle principal: ${project.mainStreetPrice} MXN

Base de conocimiento:
${kb}

Reglas de acción:
- Usa "lead_form" si el usuario quiere contacto, visita, WhatsApp, asesor, documentos, ubicación exacta o muestra intención de compra.
- Usa "calculator" si pregunta por pagos, mensualidades, enganche, plan o financiamiento.
- Usa "membership_offer" si pregunta por membresía, ahorro, tanda, aportaciones pequeñas, club, mensualidad o cómo empezar con poco.
- Usa "terrain_vision" si pregunta por subir una foto, transformar imagen, diseño visual, mejorar entorno o "enchular" un terreno.
- Usa "whatsapp_handoff" si parece listo para hablar con humano, visitar, apartar o cerrar.
- Usa "none" para respuestas informativas simples.

Responde siempre como JSON válido siguiendo el schema solicitado.
`.trim();
}

function normalizeAgentResponse(value: unknown): AgentResponse {
  if (!value || typeof value !== "object") {
    return fallbackResponse;
  }

  const partial = value as Partial<AgentResponse>;
  return {
    reply: partial.reply || fallbackResponse.reply,
    action: partial.action || "none",
    leadTemperature: partial.leadTemperature || "warm",
    leadScore:
      typeof partial.leadScore === "number"
        ? Math.max(0, Math.min(100, partial.leadScore))
        : 50,
    shouldCaptureLead: Boolean(partial.shouldCaptureLead),
    nextStep: partial.nextStep || fallbackResponse.nextStep,
  };
}

function getOutputText(response: { output_text?: string; output?: unknown[] }) {
  if (response.output_text) {
    return response.output_text;
  }

  const output = response.output ?? [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown[] }).content ?? [];
    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") continue;
      const text = (contentItem as { text?: string }).text;
      if (text) return text;
    }
  }

  return "";
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    history?: IncomingMessage[];
  };
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      { error: "Missing message" },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ...getLocalAdvisorResponse(message),
      configured: false,
    });
  }

  const history = (body.history ?? [])
    .slice(-8)
    .map((item) => `${item.role === "visitor" ? "Visitante" : "Asesor"}: ${item.text}`)
    .join("\n");

  const input = `
Historial reciente:
${history || "Sin historial previo."}

Mensaje actual del visitante:
${message}
`.trim();

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_AGENT_MODEL || "gpt-5-mini",
      instructions: buildSystemPrompt(),
      input,
      max_output_tokens: 700,
      text: {
        format: {
          type: "json_schema",
          name: "real_estate_sales_agent_response",
          schema: responseSchema,
          strict: true,
        },
      },
    }),
  });

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text();
    console.error("OpenAI agent error", errorText);
    return NextResponse.json(
      {
        ...fallbackResponse,
        configured: true,
        reply:
          "Tuve un problema conectando con el agente IA. Puedo seguir con información básica mientras se revisa la configuración.",
      },
      { status: 502 },
    );
  }

  const data = await openaiResponse.json();
  const outputText = getOutputText(data);

  try {
    return NextResponse.json({
      ...normalizeAgentResponse(JSON.parse(outputText)),
      configured: true,
    });
  } catch {
    return NextResponse.json({
      ...fallbackResponse,
      configured: true,
      reply: outputText || fallbackResponse.reply,
    });
  }
}

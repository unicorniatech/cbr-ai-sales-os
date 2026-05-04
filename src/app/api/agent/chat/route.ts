import { NextResponse } from "next/server";
import { activeTenant } from "@/app/config/tenants";

type IncomingMessage = {
  role: "advisor" | "visitor";
  text: string;
};

type AgentAction = "none" | "lead_form" | "calculator" | "whatsapp_handoff";

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
      enum: ["none", "lead_form", "calculator", "whatsapp_handoff"],
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
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ...fallbackResponse,
      configured: false,
      reply:
        "Aún falta configurar OPENAI_API_KEY. Mientras tanto puedo responder con la información básica del proyecto.",
    });
  }

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

import { NextResponse } from "next/server";
import { activeTenant } from "@/app/config/tenants";

type IncomingMessage = {
  role: "advisor" | "visitor";
  text: string;
};

type AgentAction = "none" | "lead_form" | "calculator" | "terrain_vision" | "whatsapp_handoff";

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

  if (["membresia", "membresía", "tanda", "ahorro", "100", "cien", "club"].some((word) => normalized.includes(word))) {
    return {
      ...fallbackResponse,
      reply:
        "Por ahora CBR no maneja membresías ni programas de ahorro dentro de este sitio. Te puedo ayudar con precios, ubicación, medidas, documentación y contacto para los terrenos disponibles.",
      action: "none",
      leadTemperature: "cold",
      leadScore: 35,
      shouldCaptureLead: false,
      nextStep: "Redirigir la conversación a terrenos CBR.",
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
      enum: ["none", "lead_form", "calculator", "terrain_vision", "whatsapp_handoff"],
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
- Presentar "Enchúlame el terreno" cuando el usuario quiera subir foto, imaginar mejoras, diseño, fachada, casa, parque o visualización.
- No ofrecer membresías, tandas, clubes, ahorro por suscripción ni programas externos. Este sitio solo vende y asesora sobre terrenos CBR.
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
- Usa "terrain_vision" si pregunta por subir una foto, transformar imagen, diseño visual, mejorar entorno o "enchular" un terreno.
- Usa "whatsapp_handoff" si parece listo para hablar con humano, visitar, apartar o cerrar.
- Usa "none" para respuestas informativas simples.

Responde siempre como JSON válido siguiendo el schema solicitado.
`.trim();
}

function shouldUseFastLocalResponse(message: string) {
  const normalized = message.toLowerCase();
  const fastKeywords = [
    "precio",
    "cuesta",
    "costo",
    "vale",
    "mensualidad",
    "enganche",
    "calcula",
    "calcular",
    "plan",
    "pagos",
    "financiamiento",
    "ubicacion",
    "ubicación",
    "donde",
    "mapa",
    "jojutla",
    "documento",
    "legal",
    "papeles",
    "medida",
    "metros",
    "lote",
    "datos",
    "contacto",
    "whatsapp",
    "asesor",
    "cita",
    "visita",
    "apartar",
    "enchula",
    "enchúlame",
    "foto",
    "imagen",
    "visualizar",
    "membresia",
    "membresía",
    "tanda",
    "ahorro",
    "club",
  ];

  return fastKeywords.some((word) => normalized.includes(word));
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

function parseAgentJson(outputText: string) {
  try {
    return JSON.parse(outputText);
  } catch {
    const match = outputText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found");
    return JSON.parse(match[0]);
  }
}

async function callOpenAI({
  apiKey,
  input,
  model,
  structured,
}: {
  apiKey: string;
  input: string;
  model: string;
  structured: boolean;
}) {
  const body: Record<string, unknown> = {
    model,
    instructions: structured
      ? buildSystemPrompt()
      : `${buildSystemPrompt()}\n\nResponde SOLO con JSON válido que incluya reply, action, leadTemperature, leadScore, shouldCaptureLead y nextStep.`,
    input,
    max_output_tokens: 360,
  };

  if (structured) {
    body.text = {
      format: {
        type: "json_schema",
        name: "real_estate_sales_agent_response",
        schema: responseSchema,
        strict: true,
      },
    };
  }

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!openaiResponse.ok) {
    return {
      ok: false as const,
      error: await openaiResponse.text(),
    };
  }

  return {
    ok: true as const,
    text: getOutputText(await openaiResponse.json()),
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    history?: IncomingMessage[];
    debug?: boolean;
  };
  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json(
      { error: "Missing message" },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || shouldUseFastLocalResponse(message)) {
    return NextResponse.json({
      ...getLocalAdvisorResponse(message),
      configured: Boolean(apiKey),
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

  const primaryModel = process.env.OPENAI_AGENT_MODEL || "gpt-5-mini";
  const attempts = [
    { model: primaryModel, structured: true },
    { model: primaryModel, structured: false },
    { model: "gpt-4.1-mini", structured: false },
  ].filter(
    (attempt, index, list) =>
      list.findIndex((item) => item.model === attempt.model && item.structured === attempt.structured) === index,
  );
  let outputText = "";
  const providerErrors: string[] = [];

  for (const attempt of attempts) {
    const result = await callOpenAI({
      apiKey,
      input,
      model: attempt.model,
      structured: attempt.structured,
    });

    if (result.ok) {
      outputText = result.text;
      break;
    }

    providerErrors.push(`${attempt.model}/${attempt.structured ? "structured" : "plain"}: ${result.error.slice(0, 600)}`);
    console.error("OpenAI agent error", result.error);
  }

  if (!outputText) {
    return NextResponse.json({
      ...getLocalAdvisorResponse(message),
      configured: true,
      providerIssue: true,
      ...(body.debug ? { providerErrors } : {}),
    });
  }

  try {
    return NextResponse.json({
      ...normalizeAgentResponse(parseAgentJson(outputText)),
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

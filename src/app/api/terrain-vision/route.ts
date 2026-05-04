import { NextResponse } from "next/server";

type TerrainVisionRequest = {
  imageDataUrl?: string;
  style?: string;
};

type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
  inline_data?: {
    mime_type?: string;
    data?: string;
  };
};

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  return {
    mimeType: match[1],
    data: match[2],
  };
}

function getGeneratedImage(data: { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> }) {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}`;
    }

    if (part.inline_data?.data) {
      return `data:${part.inline_data.mime_type ?? "image/png"};base64,${part.inline_data.data}`;
    }
  }

  return null;
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured",
        code: "missing_gemini_key",
      },
      { status: 500 },
    );
  }

  const body = (await request.json()) as TerrainVisionRequest;
  const image = body.imageDataUrl ? parseDataUrl(body.imageDataUrl) : null;

  if (!image) {
    return NextResponse.json(
      { error: "Missing imageDataUrl" },
      { status: 400 },
    );
  }

  const style = body.style || "Más verde";
  const prompt = `
Edita esta foto de terreno o calle mexicana de forma realista y aspiracional.
Objetivo visual: ${style}.
Mantén la perspectiva y el lugar original. Mejora limpieza, vegetación, iluminación y orden urbano.
Si agregas casa, que sea económica, viable y mexicana, sin lujo exagerado.
No agregues texto, logos, marcas de agua falsas, personas identificables ni promesas legales.
Debe parecer una visualización conceptual de mejora del entorno, no un render corporativo artificial.
`.trim();

  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: image.mimeType,
                  data: image.data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    const quotaExceeded = response.status === 429 || error.toLowerCase().includes("quota");
    console.error("Gemini terrain vision error", error);
    return NextResponse.json(
      {
        error: "Terrain vision generation failed",
        code: quotaExceeded ? "gemini_quota_exceeded" : "gemini_request_failed",
        detail: error.slice(0, 600),
      },
      { status: 502 },
    );
  }

  const data = await response.json();
  const generatedImage = getGeneratedImage(data);

  if (!generatedImage) {
    console.error("Gemini terrain vision returned no image", JSON.stringify(data).slice(0, 1000));
    return NextResponse.json(
      {
        error: "No image returned",
        code: "no_image_returned",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    imageDataUrl: generatedImage,
    style,
  });
}

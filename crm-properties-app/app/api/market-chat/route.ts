import { NextResponse } from "next/server";

// Google Gemini API ključ čitamo iz .env fajla.
// Besplatan ključ se pravi na https://aistudio.google.com/apikey (bez plaćanja i bez kartice).
const apiKey = process.env["GEMINI_API_KEY"];

// Naziv modela koji koristimo. "gemini-3.6-flash" je brz model iz besplatnog paketa.
const model = "gemini-3.6-flash";

// Puna adresa Gemini endpointa na koji šaljemo pitanje korisnika.
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Uputstvo koje modelu objašnjava kako i o čemu sme da odgovara.
const systemPrompt = `
You are a simple real estate market assistant inside a CRM application.

Answer clearly and briefly using Markdown formatting when helpful.

You may use:
- **bold**
- *italic*
- headings
- bullet points
- numbered lists
- links
- short tables

Focus only on:
- major property seller companies,
- public stock information in general terms,
- market trends in the real estate industry,
- property market insights.

If the question is outside this domain, politely say that the assistant is limited to real estate market topics.

Keep answers short, structured and useful.
`;

// Tip koji opisuje samo onaj deo Gemini odgovora koji nam je zaista potreban.
type GeminiResponse = {
  candidates?: {
    content?: {
      // Model ponekad vrati i delove sa svojim razmišljanjem, pa ih prepoznajemo po polju "thought".
      parts?: { text?: string; thought?: boolean }[];
    };
  }[];
  error?: {
    message?: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // Proveravamo da li je poruka poslata.
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required." },
        { status: 400 }
      );
    }

    // Proveravamo da li postoji API ključ.
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "GEMINI_API_KEY is missing." },
        { status: 500 }
      );
    }

    // Šaljemo običan HTTP zahtev, pa nam nije potrebna nijedna dodatna biblioteka.
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Gemini očekuje ključ u ovom zaglavlju.
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        // Sistemsko uputstvo se šalje odvojeno od korisničke poruke.
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        // Pitanje korisnika.
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          // Ograničavamo dužinu odgovora da chat ostane kratak i pregledan.
          maxOutputTokens: 800,
          // Smanjujemo interno "razmišljanje" modela kako bi odgovor stigao brže.
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
    });

    const data: GeminiResponse = await response.json();

    // Bezbedna obrada neočekivanog odgovora.
    if (!response.ok) {
      console.error("Gemini unexpected response:", data);

      return NextResponse.json(
        {
          success: false,
          message: "The AI service returned an unexpected response.",
        },
        { status: 500 }
      );
    }

    // Gemini tekst odgovora vraća kao listu delova, pa ih spajamo u jedan string.
    const reply =
      data.candidates?.[0]?.content?.parts
        ?.filter((part) => !part.thought)
        .map((part) => part.text ?? "")
        .join("")
        .trim() || "No response was generated.";

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Market chat error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process chat request.",
      },
      { status: 500 }
    );
  }
}

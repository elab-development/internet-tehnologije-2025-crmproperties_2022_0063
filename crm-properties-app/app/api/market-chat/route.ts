import { NextResponse } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";

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

    // Proveravamo da li postoji token.
    if (!token) {
      return NextResponse.json(
        { success: false, message: "GITHUB_TOKEN is missing." },
        { status: 500 }
      );
    }

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

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        model,
      },
    });

    // Bezbedna obrada neočekivanog odgovora.
    if (isUnexpected(response)) {
      console.error("GitHub Models unexpected response:", response);

      return NextResponse.json(
        {
          success: false,
          message: "The AI service returned an unexpected response.",
        },
        { status: 500 }
      );
    }

    const reply =
      response.body?.choices?.[0]?.message?.content ||
      "No response was generated.";

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
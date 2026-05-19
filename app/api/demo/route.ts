import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PERSONAS, INPUT_TYPE_CONTEXT } from "@/lib/personas";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEMO_PERSONA_IDS = ["vc", "competitor", "devil"];

function extractJSON(text: string): string {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) return text.slice(firstBrace, lastBrace + 1);
  return text.trim();
}

export async function POST(req: NextRequest) {
  const { inputText, inputType } = await req.json();

  if (!inputText) {
    return new Response("Missing inputText", { status: 400 });
  }

  const personas = PERSONAS.filter(p => DEMO_PERSONA_IDS.includes(p.id));
  const inputContext = INPUT_TYPE_CONTEXT[inputType ?? "idea"] ?? INPUT_TYPE_CONTEXT.idea;

  const systemPrompt = `${inputContext}

You are simultaneously embodying ${personas.length} adversarial personas. For each persona, produce one focused, pointed attack on the submission. Be specific, not generic.

${personas.map(p => `=== ${p.name.toUpperCase()} (id: "${p.id}") ===\n${p.role}`).join("\n\n")}

RESPONSE FORMAT: Respond with ONLY valid JSON. No markdown, no code blocks, no explanation.

{
  "score": <integer 0-100, survivability score — be harsh>,
  "verdict": "<one punchy sentence verdict>",
  "weakestPoint": "<the single most critical vulnerability in 1-2 sentences>",
  "attacks": [
    {
      "personaId": "<id from the persona list above>",
      "headline": "<punchy attack headline, 8 words max>",
      "body": "<2-4 sentences of pointed adversarial reasoning>",
      "question": "<the hardest question this persona would ask>",
      "severity": <0=Low|1=Medium|2=High|3=Critical>
    }
  ]
}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        let fullText = "";

        const msgStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: "user", content: inputText }],
        });

        for await (const chunk of msgStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullText += chunk.delta.text;
            enqueue({ type: "token", text: chunk.delta.text });
          }
        }

        const parsed = JSON.parse(extractJSON(fullText));
        enqueue({ type: "done", result: { ...parsed, runId: "demo", version: 0 } });
      } catch (err) {
        enqueue({ type: "error", message: String(err) });
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

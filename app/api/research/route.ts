import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractJSON(text: string): string {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) return text.slice(firstBrace, lastBrace + 1);
  return text.trim();
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inputText } = await req.json();
  if (!inputText) return NextResponse.json({ error: "Missing inputText" }, { status: 400 });

  const systemPrompt = `You are a competitive intelligence analyst. Use web search to research the competitive landscape for the idea described by the user. Find 4-6 of the most relevant direct or indirect competitors.

Return ONLY valid JSON — no markdown, no code blocks, no explanation:
{
  "competitors": [
    {
      "name": "<company name>",
      "pricing": "<pricing model or typical range>",
      "market": "<what market or segment they serve>",
      "gap": "<their key weakness relative to what the user is building>",
      "sentiment": "<↑ Positive | → Mixed | ↓ Negative>"
    }
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ type: "web_search_20250305", name: "web_search" }] as any,
      messages: [{ role: "user", content: inputText }],
    });

    // Collect all text blocks — web_search responses may have multiple
    const allText = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("\n");

    if (!allText.trim()) {
      console.error("Research: no text block in response. Content types:", response.content.map(b => b.type));
      return NextResponse.json({ competitors: [] });
    }

    const parsed = JSON.parse(extractJSON(allText));
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Research route error:", String(err));
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

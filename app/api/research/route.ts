import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";

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

  const { inputText, inputType } = await req.json();
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

    const textBlock = response.content.find(b => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ competitors: [] });
    }

    const parsed = JSON.parse(extractJSON(textBlock.text));
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

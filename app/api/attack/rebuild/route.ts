import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface AttackWithDefense {
  personaId: string;
  headline: string;
  body: string;
  defense: string;
  defenseVerdict: "addressed" | "partial" | "vulnerable";
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inputText, inputType, attacks } = await req.json() as {
    inputText: string;
    inputType: string;
    attacks: AttackWithDefense[];
  };

  if (!inputText || !attacks?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const defended = attacks.filter(a => a.defense && (a.defenseVerdict === "addressed" || a.defenseVerdict === "partial"));
  if (defended.length === 0) {
    return NextResponse.json({ error: "No addressed defenses to rebuild from" }, { status: 400 });
  }

  const defenseContext = defended.map(a =>
    `Attack: "${a.headline}"\nFounder's defense: "${a.defense}"\nVerdict: ${a.defenseVerdict}`
  ).join("\n\n");

  const systemPrompt = `You are a startup writing coach. A founder has submitted their ${inputType} and received adversarial attacks. They've written defenses to some of those attacks.

Your job: produce an improved version of their original submission that naturally incorporates their defenses as clarifications, additions, or stronger framing — so those weaknesses no longer exist in the text itself.

Rules:
- Keep the core idea, structure, and voice intact. Do not rewrite from scratch.
- Only incorporate defenses that were "addressed" or "partial". Ignore anything undefended or "vulnerable".
- Add the substance of each defense naturally — as a sentence, a bullet, a clarification, or a tightened claim. Don't label them or mention the attacks.
- The output should read like a better, more complete version of the original — not a patchwork of edits.
- Output ONLY the improved text. No preamble, no explanation, no labels.`;

  const userMessage = `ORIGINAL SUBMISSION:\n${inputText}\n\nDEFENSES TO INCORPORATE:\n${defenseContext}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const improvedText = message.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("")
      .trim();

    return NextResponse.json({ improvedText });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

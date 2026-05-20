import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { attackId, personaId, personaName, personaRole, headline, body, question, defense, inputText } = await req.json();

  if (!personaId || !personaName || !defense) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const systemPrompt = `You are ${personaName}. Your role: ${personaRole}
You previously attacked this idea: "${inputText}"
Your attack headline was: "${headline}"
Your key argument: "${body}"
Your hard question: "${question}"

The founder responded: "${defense}"

In 3 sentences, respond in character — is their defense convincing? Be specific and pointed.
End your response with EXACTLY one of these tags on its own line: [ADDRESSED], [PARTIAL], or [VULNERABLE]`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: systemPrompt }],
    });

    const fullText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const lines = fullText.trim().split("\n");
    const lastLine = lines[lines.length - 1].trim();

    let verdict: "addressed" | "partial" | "vulnerable" = "vulnerable";
    let responseText = fullText.trim();

    if (lastLine === "[ADDRESSED]") {
      verdict = "addressed";
      responseText = lines.slice(0, -1).join("\n").trim();
    } else if (lastLine === "[PARTIAL]") {
      verdict = "partial";
      responseText = lines.slice(0, -1).join("\n").trim();
    } else if (lastLine === "[VULNERABLE]") {
      verdict = "vulnerable";
      responseText = lines.slice(0, -1).join("\n").trim();
    }

    if (attackId) {
      await prisma.attack.update({
        where: { id: attackId },
        data: { defense, defenseVerdict: verdict },
      }).catch(() => {});
    }

    return NextResponse.json({ response: responseText, verdict });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

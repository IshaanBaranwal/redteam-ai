import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { PERSONAS, INPUT_TYPE_CONTEXT } from "@/lib/personas";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface PriorRun {
  version: number;
  score: number;
  weakestPoint: string;
  attacks: { headline: string }[];
}

function buildThreadMemory(priorRuns: PriorRun[]): string {
  if (!priorRuns || priorRuns.length === 0) return "";
  const lines = priorRuns.map(run => {
    const topAttacks = run.attacks.slice(0, 3).map(a => a.headline).join(", ");
    return `Version ${run.version} (score: ${run.score}): Weakest point was "${run.weakestPoint}". Key attacks: ${topAttacks}.`;
  });
  return `THREAD MEMORY — use to sharpen attacks only, never to adjust scoring:
This idea has been red-teamed ${priorRuns.length} time${priorRuns.length > 1 ? "s" : ""} before. Use this history to probe known weaknesses harder and avoid repeating generic attacks. History:

${lines.join("\n")}

CRITICAL SCORING RULE: Score the CURRENT submission on its own merit. Do NOT lower the score as a penalty for not iterating between runs, and do NOT factor in how many times the idea has been tested. If the submission is unchanged from a prior run, give it the same score unless you find a genuinely new angle that changes the assessment. The score must reflect the idea's survivability today, not a punishment for repetition.`;
}

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
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { inputText, inputType, personaIds, threadId, priorRuns = [], customPersonas = [] } = await req.json();

  if (!inputText || !inputType || !personaIds?.length) {
    return new Response("Missing required fields", { status: 400 });
  }

  const builtinPersonas = PERSONAS.filter(p => personaIds.includes(p.id));
  const allPersonas = [
    ...builtinPersonas,
    ...(customPersonas as { id: string; name: string; role: string; icon: string }[]),
  ];
  const inputContext = INPUT_TYPE_CONTEXT[inputType] ?? INPUT_TYPE_CONTEXT.idea;
  const threadMemory = buildThreadMemory(priorRuns);

  const systemPrompt = `${inputContext}

${threadMemory ? threadMemory + "\n\n" : ""}You are simultaneously embodying ${allPersonas.length} adversarial personas. For each persona, produce one focused, pointed attack on the submission. Be specific, not generic.

${allPersonas.map(p => `=== ${p.name.toUpperCase()} (id: "${p.id}") ===\n${p.role}`).join("\n\n")}

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
          max_tokens: 4096,
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

        // Ensure user exists in DB
        const user = await prisma.user.upsert({
          where: { clerkId: userId },
          create: { clerkId: userId, email: `${userId}@clerk.temp` },
          update: {},
        });

        // Get thread or create if missing
        const thread = await prisma.thread.findFirst({
          where: { id: threadId, userId: user.id },
        });
        if (!thread) throw new Error("Thread not found");

        const version = (await prisma.run.count({ where: { threadId } })) + 1;

        const run = await prisma.run.create({
          data: {
            threadId,
            version,
            inputText,
            inputType,
            score: parsed.score,
            verdict: parsed.verdict,
            weakestPoint: parsed.weakestPoint,
            attacks: {
              create: parsed.attacks.map((a: {
                personaId: string; headline: string; body: string;
                question: string; severity: number;
              }) => ({
                personaId: a.personaId,
                headline: a.headline,
                body: a.body,
                question: a.question,
                severity: a.severity,
              })),
            },
          },
          include: { attacks: true },
        });

        // Update thread title from first run
        if (version === 1) {
          await prisma.thread.update({
            where: { id: threadId },
            data: { title: inputText.slice(0, 60).trim() },
          });
        }

        enqueue({ type: "done", result: { ...parsed, runId: run.id, version } });
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

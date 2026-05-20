import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;

  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: { attacks: true, thread: { select: { title: true } } },
  });

  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    threadTitle: run.thread.title,
    version: run.version,
    score: run.score,
    verdict: run.verdict,
    weakestPoint: run.weakestPoint,
    inputType: run.inputType,
    attacks: run.attacks.map(a => ({
      personaId: a.personaId,
      headline: a.headline,
      body: a.body,
      question: a.question,
      severity: a.severity,
    })),
  });
}

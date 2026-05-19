import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const thread = await prisma.thread.findFirst({
    where: { id, userId: user.id },
    include: {
      runs: {
        orderBy: { version: "desc" },
        include: { attacks: true, competitors: true },
      },
    },
  });

  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

  return NextResponse.json({
    id: thread.id,
    title: thread.title,
    inputType: thread.inputType,
    runs: thread.runs.map(r => ({
      id: r.id,
      version: r.version,
      score: r.score,
      verdict: r.verdict,
      weakestPoint: r.weakestPoint,
      inputType: r.inputType,
      inputText: r.inputText,
      createdAt: r.createdAt,
      attacks: r.attacks.map(a => ({
        personaId: a.personaId,
        headline: a.headline,
        body: a.body,
        question: a.question,
        severity: a.severity,
      })),
      competitors: r.competitors.map(c => ({
        name: c.name,
        pricing: c.pricing,
        market: c.market,
        gap: c.gap,
        sentiment: c.sentiment,
      })),
    })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const title = (body.title ?? "").trim().slice(0, 100) || "Untitled";

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.thread.updateMany({ where: { id, userId: user.id }, data: { title } });
  return NextResponse.json({ ok: true });
}

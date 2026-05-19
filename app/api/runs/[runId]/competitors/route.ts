import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ runId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { runId } = await params;
  const { competitors } = await req.json();

  if (!Array.isArray(competitors)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const run = await prisma.run.findFirst({
    where: { id: runId, thread: { userId: user.id } },
  });
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  await prisma.competitor.deleteMany({ where: { runId } });
  if (competitors.length > 0) {
    await prisma.competitor.createMany({
      data: competitors.map((c: { name: string; pricing: string; market: string; gap: string; sentiment: string }) => ({
        runId,
        name: c.name ?? "",
        pricing: c.pricing ?? "",
        market: c.market ?? "",
        gap: c.gap ?? "",
        sentiment: c.sentiment ?? "",
      })),
    });
  }

  return NextResponse.json({ ok: true });
}

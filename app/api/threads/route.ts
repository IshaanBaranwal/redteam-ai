import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function getOrCreateUser(clerkId: string) {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${clerkId}@clerk.temp`;
  return prisma.user.upsert({
    where: { clerkId },
    create: { clerkId, email },
    update: { email },
  });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser(userId);

  const threads = await prisma.thread.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      runs: {
        orderBy: { version: "asc" },
        select: { score: true, version: true },
      },
    },
  });

  const now = Date.now();
  const formatted = threads.map(t => {
    const latestRun = t.runs[t.runs.length - 1];
    const diffMs = now - t.updatedAt.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const date = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
    return {
      id: t.id,
      title: t.title,
      score: latestRun?.score ?? 0,
      runs: latestRun?.version ?? 0,
      date,
      scores: t.runs.map(r => r.score),
    };
  });

  return NextResponse.json({ threads: formatted });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser(userId);
  const body = await req.json().catch(() => ({}));
  const inputType = body.inputType ?? "idea";

  const thread = await prisma.thread.create({
    data: { userId: user.id, title: "New thread", inputType },
  });

  return NextResponse.json({ thread });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("id");
  if (!threadId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const user = await getOrCreateUser(userId);

  await prisma.thread.deleteMany({
    where: { id: threadId, userId: user.id },
  });

  return NextResponse.json({ ok: true });
}

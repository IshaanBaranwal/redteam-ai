import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const FREE_RUN_LIMIT = 10;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ runsUsed: 0, limit: FREE_RUN_LIMIT });

    const runsUsed = await prisma.run.count({ where: { thread: { userId: user.id } } });
    return NextResponse.json({ runsUsed, limit: FREE_RUN_LIMIT });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

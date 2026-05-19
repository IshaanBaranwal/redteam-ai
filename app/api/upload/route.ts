import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return NextResponse.json({ extractedText: result.value });
  }

  if (ext === "pdf") {
    // Return base64 for the Anthropic document API — the attack agent handles rendering
    const base64 = buffer.toString("base64");
    return NextResponse.json({ base64Pdf: base64, mimeType: "application/pdf" });
  }

  if (ext === "pptx") {
    // TODO: install officeparser for PPTX support
    return NextResponse.json(
      { error: "PPTX parsing not yet available. Please paste your content as text." },
      { status: 422 }
    );
  }

  return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 415 });
}

import { connectDB } from "@/lib/db";
import Chunk from "@/models/Chunk";
import Document from "@/models/Document";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  const document = await Document.findById(id);
  if (!document) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  const chunks = await Chunk.find({ documentId: id });

  const fullText = chunks.map((c) => c.content).join("\n\n");

  return NextResponse.json({
    _id: document._id,
    name: document.name,
    content: fullText,
  });
}
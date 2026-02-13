import { connectDB } from "@/lib/db";
import Chunk from "@/models/Chunk";
import Document from "@/models/Document";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid document ID." },
        { status: 400 }
      );
    }

    const document = await Document.findById(id);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
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

  } catch (error) {
    console.error("Document fetch error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
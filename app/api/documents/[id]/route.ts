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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required." },
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

    await Chunk.deleteMany({ documentId: id });
    await Document.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete document error:", error);

    return NextResponse.json(
      { error: "Failed to delete document." },
      { status: 500 }
    );
  }
}
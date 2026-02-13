import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Document from "@/models/Document";
import Chunk from "@/models/Chunk";
import { splitIntoChunks } from "@/lib/chunk";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const name = body?.name;
    const content = body?.content;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Document content is required." },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Document name is required." },
        { status: 400 }
      );
    }

    const chunks = splitIntoChunks(content);

    if (!chunks || chunks.length === 0) {
      return NextResponse.json(
        { error: "Unable to split document into chunks." },
        { status: 400 }
      );
    }

    const doc = await Document.create({ name });

    for (const chunk of chunks) {
      if (!chunk || !chunk.trim()) continue;

      let embeddingResponse;

      try {
        embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
        });
      } catch (error) {
        console.error("Embedding error:", error);
        await Chunk.deleteMany({ documentId: doc._id });
        await Document.findByIdAndDelete(doc._id);

        return NextResponse.json(
          { error: "Failed to generate embeddings." },
          { status: 500 }
        );
      }

      const embedding = embeddingResponse?.data?.[0]?.embedding;

      if (!embedding) {
        await Chunk.deleteMany({ documentId: doc._id });
        await Document.findByIdAndDelete(doc._id);

        return NextResponse.json(
          { error: "Invalid embedding response." },
          { status: 500 }
        );
      }

      await Chunk.create({
        content: chunk,
        embedding,
        documentId: doc._id,
      });
    }

    return NextResponse.json(
      { success: true, documentId: doc._id },
      { status: 201 }
    );

  } catch (error) {
    console.error("Upload route error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
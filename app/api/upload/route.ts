import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Document from "@/models/Document";
import Chunk from "@/models/Chunk";
import { splitIntoChunks } from "@/lib/chunk";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  await connectDB();

  const { name, content } = await req.json();

  if (!content || content.trim() === "") {
    return NextResponse.json(
      { error: "Empty document" },
      { status: 400 }
    );
  }

  const doc = await Document.create({ name });

  const chunks = splitIntoChunks(content);

  for (const chunk of chunks) {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk,
    });

    await Chunk.create({
      content: chunk,
      embedding: embedding.data[0].embedding,
      documentId: doc._id,
    });
  }

  return NextResponse.json({ success: true });
}
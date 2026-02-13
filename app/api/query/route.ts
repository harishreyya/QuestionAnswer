import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Chunk from "@/models/Chunk";
import { cosineSimilarity } from "@/lib/similarity";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
  await connectDB();

  const { question } = await req.json();

  if (!question || question.trim() === "") {
    return NextResponse.json(
      { error: "Empty question" },
      { status: 400 }
    );
  }

  const questionEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });

  const chunks = await Chunk.find().populate("documentId");

  if (!chunks.length) {
    return NextResponse.json({
      answer: "No documents uploaded.",
      sources: [],
    });
  }

  const ranked = chunks
    .map((chunk: any) => ({
      ...chunk.toObject(),
      score: cosineSimilarity(
        questionEmbedding.data[0].embedding,
        chunk.embedding
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const topScore = ranked[0]?.score;

  if (!topScore || topScore < 0.3) {
    return NextResponse.json({
      answer:
        "I could not find relevant information in the uploaded documents.",
      sources: [],
    });
  }

  const filtered = ranked
    .filter((c) => c.score >= topScore - 0.05)
    .slice(0, 3);

  const context = filtered.map((c) => c.content).join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Answer ONLY using the provided context.",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion:\n${question}`,
      },
    ],
  });

  return NextResponse.json({
    answer: completion.choices[0].message.content,
    sources: filtered.map((c: any) => ({
      document: c.documentId.name,
      excerpt: c.content,
    })),
  });
}
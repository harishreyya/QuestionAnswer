import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Chunk from "@/models/Chunk";
import { cosineSimilarity } from "@/lib/similarity";
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

    const question = body?.question;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    let questionEmbeddingResponse;
    try {
      questionEmbeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: question,
      });
    } catch (error) {
      console.error("Embedding error:", error);
      return NextResponse.json(
        { error: "Failed to generate embedding." },
        { status: 500 }
      );
    }

    const questionEmbedding =
      questionEmbeddingResponse?.data?.[0]?.embedding;

    if (!questionEmbedding) {
      return NextResponse.json(
        { error: "Invalid embedding response." },
        { status: 500 }
      );
    }

    const chunks = await Chunk.find().populate("documentId");

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({
        answer: "No documents uploaded.",
        sources: [],
      });
    }

    const ranked = chunks
      .map((chunk: any) => ({
        ...chunk.toObject(),
        score: cosineSimilarity(
          questionEmbedding,
          chunk.embedding
        ),
      }))
      .sort((a, b) => b.score - a.score);

    if (!ranked.length) {
      return NextResponse.json({
        answer:
          "No valid document embeddings found for similarity comparison.",
        sources: [],
      });
    }

    const topScore = ranked[0]?.score ?? 0;

    if (topScore < 0.3) {
      return NextResponse.json({
        answer:
          "I could not find relevant information in the uploaded documents.",
        sources: [],
      });
    }

    const filtered = ranked
      .filter((c) => c.score >= topScore - 0.05)
      .slice(0, 3);

    const context = filtered
      .map((c) => c.content)
      .join("\n\n");

    if (!context) {
      return NextResponse.json({
        answer:
          "Relevant document content could not be constructed.",
        sources: [],
      });
    }

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Answer ONLY using the provided context. If not found, say so clearly.",
          },
          {
            role: "user",
            content: `Context:\n${context}\n\nQuestion:\n${question}`,
          },
        ],
      });
    } catch (error) {
      console.error("LLM completion error:", error);
      return NextResponse.json(
        { error: "Failed to generate answer." },
        { status: 500 }
      );
    }

    const answer =
      completion?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        { error: "Invalid LLM response." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      answer,
      sources: filtered.map((c: any) => ({
        document: c?.documentId?.name ?? "Unknown document",
        excerpt: c?.content ?? "",
      })),
    });

  } catch (error) {
    console.error("Query route error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
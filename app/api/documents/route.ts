import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Document from "@/models/Document";

export async function GET() {
  try {
    await connectDB();

    const docs = await Document.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(docs);

  } catch (error) {
    console.error("Fetch documents error:", error);

    return NextResponse.json(
      { error: "Failed to fetch documents." },
      { status: 500 }
    );
  }
}
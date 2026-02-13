import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Document from "@/models/Document";

export async function GET() {
  await connectDB();

  const docs = await Document.find().sort({ createdAt: -1 });

  return NextResponse.json(docs);
}
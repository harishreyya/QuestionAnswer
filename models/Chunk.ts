import mongoose from "mongoose";

const ChunkSchema = new mongoose.Schema({
  content: String,
  embedding: [Number],
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
  },
});

export default mongoose.models.Chunk ||
  mongoose.model("Chunk", ChunkSchema);
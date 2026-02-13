import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Document ||
  mongoose.model("Document", DocumentSchema);
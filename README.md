# 🧠 Private Knowledge Workspace (RAG-based Q&A System)

A full-stack Retrieval-Augmented Generation (RAG) application that allows users to upload documents and ask questions. The system answers strictly from uploaded content and shows exactly where the answer came from.

Built with Next.js, MongoDB, Mongoose, and OpenAI APIs.



### Demo : [https://private-que-ans.vercel.app/](https://private-que-ans.vercel.app/)

---


## 🚀 Live Features

- 📄 Upload documents via:
  - Pasted text
  - `.txt` file upload
- 🏷 Automatic document naming with collision handling
- 🧩 Intelligent document chunking
- 🧠 Embedding generation using OpenAI
- 🔎 Semantic search using cosine similarity
- 🤖 AI-generated answers strictly based on document context
- 📌 Source transparency (shows document + excerpt)
- 🗂 Documents tab with:
  - List view
  - Timestamp
  - View full document
  - Delete document
- 🛡 Strong error handling
- ✨ Smooth user experience (auto scroll, loading states, validations)

---

## 🏗 Architecture Overview

This project implements a simplified Retrieval-Augmented Generation (RAG) pipeline.

### Flow:

1. User uploads document
2. Text is split into smaller chunks
3. Each chunk is converted into an embedding using OpenAI
4. Chunks + embeddings are stored in MongoDB
5. User asks a question
6. Question is converted into an embedding
7. Cosine similarity is calculated against stored embeddings
8. Top relevant chunks are selected
9. Selected chunks are sent to OpenAI Chat API
10. Answer is generated strictly from provided context
11. Sources are displayed in UI

---

## 🛠 Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- MongoDB
- Mongoose
- OpenAI API

### AI Models Used
- `text-embedding-3-small` (for vector embeddings)
- `gpt-4o-mini` (for answer generation)

---

## 📂 Database Structure

### Document Model
```js
{
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Chunk Model
```js
{
  content: String,
  embedding: [Number],
  documentId: ObjectId (ref: Document)
}
```

Each document is split into multiple chunks for semantic search efficiency.

---

## 🧠 Key Engineering Decisions

- Manual cosine similarity calculation
- Context filtering before sending to LLM
- Threshold-based relevance filtering
- Automatic name collision handling:
  - `Document`
  - `Document (1)`
  - `Document (2)`
- Cascade delete (deletes chunks when document is deleted)
- Defensive error handling
- Scroll-to-error & scroll-to-answer UX enhancement

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/private-knowledge-workspace.git
cd private-knowledge-workspace
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Create Environment File

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

---

### 4️⃣ Run Development Server

```bash
npm run dev
```

App will run on:

```
http://localhost:3000
```

---

## 🔍 API Endpoints

### Upload Document
`POST /api/upload`

Body:
```json
{
  "name": "optional name",
  "content": "document text"
}
```

---

### Get All Documents
`GET /api/documents`

---

### Get Single Document
`GET /api/documents/:id`

---

### Delete Document
`DELETE /api/documents/:id`

---

### Ask Question
`POST /api/query`

Body:
```json
{
  "question": "Your question here"
}
```

---

## 🎯 How Hallucination Is Prevented

- Only top relevant chunks are sent to the LLM.
- System prompt enforces:
  > "Answer ONLY using the provided context."
- If similarity score is below threshold → fallback response is returned.
- Sources are displayed for transparency.

---

## 🎨 UX Enhancements

- Sticky header
- Smooth auto-scroll behavior
- Loading states for:
  - Upload
  - Query
  - Delete
- Clear error messages
- Disabled buttons during async operations
- Clean document viewer

---

## 📈 Possible Improvements

- Use vector database (Pinecone / Weaviate)
- Add authentication
- Add pagination for large document sets
- Add document renaming
- Add streaming responses
- Add rate limiting
- Add caching layer (Redis)

---

## 🧪 Edge Cases Handled

- Empty document upload
- Empty question
- Invalid JSON
- Failed embeddings
- Duplicate document names
- No documents uploaded
- Irrelevant query fallback

---

## 🏁 Project Goal

This project demonstrates:

- Building a Retrieval-Augmented Generation system
- Implementing vector similarity search
- Integrating OpenAI APIs responsibly
- Managing document lifecycle
- Designing production-style API routes
- Creating a polished user experience


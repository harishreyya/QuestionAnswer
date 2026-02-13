"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"qa" | "documents">("qa");

  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const [content, setContent] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);

  const [uploadingText, setUploadingText] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [asking, setAsking] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetStatus = () => {
    setMessage(null);
    setError(null);
  };

  const fetchDocuments = async () => {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocuments(data);
  };

  useEffect(() => {
    fetchDocuments();
  }, [uploadingText,uploadingFile]);

  const openDocument = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`);
    const data = await res.json();
    setSelectedDoc(data);
  };

  const uploadFromText = async () => {
    resetStatus();
    if (!content.trim()) {
      setError("Please enter document text.");
      return;
    }

    try {
      setUploadingText(true);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "pasted-document.txt",
          content,
        }),
      });

      if (!res.ok) throw new Error();

      setMessage("Document uploaded.");
      setContent("");
      fetchDocuments();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploadingText(false);
    }
  };

const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    resetStatus();
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      setError("Only .txt files are supported.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        setUploadingFile(true);

        const fileContent = event.target?.result as string;

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            content: fileContent,
          }),
        });

        if (!res.ok) throw new Error();

        setMessage(`"${file.name}" uploaded successfully.`);
      } catch {
        setError("File upload failed.");
      } finally {
        setUploadingFile(false);
      }
    };

    reader.readAsText(file);
  };

  const ask = async () => {
    resetStatus();
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setAsking(true);

      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      setResult(data);
    } catch {
      setError("Query failed.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex justify-center px-6 py-20">

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.15),transparent_40%)]" />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-400 opacity-20 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-40 -right-32 w-[400px] h-[400px] bg-purple-400 opacity-20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-5xl space-y-10">

        <div className="text-center space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
            Private Knowledge Workspace
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload internal documents and ask intelligent questions.
            Answers are generated strictly from your uploaded data.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setActiveTab("qa")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition ${
              activeTab === "qa"
                ? "bg-black text-white shadow-lg"
                : "bg-white/60 backdrop-blur text-gray-700"
            }`}
          >
            Q&A
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition ${
              activeTab === "documents"
                ? "bg-black text-white shadow-lg"
                : "bg-white/60 backdrop-blur text-gray-700"
            }`}
          >
            Documents
          </button>
        </div>

        {activeTab === "qa" && (
          <div className="space-y-10">
        <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border border-white/40 space-y-8">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Add Documents
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Paste content or upload a .txt file.
            </p>
          </div>

          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste document content..."
            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm shadow-inner focus:ring-2 focus:ring-blue-500 outline-none transition"
          />

          <button
            onClick={uploadFromText}
            disabled={uploadingText}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-black to-gray-800 text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition disabled:opacity-50"
          >
            {uploadingText ? "Uploading..." : "Upload Text"}
          </button>

          <label className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-white/40 hover:bg-white/60 transition">
            <p className="text-sm text-gray-600">
              Click to upload a <span className="font-medium">.txt</span> file
            </p>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadingFile && (
              <p className="mt-4 text-sm text-gray-500">
                Uploading file...
              </p>
            )}
          </label>
        </div>

        <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-10 border border-white/40 space-y-8">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Ask a Question
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Ask anything related to your uploaded documents.
            </p>
          </div>

          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: What database does PostgreSQL use?"
            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm shadow-inner focus:ring-2 focus:ring-purple-500 outline-none transition"
          />

          <button
            onClick={ask}
            disabled={asking}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition disabled:opacity-50"
          >
            {asking ? "Generating Answer..." : "Get Answer"}
          </button>
        </div>

        {result && (
          <div className="bg-white shadow-2xl rounded-3xl p-10 border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Answer
              </h3>
              <p className="mt-4 text-gray-700 leading-relaxed text-sm">
                {result.answer}
              </p>
            </div>

            {result.sources?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-4">
                  Sources
                </h4>

                <div className="space-y-4">
                  {result.sources.map((s: any, i: number) => (
                    <div
                      key={i}
                      className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-xs shadow-sm"
                    >
                      <p className="font-medium text-gray-700">
                        {s.document}
                      </p>
                      <p className="mt-2 text-gray-600">
                        {s.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border space-y-6">

            {!selectedDoc && (
              <>
                <h2 className="text-lg font-semibold">
                  Uploaded Documents
                </h2>

                <div className="space-y-3">
                  {documents.map((doc) => (
                    <button
                      key={doc._id}
                      onClick={() => openDocument(doc._id)}
                      className="w-full text-left px-5 py-3 rounded-xl bg-white shadow-sm hover:shadow-md transition border"
                    >
                      {doc.name}
                    </button>
                  ))}

                  {documents.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No documents uploaded yet.
                    </p>
                  )}
                </div>
              </>
            )}

            {selectedDoc && (
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Back to documents
                </button>

                <h2 className="text-lg font-semibold">
                  {selectedDoc.name}
                </h2>

                <div className="bg-white rounded-2xl p-6 border text-sm whitespace-pre-wrap text-gray-700 max-h-[400px] overflow-y-auto">
                  {selectedDoc.content}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
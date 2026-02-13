"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onUploadSuccess: () => void;
};

export default function QATab({ onUploadSuccess }: Props) {
  const [content, setContent] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);

  const [uploadingText, setUploadingText] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [asking, setAsking] = useState(false);

  const [error, setError] = useState<string | null>(null);


const errorRef = useRef<HTMLDivElement | null>(null);
const answerRef = useRef<HTMLDivElement | null>(null);

  const resetError = () => setError(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [error]);

  useEffect(() => {
  if (result && answerRef.current) {
    answerRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}, [result]);


  const uploadFromText = async () => {
    resetError();

    if (!content.trim()) {
      setError("Document content cannot be empty.");
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Upload failed.");
      }

      setContent("");
      onUploadSuccess(); 
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploadingText(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    resetError();

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

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "File upload failed.");
        }

        onUploadSuccess(); 
      } catch (err: any) {
        setError(err.message || "File upload failed.");
      } finally {
        setUploadingFile(false);
        e.target.value = ""; 
      }
    };

    reader.readAsText(file);
  };

  const ask = async () => {
    resetError();

    if (!question.trim()) {
      setError("Question cannot be empty.");
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

      if (!res.ok) {
        throw new Error(data?.error || "Query failed.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Query failed.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-8">

      {error && (
        <div
          ref={errorRef}
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm shadow-sm"
        >
          {error}
        </div>
      )}

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
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-black to-gray-800 text-white text-sm font-medium shadow-lg hover:shadow-xl transition disabled:opacity-50"
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
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium shadow-lg hover:shadow-xl transition disabled:opacity-50"
        >
          {asking ? "Generating Answer..." : "Get Answer"}
        </button>
      </div>

 
      {result && (
        <div className="bg-white shadow-2xl rounded-3xl p-10 border border-gray-100 space-y-8">
          <div  ref={answerRef}>
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
  );
}

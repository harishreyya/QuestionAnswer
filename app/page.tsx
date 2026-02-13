"use client";

import { useState , useEffect} from "react";
import QATab from "./components/QATab";
import DocumentsTab from "./components/DocumentsTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"qa" | "documents">("qa");
const [documents, setDocuments] = useState<any[]>([]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();

      if (!res.ok) throw new Error();

      setDocuments(data || []);
    } catch {
      console.error("Failed to fetch documents");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden flex justify-center px-6 py-20">

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.15),transparent_40%)]" />

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
          <QATab onUploadSuccess={fetchDocuments} />
        )}

        {activeTab === "documents" && (
          <DocumentsTab docs={documents} onDeleteSuccess={fetchDocuments} />
        )}
       </div>
     </main>
   );
 }


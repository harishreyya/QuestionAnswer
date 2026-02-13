"use client";

import { useState } from "react";

type Props = {
  docs: any[];
  onDeleteSuccess: () => void;
};

export default function DocumentsTab({ docs, onDeleteSuccess }: Props) {
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const openDocument = async (id: string) => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch(`/api/documents/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to open document.");
      }

      setSelectedDoc(data);
    } catch (err: any) {
      setError(err.message || "Error opening document.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setDeletingId(id);

      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Delete failed.");
      }

      onDeleteSuccess();
    } catch (err: any) {
      setError(err.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-center text-sm text-gray-500">Loading...</p>
      )}

      {!selectedDoc ? (
        <>
          <h2 className="text-lg font-semibold">Uploaded Documents</h2>

          {docs.length === 0 && (
            <p className="text-sm text-gray-500">
              No documents uploaded yet.
            </p>
          )}

          <div className="space-y-4">
            {docs.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between bg-white  rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition"
              >
                <div
                  onClick={() => openDocument(doc._id)}
                  className="cursor-pointer"
                >
                  <p className="font-medium text-gray-800">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {formatDate(doc.createdAt)}
                  </p>
                </div>

                <button
                  onClick={() => deleteDocument(doc._id)}
                  disabled={deletingId === doc._id}
                  className="text-xs text-red-600 hover:text-red-800 transition disabled:opacity-50"
                >
                  {deletingId === doc._id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedDoc(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>

          <div>
            <h2 className="text-lg font-semibold">
              {selectedDoc?.name}
            </h2>
            {selectedDoc?.createdAt && (
              <p className="text-xs text-gray-500 mt-1">
                Uploaded: {formatDate(selectedDoc.createdAt)}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border text-sm whitespace-pre-wrap text-gray-700 max-h-[400px] overflow-y-auto">
            {selectedDoc?.content || "No content found."}
          </div>
        </div>
      )}
    </div>
  );
}
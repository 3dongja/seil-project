"use client";
import { useState } from "react";

export default function FirestoreReset() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reset-firestore", {
        method: "POST",
      });
      const result = await res.json();
      alert(result.message);
    } catch {
      alert("초기화 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">📦 Firestore 초기화</h2>
      <button
        onClick={handleReset}
        disabled={loading}
        className="bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Firestore 컬렉션 초기화
      </button>
    </div>
  );
}

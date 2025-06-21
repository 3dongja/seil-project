// FirestoreReset.tsx
"use client";
import { useState } from "react";
import { deleteCollection } from "@/lib/firestore-utils"; // 유틸 함수 필요

const collections = ["sellers", "sellerInfo", "inquiries", "messages"];

export default function FirestoreReset() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    for (const col of collections) {
      await deleteCollection(col);
    }
    setLoading(false);
    alert("Firestore 초기화 완료");
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
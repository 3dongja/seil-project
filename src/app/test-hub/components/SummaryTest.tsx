// SummaryTest.tsx
"use client";
import { useState } from "react";

export default function SummaryTest({ chatId }: { chatId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSummary = async () => {
    setLoading(true);
    const res = await fetch("/api/summary", {
      method: "POST",
      body: JSON.stringify({ chatId }),
    });
    const result = await res.json();
    setLoading(false);
    alert("요약 결과: " + JSON.stringify(result));
  };

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">🧠 요약 테스트</h2>
      <button
        onClick={handleSummary}
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        요약 생성 요청 (chatId: {chatId})
      </button>
    </div>
  );
}

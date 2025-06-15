// components/NoticeForm.tsx
"use client";

import { useState } from "react";

export default function NoticeForm({ author, onSuccess }: { author: string; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, author })
    });

    setLoading(false);
    if (res.ok) onSuccess();
    else alert("저장 실패");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" className="w-full p-2 border rounded" required />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용" className="w-full p-2 border rounded h-40" required />
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded" disabled={loading}>
        {loading ? "등록 중..." : "공지 등록"}
      </button>
    </form>
  );
}
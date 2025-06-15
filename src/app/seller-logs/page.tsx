// src/app/seller-logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";

export default function SellerLogsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      const sellerId = user.uid;
      const snap = await getDocs(collection(db, "users", sellerId, "seller", "messages"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    };
    fetchMessages();
  }, [user]);

  const updateStatus = async (messageId: string, status: string) => {
    if (!user) return;
    const sellerId = user.uid;
    const msgRef = doc(db, "users", sellerId, "seller", "messages", messageId);
    await updateDoc(msgRef, { status });
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, status } : msg));
  };

  const filteredMessages = filter === "all" ? messages : messages.filter(m => m.status === filter);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">📄 상담 내역 관리</h2>

      <div className="flex space-x-2">
        <button onClick={() => setFilter("all")} className="px-3 py-1 rounded bg-gray-200">전체</button>
        <button onClick={() => setFilter("처리 중")} className="px-3 py-1 rounded bg-yellow-300">처리 중</button>
        <button onClick={() => setFilter("응답 완료")} className="px-3 py-1 rounded bg-green-300">응답 완료</button>
      </div>

      {filteredMessages.length === 0 ? (
        <p>📭 해당 상태의 문의가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {filteredMessages.map((msg, idx) => (
            <div key={msg.id} className="flex items-center justify-between border rounded-xl p-3 bg-white shadow">
              <div className="flex flex-col text-sm w-2/3">
                <span className="font-medium">{msg.userName || msg.userId || "사용자"}</span>
                <span className="text-gray-500">{msg.question}</span>
                <span className="text-gray-400 text-xs">{msg.createdAt ? dayjs(msg.createdAt.toDate()).format("YYYY-MM-DD HH:mm") : "-"}</span>
                {msg.summary && (
                  <button
                    onClick={() => setSelectedSummary(msg.summary)}
                    className="text-blue-500 text-xs mt-1 underline w-fit"
                  >
                    요약 보기
                  </button>
                )}
              </div>
              <div className="flex flex-col items-end text-right space-y-1 w-1/3">
                <span className="text-xs text-gray-600">상태: {msg.status}</span>
                <div className="flex space-x-1">
                  <button onClick={() => updateStatus(msg.id, '응답 완료')} className="bg-green-500 text-white px-2 py-1 rounded text-xs">응답 완료</button>
                  <button onClick={() => updateStatus(msg.id, '처리 중')} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">처리 중</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">📌 상담 요약</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSummary}</p>
            <div className="mt-4 text-right">
              <button onClick={() => setSelectedSummary(null)} className="px-4 py-1 bg-blue-600 text-white rounded">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import dayjs from "dayjs";

interface Ticket {
  id: string;
  uid: string;
  email: string;
  message: string;
  createdAt?: { toDate: () => Date };
  status: string;
  adminReply?: string;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTickets = async () => {
      const snap = await getDocs(collection(db, "supportTickets"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      list.sort((a, b) => (b.adminReply ? 1 : 0) - (a.adminReply ? 1 : 0));
      setTickets(list);
    };
    fetchTickets();
  }, []);

  const markResolved = async (id: string) => {
    await updateDoc(doc(db, "supportTickets", id), { status: "처리 완료" });
    setTickets(prev => prev.map(ticket => ticket.id === id ? { ...ticket, status: "처리 완료" } : ticket));
  };

  const handleReply = async (id: string) => {
    const message = replies[id];
    if (!message?.trim()) return;
    await updateDoc(doc(db, "supportTickets", id), {
      adminReply: message,
      status: "답장 완료",
    });
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === id ? { ...ticket, adminReply: message, status: "답장 완료" } : ticket
      )
    );
    setReplies(prev => ({ ...prev, [id]: "" }));
  };

  return (
    <main className="min-h-screen p-4 space-y-4 bg-gray-50">
      <h1 className="text-lg font-bold">📬 접수된 고객 문의</h1>
      {tickets.length === 0 ? (
        <p className="text-sm text-gray-500">📭 현재 문의가 없습니다.</p>
      ) : (
        <div className="flex flex-col space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="border rounded-xl bg-white p-4 shadow-sm space-y-2 text-sm">
              <div className="text-gray-600">
                <strong>{ticket.email}</strong><br />
                <span className="text-xs">{ticket.uid}</span><br />
                <span className="text-xs text-gray-400">{ticket.createdAt ? dayjs(ticket.createdAt.toDate()).format("YYYY-MM-DD HH:mm") : "-"}</span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{ticket.message}</p>
              {ticket.adminReply && (
                <div className="bg-gray-100 p-2 rounded text-xs text-gray-700">
                  ✉️ 관리자 답변: {ticket.adminReply}
                </div>
              )}
              {ticket.status !== "처리 완료" && (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded text-xs"
                    placeholder="답장 내용을 입력하세요"
                    value={replies[ticket.id] ?? ""}
                    onChange={(e) => setReplies({ ...replies, [ticket.id]: e.target.value })}
                  />
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleReply(ticket.id)}
                      className="text-green-600 text-xs underline"
                    >
                      ✅ 답장 보내기
                    </button>
                    <button
                      onClick={() => markResolved(ticket.id)}
                      className="text-blue-600 text-xs underline"
                    >
                      📌 처리 완료
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

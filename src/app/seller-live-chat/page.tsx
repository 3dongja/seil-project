// src/app/seller-live-chat/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import ChatMessageList from "@/components/chat/ChatMessageList";
import KakaoChatInputBar from "@/components/chat/KakaoChatInputBar";

interface Inquiry {
  id: string;
  summary: string;
  createdAt?: any;
  alert?: boolean;
}

export default function SellerLiveChatPage() {
  const sellerId = "YOUR_SELLER_ID"; // 실제 로그인 정보로 교체 필요
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "sellers", sellerId, "inquiries"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Inquiry));
      setInquiries(data);
    });

    return () => unsubscribe();
  }, [sellerId]);

  useEffect(() => {
    const loadSummary = async () => {
      if (!selectedInquiryId) return;
      const summaryRef = doc(db, "sellers", sellerId, "inquiries", selectedInquiryId);
      const snap = await getDoc(summaryRef);
      const data = snap.data();
      if (data?.summary) setSummary(data.summary);
      else setSummary("");

      // 알림 해제 처리
      await updateDoc(summaryRef, { alert: false });
    };

    loadSummary();
  }, [selectedInquiryId, sellerId]);

  return (
    <div className="flex h-screen">
      <aside className="w-1/3 border-r overflow-y-auto">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${selectedInquiryId === inq.id ? "bg-gray-200" : ""}`}
            onClick={() => setSelectedInquiryId(inq.id)}
          >
            <div className="font-semibold flex justify-between items-center">
              <span>{inq.summary?.slice(0, 40) || "요약 없음"}</span>
              {inq.alert && <span className="text-red-500 text-xs ml-2">● 새 메시지</span>}
            </div>
            <div className="text-xs text-gray-500">{inq.id}</div>
          </div>
        ))}
      </aside>

      <main className="flex flex-col w-2/3">
        {selectedInquiryId ? (
          <>
            <div className="p-2 bg-yellow-100 text-sm border-b">{summary || "요약 정보 없음"}</div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-4">
              <ChatMessageList
                userType="seller"
                sellerId={sellerId}
                inquiryId={selectedInquiryId}
              />
            </div>
            <KakaoChatInputBar
              sellerId={sellerId}
              inquiryId={selectedInquiryId}
              userType="seller"
              scrollToBottom={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            채팅을 선택하세요
          </div>
        )}
      </main>
    </div>
  );
}

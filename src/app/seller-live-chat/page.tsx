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
import useUserRoles from "@/hooks/useUserRoles";

export default function SellerLiveChatPage() {
  const { user, isSeller } = useUserRoles();
  const sellerId = user?.uid;
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sellerId) return;

    const q = query(
      collection(db, "sellers", sellerId, "inquiries"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInquiries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [sellerId]);

  useEffect(() => {
    if (!selectedInquiryId || !sellerId) return;

    const loadSummary = async () => {
      const ref = doc(db, "sellers", sellerId, "inquiries", selectedInquiryId);
      const snap = await getDoc(ref);
      const data = snap.data();
      setSummary(data?.summary || "");
      await updateDoc(ref, { alert: false });
    };

    loadSummary();
  }, [selectedInquiryId, sellerId]);

  if (!sellerId) {
    return <div className="p-4 text-center text-red-500">판매자 인증이 필요합니다.</div>;
  }

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

      <main className="flex flex-col w-2/3 h-screen">
        {selectedInquiryId ? (
          <>
            <div className="p-2 bg-yellow-100 text-sm border-b">
              {summary ? summary : "요약 정보 없음"}
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-4">
              <ChatMessageList
                userType="seller"
                sellerId={sellerId}
                inquiryId={selectedInquiryId}
              />
            </div>
            <div className="flex-shrink-0">
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
            </div>
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

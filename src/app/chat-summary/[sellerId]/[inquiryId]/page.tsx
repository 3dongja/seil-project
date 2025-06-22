// src/app/chat-summary/[sellerId]/[inquiryId]/page.tsx

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import ChatScreen from "@/components/chat/ChatScreen";

export default function Page() {
  const { sellerId, inquiryId } = useParams() as {
    sellerId: string;
    inquiryId: string;
  };

  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "문의";

  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  useEffect(() => {
    if (!sellerId) return;
    const ref = doc(db, "sellers", sellerId);
    getDoc(ref).then((snap) => {
      const data = snap.data();
      if (data?.openTime) setOpenTime(data.openTime);
      if (data?.closeTime) setCloseTime(data.closeTime);
    });
  }, [sellerId]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="text-sm text-center text-gray-600 py-2">
        🕒 상담 가능 시간: {openTime} ~ {closeTime}
      </div>
      <ChatScreen
        sellerId={sellerId}
        inquiryId={inquiryId}
        userType="consumer"
        category={category}
      />
    </main>
  );
}

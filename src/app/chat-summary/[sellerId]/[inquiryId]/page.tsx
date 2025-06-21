"use client";

import { useEffect, useState } from "react";
import ChatScreen from "@/components/chat/ChatScreen";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ConsumerChatPage({
  params,
}: {
  params: { sellerId: string; inquiryId: string };
}) {
  const [openTime, setOpenTime] = useState<string>("");
  const [closeTime, setCloseTime] = useState<string>("");

  useEffect(() => {
    const ref = doc(db, "sellers", params.sellerId, "settings", "chatbot");
    getDoc(ref).then((snap) => {
      const data = snap.data();
      if (data?.openTime) setOpenTime(data.openTime);
      if (data?.closeTime) setCloseTime(data.closeTime);
    });
  }, [params.sellerId]);

  return (
    <>
      <div className="text-sm text-center text-gray-600 py-2">
        상담 가능 시간: {openTime} ~ {closeTime}
      </div>
      <ChatScreen
        sellerId={params.sellerId}
        inquiryId={params.inquiryId}
        userType="consumer"
      />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import ChatScreen from "@/components/chat/ChatScreen";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface PageProps {
  params: {
    sellerId: string;
    inquiryId: string;
  };
}

export default function ConsumerChatPage(props: PageProps) {
  const { sellerId, inquiryId } = props.params;
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  useEffect(() => {
    const ref = doc(db, "sellers", sellerId, "settings", "chatbot");
    getDoc(ref).then((snap) => {
      const data = snap.data();
      if (data?.openTime) setOpenTime(data.openTime);
      if (data?.closeTime) setCloseTime(data.closeTime);
    });
  }, [sellerId]);

  return (
    <>
      <div className="text-sm text-center text-gray-600 py-2">
        상담 가능 시간: {openTime} ~ {closeTime}
      </div>
      <ChatScreen
        sellerId={sellerId}
        inquiryId={inquiryId}
        userType="consumer"
      />
    </>
  );
}

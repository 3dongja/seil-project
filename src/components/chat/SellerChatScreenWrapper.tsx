// src/components/chat/SellerChatScreenWrapper.tsx
"use client";

import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ChatScreen from "./ChatScreen";

interface SellerChatScreenWrapperProps {
  sellerId: string;
  inquiryId: string;
  summaryInfo?: {
    name?: string;
    phone?: string;
  };
}

export default function SellerChatScreenWrapper({
  sellerId,
  inquiryId,
  summaryInfo,
}: SellerChatScreenWrapperProps) {
  useEffect(() => {
    const markSellerActive = async () => {
      const inquiryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId);
      await updateDoc(inquiryRef, { sellerActive: true });
    };
    markSellerActive();
  }, [sellerId, inquiryId]);

  return (
    <ChatScreen
      sellerId={sellerId}
      inquiryId={inquiryId}
      userType="seller" // 핵심: seller로 지정
      summaryInfo={summaryInfo}
    />
  );
}

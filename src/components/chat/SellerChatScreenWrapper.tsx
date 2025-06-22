// src/components/chat/SellerChatScreenWrapper.tsx
"use client";

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
  return (
    <ChatScreen
      sellerId={sellerId}
      inquiryId={inquiryId}
      userType="seller" // 핵심: seller로 지정
      summaryInfo={summaryInfo}
    />
  );
}

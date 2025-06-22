// src/components/chat/SellerChatScreenWrapper.tsx
"use client";

import ChatScreen from "./ChatScreen";

export default function SellerChatScreenWrapper({
  sellerId,
  inquiryId
}: {
  sellerId: string;
  inquiryId: string;
}) {
  return (
    <ChatScreen
      sellerId={sellerId}
      inquiryId={inquiryId}
      userType="seller" // 핵심: seller로 지정
    />
  );
}

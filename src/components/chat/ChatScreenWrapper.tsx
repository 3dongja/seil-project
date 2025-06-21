// src/components/chat/ChatScreenWrapper.tsx
"use client";

import ChatScreen from "./ChatScreen";

export default function ChatScreenWrapper({
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
      userType="consumer"
    />
  );
}

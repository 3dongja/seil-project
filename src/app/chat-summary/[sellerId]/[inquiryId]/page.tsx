// src/app/chat/[sellerId]/[inquiryId]/page.tsx
"use client";

import ChatScreen from "@/components/chat/ChatScreen";

export default function ConsumerChatPage({ params }: { params: { sellerId: string; inquiryId: string } }) {
  return (
    <ChatScreen
      sellerId={params.sellerId}
      inquiryId={params.inquiryId}
      userType="consumer"
    />
  );
}

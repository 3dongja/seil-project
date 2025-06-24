"use client";

import { useSearchParams } from "next/navigation";
import SellerChatScreenWrapper from "@/components/chat/SellerChatScreenWrapper";

export default function SellerLiveChatPage() {
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("seller") || "";
  const inquiryId = searchParams.get("inquiry") || "";

  if (!sellerId || !inquiryId) {
    return <div className="p-4 text-gray-500">채팅 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <main className="h-screen bg-white">
      <SellerChatScreenWrapper sellerId={sellerId} inquiryId={inquiryId} />
    </main>
  );
}

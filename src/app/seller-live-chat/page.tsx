// src/app/seller-live-chat/page.tsx
import { Suspense } from "react";
import SellerLiveChatSuspended from "@/components/chat/SellerLiveChatSuspended";

export default function SellerLiveChatPage() {
  return (
    <Suspense fallback={<div className="p-4">로딩 중...</div>}>
      <SellerLiveChatSuspended />
    </Suspense>
  );
}
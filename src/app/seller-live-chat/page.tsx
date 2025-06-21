// src/app/seller-live-chat/page.tsx
"use client";

import { Suspense } from "react";
import SellerLiveChatWrapper from "@/components/chat/SellerLiveChatWrapper";

export default function SellerLiveChatPage() {
  return (
    <Suspense fallback={<div className="p-4">로딩 중...</div>}>
      <SellerLiveChatWrapper />
    </Suspense>
  );
}

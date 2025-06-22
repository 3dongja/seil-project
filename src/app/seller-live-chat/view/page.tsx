// src/app/seller-live-chat/view/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import SellerLiveChatPage from "../SellerLiveChatPage";
import { Suspense } from "react";

export default function ChatViewRoute() {
  const searchParams = useSearchParams();
  const sellerId = searchParams.get("seller") || "";
  const inquiryId = searchParams.get("inquiry") || "";

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SellerLiveChatPage sellerId={sellerId} inquiryId={inquiryId} />
    </Suspense>
  );
}

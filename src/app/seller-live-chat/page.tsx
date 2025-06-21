// src/app/seller-live-chat/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Suspense } from "react";
import SellerLiveChatWrapper from "@/components/chat/SellerLiveChatWrapper";

export default function SellerLiveChatPage() {
  const searchParams = useSearchParams();

  // useMemo로 안정적으로 한 번만 가져오도록 처리
  const sellerId = useMemo(() => searchParams.get("seller") ?? "", [searchParams]);
  const inquiryId = useMemo(() => searchParams.get("inquiry") ?? "", [searchParams]);
  const userType = useMemo(() => searchParams.get("type") ?? "seller", [searchParams]);

  return (
    <Suspense fallback={<div className="p-4">로딩 중...</div>}>
      <SellerLiveChatWrapper
        uid={sellerId}
        inquiryId={inquiryId}
        
      />
    </Suspense>
  );
}

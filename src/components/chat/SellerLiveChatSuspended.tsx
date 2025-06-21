// src/components/chat/SellerLiveChatSuspended.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import SellerLiveChatWrapper from "@/components/chat/SellerLiveChatWrapper";

export default function SellerLiveChatSuspended() {
  const searchParams = useSearchParams();

  const sellerId = useMemo(() => searchParams.get("seller") ?? "", [searchParams]);
  const inquiryId = useMemo(() => searchParams.get("inquiry") ?? "", [searchParams]);
  const userType = useMemo(() => searchParams.get("type") ?? "seller", [searchParams]);

  if (!sellerId || !inquiryId) {
    return <div className="p-4 text-red-500">잘못된 접근입니다. 링크를 다시 확인해주세요.</div>;
  }

  return (
    <SellerLiveChatWrapper
      uid={sellerId}
      inquiryId={inquiryId}
      // userType prop 제거
    />
  );
}

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

  // 필수 파라미터가 없으면 안내 메시지
  if (!sellerId || !inquiryId) {
    return <div className="p-4 text-red-500">잘못된 접근입니다. 링크를 다시 확인해주세요.</div>;
  }

  return (
    <Suspense fallback={<div className="p-4">로딩 중...</div>}>
      <SellerLiveChatWrapper
        uid={sellerId}
        inquiryId={inquiryId}
      />
    </Suspense>
  );
}

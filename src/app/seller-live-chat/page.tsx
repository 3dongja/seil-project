// src/app/seller-live-chat/page.tsx
"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import SellerLiveChatWrapper from "@/components/chat/SellerLiveChatWrapper";

export default function SellerLiveChatPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className="p-4">로딩 중...</div>;
  if (!session?.user?.email) return <div className="p-4">로그인이 필요합니다.</div>;

  // 🔧 Firebase UID와 매핑 필요시 Firestore 조회 로직 추가 가능
  const uid = session.user.email;

  return (
    <Suspense fallback={<div className="p-4">로딩 중...</div>}>
      <SellerLiveChatWrapper uid={uid} />
    </Suspense>
  );
}

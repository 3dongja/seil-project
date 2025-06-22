// src/app/seller-live-chat/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ChatListPage from "./ChatListPage";
import useUserRoles from "@/hooks/useUserRoles";

export default function Page() {
  const { user, isSeller, loading } = useUserRoles();

  if (loading) return <div className="p-4">⏳ 로딩 중...</div>;
  if (!isSeller || !user) return <div className="p-4">❌ 접근 권한 없음</div>;

  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ChatListPage sellerId={user.uid} />
    </Suspense>
  );
}
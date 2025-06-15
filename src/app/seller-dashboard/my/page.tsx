// src/app/seller-dashboard/my/page.tsx

"use client";

import BackButton from "@/components/common/BackButton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserRoles from "@/hooks/useUserRoles";

export default function SellerDashboardPage() {
  const { user, isSeller, loading } = useUserRoles();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isSeller)) {
      router.push("/login");
    }
  }, [loading, user, isSeller, router]);

  if (loading) {
    return (
      <div className="p-4">
        <BackButton />
        로딩 중...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 pb-20">
      <h1 className="text-xl font-bold mb-4">📋 전체 메뉴</h1>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <button onClick={() => router.push("/seller-dashboard")} className="border p-3 rounded">🏠 대시보드</button>
        <button onClick={() => router.push("/seller-live-chat")} className="border p-3 rounded">💬 채팅</button>
        <button onClick={() => router.push("/seller-logs")} className="border p-3 rounded">📨 메시지 로그</button>
        <button onClick={() => router.push("/community")} className="border p-3 rounded">📰 커뮤니티 게시판</button>
        <button onClick={() => router.push("/seller-info")} className="border p-3 rounded">📇 내 정보</button>
        <button onClick={() => router.push("/seller-theme")} className="border p-3 rounded">🎨 테마 설정</button>
        <button onClick={() => router.push("/seller-plan")} className="border p-3 rounded">💳 요금제 관리</button>
        <button onClick={() => router.push("/support")} className="border p-3 rounded">📞 고객센터</button>

        {/* 추가된 버튼 */}
        <button onClick={() => router.push("/seller-settings")} className="border p-3 rounded">⚙️ 설정</button>
        <button onClick={() => router.push("/seller-stats")} className="border p-3 rounded">📊 통계 보기</button>
        <button onClick={() => router.push("/community/message/inbox")} className="border p-3 rounded">📥 받은 쪽지함</button>
      </div>
    </main>
  );
}

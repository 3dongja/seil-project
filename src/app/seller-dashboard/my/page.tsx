"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

const menuItems = [
  { label: "🏠 대시보드", path: "/seller-dashboard" },
  { label: "💬 채팅 상담", path: "/seller-live-chat" },
  { label: "📨 메시지 로그", path: "/seller-logs" },
  { label: "📊 통계 보기", path: "/seller-stats" },
  { label: "📇 내 정보", path: "/seller-info" },
  { label: "⚙️ 챗봇 응답 설정", path: "/seller-settings" },
  { label: "🎨 테마 설정", path: "/seller-theme" },
  { label: "💳 요금제 관리", path: "/seller-plan" },
  { label: "📥 받은 쪽지함", path: "/community/message/inbox" },
  { label: "📰 커뮤니티 게시판", path: "/community" },
  { label: "📞 고객센터", path: "/support" },
];

export default function SellerMenuPage() {
  return (
    <div className="px-4 py-6 space-y-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-2">📋 전체 메뉴</h1>
      <div className="flex flex-col space-y-3">
        {menuItems.map(({ label, path }) => (
          <Link
            key={path}
            href={path}
            className="flex items-center justify-between bg-white border border-gray-200 hover:border-gray-300 transition rounded-xl px-4 py-4 shadow-sm"
          >
            <span className="font-medium text-gray-700">{label}</span>
            <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
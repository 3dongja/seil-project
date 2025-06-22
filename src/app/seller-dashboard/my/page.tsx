"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

const groupedMenu = [
  {
    title: "📊 업무 관련 (채팅 및 상담 통계 관리)",
    items: [
      { label: "🏠 대시보드", path: "/seller-dashboard" },
      { label: "💬 채팅 상담", path: "/seller-live-chat" },
      { label: "📨 메시지 로그", path: "/seller-logs" },
      { label: "📊 통계 보기", path: "/seller-stats" },
      { label: "🧾 요약 통계", path: "/seller-logs" },
    ]
  },
  {
    title: "💬 커뮤니티 ⭐ 핵심 혜택 (소통 + 등급별 글쓰기 가능)",
    items: [
      { label: "📰 커뮤니티 게시판", path: "/community" },
      { label: "📥 받은 쪽지함", path: "/community/message/inbox" },
    ]
  },
  {
    title: "👤 내 정보 (사업자 프로필 및 요금제 관리)",
    items: [
      { label: "📇 내 정보", path: "/seller-info" },
      { label: "💳 요금제 관리", path: "/seller-plan" },
      { label: "💰 요금제 선택", path: "/pricing" },
      { label: "💳 충전 신청", path: "/charge" },
    ]
  },
  {
    title: "⚙️ 환경 설정 (기능 조정)",
    items: [
      { label: "⚙️ 챗봇 응답 설정", path: "/seller-settings" },
      { label: "📝 질문 템플릿 설정", path: "/seller-question-forms" },
    ]
  },
  {
    title: "📞 고객 지원 (문의 및 지원 서비스)",
    items: [
      { label: "📞 고객센터", path: "/support" },
    ]
  }
];

export default function SellerMenuPage() {
  return (
    <div className="px-4 py-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-2">📋 전체 메뉴</h1>
      {groupedMenu.map((group, idx) => (
        <div key={idx} className="space-y-2">
          <h2 className="text-lg font-bold text-purple-700 ml-1 border-l-4 border-purple-400 pl-2 bg-purple-50 rounded" title={group.title.replace(/^[^\(]*\(/, '').replace(/\)$/, '')}>{group.title}</h2>
          <div className="flex flex-col space-y-3">
            {group.items.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className="flex items-center justify-between bg-white border border-gray-200 hover:border-gray-300 transition rounded-xl px-4 py-4 shadow-sm"
              >
                <span className="font-medium text-gray-700" title={label}>{label}</span>
                <ArrowRightIcon className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

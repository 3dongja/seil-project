// src/app/blocked/page.tsx
"use client"

import { useRouter } from "next/navigation"

export default function BlockedPage() {
  const router = useRouter()

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">GPT 사용 제한</h1>
      <p className="text-gray-700 mb-4">
        이번 달 GPT 사용량이 <strong>1,000건</strong>을 초과하여 일시적으로 차단되었습니다.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        충전 후 관리자 승인 시 다시 사용할 수 있습니다.
      </p>
      <button
        onClick={() => router.push("/charge")}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        💳 충전하러 가기
      </button>
    </div>
  )
}

// src/components/common/BackButton.tsx

"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function BackButton() {
  const router = useRouter()
  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        돌아가기
      </button>
    </div>
  )
}

// src/app/seller-plan/page.tsx (요금제 확인 전용 + 내정보 추적 기반 업그레이드 유도)

"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import useUserRoles from "@/hooks/useUserRoles"
import BackButton from "@/components/common/BackButton"
import { useRouter } from "next/navigation"

const planLabel: Record<string, string> = {
  free: "프리 요금제",
  basic: "베이직 요금제",
  premium: "프리미엄 요금제"
}

export default function SellerPlanPage() {
  const { user, isSeller, loading } = useUserRoles()
  const [currentPlan, setCurrentPlan] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    if (!user || !isSeller) return
    const fetchPlan = async () => {
      const ref = doc(db, "users", user.uid, "seller", "profile")
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setCurrentPlan(snap.data().plan || "free")
      }
    }
    fetchPlan()
  }, [user, isSeller])

  if (loading) return <div className="p-4">로딩 중...</div>

  return (
    <main className="min-h-screen p-4">
      <BackButton />
      <h1 className="text-xl font-bold mb-4">요금제 정보</h1>
      <p className="text-lg">현재 가입된 요금제는 <span className="font-semibold text-blue-600">{planLabel[currentPlan]}</span> 입니다.</p>

      {currentPlan === "free" && (
        <div className="mt-4 text-sm text-gray-600">
          👉 <strong>베이직</strong> 또는 <strong>프리미엄</strong> 요금제로 업그레이드할 수 있습니다.
          <div className="mt-2">
            <button onClick={() => router.push("/support?reason=upgrade-basic")} className="text-blue-500 underline mr-4">베이직으로 업그레이드 요청</button>
            <button onClick={() => router.push("/support?reason=upgrade-premium")} className="text-blue-500 underline">프리미엄으로 업그레이드 요청</button>
          </div>
        </div>
      )}
      {currentPlan === "basic" && (
        <div className="mt-4 text-sm text-gray-600">
          👉 <strong>프리미엄</strong> 요금제로 업그레이드할 수 있습니다.
          <div className="mt-2">
            <button onClick={() => router.push("/support?reason=upgrade-premium")} className="text-blue-500 underline">프리미엄으로 업그레이드 요청</button>
          </div>
        </div>
      )}
      {currentPlan === "premium" && (
        <div className="mt-4 text-sm text-gray-600">
          👍 현재 최고 요금제에 가입되어 있습니다.
        </div>
      )}

      <p className="text-sm text-gray-400 mt-6">※ 요금제 변경은 고객센터를 통해 요청하실 수 있습니다.</p>

      <div className="mt-8">
        <button
          onClick={() => router.push("/seller-info")}
          className="text-sm text-blue-600 underline"
        >
          🔍 내 정보 전체 보기
        </button>
      </div>
    </main>
  )
} 

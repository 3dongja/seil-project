// src/app/charge/page.tsx
"use client"

import { useState } from "react"
import { getAuth } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function ChargePage() {
  const [selected, setSelected] = useState(30000)
  const [loading, setLoading] = useState(false)

  const handleCharge = async () => {
    const user = getAuth().currentUser
    if (!user) return alert("로그인이 필요합니다")

    setLoading(true)

    const ref = doc(db, "chargeRequests", user.uid)
    await setDoc(ref, {
      amount: selected,
      status: "pending",
      createdAt: serverTimestamp()
    })

    alert(`${selected.toLocaleString()}원 충전 신청 완료!\n입금 확인 후 반영됩니다.`)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <h1 className="text-xl font-bold text-center mb-4">💳 충전하기</h1>

      <div className="space-y-3 mb-6">
        {[30000, 50000, 99000].map((amount) => (
          <button
            key={amount}
            onClick={() => setSelected(amount)}
            className={`w-full px-4 py-2 rounded border ${selected === amount ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} hover:shadow`}
          >
            {amount.toLocaleString()}원 충전
          </button>
        ))}
        <button
          onClick={() => setSelected(100000)}
          className={`w-full px-4 py-2 rounded border ${selected === 100000 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} hover:shadow`}
        >
          100,000원 충전
        </button>
      </div>

      <button
        onClick={handleCharge}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
      >
        {loading ? "처리 중..." : "충전 신청"}
      </button>

      <p className="text-xs text-gray-500 mt-6 text-center">
        * 충전 후 관리자 승인까지 최대 1시간 소요될 수 있습니다.
      </p>
    </div>
  )
}

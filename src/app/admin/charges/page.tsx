// src/app/admin/charges/page.tsx
"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, updateDoc, doc, Timestamp, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getAuth } from "firebase/auth"
import { useRouter } from "next/navigation"

interface ChargeRequest {
  id: string
  amount?: number
  status?: string
  createdAt?: Timestamp
}

export default function AdminChargePage() {
  const [requests, setRequests] = useState<ChargeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const user = getAuth().currentUser
      if (!user) return router.push("/")

      const ref = doc(db, "admins", user.uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        alert("관리자만 접근 가능합니다.")
        router.push("/")
      }
    }

    const fetchRequests = async () => {
      const snapshot = await getDocs(collection(db, "chargeRequests"))
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChargeRequest[]
      const sorted = data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setRequests(sorted)
      setPendingCount(sorted.filter(r => r.status === "pending").length)
      setLoading(false)
    }

    checkAdmin()
    fetchRequests()
  }, [])

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "chargeRequests", id), { status: "approved" })
    await setDoc(doc(db, "usageLimit", id), { blocked: false }, { merge: true })
    alert("승인 완료! 사용 제한 해제됨")
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r))
    setPendingCount(prev => prev - 1)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "대기 중"
      case "approved": return "승인 완료"
      default: return status
    }
  }

  const filteredRequests = requests.filter(r =>
    r.id.includes(searchTerm) ||
    (r.amount?.toString().includes(searchTerm))
  )

  const formatDate = (ts?: Timestamp) => {
    if (!ts) return "-"
    const date = ts.toDate()
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const downloadCSV = () => {
    const csv = ["UID,금액,상태,요청시각"].concat(
      requests.map(r => `${r.id},${r.amount},${r.status},${formatDate(r.createdAt)}`)
    ).join("\n")

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "충전요청.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <p className="p-4">불러오는 중...</p>

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">충전 요청 관리</h1>
      <div className="text-sm text-red-600 mb-4">🔔 대기 중 요청 {pendingCount}건</div>

      <div className="flex justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="UID 또는 금액 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border px-3 py-2 rounded text-sm"
        />
        <button onClick={downloadCSV} className="text-sm bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">
          엑셀 다운로드
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <p>검색 결과 없음</p>
      ) : (
        <ul className="space-y-4">
          {filteredRequests.map(req => (
            <li key={req.id} className="border rounded p-4">
              <div className="text-sm text-gray-500">UID: {req.id}</div>
              <div className="text-sm text-gray-500">요청 시각: {formatDate(req.createdAt)}</div>
              <div className="text-lg font-medium">금액: {req.amount?.toLocaleString()}원</div>
              <div className="text-sm">상태: <span className="font-semibold text-blue-600">{getStatusLabel(req.status || "")}</span></div>
              {req.status === "pending" && (
                <button
                  onClick={() => handleApprove(req.id)}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  승인하기
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

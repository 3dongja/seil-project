// src/app/seller/[sellerId]/chat/components/SummaryPanel.tsx
"use client"

import { useEffect, useState } from "react"
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Props {
  sellerId: string
}

export default function SummaryPanel({ sellerId }: Props) {
  const [messages, setMessages] = useState<any[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [chatTitle, setChatTitle] = useState("요약 보기")
  const [showGptSummary, setShowGptSummary] = useState(true)

  useEffect(() => {
    if (!sellerId) return

    const fetchSettings = async () => {
      const sellerSnap = await getDoc(doc(db, "sellers", sellerId))
      const data = sellerSnap.data()
      setChatTitle(data?.chatTitle || "요약 보기")
      setShowGptSummary(data?.showGptSummary !== false)
    }

    fetchSettings()

    const unsub = onSnapshot(query(collection(db, `chatLogs/${sellerId}/messages`), orderBy("createdAt")), snap => {
      const msgs = snap.docs.map(doc => doc.data())
      setMessages(msgs)

      const fullText = msgs.map(m => m.text).join(" ")
      if (fullText.length > 10) {
        const keywords = fullText.split(" ").filter(word => word.length > 1)
        const summary = [...new Set(keywords)].slice(0, 5).join(", ")
        setSummary(`주요 키워드: ${summary}`)
      }
    })

    return () => unsub()
  }, [sellerId])

  if (!showGptSummary) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <p className="text-gray-500">사업주가 요약 기능을 비활성화했습니다.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold text-center">{chatTitle}</h1>
      {summary ? (
        <div className="p-4 bg-yellow-100 rounded text-gray-700">
          <strong>AI 요약:</strong> {summary}
        </div>
      ) : (
        <p className="text-gray-500 text-center">요약 가능한 메시지가 아직 없습니다.</p>
      )}
    </div>
  )
}

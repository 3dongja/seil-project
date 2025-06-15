// src/app/seller/[sellerId]/chat/components/HistoryPanel.tsx
"use client"

import { useEffect, useState } from "react"
import { collection, doc, getDoc, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Props {
  sellerId: string
}

export default function HistoryPanel({ sellerId }: Props) {
  const [messages, setMessages] = useState<any[]>([])
  const [replies, setReplies] = useState<any[]>([])
  const [chatTitle, setChatTitle] = useState("상담 기록")
  const [summary, setSummary] = useState<string | null>(null)
  const [adminStatus, setAdminStatus] = useState<"online" | "gpt-only" | "offline">("offline")
  const keywordLimit = 5

  useEffect(() => {
    if (!sellerId) return

    const fetchSettings = async () => {
      const sellerSnap = await getDoc(doc(db, "sellers", sellerId))
      const data = sellerSnap.data()
      setChatTitle(data?.chatTitle || "상담 기록")

      const lastActive = data?.settings?.lastAdminActive?.toDate?.()
      if (lastActive) {
        const diff = Date.now() - lastActive.getTime()
        if (diff < 5 * 60 * 1000) setAdminStatus("online")
        else setAdminStatus("gpt-only")
      } else {
        setAdminStatus("offline")
      }
    }

    fetchSettings()

    const unsubMessages = onSnapshot(query(collection(db, `chatLogs/${sellerId}/messages`), orderBy("createdAt")), snap => {
      const msgs = snap.docs.map(doc => doc.data())
      setMessages(msgs)

      const fullText = msgs.map(m => m.text).join(" ")
      if (fullText.length > 10) {
        const keywords = fullText.split(" ").filter(word => word.length > 1)
        const summaryText = [...new Set(keywords)].slice(0, keywordLimit).join(", ")
        setSummary(`요약 키워드: ${summaryText}`)
      }
    })

    const unsubReplies = onSnapshot(query(collection(db, `chatLogs/${sellerId}/replies`), orderBy("createdAt")), snap => {
      setReplies(snap.docs.map(doc => doc.data()))
    })

    return () => {
      unsubMessages()
      unsubReplies()
    }
  }, [sellerId])

  const formatTime = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date()
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  }

  const renderStatusIcon = () => {
    switch (adminStatus) {
      case "online":
        return <span className="text-green-500">●</span>
      case "gpt-only":
        return <span className="text-yellow-500">●</span>
      default:
        return <span className="text-gray-400">●</span>
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold text-center flex items-center justify-center gap-2">
        {chatTitle} {renderStatusIcon()}
      </h1>

      {summary && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-gray-700 rounded">
          <strong>AI 요약:</strong> {summary}
        </div>
      )}

      <div className="space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="bg-gray-100 p-3 rounded">
            <p className="text-sm text-gray-800">🧑‍💬 {msg.text}</p>
            {replies.find(r => r.text === msg.text) && (
              <p className="text-sm text-gray-600 mt-1">🤖 {replies.find(r => r.text === msg.text)?.reply}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{formatTime(msg.createdAt)}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-gray-500">저장된 상담 메시지가 없습니다.</p>
        )}
      </div>
    </div>
  )
}

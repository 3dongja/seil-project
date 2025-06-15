// src/app/seller/[sellerId]/chat/components/ChatPanel.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import ChatWindow from "./ChatWindow"
import TemplateResponses from "./TemplateResponses"
import SummaryPanel from "./SummaryPanel"
import HistoryPanel from "./HistoryPanel"

interface Props {
  sellerId: string
}

interface ChatTheme {
  backgroundColor?: string
  fontColor?: string
  fontFamily?: string
  bubbleColor?: string
  reverseBubble?: boolean
  bgImageUrl?: string
}

export default function ChatPanel({ sellerId }: Props) {
  const searchParams = useSearchParams()
  const mode = searchParams.get("page") || "chat"

  const [chatTitle, setChatTitle] = useState("")
  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")
  const [chatTheme, setChatTheme] = useState<ChatTheme>({})
  const [sellerNotice, setSellerNotice] = useState("")

  useEffect(() => {
    if (!sellerId) return
    const fetchSettings = async () => {
      const docSnap = await getDoc(doc(db, "sellers", sellerId))
      const settings = docSnap.data()?.settings
      if (settings) {
        setChatTitle(settings.chatTitle || "")
        setOpenTime(settings.openTime || "")
        setCloseTime(settings.closeTime || "")
        setSellerNotice(settings.notice || "")
        setChatTheme(settings.theme || {})
      }
    }
    fetchSettings()
  }, [sellerId])

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        backgroundColor: chatTheme.backgroundColor || "#fff",
        color: chatTheme.fontColor || "#000",
        fontFamily: chatTheme.fontFamily || "inherit",
        backgroundImage: chatTheme.bgImageUrl ? `url(${chatTheme.bgImageUrl})` : undefined,
        backgroundSize: "cover",
      }}
    >
      <div className="text-center py-2 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-bold">{chatTitle}</h1>
        {openTime && closeTime && (
          <p className="text-sm text-gray-500">
            상담 가능 시간: {openTime} ~ {closeTime}
          </p>
        )}
        {sellerNotice && (
          <p className="text-sm text-blue-600 font-medium mt-1">{sellerNotice}</p>
        )}
      </div>

      {mode === "chat" && <TemplateResponses sellerId={sellerId} />}
      {mode === "chat" && <ChatWindow sellerId={sellerId} theme={chatTheme} />}
      {mode === "summary" && <SummaryPanel sellerId={sellerId} />}
      {mode === "history" && <HistoryPanel sellerId={sellerId} />}
    </div>
  )
}

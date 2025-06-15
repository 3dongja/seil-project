// src/app/admin/message/[threadId]/page.tsx
"use client"

import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { getAuth } from "firebase/auth"
import {
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Heart, Trash, AlertCircle } from "lucide-react"

function renderMessage(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      if (part.match(/\.(jpeg|jpg|gif|png)$/)) {
        return <img key={i} src={part} alt="img" className="max-w-xs rounded" />
      }
      return <a key={i} href={part} target="_blank" className="text-blue-600 underline">{part}</a>
    }
    return <span key={i}>{part}</span>
  })
}

export default function ThreadPage() {
  const { threadId } = useParams()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [lastRead, setLastRead] = useState<any>(null)
  const [sellerId, setSellerId] = useState<string>("")
  const [plan, setPlan] = useState<string>("free")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const templates = ["좋은 글 감사합니다!", "문의 확인했습니다.", "빠르게 답변드릴게요!"]

  useEffect(() => {
    const init = async () => {
      const user = getAuth().currentUser
      if (!user) return
      const uid = user.uid
      const mapSnap = await getDoc(doc(db, "sellersByUser", uid))
      const id = mapSnap.data()?.sellerId
      setSellerId(id)
      const sellerRef = doc(db, "sellers", id)
      const sellerSnap = await getDoc(sellerRef)
      setPlan(sellerSnap.data()?.plan || "free")

      const threadRef = doc(db, "messages", threadId as string)
      await updateDoc(threadRef, {
        [`lastReadBy.${id}`]: serverTimestamp()
      })
    }
    init()
  }, [threadId])

  useEffect(() => {
    if (!threadId) return
    const q = query(
      collection(db, `messages/${threadId}/chats`),
      orderBy("createdAt", "asc")
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsub()
  }, [threadId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const user = getAuth().currentUser
    if (!user || !input.trim() || plan === "free") return

    const uid = user.uid
    const mapSnap = await getDoc(doc(db, "sellersByUser", uid))
    const id = mapSnap.data()?.sellerId

    await addDoc(collection(db, `messages/${threadId}/chats`), {
      sender: id,
      text: input,
      createdAt: serverTimestamp(),
    })
    setInput("")
  }

  const handleLike = async (msgId: string) => {
    const msgRef = doc(db, `messages/${threadId}/chats/${msgId}`)
    await updateDoc(msgRef, {
      liked: true
    })
  }

  const handleDelete = async (msgId: string) => {
    await deleteDoc(doc(db, `messages/${threadId}/chats/${msgId}`))
  }

  const handleReport = async (msgId: string) => {
    await addDoc(collection(db, `messages/${threadId}/chats/${msgId}/reports`), {
      reporter: sellerId,
      reason: "이상한 대화",
      createdAt: serverTimestamp(),
    })
    alert("신고가 접수되었습니다.")
  }

  const insertChatLink = () => {
    if (sellerId) {
      setInput(`https://seil.chat/seller/${sellerId}`)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1
          const isMine = msg.sender === sellerId
          return (
            <div key={msg.id} className="relative group">
              <div className="p-2 rounded bg-white shadow">
                {renderMessage(msg.text)}
              </div>
              {isLast && msg.sender !== "owner" && (
                <div className="text-xs text-right pr-2 text-gray-400">✔✔</div>
              )}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden group-hover:flex gap-1">
                <button onClick={() => handleLike(msg.id)}>
                  <Heart size={16} className="text-pink-400 hover:scale-110 transition" />
                </button>
                {isMine && (
                  <button onClick={() => handleDelete(msg.id)}>
                    <Trash size={16} className="text-gray-400 hover:text-red-500" />
                  </button>
                )}
                <button onClick={() => handleReport(msg.id)}>
                  <AlertCircle size={16} className="text-gray-400 hover:text-orange-500" />
                </button>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      {plan !== "free" && (
        <div className="px-2 py-1 border-t flex flex-wrap gap-2 bg-gray-50">
          {templates.map((tpl, i) => (
            <button
              key={i}
              className="bg-gray-200 text-sm px-3 py-1 rounded-full"
              onClick={() => setInput(tpl)}
            >
              {tpl}
            </button>
          ))}
          <button
            className="bg-blue-100 text-sm px-3 py-1 rounded-full"
            onClick={insertChatLink}
          >
            내 상담 챗 주소 붙이기
          </button>
        </div>
      )}
      <div className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          placeholder={plan === "free" ? "유료 요금제에서만 전송 가능" : "메시지 입력"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={plan === "free"}
        />
        <button
          className="bg-blue-500 text-white px-4 rounded"
          onClick={handleSend}
          disabled={plan === "free"}
        >
          전송
        </button>
      </div>
    </div>
  )
}
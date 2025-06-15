"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import useUserRoles from "@/hooks/useUserRoles"

export default function SendMessageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const to = searchParams.get("to") || ""
  const { user } = useUserRoles()
  const [message, setMessage] = useState("")

  const handleSend = async () => {
    if (!user || !to || !message.trim()) return
    await addDoc(collection(db, "users", to, "inbox"), {
      from: user.uid,
      to,
      content: message.trim(),
      createdAt: serverTimestamp()
    })
    router.push("/community")
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-lg font-semibold">쪽지 보내기</h1>
      <p className="text-sm text-gray-600">받는 사람: <span className="font-medium">{to}</span></p>
      <textarea
        className="w-full border p-2 rounded"
        rows={6}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="내용을 입력하세요"
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        전송하기
      </button>
    </div>
  )
}

// src/app/admin/notices/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import BackButton from "@/components/common/BackButton"
import { logAdminAction } from "@/lib/logging/logAdminAction"
import { useUser } from "@/hooks/useUser" // 현재 로그인된 사용자 정보 훅 (예시)

export default function NoticeCreatePage() {
  const router = useRouter()
  const { user } = useUser() // 현재 로그인된 사용자 정보
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [audience, setAudience] = useState<"all" | "consumer" | "seller">("all")
  const params = useParams()
  const id = params?.id as string | undefined

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      const snap = await getDoc(doc(db, "adminNotices", id))
      if (snap.exists()) {
        const data = snap.data()
        setTitle(data.title)
        setContent(data.content)
        setAudience(data.audience || "all")
      }
    }
    loadData()
  }, [id])

  const handleSubmit = async () => {
    if (!title || !content) {
      alert("제목과 내용을 입력하세요")
      return
    }

    if (id) {
      await updateDoc(doc(db, "adminNotices", id), {
        title,
        content,
        audience,
        updatedAt: serverTimestamp(),
      })
      if (user?.uid) {
        await logAdminAction({
          uid: user.uid,
          action: "공지 수정",
          detail: `제목: ${title}, ID: ${id}`,
        })
      }
      alert("공지 수정 완료")
    } else {
      const docRef = await addDoc(collection(db, "adminNotices"), {
        title,
        content,
        audience,
        createdAt: serverTimestamp(),
        isActive: true,
        isDraft: false,
      })
      if (user?.uid) {
        await logAdminAction({
          uid: user.uid,
          action: "공지 등록",
          detail: `제목: ${title}, ID: ${docRef.id}`,
        })
      }
      alert("공지 등록 완료")
    }
    router.push("/admin/notices/list")
  }

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-xl font-bold mb-4">📢 {id ? "공지 수정" : "새 공지 등록"}</h1>
      <input
        className="w-full p-2 border mb-2"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full p-2 border h-40 mb-2"
        placeholder="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <select
        className="w-full p-2 border mb-4"
        value={audience}
        onChange={(e) => setAudience(e.target.value as "all" | "consumer" | "seller")}
      >
        <option value="all">전체</option>
        <option value="consumer">소비자 전용</option>
        <option value="seller">사업자 전용</option>
      </select>
      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded"
      >
        {id ? "수정하기" : "등록"}
      </button>
    </div>
  )
}

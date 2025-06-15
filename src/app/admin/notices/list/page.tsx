// src/app/admin/notices/edit/[id]/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function NoticeEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [audience, setAudience] = useState<"all" | "consumer" | "seller">("all")

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return
      const ref = doc(db, "adminNotices", id as string)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        setTitle(data.title)
        setContent(data.content)
        setAudience(data.audience || "all")
      }
    }
    fetchNotice()
  }, [id])

  const handleUpdate = async () => {
    if (!id) return
    await updateDoc(doc(db, "adminNotices", id as string), {
      title,
      content,
      audience,
      updatedAt: serverTimestamp(),
    })
    alert("공지 수정 완료")
    router.back()
  }

  const handleDuplicate = async () => {
    await addDoc(collection(db, "adminNotices"), {
      title,
      content,
      audience,
      createdAt: serverTimestamp(),
      isDraft: true,
    })
    alert("공지 복제 및 임시저장 완료")
    router.push("/admin/notices/list")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← 돌아가기
      </button>
      <h1 className="text-xl font-bold mb-4">공지사항 수정</h1>
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
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          저장
        </button>
        <button
          onClick={handleDuplicate}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          복제하여 임시저장
        </button>
      </div>
    </div>
  )
}
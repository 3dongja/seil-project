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

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return
      const ref = doc(db, "adminNotices", id as string)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        setTitle(data.title)
        setContent(data.content)
      }
    }
    fetchNotice()
  }, [id])

  const handleUpdate = async () => {
    if (!id) return
    await updateDoc(doc(db, "adminNotices", id as string), {
      title,
      content,
      updatedAt: serverTimestamp(),
    })
    alert("공지 수정 완료")
    router.push("/admin/notices/list")
  }

  const handleDuplicate = async () => {
    await addDoc(collection(db, "adminNotices"), {
      title,
      content,
      createdAt: serverTimestamp(),
      isDraft: true,
    })
    alert("공지 복제 및 임시저장 완료")
    router.push("/admin/notices/list")
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">공지사항 수정</h1>
      <input
        className="w-full p-2 border mb-2"
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full p-2 border h-40"
        placeholder="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
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

// src/community/write/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import useUserRoles from "@/hooks/useUserRoles"

export default function WritePage() {
  const router = useRouter()
  const { user } = useUserRoles()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [category, setCategory] = useState("free")

  useEffect(() => {
    const saved = localStorage.getItem("communityDraft")
    if (saved) {
      const draft = JSON.parse(saved)
      setTitle(draft.title || "")
      setContent(draft.content || "")
      setTags(draft.tags || "")
      setCategory(draft.category || "free")
    }
  }, [])

  const handleSubmit = async () => {
  if (!user || !title || !content || !category)
    return alert("모든 필드를 입력해주세요.");

  await addDoc(collection(db, `community/${category}/posts`), {
    title,
    content,
    author: user.displayName || "익명",
    uid: user.uid,
    createdAt: Timestamp.now(),
    tags: (tags ?? "")
      .split("#")
      .map((t: string) => t.trim())
      .filter((t) => t),
    category,
    likes: 0,
    commentCount: 0,
    views: 0,
    topFixed: false,
    dailyTop: false
  })
    localStorage.removeItem("communityDraft")
    router.push(`/community/${category}`)
  }

  const handleSaveDraft = () => {
    const draft = {
      title,
      content,
      tags,
      category
    }
    localStorage.setItem("communityDraft", JSON.stringify(draft))
    alert("임시 저장되었습니다.")
  }

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto md:max-w-2xl pb-32">
      <h1 className="text-xl font-bold">글쓰기</h1>
      <input
        className="w-full border px-3 py-2 rounded text-base"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border px-3 py-2 rounded text-base min-h-[300px]"
        placeholder="내용을 입력하세요"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <input
        className="w-full border px-3 py-2 rounded text-base"
        placeholder="#태그 형식으로 입력하세요 (예: #뉴스#공지)"
        value={tags}
        onChange={e => setTags(e.target.value)}
      />
      <select
        className="w-full border px-3 py-2 rounded text-base"
        value={category}
        onChange={e => setCategory(e.target.value)}
      >
        <option value="free">자유 게시판</option>
        <option value="success">사업성공 SSEOL</option>
        <option value="fail">사업실패 SSEOL</option>
      </select>
      <button
        className="bg-blue-600 text-white px-4 py-3 rounded w-full text-lg"
        onClick={handleSubmit}
      >
        작성하기
      </button>
      <div className="flex gap-2">
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded w-full text-base"
          onClick={handleSaveDraft}
        >
          임시 저장
        </button>
        <button
          className="bg-gray-300 text-black px-4 py-2 rounded w-full text-base"
          onClick={() => {
            const saved = localStorage.getItem("communityDraft")
            if (saved) {
              const draft = JSON.parse(saved)
              setTitle(draft.title || "")
              setContent(draft.content || "")
              setTags(draft.tags || "")
              setCategory(draft.category || "free")
              alert("임시 저장 불러오기 완료")
            } else {
              alert("불러올 임시 저장이 없습니다.")
            }
          }}
        >
          임시 저장 불러오기
        </button>
      </div>
    </div>
  )
}

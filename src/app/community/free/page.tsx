// src/community/free/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { auth } from "@/lib/firebase"

const categories = [
  { id: "free", name: "자유 게시판" },
  { id: "sseol", name: "사업 성공 sseol" },
  { id: "fail", name: "사업 실패 sseol" },
]

export default function FreeCommunityPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("free")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const router = useRouter()
  const user = auth.currentUser

  useEffect(() => {
    const fetchPosts = async () => {
      const snap = await getDocs(collection(db, "posts"))
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPosts(list)
    }
    fetchPosts()
  }, [])

  const handleClick = async (id: string) => {
    await updateDoc(doc(db, "posts", id), {
      views: increment(1)
    })
    router.push(`/community/${id}`)
  }

  const handleLike = async (post: any) => {
    if (!user) return alert("로그인이 필요합니다.")
    const liked = post.likedBy?.includes(user.uid)
    const postRef = doc(db, "posts", post.id)
    await updateDoc(postRef, {
      likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    })
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? {
              ...p,
              likedBy: liked
                ? p.likedBy.filter((id: string) => id !== user.uid)
                : [...(p.likedBy || []), user.uid]
            }
          : p
      )
    )
  }

  const filtered = posts
    .filter(post => {
      const keyword = search.toLowerCase()
      const match =
        post.category === selectedCategory &&
        (post.title?.toLowerCase().includes(keyword) ||
          post.content?.toLowerCase().includes(keyword) ||
          post.author?.toLowerCase().includes(keyword))
      return match
    })
    .sort((a, b) => {
      const aPinned = a.pinnedUntil && new Date(a.pinnedUntil) > new Date()
      const bPinned = b.pinnedUntil && new Date(b.pinnedUntil) > new Date()
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1
      return 0
    })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto md:max-w-3xl">
      <div className="flex justify-around gap-2 text-center">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => {
              setSelectedCategory(cat.id)
              setCurrentPage(1)
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="검색어를 입력하세요"
        className="w-full border px-3 py-2 rounded text-sm"
      />

      <div className="divide-y border rounded overflow-hidden bg-white">
        {currentItems.map(post => (
          <div
            key={post.id}
            className="px-4 py-3 hover:bg-gray-50 text-sm"
          >
            <div onClick={() => handleClick(post.id)} className="cursor-pointer">
              <div className="font-semibold text-base truncate mb-1">
                {post.title}
                {post.pinnedUntil && new Date(post.pinnedUntil) > new Date() && (
                  <span className="ml-2 text-red-500 text-xs">📌</span>
                )}
              </div>
              <div className="text-gray-600 flex justify-between text-xs">
                <span>{post.author}</span>
                <span className="flex gap-2">
                  <span>👍 {post.likedBy?.length || 0}</span>
                  <span>💬 {post.commentCount || 0}</span>
                  <span>👁️ {post.views || 0}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => handleLike(post)}
              className="text-xs text-blue-500 mt-2 underline"
            >
              {post.likedBy?.includes(user?.uid) ? "좋아요 취소" : "좋아요"}
            </button>
          </div>
        ))}
        {currentItems.length === 0 && (
          <div className="px-4 py-6 text-center text-gray-400 text-sm">게시글이 없습니다.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setCurrentPage(n)}
              className={`px-3 py-1 rounded ${currentPage === n ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

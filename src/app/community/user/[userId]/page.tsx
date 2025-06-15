// src/community/user/[userId]/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function UserPostsPage() {
  const router = useRouter()
  const { userId } = useParams() as { userId: string }
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      const ref = collection(db, "posts")
      const q = query(ref, where("authorId", "==", userId))
      const snap = await getDocs(q)
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    if (userId) fetchPosts()
  }, [userId])

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto md:max-w-3xl">
      <h1 className="text-xl font-bold">작성자 게시글</h1>
      <button
        onClick={() => router.push(`/community/message/new?to=${userId}`)}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
      >
        쪽지 보내기
      </button>
      {posts.length === 0 && <p className="text-gray-500">게시글이 없습니다.</p>}
      <div className="grid gap-3">
        {posts.map(post => (
          <div key={post.id} className="p-4 border rounded bg-white cursor-pointer" onClick={() => router.push(`/community/${post.id}`)}>
            <h2 className="font-semibold text-base">{post.title}</h2>
            <p className="text-sm text-gray-600">{post.category} • 좋아요 {post.likes || 0} • 댓글 {post.commentCount || 0}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

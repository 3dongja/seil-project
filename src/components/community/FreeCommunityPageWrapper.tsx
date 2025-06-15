// src/community/FreeCommunityPageWrapper.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CommunityPost } from "@/types/community";

export default function FreeCommunityPage({ defaultCategory }: { defaultCategory: string }) {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const postRef = collection(db, `community/${defaultCategory}/posts`);
      const q = query(postRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const newPosts: CommunityPost[] = [];
      querySnapshot.forEach((doc) => {
        newPosts.push({ ...(doc.data() as CommunityPost), id: doc.id });
      });
      setPosts(newPosts);
    };
    fetchPosts();
  }, [defaultCategory]);

  const filteredPosts = posts.filter((post) => {
    const keyword = search.toLowerCase();
    return post.title.toLowerCase().includes(keyword) || post.author.toLowerCase().includes(keyword);
  });

  return (
    <main className="min-h-screen bg-white p-4 space-y-4">
      <h1 className="text-lg font-bold">📘 커뮤니티 게시판 - {defaultCategory}</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="검색어를 입력하세요"
        className="w-full p-2 border rounded"
      />
      <button
        onClick={() => router.push("/community/write")}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        ✍️ 글쓰기
      </button>

      <div className="space-y-2">
        {filteredPosts.length === 0 ? (
          <p className="text-gray-500">게시글이 없습니다.</p>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="border p-3 rounded shadow hover:bg-gray-50 cursor-pointer"
              onClick={() => router.push(`/community/${defaultCategory}/${post.id}`)}
            >
              <p className="font-semibold">{post.title}</p>
              <p className="text-xs text-gray-500">{post.author} · {post.createdAt?.toDate?.().toLocaleDateString?.()}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

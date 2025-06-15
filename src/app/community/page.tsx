// src/app/seller-community/page.tsx

"use client";

import { useRouter } from "next/navigation";
import BackButton from "@/components/common/BackButton";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SellerCommunityPage() {
  const router = useRouter();
  const [latest, setLatest] = useState<{ id: string; title: string; board: string }[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      const boards = ["free", "success", "fail"];
      const allPosts: any[] = [];
      for (const board of boards) {
        const snap = await getDocs(query(collection(db, `community/${board}/posts`), orderBy("createdAt", "desc"), limit(5)));
        snap.forEach(doc => allPosts.push({ id: doc.id, title: doc.data().title, board }));
      }
      setLatest(allPosts);
    };
    fetchLatest();
  }, []);

  return (
    <main className="min-h-screen p-4 space-y-4 bg-white">
      <BackButton />
      <h1 className="text-xl font-bold">📢 사업주 커뮤니티 대시보드</h1>
      <p className="text-sm text-gray-600">커뮤니티에 참여하고 다른 사업자들과 경험을 나눠보세요.</p>

      <div className="grid gap-4">
        <button
          onClick={() => router.push("/community/free")}
          className="p-4 border rounded-2xl shadow-sm text-left bg-gray-50 hover:bg-gray-100 transition"
        >
          🗣 자유게시판 보기
        </button>

        <button
          onClick={() => router.push("/community/success")}
          className="p-4 border rounded-2xl shadow-sm text-left bg-gray-50 hover:bg-gray-100 transition"
        >
          🏆 사업성공 SSEOL 게시판 보기
        </button>

        <button
          onClick={() => router.push("/community/fail")}
          className="p-4 border rounded-2xl shadow-sm text-left bg-gray-50 hover:bg-gray-100 transition"
        >
          🧯 사업실패 SSEOL 게시판 보기
        </button>

        <button
          onClick={() => router.push("/community/write")}
          className="bg-blue-600 text-white px-4 py-3 rounded-2xl text-center hover:bg-blue-700 transition"
        >
          ✍️ 글쓰기
        </button>

        <button
          onClick={() => router.push("/community/message/inbox")}
          className="border p-3 rounded-2xl text-left bg-gray-50 hover:bg-gray-100 transition"
        >
          💌 받은 쪽지함 보기
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">🆕 최근 게시글</h2>
        <ul className="mt-2 space-y-2">
          {latest.map(post => (
            <li
              key={post.id}
              onClick={() => router.push(`/community/${post.board}/${post.id}`)}
              className="text-sm text-blue-700 underline cursor-pointer hover:text-blue-900 transition"
            >
              [{post.board}] {post.title}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

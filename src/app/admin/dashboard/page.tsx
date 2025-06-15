"use client";

import { useUserRoles } from "@/hooks/useUserRoles";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { isAdmin } = useUserRoles();
  const [stats, setStats] = useState({ posts: 0, comments: 0, reports: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    const loadStats = async () => {
      const [postsSnap, commentsSnap, reportsSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "communityPosts")),
        getDocs(collection(db, "communityComments")),
        getDocs(collection(db, "reports")),
        getDocs(collection(db, "users")),
      ]);
      setStats({
        posts: postsSnap.size,
        comments: commentsSnap.size,
        reports: reportsSnap.size,
        users: usersSnap.size,
      });
      setLoading(false);
    };

    loadStats();
  }, [isAdmin]);

  if (!isAdmin) return <div className="p-6 text-red-500">🚫 관리자 권한이 없습니다</div>;
  if (loading) return <div className="p-6">📊 통계 로딩 중...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      <ul className="list-disc pl-5">
        <li>총 게시글 수: {stats.posts}</li>
        <li>총 댓글 수: {stats.comments}</li>
        <li>총 신고 수: {stats.reports}</li>
        <li>전체 사용자 수: {stats.users}</li>
      </ul>

      <section className="flex flex-wrap gap-3 pt-6">
        <Link href="/admin/community/messages">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            📬 쪽지 목록
          </button>
        </Link>
        <Link href="/admin/community/reports">
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            🚨 신고 관리
          </button>
        </Link>
        <Link href="/admin/community/users">
          <button className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
            🧑 사용자 목록
          </button>
        </Link>
      </section>
    </div>
  );
}

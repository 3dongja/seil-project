"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useUserRoles from "@/hooks/useUserRoles";

export default function AdminReportsPage() {
  const { isAdmin } = useUserRoles();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return router.push("/");
    const fetchReports = async () => {
      const snap = await getDocs(collection(db, "reports/posts"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(list);
    };
    fetchReports();
  }, [isAdmin]);

  const handleDelete = async (postId: string, authorId: string) => {
    await deleteDoc(doc(db, "posts", postId));
    await deleteDoc(doc(db, "reports/posts", postId));
    await updateDoc(doc(db, "sellerInfo", authorId), {
      reportCount: increment(1)
    });
    setReports(prev => prev.filter(r => r.id !== postId));
  };

  const handleDismiss = async (postId: string) => {
    await deleteDoc(doc(db, "reports/posts", postId));
    setReports(prev => prev.filter(r => r.id !== postId));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">신고된 게시글</h1>
      {reports.length === 0 && <p className="text-gray-500">신고된 항목이 없습니다.</p>}
      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id} className="p-4 border rounded shadow bg-white">
            <h2 className="font-semibold">{report.title}</h2>
            <p className="text-sm text-gray-600 mt-1">신고사유: {report.reason || "미입력"}</p>
            <p className="text-sm text-gray-500">신고수: {report.count || 1}</p>
            <div className="flex gap-2 mt-2">
              <button className="text-blue-600 underline" onClick={() => router.push(`/community/${report.id}`)}>게시글 보기</button>
              <button className="text-red-600 underline" onClick={() => handleDelete(report.id, report.authorId)}>강제 삭제</button>
              <button className="text-gray-600 underline" onClick={() => handleDismiss(report.id)}>신고 무시</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
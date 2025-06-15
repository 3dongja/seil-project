// src/app/admin/community/comments/page.tsx

"use client"

import { useEffect, useState } from "react"
import { collection, deleteDoc, doc, getDocs, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AdminCommentReportsPage() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    const fetchReports = async () => {
      const snap = await getDocs(collection(db, "reports_comments"))
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    fetchReports()
  }, [])

  const handleDelete = async (commentId: string, userId: string, reportId: string) => {
    await deleteDoc(doc(db, "comments", commentId))
    await deleteDoc(doc(db, "reports_comments", reportId))
    const sellerRef = doc(db, "sellerInfo", userId)
    await updateDoc(sellerRef, { reportCount: increment(1) })
    setReports(prev => prev.filter(r => r.id !== reportId))
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">신고된 댓글</h1>
      {reports.length === 0 && <p className="text-gray-500">신고 내역이 없습니다.</p>}
      <ul className="space-y-4">
        {reports.map(report => (
          <li key={report.id} className="p-4 border rounded bg-white shadow">
            <p className="font-semibold">신고 사유: {report.reason}</p>
            <p className="text-sm text-gray-600">댓글 ID: {report.commentId}</p>
            <p className="text-sm text-gray-600">작성자 ID: {report.authorId}</p>
            <button
              onClick={() => handleDelete(report.commentId, report.authorId, report.id)}
              className="bg-red-500 text-white px-3 py-1 text-sm rounded mt-2"
            >
              댓글 삭제 및 처리
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

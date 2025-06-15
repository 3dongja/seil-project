// src/app/admin/logs/page.tsx

"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  getDoc,
  doc,
  orderBy,
  query,
  Timestamp,
  where,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import BackButton from "@/components/common/BackButton"

interface AdminLog {
  uid: string
  action: string
  detail: string
  createdAt: Timestamp
}

export default function AdminLogListPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [actionFilter, setActionFilter] = useState("전체")
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchLogs = async (reset = false) => {
    const q = query(
      collection(db, "adminLogs"),
      orderBy("createdAt", "desc"),
      ...(actionFilter !== "전체" ? [where("action", "==", actionFilter)] : []),
      ...(reset ? [limit(10)] : [startAfter(lastDoc!), limit(10)])
    )

    const snap = await getDocs(q)
    const newLogs = snap.docs.map(doc => ({ ...(doc.data() as AdminLog), createdAt: doc.data().createdAt }))
    setLogs(prev => (reset ? newLogs : [...prev, ...newLogs]))
    setLastDoc(snap.docs[snap.docs.length - 1] || null)
    setHasMore(snap.size === 10)

    const uniqueUids = Array.from(new Set(newLogs.map(l => l.uid)))
    const nameMap: Record<string, string> = { ...names }
    for (const uid of uniqueUids) {
      if (!nameMap[uid]) {
        const adminSnap = await getDoc(doc(db, "adminUsers", uid))
        nameMap[uid] = adminSnap.exists() ? (adminSnap.data().displayName || uid) : uid
      }
    }
    setNames(nameMap)
  }

  useEffect(() => {
    fetchLogs(true)
  }, [actionFilter])

  return (
    <div className="p-4">
      <BackButton />
      <h1 className="text-xl font-bold mb-4">🕵️‍♀️ 관리자 로그</h1>

      <select
        className="mb-4 p-2 border rounded"
        value={actionFilter}
        onChange={(e) => setActionFilter(e.target.value)}
      >
        <option value="전체">전체</option>
        <option value="공지 등록">공지 등록</option>
        <option value="공지 수정">공지 수정</option>
      </select>

      <ul className="space-y-2">
        {logs.map((log, index) => (
          <li key={index} className="border p-3 rounded">
            <div className="font-medium">{log.action}</div>
            <div className="text-sm text-gray-600">{log.detail}</div>
            <div className="text-xs text-gray-400 mt-1">
              {log.createdAt.toDate().toLocaleString()} | {names[log.uid] || log.uid} ({log.uid})
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-800 rounded shadow"
          disabled={loadingMore}
          onClick={() => {
            setLoadingMore(true)
            fetchLogs(false).finally(() => setLoadingMore(false))
          }}
        >
          더 보기
        </button>
      )}
    </div>
  )
}

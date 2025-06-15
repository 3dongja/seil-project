// src/app/admin/message/page.tsx
"use client"

import { useEffect, useState } from "react"
import { getAuth } from "firebase/auth"
import { collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore"
import Link from "next/link"
import { db } from "@/lib/firebase"

export default function MessageListPage() {
  const [threads, setThreads] = useState<any[]>([])
  const [sellerId, setSellerId] = useState<string>("")

  useEffect(() => {
    const fetchThreads = async () => {
      const user = getAuth().currentUser
      if (!user) return
      const uid = user.uid
      const mapSnap = await getDoc(doc(db, "sellersByUser", uid))
      const id = mapSnap.data()?.sellerId
      setSellerId(id)

      const q = query(collection(db, "messages"), orderBy("updatedAt", "desc"))
      const snap = await getDocs(q)
      const list = snap.docs
        .filter((doc) => doc.data()?.participants?.includes(id))
        .map((doc) => ({ id: doc.id, ...doc.data() }))
      setThreads(list)
    }
    fetchThreads()
  }, [])

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">쪽지 스레드 목록</h1>
      <ul className="space-y-2">
        {threads.map((thread) => (
          <li key={thread.id} className="border p-3 rounded hover:bg-gray-50">
            <Link href={`/admin/message/${thread.id}`} className="block">
              <div className="text-sm font-medium">스레드 ID: {thread.id}</div>
              <div className="text-xs text-gray-600">
                마지막 활동: {new Date(thread.updatedAt?.seconds * 1000).toLocaleString()}
              </div>
              {thread.lastReadBy?.[sellerId] === undefined && (
                <div className="text-xs text-red-500">읽지 않음</div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
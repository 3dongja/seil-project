// src/app/seller-logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import useUserRoles from "@/hooks/useUserRoles";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  category: string;
  details: Record<string, string>;
  fileUrl?: string;
  fileName?: string;
  createdAt: any;
  summary?: string;
}

export default function SellerLogsPage() {
  const { user, isSeller, loading } = useUserRoles();
  const [logs, setLogs] = useState<Inquiry[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && isSeller) {
      const q = query(
        collection(db, "sellers", user.uid, "inquiries"),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Inquiry[];
        setLogs(items);
      });
      return () => unsubscribe();
    }
  }, [loading, user, isSeller]);

  const handleDelete = async (log: Inquiry) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const refDoc = doc(db, "sellers", user!.uid, "inquiries", log.id);
      await deleteDoc(refDoc);
      if (log.fileUrl && log.fileName) {
        const storageRef = ref(storage, `sellers/${user!.uid}/inquiries/${log.id}/${log.fileName}`);
        await deleteObject(storageRef);
      }
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const formatTime = (ts: any) => {
    if (!ts?.seconds) return "";
    const date = new Date(ts.seconds * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000 * 2 && date.getDate() === now.getDate() - 1) return "어제";
    return date.toLocaleDateString();
  };

  return (
    <main className="h-screen bg-gray-50 flex flex-col p-4">
      <h1 className="text-xl font-bold mb-4">📨 상담 요약 로그</h1>

      <div className="flex-1 overflow-y-auto space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="relative rounded-xl shadow-md bg-white hover:bg-gray-50 overflow-hidden"
          >
            <div className="flex items-start p-4">
              <div
                className="flex-1 cursor-pointer"
                onClick={() =>
                  router.push(`/chat-summary/${user!.uid}/${log.id}/summary`)
                }
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{formatTime(log.createdAt)}</p>
                  <div className="space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/seller-logs/${log.id}/summary/edit`);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      ✏️ 수정
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(log);
                      }}
                      className="text-sm text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {log.name} / {log.phone}
                </p>
                <p className="text-sm text-gray-700">
                  {log.category} 관련 문의 - {log.summary ? "요약됨" : "요약 준비 중"}
                </p>
                {log.summary && (
                  <p className="text-sm text-gray-600 italic mt-1">
                    📝 {log.summary.slice(0, 80)}...
                  </p>
                )}
                {log.fileUrl && (
                  <p className="text-sm text-blue-600 underline mt-1">
                    <a href={log.fileUrl} target="_blank" rel="noopener noreferrer">
                      📎 첨부파일 보기
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
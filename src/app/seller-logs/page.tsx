// src/app/seller-logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
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
}

export default function SellerLogsPage() {
  const { user, isSeller, loading } = useUserRoles();
  const [logs, setLogs] = useState<Inquiry[]>([]);
  const router = useRouter();

  const fetchLogs = async () => {
    if (!loading && user && isSeller) {
      const q = query(collection(db, "sellers", user.uid, "inquiries"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Inquiry[];
      setLogs(items);
    }
  };

  useEffect(() => {
    fetchLogs();
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
      fetchLogs();
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-bold">📨 상담 요약 로그</h1>

      {logs.map((log) => (
        <div
          key={log.id}
          className="border rounded-lg p-4 bg-white shadow hover:bg-gray-50 cursor-pointer relative"
        >
          <button
            onClick={() => handleDelete(log)}
            className="absolute top-2 right-2 text-sm text-red-500 hover:underline"
          >
            삭제
          </button>
          <div onClick={() => router.push(`/seller/chats/${log.id}`)}>
            <p className="text-sm text-gray-500">
              {log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleString() : "시간 정보 없음"}
            </p>
            <p className="font-medium">{log.name} / {log.phone}</p>
            <p className="text-sm text-gray-700">
              {log.category} 관련 문의 - 요약 준비 중
            </p>
            {log.fileUrl && (
              <p className="text-sm text-blue-600 underline mt-1">
                <a href={log.fileUrl} target="_blank" rel="noopener noreferrer">📎 첨부파일 보기</a>
              </p>
            )}
          </div>
        </div>
      ))}
    </main>
  );
}

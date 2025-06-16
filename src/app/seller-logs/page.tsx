/* /src/app/seller-logs/page.tsx */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import useUserRoles from "@/hooks/useUserRoles";

interface Inquiry {
  id: string;
  summary: string;
  customerName: string;
  createdAt: string;
}

export default function SellerLogsPage() {
  const { user, isSeller, loading } = useUserRoles();
  const [logs, setLogs] = useState<Inquiry[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && isSeller) {
      setLogs([
        {
          id: "example-123",
          summary: "환불 요청 - 김민수 010-1234-5678",
          customerName: "김민수",
          createdAt: "2024-06-16 10:12"
        }
      ]);
    }
  }, [loading, user, isSeller]);

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setLogs((prev) => prev.filter((log) => log.id !== id));
    // 실제 삭제 로직은 아래 주석을 해제해 사용
    // await deleteDoc(doc(db, "sellers", user.uid, "inquiries", id));
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
            onClick={() => handleDelete(log.id)}
            className="absolute top-2 right-2 text-sm text-red-500 hover:underline"
          >
            삭제
          </button>
          <div onClick={() => router.push(`/seller/chats/${log.id}`)}>
            <p className="text-sm text-gray-500">{log.createdAt}</p>
            <p className="font-medium">{log.customerName}</p>
            <p className="text-sm text-gray-700">{log.summary}</p>
          </div>
        </div>
      ))}
    </main>
  );
}

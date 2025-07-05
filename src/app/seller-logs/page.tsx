// ✅ seller-logs/page.tsx: ✏️ 수정 버튼 제거 (소비자 정보는 수정 불가)

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
  getDoc,
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
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const items: Inquiry[] = [];
        for (const docSnap of snapshot.docs) {
          const base = { id: docSnap.id, ...docSnap.data() } as Inquiry;
          const summaryRef = doc(db, "sellers", user.uid, "inquiries", docSnap.id, "summary", "auto");
          const summarySnap = await getDoc(summaryRef);
          const autoSummary = summarySnap.exists() ? summarySnap.data().summary : null;
          items.push({ ...base, summary: autoSummary || base.summary });
        }
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
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{formatTime(log.createdAt)}</p>
                  <button
                    onClick={() => handleDelete(log)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {log.name} / {log.phone}
                </p>
                <p className="text-sm text-gray-700">
                  {log.category} 관련 문의 - {log.summary ? "요약됨" : "요약 준비 중"}
                </p>
                {log.summary && (
                  <p className="text-sm text-gray-600 italic mt-1">
                    🧠 GPT 요약: {log.summary.slice(0, 80)}...
                  </p>
                )}
                {log.details && (
                  <div className="text-sm text-gray-700 mt-2">
                    <p className="font-semibold">📝 소비자 입력 요약:</p>
                    <ul className="list-disc list-inside text-gray-600">
                      {Object.entries(log.details).map(([k, v]) => (
                        <li key={k}>{k}: {v}</li>
                      ))}
                    </ul>
                  </div>
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

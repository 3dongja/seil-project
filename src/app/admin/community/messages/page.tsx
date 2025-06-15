"use client";

import { useUserRoles } from "@/hooks/useUserRoles";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDocs, getDoc, updateDoc } from "firebase/firestore";

export default function AdminMessagesPage() {
  const { isAdmin } = useUserRoles();
  const [messages, setMessages] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [reportCounts, setReportCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchMessages = async () => {
      const snap = await getDocs(collection(db, "messages"));
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchReports = async () => {
      const snap = await getDocs(collection(db, "reports"));
      const counts: { [key: string]: number } = {};
      snap.docs.forEach(doc => {
        const { targetUserId } = doc.data();
        if (targetUserId) {
          counts[targetUserId] = (counts[targetUserId] || 0) + 1;
        }
      });
      setReportCounts(counts);
    };

    Promise.all([fetchMessages(), fetchReports()]).finally(() => setLoading(false));
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "messages", id));
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const handleBlockUser = async (userId: string) => {
    const userRef = doc(db, "sellerInfo", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, { blocked: true });
      setBlockedUsers(prev => [...prev, userId]);
    }
  };

  if (!isAdmin) return <div className="p-6 text-red-500">🚫 관리자 권한이 없습니다</div>;
  if (loading) return <div className="p-6">📨 쪽지 로딩 중...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">전체 쪽지함</h1>
      {messages.length === 0 && <p className="text-gray-500">쪽지가 없습니다.</p>}
      <ul className="space-y-4">
        {messages.map(msg => (
          <li key={msg.id} className="p-4 border rounded bg-white shadow">
            <p><strong>From:</strong> {msg.senderId}</p>
            <p><strong>To:</strong> {msg.receiverId}</p>
            {reportCounts[msg.senderId] >= 5 && (
              <span className="inline-block text-xs text-red-600 font-semibold">🚫 신고 누적 {reportCounts[msg.senderId]}회</span>
            )}
            <p className="text-sm text-gray-700 whitespace-pre-line">{msg.content}</p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleDelete(msg.id)}
                className="bg-red-500 text-white px-3 py-1 text-sm rounded"
              >
                삭제
              </button>
              <button
                onClick={() => handleBlockUser(msg.senderId)}
                className="bg-yellow-500 text-white px-3 py-1 text-sm rounded"
                disabled={blockedUsers.includes(msg.senderId)}
              >
                {blockedUsers.includes(msg.senderId) ? "차단됨" : "발신자 차단"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

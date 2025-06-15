"use client";

import { useUserRoles } from "@/hooks/useUserRoles";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";

export default function AdminUsersPage() {
  const { isAdmin } = useUserRoles();
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [lastLog, setLastLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    };

    const fetchLogs = async () => {
      setLoadingLogs(true);
      const logQuery = query(
        collection(db, "userLogs"),
        where("type", "in", ["search", "navigate"]),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(logQuery);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
      setLastLog(snapshot.docs[snapshot.docs.length - 1]);
      setLoadingLogs(false);
    };

    Promise.all([fetchUsers(), fetchLogs()]).finally(() => setLoading(false));
  }, [isAdmin]);

  const loadMoreLogs = async () => {
    if (!lastLog) return;
    setLoadingLogs(true);
    const logQuery = query(
      collection(db, "userLogs"),
      where("type", "in", ["search", "navigate"]),
      orderBy("createdAt", "desc"),
      startAfter(lastLog),
      limit(10)
    );
    const snapshot = await getDocs(logQuery);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setLogs((prev) => [...prev, ...data]);
    setLastLog(snapshot.docs[snapshot.docs.length - 1]);
    setLoadingLogs(false);
  };

  if (!isAdmin) return <div className="p-6 text-red-500">🚫 관리자 권한이 없습니다</div>;
  if (loading) return <div className="p-6">🧑 사용자 정보 및 로그 로딩 중...</div>;

  return (
    <div className="p-6 space-y-6">
      <section>
        <h1 className="text-xl font-bold">🧑 전체 사용자</h1>
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="p-3 border rounded">
              <div><strong>UID:</strong> {user.id}</div>
              <div><strong>이메일:</strong> {user.email || "(미입력)"}</div>
              <div><strong>이름:</strong> {user.name || "(미입력)"}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold">📄 사용자 이상 로그</h2>
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="p-3 border rounded bg-gray-50">
              <div><strong>유형:</strong> {log.type}</div>
              <div><strong>UID:</strong> {log.uid}</div>
              <div><strong>내용:</strong> {log.message}</div>
              <div><strong>시간:</strong> {new Date(log.createdAt?.toDate()).toLocaleString()}</div>
            </li>
          ))}
        </ul>
        {lastLog && (
          <button
            className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
            onClick={loadMoreLogs}
            disabled={loadingLogs}
          >
            더 보기
          </button>
        )}
      </section>
    </div>
  );
}

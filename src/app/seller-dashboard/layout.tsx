"use client";

import { ReactNode, useEffect, useState } from "react";
import { TabBar } from "@/components/TabBar";
import { db } from "@/lib/firebase";
import { useUser } from "@/hooks/useUser";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function SellerDashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [status, setStatus] = useState<'online' | 'away' | 'bot'>('bot');

  useEffect(() => {
    if (!user?.uid) return;

    const fetchStatus = async () => {
      const ref = doc(db, "users", user.uid, "seller", "profile");
      const snap = await getDoc(ref);
      const data = snap.data();

      if (data?.lastAdminActive?.toDate) {
        const last = data.lastAdminActive.toDate().getTime();
        const now = Date.now();
        const diff = now - last;
        if (diff < 10 * 60 * 1000) {
          setStatus("online");
        } else {
          setStatus("bot");
        }
      } else {
        setStatus("bot");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    const interval = setInterval(() => {
      updateDoc(doc(db, "users", user.uid, "seller", "profile"), {
        lastAdminActive: serverTimestamp(),
      });
    }, 570000); // 9분 30초
    return () => clearInterval(interval);
  }, [user]);

  const statusColor = status === 'online' ? 'bg-green-500' : status === 'bot' ? 'bg-yellow-400' : 'bg-gray-400';
  const statusText = status === 'online' ? '접속 중' : status === 'bot' ? '챗봇 대응' : '부재중';

  return (
    <>
      <main className="pb-20">
        <div className="p-2 text-xs text-right text-gray-500">
          상태: <span className={`inline-block w-2 h-2 rounded-full ${statusColor} mr-1`}></span>{statusText}
        </div>
        {children}
      </main>
      <TabBar />
    </>
  );
}

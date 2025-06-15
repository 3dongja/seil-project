// src/app/community/message/inbox/page.tsx
"use client"

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function MessageInboxPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      const inboxRef = collection(db, "users", user.uid, "inbox");
      const q = query(inboxRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setMessages(list);
    };
    fetchMessages();
  }, [user]);

  return (
    <main className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">📬 받은 메시지함</h1>

      {messages.length === 0 && <p className="text-gray-600">받은 메시지가 없습니다.</p>}

      <ul className="space-y-2">
        {messages.map((msg) => (
          <li key={msg.id} className="border p-3 rounded">
            <p className="text-sm text-gray-500">보낸이: {msg.from}</p>
            <p className="text-base whitespace-pre-wrap">{msg.content}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

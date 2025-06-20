// src/app/admin/chat-logs/room/[id]/page.tsx

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";

interface Message {
  id: string;
  text: string;
  reply: string;
  sender: string;
  createdAt: any;
}

export default async function AdminChatLogPage({ params }: { params: { id: string } }) {
  const [sellerId, inquiryId] = params.id.split("-");

  if (!sellerId || !inquiryId) return notFound();

  const ref = collection(db, "admin", "chat-logs", "rooms", `${sellerId}-${inquiryId}`, "messages");
  const snapshot = await getDocs(ref);

  const messages: Message[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Message[];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">GPT 요약 로그</h1>
      {messages.map((m) => (
        <div key={m.id} className="mb-4 p-4 border rounded-xl shadow">
          <div className="text-xs text-gray-500">{m.createdAt.toDate().toLocaleString()}</div>
          <div className="font-mono text-sm whitespace-pre-wrap">
            <strong>📝 입력:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-1 mb-2">{m.text}</pre>
            <strong>🤖 요약:</strong>
            <pre className="bg-yellow-100 p-2 rounded mt-1">{m.reply}</pre>
          </div>
        </div>
      ))}
    </div>
  );
}
// src/components/chat/ChatMessageList.tsx

import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChatMessageListProps {
  messages?: any[]; // ← 선택적
  userType: "seller" | "consumer";
  sellerId: string;
  inquiryId: string;
}

export default function ChatMessageList({ messages, userType, sellerId, inquiryId }: ChatMessageListProps) {
  const safeMessages = messages ?? [];

  const handleDelete = async (msgId: string) => {
    const ok = confirm("메시지를 삭제하시겠습니까?");
    if (!ok) return;
    await updateDoc(doc(db, "sellers", sellerId, "inquiries", inquiryId, "messages", msgId), {
      deleted: true,
    });
  };

  return (
    <div className="space-y-2">
      {safeMessages.map((msg) => {
        if (msg.sender === "system") {
          if (msg.type === "summary") {
            return (
              <div key={msg.id} className="border border-blue-300 bg-blue-50 text-blue-900 rounded-lg p-3 text-sm">
                <div className="font-semibold mb-1">📋 요약 내용</div>
                <div>{msg.deleted ? "삭제된 메시지입니다." : msg.text}</div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="text-center text-xs italic text-gray-500 py-2">
              {msg.deleted ? "삭제된 메시지입니다." : msg.text}
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={`flex ${msg.sender === userType ? "justify-end" : "justify-start"}`}
            onContextMenu={(e) => {
              e.preventDefault();
              if (msg.sender === userType) handleDelete(msg.id);
            }}
          >
            <div
              className={`max-w-xs rounded-2xl px-4 py-2 shadow text-sm whitespace-pre-line break-words ${
                msg.sender === userType ? "bg-yellow-300 text-right" : "bg-gray-200 text-left"
              }`}
            >
              {msg.deleted ? "삭제된 메시지입니다." : msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}

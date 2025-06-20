// src/components/chat/ChatScreen.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import KakaoChatInputBar from "./KakaoChatInputBar";

function formatTime(timestamp: any) {
  if (!timestamp) return "";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface ChatMessageListProps {
  messages?: any[];
  userType: "seller" | "consumer";
  sellerId: string;
  inquiryId: string;
}

function ChatMessageList(props: ChatMessageListProps) {
  const { messages, userType, sellerId, inquiryId } = props;
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
      {safeMessages.map((msg: any) => {
        if (msg.sender === "system") {
          return (
            <div key={msg.id} className="text-center text-xs italic text-gray-500 py-2">
              {msg.deleted ? "삭제된 메시지입니다." : msg.text}
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === userType ? "items-end" : "items-start"}`}
            onContextMenu={(e) => {
              e.preventDefault();
              if (msg.sender === userType) handleDelete(msg.id);
            }}
          >
            <div
              className={`max-w-xs rounded-2xl px-4 py-2 shadow text-sm whitespace-pre-line break-words mb-1 ${
                msg.sender === userType ? "bg-yellow-300 text-right" : "bg-gray-200 text-left"
              }`}
            >
              {msg.deleted ? "삭제된 메시지입니다." : msg.text}
            </div>
            <div className="text-xs text-gray-400">
              {formatTime(msg.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ChatScreenProps {
  sellerId: string;
  inquiryId: string;
  userType: "seller" | "consumer";
  searchTerm?: string;
  sortOrder?: "asc" | "desc";
}

export default function ChatScreen({ sellerId, inquiryId, userType, searchTerm = "", sortOrder = "asc" }: ChatScreenProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    });
    return () => unsubscribe();
  }, [sellerId, inquiryId]);

  useEffect(() => {
    if (userType === "seller") {
      const ref = doc(db, "sellers", sellerId, "inquiries", inquiryId);
      updateDoc(ref, { alert: false });
    }
  }, [sellerId, inquiryId, userType]);

  useEffect(() => {
    if (userType !== "seller" || messages.length < 1) return;

    const last = messages[messages.length - 1];
    const hasSummary = messages.some((m) => m.sender === "system" || m.sender === "gpt");

    if (last.sender === "consumer" && !hasSummary) {
      fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          inquiryId,
          messages: messages.filter((m) => m.text && !m.deleted).map((m) => ({ role: m.sender, content: m.text }))
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          const summary = data.summary ?? "요약을 생성할 수 없습니다.";

          await Promise.all([
            addDoc(collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"), {
              sender: "system",
              text: summary,
              createdAt: new Date(),
            }),
            addDoc(collection(db, "admin", "chat-logs", "logs"), {
              sellerId,
              inquiryId,
              reply: summary,
              source: "auto-summary",
              createdAt: new Date(),
            })
          ]);
        })
        .catch((err) => console.error("요약 실패:", err));
    }
  }, [messages, sellerId, inquiryId, userType]);

  const filteredMessages = messages
    .filter((msg) => msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 py-4" ref={scrollRef}>
        <ChatMessageList
          userType={userType}
          sellerId={sellerId}
          inquiryId={inquiryId}
          messages={filteredMessages}
        />
      </div>
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t z-10">
        <KakaoChatInputBar
          sellerId={sellerId}
          inquiryId={inquiryId}
          userType={userType}
          scrollToBottom={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }}
        />
      </div>
    </div>
  );
}

// src/components/chat/ChatScreen.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import KakaoChatInputBar from "./KakaoChatInputBar";
import CategoryForm from "./CategoryForm";
import { getSummaryFromAnswers } from "@/lib/summary";
import { useSearchParams } from "next/navigation"; // ✅ 추가

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
    <div className="space-y-2 pb-[80px]">
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
  category?: string;
}

export default function ChatScreen({ sellerId, inquiryId, userType, searchTerm = "", sortOrder = "asc", category }: ChatScreenProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [valid, setValid] = useState(false);
  const [lastSummaryInput, setLastSummaryInput] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const resolvedCategory = category ?? searchParams.get("category") ?? "문의";

  useEffect(() => {
    const q = query(
      collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"),
      orderBy("createdAt", sortOrder)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsubscribe();
  }, [sellerId, inquiryId, sortOrder]);

  const filteredMessages = messages.filter((m) => m.text?.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    if (!valid || Object.keys(answers).length === 0) return;
    const inputText = JSON.stringify(answers);
    if (inputText === lastSummaryInput) return;

    const fetchSummary = async () => {
      const settingsRef = doc(db, "sellers", sellerId, "settings", "chatbot");
      const settingsSnap = await getDoc(settingsRef);
      const systemPrompt = settingsSnap.exists() ? settingsSnap.data() : {};
      const summary = await getSummaryFromAnswers(sellerId, resolvedCategory, answers, systemPrompt);
      await setDoc(doc(db, "sellers", sellerId, "inquiries", inquiryId, "summary", "auto"), {
        category: resolvedCategory,
        answers,
        summary,
        updatedAt: new Date()
      });
      setLastSummaryInput(inputText);
    };
    fetchSummary();
  }, [answers, valid]);

  return (
    <div className="p-4 space-y-4">
      <CategoryForm category={resolvedCategory} onChange={setAnswers} onValidate={setValid} />
      <ChatMessageList messages={filteredMessages} userType={userType} sellerId={sellerId} inquiryId={inquiryId} />
      <KakaoChatInputBar sellerId={sellerId} inquiryId={inquiryId} userType={userType} />
      <div ref={scrollRef} className="h-1"></div>
    </div>
  );
}

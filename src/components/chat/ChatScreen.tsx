// src/components/chat/ChatScreen.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import KakaoChatInputBar from "./KakaoChatInputBar";
import CategoryForm from "./CategoryForm";
import { getSummaryFromAnswers } from "@/lib/summary";
import { useSearchParams } from "next/navigation";

function formatTime(timestamp: any) {
  if (!timestamp) return "";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatMessageList({ messages = [], userType, sellerId, inquiryId }: any) {
  const handleDelete = async (msgId: string) => {
    const ok = confirm("메시지를 삭제하시겠습니까?");
    if (!ok) return;
    await updateDoc(doc(db, "sellers", sellerId, "inquiries", inquiryId, "messages", msgId), {
      deleted: true,
    });
  };

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        아직 메시지가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg: any) => (
        msg.sender === "system" ? (
          <div key={msg.id} className="text-center text-xs italic text-gray-500 py-2">
            {msg.deleted ? "삭제된 메시지입니다." : msg.text}
          </div>
        ) : (
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
        )
      ))}
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
  summaryInfo?: {
    name?: string;
    phone?: string;
  };
  useApiSummary?: boolean; // ✅ 추가됨
}

export default function ChatScreen({ sellerId, inquiryId, userType, searchTerm = "", sortOrder = "asc", category, summaryInfo, useApiSummary }: ChatScreenProps) {
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

      const messageEntries = Object.entries(answers)
        .filter(([_, v]) => v?.trim())
        .map(([k, v]) => ({ role: "user", content: `${k}: ${v}` }));

      if (useApiSummary && messageEntries.length > 0) {
        const response = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellerId, inquiryId, messages: messageEntries })
        });
        const data = await response.json();
        await setDoc(doc(db, "sellers", sellerId, "inquiries", inquiryId, "summary", "auto"), {
          category: resolvedCategory,
          answers,
          summary: data.summary,
          updatedAt: new Date()
        });
      } else if (!useApiSummary) {
        const summary = await getSummaryFromAnswers(sellerId, resolvedCategory, answers, systemPrompt);
        await setDoc(doc(db, "sellers", sellerId, "inquiries", inquiryId, "summary", "auto"), {
          category: resolvedCategory,
          answers,
          summary,
          updatedAt: new Date()
        });
      }

      setLastSummaryInput(inputText);
    };
    fetchSummary();
  }, [answers, valid]);

  return (
    <div className="h-full flex flex-col">
      {summaryInfo?.name || summaryInfo?.phone ? (
        <div className="px-4 py-2 bg-gray-100 border-b text-sm text-gray-800">
          {summaryInfo.name && <div>이름: {summaryInfo.name}</div>}
          {summaryInfo.phone && (
            <div
              className="cursor-pointer text-blue-600 underline"
              onClick={() => {
                if (summaryInfo.phone) {
                  navigator.clipboard.writeText(summaryInfo.phone);
                  alert("전화번호가 복사되었습니다.");
                }
              }}
            >
              전화번호: {summaryInfo.phone}
            </div>
          )}
        </div>
      ) : null}
      <div className="p-4">
        <CategoryForm category={resolvedCategory} onChange={setAnswers} onValidate={setValid} />
      </div>
      <div className="flex-1 overflow-auto px-4 space-y-4 pb-32">
        <ChatMessageList messages={filteredMessages} userType={userType} sellerId={sellerId} inquiryId={inquiryId} />
        <div ref={scrollRef} className="h-1"></div>
      </div>
      <div className="fixed bottom-0 left-0 w-full z-20 bg-white border-t">
        <KakaoChatInputBar sellerId={sellerId} inquiryId={inquiryId} userType={userType} />
      </div>
    </div>
  );
}
// src/components/chat/ChatBotScreen.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuth } from "@/AuthContext";
import { useAutoScroll } from "@/useAutoScroll";
import {
  doc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import useUserRoles from "@/hooks/useUserRoles";
import ChatMessageList from "@/components/chat/ChatMessageList";
import KakaoChatInputBar from "@/components/chat/KakaoChatInputBar";

interface ChatBotScreenProps {
  sellerId?: string;
  inquiryId?: string;
}

export default function ChatBotScreen(props: ChatBotScreenProps) {
  const { user: currentUser } = useAuth();
  const { user } = useUserRoles();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [botActive, setBotActive] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const inquiryId = props.inquiryId ?? searchParams.get("inquiryId");
  const sellerId = props.sellerId ?? currentUser?.uid;

  const dummy = useRef<HTMLDivElement>(null!);

  const messagesRef = collection(
    db,
    "sellers",
    sellerId!,
    "inquiries",
    inquiryId!,
    "chatMessages"
  );
  const q = query(messagesRef, orderBy("createdAt"));
  const [messagesSnapshot] = useCollection(q);
  useAutoScroll(messagesSnapshot, dummy);

  useEffect(() => {
    if (!inquiryId || !sellerId) return;
    const inquiryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId);
    const unsubscribe = onSnapshot(inquiryRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.sellerActive) {
        setBotActive(false);
      }
    });
    return () => unsubscribe();
  }, [inquiryId, sellerId]);

  const handleSend = async (message: string) => {
    if (!message.trim() || !inquiryId || !sellerId || !botActive) {
      console.warn("메시지 또는 파라미터 누락", { message, inquiryId, sellerId, botActive });
      return;
    }

    const userSnap = await getDoc(doc(db, "users", sellerId));
    if (userSnap.exists() && userSnap.data()?.role === "seller") return;

    const userMessage = {
      text: message,
      senderId: sellerId,
      senderType: "user",
      createdAt: serverTimestamp(),
    };
    await addDoc(messagesRef, userMessage);

    const systemPrompt = `당신은 고객센터 AI 챗봇입니다.
고객이 남긴 요약 내용 안에서만 응답하며, 판매자의 업종과 상품 정보를 참고합니다.
항상 정중한 말투로 상담 목적에 집중하세요.

- 상담사가 아닌 AI임을 명확히 하세요
- 결제, 개인정보 요청은 금지입니다
- 상담 외 질문(예: 농담, 잡담, 기능 테스트 등)은 “정확한 안내를 위해 담당자에게 전달하겠습니다”로 응답하세요
- 모르는 내용은 상상하지 말고 “그 부분은 확인 후 안내드릴게요”로 마무리하세요`;

    const chatHistory =
      messagesSnapshot?.docs.map((doc) => {
        const d = doc.data();
        return `[${d.senderType}] ${d.text}`;
      }).slice(-10) ?? [];

    try {
      const response = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          systemPrompt,
          sellerId,
          inquiryId,
          chatHistory,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("GPT 응답 실패 (상세):", text);
        throw new Error(`GPT 응답 실패: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.message ?? "죄송합니다. 응답을 생성하지 못했습니다.";

      const botMessage = {
        text: reply,
        senderId: "chatbot",
        senderType: "bot",
        createdAt: serverTimestamp(),
      };
      await addDoc(messagesRef, botMessage);
    } catch (error) {
      console.error("GPT 응답 예외:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4">
        <ChatMessageList
          messages={messagesSnapshot?.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))}
          userType={(user as any)?.role ?? "consumer"}
          sellerId={sellerId ?? ""}
          inquiryId={inquiryId ?? ""}
        />
        <div ref={dummy} />
      </div>
      <KakaoChatInputBar
        sellerId={sellerId ?? ""}
        inquiryId={inquiryId ?? ""}
        userType={(user as any)?.role ?? "consumer"}
        disabled={loading || !botActive}
        onSend={async (msg: string) => {
          setLoading(true);
          try {
            await handleSend(msg);
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}

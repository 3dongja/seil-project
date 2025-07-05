"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuth } from "@/AuthContext";
import { useAutoScroll } from "@/useAutoScroll";
import { doc, getDoc, serverTimestamp, collection, addDoc, updateDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useUserRoles from "@/hooks/useUserRoles";
import ChatMessageList from "@/components/chat/ChatMessageList";
import KakaoChatInputBar from "@/components/chat/KakaoChatInputBar";

export default function ChatBotScreen() {
  const { user: currentUser } = useAuth();
  const { user } = useUserRoles();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [botActive, setBotActive] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const inquiryId = searchParams.get("inquiryId");
  const dummy = useRef<HTMLDivElement>(null!); // null 허용 제거

  const messagesRef = collection(db, "chats", inquiryId!, "messages");
  const q = query(messagesRef, orderBy("createdAt"));
  const [messagesSnapshot] = useCollection(q);
  useAutoScroll(messagesSnapshot, dummy);

  useEffect(() => {
    if (!inquiryId || !currentUser?.uid) return;
    const inquiryRef = doc(db, "sellers", currentUser.uid, "inquiries", inquiryId);
    const unsubscribe = onSnapshot(inquiryRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.sellerActive) {
        setBotActive(false); // 챗봇 비활성화
      }
    });
    return () => unsubscribe();
  }, [inquiryId, currentUser]);

  const handleSend = async (message: string) => {
    if (!message.trim() || !inquiryId || !currentUser || !botActive) return;

    const userSnap = await getDoc(doc(db, "users", currentUser.uid));
    if (userSnap.exists() && userSnap.data()?.role === "seller") return;

    const userMessage = {
      text: message,
      senderId: currentUser.uid,
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

    try {
      const response = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, systemPrompt }),
      });
      const data = await response.json();
      const botMessage = {
        text: data.reply,
        senderId: "chatbot",
        senderType: "bot",
        createdAt: serverTimestamp(),
      };
      await addDoc(messagesRef, botMessage);
    } catch (error) {
      console.error("GPT 응답 실패", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4">
        <ChatMessageList
          messages={messagesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() }))}
          userType={(user as any)?.role ?? "consumer"}
          sellerId={currentUser?.uid ?? ""}
          inquiryId={inquiryId ?? ""}
        />
        <div ref={dummy} />
      </div>
      <KakaoChatInputBar
        sellerId={currentUser?.uid ?? ""}
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

// src/components/chat/ChatScreen.tsx

import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import KakaoChatInputBar from "./KakaoChatInputBar";

interface ChatMessageListProps {
  messages?: any[]; // 선택 속성으로 수정
  userType: "seller" | "consumer";
  sellerId: string;
  inquiryId: string;
}

function ChatMessageList(props: ChatMessageListProps) {
  const {
    messages,
    userType,
    sellerId,
    inquiryId
  } = props;

  const safeMessages = messages ?? []; // 안전 대체 변수

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

interface ChatScreenProps {
  sellerId: string;
  inquiryId: string;
  userType: "seller" | "consumer";
}

export default function ChatScreen({ sellerId, inquiryId, userType }: ChatScreenProps) {
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

  // 판매자 진입 시 알림 해제
  useEffect(() => {
    if (userType === "seller") {
      const ref = doc(db, "sellers", sellerId, "inquiries", inquiryId);
      updateDoc(ref, { alert: false });
    }
  }, [sellerId, inquiryId, userType]);

  // 요약 자동 출력 + 관리자 로그 저장
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

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white px-2 py-4">
        <ChatMessageList
          userType={userType}
          sellerId={sellerId}
          inquiryId={inquiryId}
          messages={messages}
        />
      </div>
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
  );
}

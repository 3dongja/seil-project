// ChatBotScreen.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";
import KakaoChatInputBar from "@/components/chat/KakaoChatInputBar";
import ChatBotWrapper from "@/components/chat/ChatBotWrapper";

interface Props {
  sellerId: string;
  inquiryId: string;
}

const ChatBotScreen = ({ sellerId, inquiryId }: Props) => {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [details, setDetails] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkPlan = async () => {
      const sellerRef = doc(db, "sellers", sellerId);
      const snap = await getDoc(sellerRef);
      const plan = snap.data()?.plan || "free";

      if (plan === "free") {
        alert("무료 요금제는 챗봇 기능이 제한됩니다.");
        router.replace(`/chat-summary/${sellerId}`);
      }
    };
    checkPlan();
  }, [sellerId]);

  useEffect(() => {
    const fetchData = async () => {
      const refDoc = doc(db, "sellers", sellerId, "inquiries", inquiryId);
      const snap = await getDoc(refDoc);
      const data = snap.data();
      setSummary(data?.summary || "");
      setCategory(data?.category || "");
      setDetails(data?.details || {});
    };
    fetchData();
  }, [sellerId, inquiryId]);

  useEffect(() => {
    const q = query(
      collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"),
      orderBy("createdAt")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [sellerId, inquiryId]);

  useEffect(() => {
    const watchSellerActive = onSnapshot(doc(db, "sellers", sellerId, "inquiries", inquiryId), (docSnap) => {
      if (docSnap.data()?.sellerActive) {
        alert("상담원이 채팅에 참여하여 챗봇이 종료됩니다.");
        router.replace(`/chat-summary/${sellerId}`);
      }
    });
    return () => watchSellerActive();
  }, [sellerId, inquiryId]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const offTopic = !["주문", "예약", "상담", "문의", "반품", "교환"].some((k) => text.includes(k));
    if (offTopic) {
      await addDoc(collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"), {
        sender: "bot",
        text: "죄송합니다. 본 서비스와 관련된 질문만 응답드릴 수 있습니다.",
        createdAt: serverTimestamp()
      });
      return;
    }

    await addDoc(collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"), {
      sender: "user",
      text,
      createdAt: serverTimestamp()
    });

    setSending(true);
    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId, inquiryId, summary, category, details, text })
    });
    const data = await res.json();
    setSending(false);

    if (data.reply) {
      await addDoc(collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"), {
        sender: "bot",
        text: data.reply,
        createdAt: serverTimestamp()
      });
    }
  };

  return (
    <ChatBotWrapper messages={messages}>
      <KakaoChatInputBar
        sellerId={sellerId}
        inquiryId={inquiryId}
        userType="consumer"
        disabled={sending}
        onSend={handleSend}
      />
      <div ref={bottomRef} />
    </ChatBotWrapper>
  );
};

export default ChatBotScreen;

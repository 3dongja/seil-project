"use client";

import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import KakaoChatInputBar from "@/components/chat/KakaoChatInputBar";

interface ChatScreenProps {
  sellerId: string;
  userId: string;
  category: string;
  prompt: string;
  welcomeMessage: string;
  statusColor: string;
  industry: string;
  products: string;
  promptCue: string;
}

export default function ChatScreen({
  sellerId,
  userId,
  category,
  prompt,
  welcomeMessage,
  statusColor
}: ChatScreenProps) {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWelcome = async () => {
      if (!sellerId) return;
      const snap = await getDoc(doc(db, "sellers", sellerId, "settings", "chatbot"));
      const data = snap.data();
      if (data?.welcomeMessage) {
        setChat([{ role: "bot", text: data.welcomeMessage }].map(m => `🤖 ${m.text}`));
      } else {
        setChat([{ role: "bot", text: "안녕하세요! 버튼을 눌러 대화를 시작해보세요." }].map(m => `🤖 ${m.text}`));
      }
    };
    loadWelcome();
  }, [sellerId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newChat = [...chat, `🙋‍♀️ ${input}`];
    setChat(newChat);
    setLoading(true);

    // 서버 API 요구사항에 맞춰 body 수정
    const dataToSend = { sellerId, text: input };
    console.log("[클라이언트] 보내는 데이터:", dataToSend);

    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    const data = await res.json();
    setChat([...newChat, `🤖 ${data.reply}`]);
    setInput("");
    setLoading(false);
  };

  const uploadImage = async (file: File) => {
    const path = `chats/${userId}/${file.name}`;
    const snap = await uploadBytes(ref(storage, path), file);
    const url = await getDownloadURL(snap.ref);
    setChat((prev) => [...prev, `🖼️ <img src="${url}" class="max-w-xs rounded-lg" />`]);
  };

  return (
    <>
      <div className="bg-gray-50 p-3 rounded shadow min-h-[300px] max-h-[50vh] overflow-y-auto space-y-2">
        {chat.map((msg, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: msg }} className="whitespace-pre-wrap" />
        ))}
        <div ref={bottomRef} />
      </div>
      <KakaoChatInputBar
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        onImageUpload={uploadImage}
        disabled={loading}
      />
    </>
  );
}

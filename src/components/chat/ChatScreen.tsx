// src/components/chat/ChatScreen.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import KakaoChatInputBar from "@/components/chat/KakaoChatInputBar";

export interface ChatScreenProps {
  sellerId: string;
  userId: string;
  prompt: string;
  welcomeMessage: string;
  statusColor: string;
  category: string;
  industry: string;
  products: string;
  promptCue: string;

  bubbleColor: string;
  bubbleTextColor: string;
  emojiAvatar: string;
  bgImageUrl: string;
  fontClass: string;
  reverseBubble: boolean;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  type?: "text" | "image";
}

export default function ChatScreen({
  sellerId,
  userId,
  category,
  prompt,
  welcomeMessage,
  statusColor,
  bubbleColor,
  bubbleTextColor,
  emojiAvatar,
  bgImageUrl,
  fontClass,
  reverseBubble,
  industry,
  products,
  promptCue,
}: ChatScreenProps) {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (welcomeMessage) {
      setChat([{ sender: "bot", text: welcomeMessage, type: "text" }]);
    } else {
      setChat([{ sender: "bot", text: "위 카테고리를 클릭후 상담을 부탁드려요 .", type: "text" }]);
    }
  }, [welcomeMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage: Message = { sender: "user", text: input, type: "text" };
    setChat((prev) => [...prev, newUserMessage]);
    setLoading(true);

    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellerId,
        userId,
        category,
        industry,
        products,
        prompt,
        promptCue,
        text: input
      }),
    });

    const data = await res.json();

    const botMessage: Message = {
      sender: "bot",
      text: data.reply || "죄송합니다, 응답을 받지 못했습니다.",
      type: "text",
    };

    setChat((prev) => [...prev, botMessage]);
    setInput("");
    setLoading(false);
  };

  return (
    <>
      <div
        className={`p-3 rounded shadow min-h-[300px] max-h-[50vh] overflow-y-auto space-y-2 ${fontClass}`}
        style={{
          backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : undefined,
          backgroundSize: "cover",
        }}
      >
        {chat.map((msg, i) => {
          const isUser = msg.sender === "user";

          const bubbleStyle = {
            backgroundColor: bubbleColor,
            color: bubbleTextColor,
            borderRadius: 15,
            maxWidth: "70%",
            padding: "8px 12px",
            marginLeft: isUser ? "auto" : reverseBubble ? undefined : 0,
            marginRight: isUser ? (reverseBubble ? 0 : undefined) : "auto",
            whiteSpace: "pre-wrap" as const,
          };

          return (
            <div
              key={i}
              style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "center" }}
            >
              {!isUser && (
                <span style={{ fontSize: "1.5rem", marginRight: 6 }}>{emojiAvatar}</span>
              )}
              <div style={bubbleStyle}>{msg.text}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <KakaoChatInputBar
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        disabled={loading}
      />
    </>
  );
}

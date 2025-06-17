// src/components/chat/ChatMessageList.tsx
"use client";

interface Message {
  sender: "user" | "bot";
  text: string;
  type?: "text" | "image";
}

interface ChatMessageListProps {
  messages: Message[];
  bottomRef: React.RefObject<HTMLDivElement>;
}

export default function ChatMessageList({ messages, bottomRef }: ChatMessageListProps) {
  return (
    <div className="p-3 overflow-y-auto max-h-[50vh] space-y-2">
      {messages.map((msg, i) => {
        const isUser = msg.sender === "user";
        return (
          <div
            key={i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-2 rounded-lg ${
                isUser
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              } break-words`}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {msg.type === "image" ? (
                <img src={msg.text} alt="이미지" className="max-w-full rounded-lg" />
              ) : (
                msg.text
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
// src/app/seller/[sellerId]/chat/components/ChatWindow.tsx

"use client"

import { useState } from "react"

interface ChatTheme {
  bubbleColor?: string;
  fontColor?: string;
}

interface Props {
  sellerId: string;
  theme: ChatTheme;
}

export default function ChatWindow({ sellerId, theme }: Props) {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input])
      setInput("")
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg, i) => (
        <div
          key={i}
          className="self-end px-4 py-2 rounded-xl text-white"
          style={{ backgroundColor: theme.bubbleColor || "#4A90E2" }}
        >
          {msg}
        </div>
      ))}
      <div className="mt-auto flex items-center border-t p-2">
        <input
          className="flex-1 border rounded p-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          전송
        </button>
      </div>
    </div>
  )
}

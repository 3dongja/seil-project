import { Message } from "@/types/message";

export default function ChatMessageList({ chat }: { chat: Message[] }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
      {chat.map((msg, idx) => (
        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`rounded-xl px-4 py-2 max-w-[75%] text-sm whitespace-pre-wrap ${
              msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        </div>
      ))}
    </div>
  );
}

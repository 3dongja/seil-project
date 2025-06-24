// ChatBotWrapper.tsx
import React from "react";

interface ChatBotWrapperProps {
  messages: any[];
  children?: React.ReactNode;
}

const ChatBotWrapper = ({ messages, children }: ChatBotWrapperProps) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50 p-4">
      <div className="flex flex-col gap-2 flex-grow">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-md max-w-xs relative ${
              msg.sender === "user"
                ? "bg-blue-100 self-end"
                : msg.sender === "bot"
                ? "bg-gray-300 self-start"
                : "bg-green-200 self-start"
            }`}
          >
            {msg.sender === "bot" && (
              <span className="absolute -left-6 top-1/2 transform -translate-y-1/2">🧠</span>
            )}
            {msg.text}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
};

export default ChatBotWrapper;


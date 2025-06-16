import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function KakaoChatInputBar({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: ChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-3 flex items-end gap-2 max-w-md mx-auto">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="메시지를 입력하세요..."
        className="flex-grow resize-none p-2 rounded-xl border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <Button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        전송
      </Button>
    </div>
  );
}
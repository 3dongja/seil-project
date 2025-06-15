// 쪽지 메시지 UI 컴포넌트

interface MessageItemProps {
  text: string;
  sender: "user" | "owner" | "gpt";
}

export default function MessageItem({ text, sender }: MessageItemProps) {
  const baseStyle = "px-3 py-2 rounded-xl max-w-xs whitespace-pre-wrap";

  const styleMap = {
    user: "bg-blue-100 text-left self-start",
    owner: "bg-green-100 text-right self-end",
    gpt: "bg-gray-200 text-left self-start font-mono"
  };

  return (
    <div className={`my-1 ${styleMap[sender]}`}>
      <div className={`${baseStyle} ${styleMap[sender]}`}>{text}</div>
    </div>
  );
}

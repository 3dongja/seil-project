// src/components/chat/KakaoChatInputBar.tsx
import { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface KakaoChatInputBarProps {
  sellerId: string;
  inquiryId: string;
  userType: "seller" | "consumer";
  scrollToBottom?: () => void;
}

export default function KakaoChatInputBar({ sellerId, inquiryId, userType, scrollToBottom }: KakaoChatInputBarProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sellerOnline, setSellerOnline] = useState(false);
  const [chatHours, setChatHours] = useState<string>("");

  useEffect(() => {
    const fetchSellerStatus = async () => {
      const statusRef = doc(db, "sellers", sellerId);
      const statusSnap = await getDoc(statusRef);
      if (statusSnap.exists()) {
        const data = statusSnap.data();
        setSellerOnline(!!data.online);
        setChatHours(data.chatHours || "");
      }
    };

    fetchSellerStatus();
  }, [sellerId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"), {
      text,
      sender: userType,
      createdAt: serverTimestamp(),
    });
    setText("");
    scrollToBottom?.();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert("첨부 파일은 10MB를 초과할 수 없습니다.");
      return;
    }

    // TODO: Firebase Storage 업로드 구현 필요
    console.log("업로드할 파일:", file.name);
  };

  return (
    <div className="flex flex-col border-t border-gray-300 bg-black">
      <div className="flex justify-between items-center px-4 py-1 text-sm text-white bg-gray-800">
        <div>
          {sellerOnline ? <span className="text-green-400">● 상담원 접속 중</span> : <span className="text-gray-400">● 상담원 부재중</span>}
        </div>
        {chatHours && <div className="text-gray-400">상담 가능 시간: {chatHours}</div>}
      </div>

      <div className="flex items-center px-3 py-2">
        <button
          className="text-white px-2"
          onClick={() => fileInputRef.current?.click()}
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="text"
          className="flex-1 px-3 py-2 text-white bg-transparent placeholder-gray-400 focus:outline-none"
          placeholder="메시지를 입력하세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="text-white font-semibold px-3 py-2"
        >
          전송
        </button>
      </div>
    </div>
  );
}

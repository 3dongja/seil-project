"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import ChatScreen from "@/components/chat/ChatScreen";

export default function ConsumerChatPage() {
  const { sellerId } = useParams();
  const [prompt, setPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [statusColor, setStatusColor] = useState("gray");
  const [userId, setUserId] = useState("");
  const [category, setCategory] = useState("상담");
  const [industry, setIndustry] = useState("");
  const [products, setProducts] = useState("");
  const [promptCue, setPromptCue] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("consumer_uid") || uuidv4();
    localStorage.setItem("consumer_uid", stored);
    setUserId(stored);
  }, []);

  useEffect(() => {
    if (sellerId) {
      fetchPrompt();
      checkStatus();
    }
  }, [sellerId]);

  const fetchPrompt = async () => {
    const ref = doc(db, "sellers", sellerId as string, "settings", "chatbot");
    const snap = await getDoc(ref);
    const data = snap.data();
    if (!data) return;

    setWelcomeMessage(data.welcomeMessage || "");
    setIndustry(data.industry || "");
    setProducts(data.products || "");
    setPromptCue(data.promptCue || "");
    setPrompt(`업종은 ${data.industry}, 카테고리는 ${category}, 판매상품은 ${data.products}입니다. 고객에게는 다음과 같이 안내하세요: \"${data.welcomeMessage}\" 유도 질문: ${data.promptCue}`);
  };

  const checkStatus = async () => {
    const ref = doc(db, "users", sellerId as string, "seller", "profile");
    const snap = await getDoc(ref);
    const data = snap.data();
    if (!data?.lastAdminActive) return;

    const last = data.lastAdminActive.toDate().getTime();
    const now = Date.now();
    const diff = now - last;

    setStatusColor(diff < 5 * 60 * 1000 ? "green" : diff < 10 * 60 * 1000 ? "yellow" : "gray");
  };

  const categories = ["주문", "예약", "상담", "문의", "반품", "교환", "1:1채팅"];

  return (
    <div className="flex flex-col h-screen">
      <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 text-sm border rounded-full whitespace-nowrap ${cat === category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <ChatScreen
        sellerId={sellerId as string}
        userId={userId}
        prompt={prompt}
        welcomeMessage={welcomeMessage}
        statusColor={statusColor}
        category={category}
        industry={industry}
        products={products}
        promptCue={promptCue}
      />
    </div>
  );
}

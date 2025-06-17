"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import ChatScreen from "@/components/chat/ChatScreen";

export default function ConsumerChatPage() {
  const params = useParams();
  const sellerIdRaw = params.sellerId;
  const sellerId = Array.isArray(sellerIdRaw) ? sellerIdRaw[0] : sellerIdRaw ?? "";

  const [prompt, setPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [statusColor, setStatusColor] = useState("gray");
  const [userId, setUserId] = useState("");
  const [category, setCategory] = useState("상담");
  const [industry, setIndustry] = useState("");
  const [products, setProducts] = useState("");
  const [promptCue, setPromptCue] = useState("");

  const [bubbleColor, setBubbleColor] = useState("#f0f0f0");
  const [bubbleTextColor, setBubbleTextColor] = useState("#000000");
  const [emojiAvatar, setEmojiAvatar] = useState("😊");
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [fontClass, setFontClass] = useState("font-sans");
  const [reverseBubble, setReverseBubble] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("consumer_uid") || uuidv4();
    localStorage.setItem("consumer_uid", stored);
    setUserId(stored);
  }, []);

  useEffect(() => {
    if (!sellerId) return;

    const fetchPrompt = async () => {
      const ref = doc(db, "sellers", sellerId, "settings", "chatbot");
      const snap = await getDoc(ref);
      const data = snap.data();
      if (!data) return;

      setWelcomeMessage(data.welcomeMessage || "");
      setIndustry(data.industry || "");
      setProducts(data.products || "");
      setPromptCue(data.promptCue || "");
      setPrompt(
        `업종은 ${data.industry}, 카테고리는 ${category}, 판매상품은 ${data.products}입니다. 고객에게는 다음과 같이 안내하세요: "${data.welcomeMessage}" 유도 질문: ${data.promptCue}`
      );
    };

    const fetchTheme = async () => {
      const ref = doc(db, "users", sellerId, "seller", "settings");
      const snap = await getDoc(ref);
      const data = snap.data();
      if (!data) return;

      setBubbleColor(data.bubbleColor || "#f0f0f0");
      setBubbleTextColor(data.bubbleTextColor || "#000000");
      setEmojiAvatar(data.emojiAvatar || "😊");
      setBgImageUrl(data.bgImageUrl || "");
      setFontClass(data.fontClass || "font-sans");
      setReverseBubble(data.reverseBubble || false);
    };

    const checkStatus = async () => {
      const ref = doc(db, "users", sellerId, "seller", "profile");
      const snap = await getDoc(ref);
      const data = snap.data();
      if (!data?.lastAdminActive) return;

      const last = data.lastAdminActive.toDate().getTime();
      const now = Date.now();
      const diff = now - last;

      setStatusColor(
        diff < 5 * 60 * 1000
          ? "green"
          : diff < 10 * 60 * 1000
          ? "yellow"
          : "gray"
      );
    };

    fetchPrompt();
    fetchTheme();
    checkStatus();
  }, [sellerId, category]);

  const categories = ["주문", "예약", "상담", "문의", "반품", "교환"];

  return (
    <div className="flex flex-col h-screen">
      <div className="flex gap-3 px-4 pt-4 pb-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPrompt(
                `업종은 ${industry}, 카테고리는 ${cat}, 판매상품은 ${products}입니다. 고객에게는 다음과 같이 안내하세요: "${welcomeMessage}" 유도 질문: ${promptCue}`
              );
            }}
            className={`px-4 py-2 text-lg border rounded-lg whitespace-nowrap shadow font-semibold transition ${
              cat === category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ChatScreen
        sellerId={sellerId}
        userId={userId}
        prompt={prompt}
        welcomeMessage={welcomeMessage}
        statusColor={statusColor}
        category={category}
        industry={industry}
        products={products}
        promptCue={promptCue}
        bubbleColor={bubbleColor}
        bubbleTextColor={bubbleTextColor}
        emojiAvatar={emojiAvatar}
        bgImageUrl={bgImageUrl}
        fontClass={fontClass}
        reverseBubble={reverseBubble}
      />
    </div>
  );
}

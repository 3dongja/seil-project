// src/lib/chat/useChatLogic.ts
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChatMessage {
  role: string;
  text: string;
}

export function useChatLogic(sellerId: string) {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [industry, setIndustry] = useState("");
  const [products, setProducts] = useState("");
  const [promptCue, setPromptCue] = useState("");

  useEffect(() => {
    const loadPrompt = async () => {
      if (!sellerId) return;
      const docRef = doc(db, "sellers", sellerId, "settings", "chatbot");
      const snap = await getDoc(docRef);
      const data = snap.data();
      if (!data) return;

      const { industry, products, promptCue, welcomeMessage } = data;
      const promptText = `업종은 ${industry}, 판매상품은 ${products}입니다. 고객에게는 다음과 같이 안내하세요: "${welcomeMessage}" 유도 질문: ${promptCue}`;

      setIndustry(industry);
      setProducts(products);
      setPromptCue(promptCue);
      setWelcomeMessage(welcomeMessage);
      setPrompt(promptText);
      setChat([{ role: "bot", text: welcomeMessage || "안녕하세요! 버튼을 눌러 대화를 시작해보세요." }]);
    };
    loadPrompt();
  }, [sellerId]);

  return { chat, setChat, prompt, welcomeMessage, industry, products, promptCue };
}

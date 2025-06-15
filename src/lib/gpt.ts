// src/lib/gpt.ts

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function generateSystemPrompt(chatId: string, category: string): Promise<string> {
  const ref = doc(db, "chatSettings", chatId);
  const snap = await getDoc(ref);
  const data = snap.data();

  const industry = data?.industry || "상점";
  const promptStyle = promptStyleMap[data?.promptStyle || "friendlyTone"];

  return `당신은 '${industry}'을 판매하는 상점의 상담 담당자입니다.\n현재 고객은 '${category}' 문의를 하고 있으며,\n아래와 같은 톤으로 응답해주세요: ${promptStyle}`;
}

const promptStyleMap: Record<string, string> = {
  friendlyTone: "친절하고 부드러운 스타일",
  strictPolicy: "정책에 따라 단호하고 명확한 스타일",
  casual: "편안하고 캐주얼한 말투"
};

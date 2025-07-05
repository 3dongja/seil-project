// src/lib/prompt-engine/custom-prompts.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getCustomPrompt(sellerId: string, intent: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "sellers", sellerId, "settings", "chatbot"));
  const data = snap.data();
  if (!data) return null;

  if (intent === "chat" && data.promptCue && data.welcomeMessage) {
    return `업종: ${data.industry}\n상품: ${data.products}\n"${data.welcomeMessage}"\n${data.promptCue}`;
  }

  if (intent === "summary" && data.industry && data.products) {
    return `요약 기준: ${data.industry} 업종의 ${data.products} 상품 상담 기준으로`;  
  }

  return null;
}
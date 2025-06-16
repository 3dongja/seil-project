// src/hooks/useChatHandler.ts
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface PromptData {
  industry: string;
  products: string;
  promptCue: string;
  welcomeMessage: string;
}

export interface SendMessageParams {
  prompt: string;
  userMessage: string;
}

export interface SummarySaveParams {
  sellerId: string;
  userId: string;
  summary: string;
}

export const fetchPromptData = async (sellerId: string): Promise<PromptData | null> => {
  const ref = doc(db, "sellers", sellerId, "settings", "chatbot");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as PromptData) : null;
};

export const saveSummary = async ({ sellerId, userId, summary }: SummarySaveParams) => {
  const ref = doc(db, "sellers", sellerId, "inquiries", userId);
  await setDoc(ref, {
    summary,
    customerName: "손님",
    createdAt: serverTimestamp()
  });
};

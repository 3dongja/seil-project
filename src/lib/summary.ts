// src/lib/summary.ts
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export async function getSummaryFromAnswers(
  sellerId: string,
  category: string,
  answers: Record<string, string>,
  prompt: any
): Promise<string> {
  try {
    const summarize = httpsCallable(functions, "summarizeForm");
    const response: any = await summarize({ sellerId, category, answers, prompt });
    return response?.data?.summary ?? "[요약 실패]";
  } catch (error) {
    console.error("GPT 요약 호출 실패:", error);
    return "[요약 오류]";
  }
}

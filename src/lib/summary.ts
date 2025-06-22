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
    // 파라미터 유효성 검사
    if (!sellerId || !category || !prompt || !answers || Object.keys(answers).length === 0) {
      console.warn("[요약 생략] 유효하지 않은 입력:", { sellerId, category, answers, prompt });
      return "[요약 생략됨]";
    }

    // 디버그용 파라미터 출력
    console.log("요약 요청 파라미터:", {
      sellerId,
      category,
      answers,
      prompt
    });

    const summarize = httpsCallable(functions, "summarizeForm");
    const response: any = await summarize({ sellerId, category, answers, prompt });
    return response?.data?.summary ?? "[요약 실패]";
  } catch (error) {
    console.error("GPT 요약 호출 실패:", error);
    return "[요약 오류]";
  }
}

// src/lib/prompt-engine/index.ts
import { defaultPrompts } from "./default-prompts";
import { getCustomPrompt } from "./custom-prompts";

export async function generatePrompt({
  role,
  intent,
  sellerId
}: {
  role: "consumer" | "seller",
  intent: "chat" | "summary",
  sellerId?: string;
}): Promise<string> {
  if (sellerId) {
    const custom = await getCustomPrompt(sellerId, intent);
    if (custom) return custom;
  }
  return defaultPrompts[role]?.[intent] ?? "기본 프롬프트를 사용할 수 없습니다.";
}

// ✅ 반드시 아래 export가 있어야 Vercel이 이 파일을 모듈로 인식합니다.
export default generatePrompt;

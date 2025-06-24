// src/lib/gpt/prompt.ts

export interface PromptSettings {
  industry: string;
  category: string;
  products: string;
  promptCue: string;
  welcomeMessage: string;
}

/**
 * 판매자 설정에 따라 요약용 GPT 프롬프트를 생성합니다
 */
export function buildPrompt({ industry, category, products, promptCue, welcomeMessage }: PromptSettings): string {
  return `당신은 고객센터 요약 AI입니다.
판매자의 업종과 판매 품목을 참고하되, 그 외 주제나 과거 정보로 벗어나지 말고 고객의 말과 해당 판매자의 업종/상품 안에서만 집중해서 요약하세요.

업종: ${industry}
카테고리: ${category}
판매상품: ${products}

고객에게는 다음과 같이 안내하세요: "${welcomeMessage}"
유도 질문: ${promptCue}`;
}

/**
 * (선택) 템플릿화된 안내 프롬프트 기본값
 * ※ 예시용이며 실제 사용 시 Firestore에서 판매자 설정을 불러옵니다.
 */
export const defaultPrompt: PromptSettings = {
  industry: "예: 과일 유통",
  category: "상담",
  products: "예: 수박, 고구마 등 다양한 상품 가능",
  promptCue: "예: 어떤 상품을 반품 원하시나요?",
  welcomeMessage: "예: 안녕하세요! 문의주세요.",
};

// src/lib/prompt-engine/default-prompts.ts

export const defaultPrompts = {
  consumer: {
    chat: `당신은 고객센터 AI입니다. 고객의 문의를 친절하고 정확하게 응답하세요.`,
    summary: `고객의 입력 내용을 간결하고 명확하게 요약하세요.`,
  },
  seller: {
    chat: `당신은 상담사입니다. 고객의 문의에 전문적인 입장에서 대응하세요.`,
    summary: `상담 내역을 요약하되, 핵심만 남기고 불필요한 정보는 제외하세요.`,
  },
};

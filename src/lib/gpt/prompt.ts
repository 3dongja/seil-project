// lib/gpt/prompt.ts
export const buildPrompt = ({ industry, category, products, cue, welcome }: {
  industry: string, category: string, products: string, cue: string, welcome: string
}) => {
  return `당신은 ${industry}에서 근무하는 서비스 직원입니다.\n` +
    `[카테고리: ${category}]에 해당하는 손님의 질문에 친절하게 응답해주세요.\n` +
    `판매상품: ${products}\n` +
    `유도 질문: ${cue}\n` +
    `고객에게는 다음과 같이 안내: \"${welcome}\"\n` +
    `질문을 요약하고 고객 이름, 연락처, 문의 내용을 받아 사업주에게 전달합니다.`;
};

import { OpenAI } from "openai";

const openai = new OpenAI();

/**
 * GPT 응답을 생성하는 유틸 함수
 * @param {Object} options
 * @param {string} options.text - 유저의 질문
 * @param {string} [options.systemPrompt] - 시스템 프롬프트 메시지
 * @param {string} [options.model] - 사용할 모델명 (기본값: gpt-3.5-turbo)
 * @param {number} [options.temperature] - 창의성 온도 (기본값: 0.3)
 * @returns {Promise<string>} 요약 결과 문자열
 */
export async function sendToGPT({
  text,
  systemPrompt = "당신은 친절한 AI 비서입니다.",
  model = "gpt-3.5-turbo",
  temperature = 0.3,
}: {
  text: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
}): Promise<string> {
  try {
    const chat = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature,
    });

    const reply = chat.choices[0].message.content?.trim();
    if (!reply) throw new Error("GPT 응답 없음");
    return reply;
  } catch (err: any) {
    console.error("sendToGPT 실패:", err);
    throw new Error("GPT 요청 실패");
  }
}
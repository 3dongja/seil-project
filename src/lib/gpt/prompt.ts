// ✅ src/lib/gpt/prompt.ts

/**
 * GPT에게 전달할 프롬프트를 구성합니다.
 * 고객의 이름, 연락처, 상세 문의 내용을 기반으로 요약 요청용 메시지를 생성합니다.
 */
export function buildPrompt(userInfo: {
  name: string;
  phone: string;
  details: string;
}): string {
  return `
고객 문의 요약:

- 고객명: ${userInfo.name}
- 연락처: ${userInfo.phone}
- 문의 내용: ${userInfo.details}

위 정보를 기반으로, 사업주가 빠르게 파악할 수 있도록 핵심만 요약해줘.
중복 표현 없이, 너무 길거나 모호하지 않게 해줘.
`; 
}

/**
 * 요약 요청을 GPT API에 보냅니다.
 */
export async function generateSummary(prompt: string): Promise<string> {
  const res = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) throw new Error("GPT 요약 실패");

  const data = await res.json();
  return data.summary;
}

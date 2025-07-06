// Edge 전용: Firebase 사용 불가
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, model } = await req.json();
  if (!prompt) return NextResponse.json({ error: "프롬프트 누락" }, { status: 400 });

  const selectedModel = typeof model === "string" && model.includes("gpt-4") ? "gpt-4" : "gpt-3.5-turbo";
  if (selectedModel === "gpt-4") {
    return NextResponse.json({ error: "GPT-4 모델은 준비 중입니다." }, { status: 403 });
  }

  const apiKey = process.env.OPENAI_API_KEY_GPT35;
  if (!apiKey) return NextResponse.json({ error: "API 키 없음" }, { status: 500 });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: "system", content: "고객 지원 챗봇" },
        { role: "user", content: prompt },
      ],
    }),
  });

  const completion = await response.json();
  const message = completion.choices?.[0]?.message?.content;
  return NextResponse.json({ message });
}

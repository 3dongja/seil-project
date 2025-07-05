// ✅ src/app/api/summary/route.ts

import { NextResponse } from "next/server";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export async function POST(req: Request) {
  try {
    const { prompt, sellerId } = await req.json();
    if (!prompt || typeof prompt !== "string" || !sellerId) {
      return NextResponse.json({ error: "프롬프트 또는 판매자 ID 누락" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY_GPT35;
    if (!apiKey) {
      return NextResponse.json({ error: "API 키 누락됨" }, { status: 500 });
    }

    // Firestore에서 seller 설정 불러오기
    const configRef = doc(db, "sellers", sellerId, "settings", "chatbot");
    const configSnap = await getDoc(configRef);
    const config = configSnap.exists() ? configSnap.data() : {};

    const industry = config?.industry || "해당 분야";
    const product = config?.products || "제품";
    const promptCue = config?.promptCue || "너는 정확하고 간결한 요약 AI야.";

    const systemMessage = `
${promptCue}
- 업종: ${industry}
- 주요 제품: ${product}
- 요약은 명확하고 실용적으로 작성해줘.
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const summary = data?.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      return NextResponse.json({ error: "요약 결과가 없습니다." }, { status: 500 });
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("GPT 요약 실패:", err);
    return NextResponse.json({ error: "서버 오류 - GPT 처리 실패" }, { status: 500 });
  }
}

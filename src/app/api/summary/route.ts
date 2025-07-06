// src/app/api/summary/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, sellerId, inquiryId, message, model } = body;

    if (!prompt || !sellerId || !inquiryId || !message) {
      return NextResponse.json({ error: "필수 입력 누락" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const user = session?.user;

    const apiKey = process.env.OPENAI_API_KEY_GPT35;
    if (!apiKey) {
      return NextResponse.json({ error: "API 키 누락됨" }, { status: 500 });
    }

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
        model: model?.includes("gpt-4") ? "gpt-4" : "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error("OpenAI API 오류: " + error);
    }

    const completion = await response.json();
    const summary = completion.choices[0].message?.content;

    await addDoc(collection(db, "logs"), {
      sellerId,
      inquiryId,
      user: user?.email ?? "anonymous",
      prompt,
      message,
      summary,
      model: model?.includes("gpt-4") ? "gpt-4" : "gpt-3.5-turbo",
      createdAt: serverTimestamp(),
      intent: "summary",
      status: "done"
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("/api/summary 에러:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

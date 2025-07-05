// src/app/api/gpt/route.ts
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { generatePrompt } from "@/lib/prompt-engine/index";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { message, role, intent, model = "gpt-3.5-turbo", details } = await req.json();
    if (!message || !role || !intent) {
      return new Response("message, role, intent는 필수입니다", { status: 400 });
    }

    // 인증 토큰 확인
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    if (!token) {
      return new Response("인증 토큰 없음", { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const sellerId = decoded.uid;

    // GPT API 키 선택 (gpt-4를 위한 구조도 미리 포함)
    const apiKey = model.includes("gpt-4")
      ? process.env.OPENAI_API_KEY_GPT40
      : process.env.OPENAI_API_KEY_GPT35;

    if (!apiKey) {
      console.error("OpenAI API 키가 설정되지 않았습니다.");
      return new Response("API 키 없음", { status: 500 });
    }

    // 프롬프트 생성
    const systemPrompt = await generatePrompt({ role, intent, sellerId });

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message?.content?.trim() ?? "";

    // 요청 로그 저장
    await adminDb.collection("logs").add({
      sellerId,
      type: intent,
      message,
      reply: content,
      details: details ?? null,
      createdAt: Date.now(),
    });

    if (intent === "summary") {
      return Response.json({ summary: content });
    }

    return Response.json({ reply: content });
  } catch (e) {
    console.error("GPT 처리 오류:", e);
    return new Response("서버 오류", { status: 500 });
  }
}

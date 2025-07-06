// src/app/api/gpt/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin"; // ✅ 추가

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, sellerId, inquiryId, model = "gpt-3.5-turbo" } = body;

    if (!prompt || !sellerId || !inquiryId) {
      return NextResponse.json({
        error: `필수 입력 누락: ${[
          !prompt && "prompt",
          !sellerId && "sellerId",
          !inquiryId && "inquiryId",
        ].filter(Boolean).join(", ")}`,
      }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const user = session?.user;

    const selectedModel = typeof model === "string" && model.includes("gpt-4") ? "gpt-4" : "gpt-3.5-turbo";

    if (selectedModel === "gpt-4") {
      return NextResponse.json({ error: "GPT-4 모델은 현재 준비 중입니다." }, { status: 403 });
    }

    const apiKey = process.env.OPENAI_API_KEY_GPT35;

    if (!apiKey) {
      return NextResponse.json({ error: "API 키 누락됨" }, { status: 500 });
    }

    const systemPrompt = `너는 고객 지원 챗봇이야. 고객의 문의에 대해 간단하고 정중하게 답변해줘.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API 오류 응답:", errorText);
      return NextResponse.json({ error: "OpenAI 오류: " + errorText }, { status: 500 });
    }

    let completion;
    try {
      completion = await response.json();
    } catch (jsonError) {
      console.error("GPT 응답 JSON 파싱 오류:", jsonError);
      return NextResponse.json({ error: "GPT 응답 파싱 실패" }, { status: 500 });
    }

    const message = completion.choices?.[0]?.message?.content;
    if (!message) {
      return NextResponse.json({ error: "GPT 응답이 비어 있음" }, { status: 500 });
    }

    try {
      await adminDb.collection("logs").add({
        sellerId,
        inquiryId,
        user: user?.email ?? "anonymous",
        prompt,
        message,
        model: selectedModel,
        createdAt: admin.firestore.FieldValue.serverTimestamp(), // ✅ 수정
        intent: "chat",
        status: "done",
      });
    } catch (logError) {
      console.error("Firestore 로그 저장 실패:", logError);
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error("/api/gpt 에러:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

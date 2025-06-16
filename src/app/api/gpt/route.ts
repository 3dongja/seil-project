// src/app/api/gpt/route.ts
// ✅ 기존 기능 완전 통합 및 요금제별 기능 확장
// ✨ Free: 1000자 제한 + 요약 제한 + 메시지 저장 + 안내 응답
// ✨ Basic: GPT-3.5 1:1 AI 채팅 + 무제한 요약
// ✨ Premium: GPT-4 1:1 AI 채팅 + 무제한 요약

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { OpenAI } from "openai";
import { incrementFreePlanSummaryCount } from "@/hooks/utils/usageStatsLimiter";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { sellerId, text, save = false } = await req.json();
  if (!sellerId || !text) {
    return new NextResponse("sellerId 또는 text 누락", { status: 400 });
  }

  const sellerRef = doc(db, "sellers", sellerId);
  const sellerSnap = await getDoc(sellerRef);
  const plan = sellerSnap.data()?.plan || "free";

  if (text.length > 1000) {
    return new NextResponse("입력은 최대 1000자까지 가능합니다.", { status: 400 });
  }

  // Free 요금제 처리: 사용량 제한 체크 + 메시지 저장 + 안내 응답
  if (plan === "free") {
    const { blocked } = await incrementFreePlanSummaryCount(sellerId);
    if (blocked) {
      return new NextResponse(
        JSON.stringify({ message: "요약 횟수를 초과하였습니다. (일 5회, 월 20회 제한)" }),
        { status: 429 }
      );
    }

    await addDoc(collection(db, `chatLogs/${sellerId}/messages`), {
      text,
      createdAt: serverTimestamp(),
    });

    const cannedResponse = `<상담 범위 안내>
본 AI는 판매자 상품/서비스 관련 문의에 응답합니다.
기술, 건강, 법률 등 일반 정보나 개인적 조언은 제공하지 않습니다.
도움을 드릴 수 있는 문의를 남겨주세요.`;

    await addDoc(collection(db, `chatLogs/${sellerId}/replies`), {
      text,
      reply: cannedResponse,
      createdAt: serverTimestamp(),
      metadata: {
        ip: req.headers.get("x-forwarded-for") || req.headers.get("host"),
        receivedAt: new Date().toISOString(),
      },
    });

    return new NextResponse(JSON.stringify({ reply: cannedResponse }), { status: 200 });
  }

  // Basic / Premium 요금제: GPT 채팅
  const model = plan === "premium" ? "gpt-4" : "gpt-3.5-turbo";

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "당신은 친절한 상담 AI입니다." },
      { role: "user", content: text },
    ],
  });

  const reply = completion.choices[0].message?.content || "죄송합니다, 응답을 생성하지 못했습니다.";

  if (save) {
    const threadRef = collection(db, "sellers", sellerId, "threads");
    const threadDoc = await addDoc(threadRef, { createdAt: serverTimestamp(), userMessage: text });
    await addDoc(collection(threadDoc, "messages"), {
      sender: "user",
      content: text,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(threadDoc, "messages"), {
      sender: "gpt",
      content: reply,
      createdAt: serverTimestamp(),
    });
  }

  return new NextResponse(JSON.stringify({ reply }), { status: 200 });
}
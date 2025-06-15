// src/app/api/gpt/route.ts
// ✅ 이 파일은 이전 /api/gpt35, /api/reply 기능을 통합한 리팩토링 버전입니다.
// ⛔ 기존 감정 기반 요약(gpt35) 및 응답(reply) API는 삭제되었습니다.
// ✨ Free 요금제는 1000자 제한 및 정보성 질문 회피 로직을 포함하며, 요약/분류까지만 수행합니다. GPT 응답은 Basic/Premium 요금제 전용입니다.

import { NextRequest } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function POST(req: NextRequest) {
  const { sellerId, text, save = false } = await req.json()
  if (!sellerId || !text) {
    return new Response("sellerId 또는 text 누락", { status: 400 })
  }

  const sellerRef = doc(db, "sellers", sellerId)
  const sellerSnap = await getDoc(sellerRef)
  const plan = sellerSnap.data()?.plan || "free"

  if (text.length > 1000) {
    return new Response("입력은 최대 1000자까지 가능합니다.", { status: 400 })
  }

  // Free 요금제는 자동 응답 없음, 메시지만 저장하고 종료
  if (plan === "free") {
    await addDoc(collection(db, `chatLogs/${sellerId}/messages`), {
      text,
      createdAt: serverTimestamp(),
    })

    return Response.json({ message: "접수되었습니다. 운영자가 확인 후 답변드릴 예정입니다." })
  }

  // AI 정보성 질문 회피 및 상담 범위 제한 안내 응답
  const cannedResponse = `<상담 범위 안내>
본 AI는 판매자 상품/서비스 관련 문의에 응답합니다.
기술, 건강, 법률 등 일반 정보나 개인적 조언은 제공하지 않습니다.
도움을 드릴 수 있는 문의를 남겨주세요.`

  await addDoc(collection(db, `chatLogs/${sellerId}/replies`), {
    text,
    reply: cannedResponse,
    createdAt: serverTimestamp(),
    metadata: {
      ip: req.headers.get("x-forwarded-for") || req.headers.get("host"),
      receivedAt: new Date().toISOString(),
    },
  })

  return Response.json({ reply: cannedResponse })
}

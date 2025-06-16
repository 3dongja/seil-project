import { NextRequest, NextResponse } from "next/server";
import { adminDb as db, admin } from "@/lib/firebase-admin";
import { OpenAI } from "openai";
import { incrementFreePlanSummaryCount } from "@/hooks/utils/usageStatsLimiter";

export async function POST(req: NextRequest) {
  const { sellerId, text, save = false } = await req.json();
  if (!sellerId || !text) {
    return new NextResponse("sellerId 또는 text 누락", { status: 400 });
  }

  const sellerRef = db.collection("sellers").doc(sellerId);
  const sellerSnap = await sellerRef.get();
  const plan = sellerSnap.data()?.plan || "free";

  if (text.length > 1000) {
    return new NextResponse("입력은 최대 1000자까지 가능합니다.", { status: 400 });
  }

  // Free 요금제: 사용량 제한 체크 + 안내 메시지 처리
  if (plan === "free") {
    const { blocked } = await incrementFreePlanSummaryCount(sellerId);
    if (blocked) {
      return new NextResponse(
        JSON.stringify({ message: "요약 횟수를 초과하였습니다. (일 5회, 월 20회 제한)" }),
        { status: 429 }
      );
    }
  }

  const apiKey = process.env.OPENAI_API_KEY_GPT35; // 요약은 항상 3.5 사용
  if (!apiKey) {
    return new NextResponse("OpenAI API 키가 설정되지 않았습니다.", { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  const model = "gpt-3.5-turbo";

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "당신은 친절한 요약 AI입니다." },
      { role: "user", content: text },
    ],
  });

  const reply = completion.choices[0].message?.content || "죄송합니다, 응답을 생성하지 못했습니다.";

  if (save) {
    await db.collection("sellers").doc(sellerId).collection("summaryLogs").add({
      text,
      reply,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  return new NextResponse(JSON.stringify({ reply }), { status: 200 });
}

import { NextRequest, NextResponse } from "next/server";
import { adminDb as db, admin } from "@/lib/firebase-admin";
import { OpenAI } from "openai";
import { incrementFreePlanSummaryCount } from "@/hooks/utils/usageStatsLimiter";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("[DEBUG] 수신된 요청 바디:", body);

  const { sellerId, text, save = false } = body;
  if (!sellerId || !text) {
    console.warn("[DEBUG] sellerId 또는 text 누락:", body);
    return new NextResponse("sellerId 또는 text 누락", { status: 400 });
  }

  const sellerRef = db.collection("sellers").doc(sellerId);
  const sellerSnap = await sellerRef.get();
  const plan = sellerSnap.data()?.plan || "free";

  if (text.length > 1000) {
    console.warn("[DEBUG] 입력 글자수 초과:", text.length);
    return new NextResponse("입력은 최대 1000자까지 가능합니다.", { status: 400 });
  }

  if (plan === "free") {
    console.warn("[DEBUG] 무료 요금제 접근 차단");
    return new NextResponse(
      JSON.stringify({ message: "챗봇 기능은 무료 요금제에서 지원하지 않습니다." }),
      { status: 403 }
    );
  }

  const apiKey =
    plan === "premium"
      ? process.env.OPENAI_API_KEY_GPT40
      : process.env.OPENAI_API_KEY_GPT35;

  if (!apiKey) {
    console.error("[DEBUG] OpenAI API 키 미설정");
    return new NextResponse("OpenAI API 키가 설정되지 않았습니다.", { status: 500 });
  }

  const openai = new OpenAI({ apiKey });
  const model = plan === "premium" ? "gpt-4" : "gpt-3.5-turbo";

  console.log("[DEBUG] model:", model);
  console.log("[DEBUG] user text:", text);

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "당신은 친절한 상담 AI입니다." },
      { role: "user", content: text },
    ],
  });

  const reply = completion.choices[0].message?.content || "죄송합니다, 응답을 생성하지 못했습니다.";

  console.log("[DEBUG] GPT 응답:", reply);

  if (save) {
    const threadsRef = db.collection("sellers").doc(sellerId).collection("threads");
    const threadDoc = await threadsRef.add({ createdAt: admin.firestore.FieldValue.serverTimestamp(), userMessage: text });

    const threadMessagesRef = threadDoc.collection("messages");
    await threadMessagesRef.add({
      sender: "user",
      content: text,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    await threadMessagesRef.add({
      sender: "gpt",
      content: reply,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("[DEBUG] 대화 저장 완료");
  }

  return new NextResponse(JSON.stringify({ reply }), { status: 200 });
}

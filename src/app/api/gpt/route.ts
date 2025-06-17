import { NextRequest, NextResponse } from "next/server";
import { adminDb as db, admin } from "@/lib/firebase-admin";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[TEST] 수신된 요청 바디:", body);

    const { sellerId, text, save = false } = body;
    if (!sellerId || !text) {
      console.warn("[TEST] sellerId 또는 text 누락:", body);
      return new NextResponse(
        JSON.stringify({ error: "sellerId 또는 text 누락" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 파이어스토어에서 요금제 조회
    const sellerRef = db.collection("sellers").doc(sellerId);
    const sellerSnap = await sellerRef.get();
    const plan = sellerSnap.data()?.plan || "free";

    if (text.length > 1000) {
      console.warn("[TEST] 입력 글자수 초과:", text.length);
      return new NextResponse(
        JSON.stringify({ error: "입력은 최대 1000자까지 가능합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (plan === "free") {
      console.warn("[TEST] 무료 요금제 접근 차단");
      return new NextResponse(
        JSON.stringify({ message: "챗봇 기능은 무료 요금제에서 지원하지 않습니다." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey =
      plan === "premium"
        ? process.env.OPENAI_API_KEY_GPT40
        : process.env.OPENAI_API_KEY_GPT35;

    if (!apiKey) {
      console.error("[TEST] OpenAI API 키 미설정");
      return new NextResponse(
        JSON.stringify({ error: "OpenAI API 키가 설정되지 않았습니다." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey });
    const model = plan === "premium" ? "gpt-4" : "gpt-3.5-turbo";

    console.log("[TEST] 모델:", model);
    console.log("[TEST] 사용자 입력:", text);

    let reply = "죄송합니다, 응답을 생성하지 못했습니다.";

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "당신은 친절한 상담 AI입니다." },
          { role: "user", content: text },
        ],
      });
      reply = completion.choices[0].message?.content || reply;
    } catch (error) {
      console.error("[TEST] GPT 호출 실패:", error);
    }

    console.log("[TEST] GPT 응답:", reply);

    // save가 true면 파이어스토어에 대화 저장 (옵션)
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
      console.log("[TEST] 대화 저장 완료");
    }

    return new NextResponse(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[TEST] 처리 중 예외 발생:", error);
    return new NextResponse(JSON.stringify({ error: "서버 처리 중 오류가 발생했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

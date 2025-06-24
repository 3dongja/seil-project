import { NextRequest, NextResponse } from "next/server";
import { adminDb as db, admin } from "@/lib/firebase-admin";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API GPT] 수신된 요청 바디:", body);

    const { sellerId, inquiryId, prompt, text, save = false } = body;
    if (!sellerId || !prompt || !text || !inquiryId) {
      return new NextResponse(
        JSON.stringify({ error: "sellerId, inquiryId, prompt, text 중 누락된 값이 있습니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sellerRef = db.collection("sellers").doc(sellerId);
    const sellerSnap = await sellerRef.get();
    if (!sellerSnap.exists) {
      return new NextResponse(
        JSON.stringify({ error: "sellerId가 존재하지 않습니다." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const plan = sellerSnap.data()?.plan || "free";
    if (plan === "free") {
      return new NextResponse(
        JSON.stringify({ error: "무료 요금제에서는 챗봇 사용이 제한됩니다." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const openAiApiKey =
      plan === "premium"
        ? process.env.OPENAI_API_KEY_GPT40
        : process.env.OPENAI_API_KEY_GPT35;

    const model = plan === "premium" ? "gpt-4" : "gpt-3.5-turbo";

    if (!openAiApiKey) {
      return new NextResponse(
        JSON.stringify({ error: "OpenAI API 키가 설정되지 않았습니다." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({ apiKey: openAiApiKey });

    let reply = "죄송합니다. 응답 생성에 실패했습니다.";

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text },
        ],
      });
      reply = completion.choices[0].message?.content || reply;
    } catch (error) {
      console.error("[GPT 호출 실패]", error);
      return new NextResponse(
        JSON.stringify({ error: "GPT 호출 중 오류가 발생했습니다." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Firestore 대화 저장 (기존 thread → inquiries로 수정)
    if (save) {
      const inquiryRef = db
        .collection("sellers")
        .doc(sellerId)
        .collection("inquiries")
        .doc(inquiryId)
        .collection("messages");

      await inquiryRef.add({
        sender: "user",
        content: text,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await inquiryRef.add({
        sender: "bot",
        content: reply,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("[API GPT] 메시지 저장 완료 (inquiries)");
    }

    return new NextResponse(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[API GPT] 서버 처리 오류", error);
    return new NextResponse(
      JSON.stringify({ error: "서버 처리 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

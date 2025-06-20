// src/app/api/summary/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { adminDb as db, admin } from "@/lib/firebase-admin";
import { incrementFreePlanSummaryCount } from "@/hooks/utils/usageStatsLimiter";
import { OpenAI } from "openai";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { sellerId, text, inquiryId, save = true, templateName, summaryType = "basic", tags = [] } = await req.json();

    if (!sellerId || !text || !inquiryId) {
      return new NextResponse("sellerId, text, inquiryId 누락", { status: 400 });
    }

    const sellerRef = db.collection("sellers").doc(sellerId);
    const sellerSnap = await sellerRef.get();
    const sellerData = sellerSnap.data();
    const plan = sellerData?.plan || "free";

    if (text.length > 1000) {
      return new NextResponse("입력은 최대 1000자까지 가능합니다.", { status: 400 });
    }

    const summarySnap = await db
      .collection("summaryLogs")
      .where("sellerId", "==", sellerId)
      .where("inquiryId", "==", inquiryId)
      .limit(1)
      .get();

    if (!summarySnap.empty) {
      const cached = summarySnap.docs[0].data();
      return NextResponse.json({ reply: cached.reply });
    }

    const settingsRef = sellerRef.collection("settings").doc("chatbot");
    const settingsSnap = await settingsRef.get();
    const settings = settingsSnap.data() || {};

    const industry = settings.industry || "";
    const products = settings.products || "";
    const promptCue = settings.promptCue || "";
    const welcomeMessage = settings.welcomeMessage || "";
    const category = settings.category || "상담";

    if (plan === "free") {
      const { blocked } = await incrementFreePlanSummaryCount(sellerId);
      if (blocked) {
        return new NextResponse(
          JSON.stringify({ message: "요약 횟수를 초과했습니다. 유료 요금제로 업그레이드 해주세요." }),
          { status: 403 }
        );
      }
    }

    const systemPrompt = `당신은 고객센터 요약 AI입니다. 
판매자의 업종과 판매 품목을 참고하되, 그 외 주제나 과거 정보로 벗어나지 말고 고객의 말과 해당 판매자의 업종/상품 안에서만 집중해서 요약하세요.

업종: ${industry}
카테고리: ${category}
판매상품: ${products}

고객에게는 다음과 같이 안내하세요: "${welcomeMessage}"
유도 질문: ${promptCue}

- 요약은 다음 항목만 포함: 요청내용, 이유, 날짜, 연락처
- 말머리 제거: "고객은", "요약:" 금지
- 1~2문장 간결 요약`;

    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    });

    const reply = chat.choices[0].message.content?.trim();

    if (!reply) {
      return new NextResponse("요약 생성 실패", { status: 500 });
    }

    if (save) {
      await db.collection("summaryLogs").add({
        sellerId,
        inquiryId,
        text,
        reply,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection("chatMessages").add({
        from: "system",
        to: sellerId,
        inquiryId,
        message: reply,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    const templatesSnap = await db
      .collection("templates")
      .where("sellerId", "==", sellerId)
      .where("category", "==", category)
      .get();

    for (const doc of templatesSnap.docs) {
      const t = doc.data();
      const matched = t.keywords?.some((kw: string) => reply.includes(kw));
      if (matched) {
        await db.collection("chatMessages").add({
          from: "system",
          to: sellerId,
          inquiryId,
          message: t.message,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;
      }
    }

    const compressed = `입력:${text.replace(/\s+/g, "")} 요약:${reply.replace(/\s+/g, "")}`;
    await db.collection("adminSummaryStore").add({
      sellerId,
      inquiryId,
      data: compressed,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("GPT 요약 실패:", err);
    return new NextResponse("GPT 요약 요청 중 오류가 발생했습니다.", { status: 500 });
  }
}

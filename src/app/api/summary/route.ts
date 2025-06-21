// src/app/api/summary/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  Timestamp,
  getDocs,
  query,
  where
} from "firebase/firestore";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const body = await req.json();
  const { sellerId, inquiryId, messages, plan = "free" } = body;

  if (!sellerId || !inquiryId || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // 설정 정보 가져오기
  const sellerRef = doc(db, "sellers", sellerId);
  const settingsRef = doc(sellerRef, "settings/chatbot");
  const settingsSnap = await getDoc(settingsRef);
  const settings = settingsSnap.exists() ? settingsSnap.data() : {};

  const industry = settings.industry || "";
  const products = settings.products || "";
  const promptCue = settings.promptCue || "";
  const welcomeMessage = settings.welcomeMessage || "";
  const category = settings.category || "상담";

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

  const summaryMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
    { role: "user", content: "위 대화를 상담자 입장에서 요약해줘. 단답형이 아닌 설명식으로 정리해줘." }
  ];

  let summary = "";
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: summaryMessages,
    });
    summary = chat.choices[0].message.content ?? "요약 실패";
  } catch (err) {
    console.error("요약 실패:", err);
    summary = "요약 실패 (시스템 오류 발생)";
  }

  const createdAt = Timestamp.now();

  const summaryDoc = {
    sender: "system",
    text: summary,
    createdAt,
    type: "summary",
    status: "done",
  };

  const logDoc = {
    sellerId,
    inquiryId,
    reply: summary,
    source: "summary-api",
    createdAt,
  };

  try {
    await Promise.all([
      addDoc(collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"), summaryDoc),
      addDoc(collection(db, "admin", "chat-logs", "logs"), logDoc),
    ]);

    const templatesSnap = await getDocs(query(
      collection(db, "templates"),
      where("sellerId", "==", sellerId),
      where("category", "==", category)
    ));

    for (const docSnap of templatesSnap.docs) {
      const t = docSnap.data();
      const matched = t.keywords?.some((kw: string) => summary.includes(kw));
      if (matched) {
        await addDoc(collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"), {
          sender: "system",
          text: t.message,
          createdAt: Timestamp.now(),
          type: "template",
          status: "done",
        });
        break;
      }
    }

    const compressed = `입력:${messages.map(m => m.content).join(" ").replace(/\s+/g, "")}` +
      ` 요약:${summary.replace(/\s+/g, "")}`;
    await addDoc(collection(db, "adminSummaryStore"), {
      sellerId,
      inquiryId,
      data: compressed,
      createdAt,
    });

  } catch (err) {
    console.error("Firestore 저장 오류:", err);
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ summary });
}

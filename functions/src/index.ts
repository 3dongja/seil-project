// functions/src/index.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { aggregateStats } from "./utils/statsAggregator";
export { summary } from "./handlers/summary";
export { cleanupSummaries } from "./handlers/cleanup";

import {
  query,
  collection,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,

} from "firebase/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
const OpenAI = require("openai").default;

import { db } from "./lib/firebase-admin";

async function incrementUsageCount(sellerId: string) {
  const ref = db.doc(`usageStats/${sellerId}`);
  const snapshot = await ref.get();
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

  if (!snapshot.exists) {
    await ref.set({ monthlyCount: 1, lastMonth: currentMonth, blocked: false });
    return { blocked: false, count: 1 };
  }

  const data = snapshot.data();
  if (!data) {
    throw new Error(`사용자 usageStats/${sellerId} 문서에 데이터가 존재하지 않습니다.`);
  }
  let count = data.monthlyCount || 0;

  if (data.lastMonth !== currentMonth) {
    await ref.set({ monthlyCount: 1, lastMonth: currentMonth, blocked: false });
    return { blocked: false, count: 1 };
  }

  count += 1;
  const blocked = count > 1000;

  await ref.update({
    monthlyCount: FieldValue.increment(1),
    blocked,
  });

  return { blocked, count };
}
export { aggregateStats };

export const helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase Functions!");
});

export const onUserMessage = functions.firestore
  .document("chatLogs/{sellerId}/rooms/{chatId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const { sellerId, chatId } = context.params;
    const data = snap.data();

    if (data.sender !== "user") return null;

     // 월 채팅 사용량 집계 및 제한 체크 추가
    const { blocked, count } = await incrementUsageCount(sellerId);
    if (blocked) {
      console.log(`❌ ${sellerId} 월 채팅 1,000회 초과, 응답 제한`);
      // 차단 시 GPT 응답 메시지 저장 대신 종료 (원한다면 별도 알림 저장 가능)
      return null;
    }

    const sellerRef = db.doc(`sellers/${sellerId}`);
    const sellerSnap = await sellerRef.get();
    const settings = sellerSnap.data()?.settings || {};

    let { gptEnabled, lastAdminActive, plan } = settings;

    const now = Date.now();
    const adminLast = lastAdminActive?.toMillis?.() ?? 0;
    const isAdminOnline = now - adminLast < 10 * 60 * 1000;

    if (!gptEnabled && !isAdminOnline) {
      await sellerRef.update({ "settings.gptEnabled": true });
      gptEnabled = true;
    }

    if (!gptEnabled) return null;
     
    // 신규 메시지 알림 저장
    const alertRef = db.collection(`sellers/${sellerId}/alerts`);
    await alertRef.add({
      type: "new_message",
      chatId,
      messageId: snap.id,
      userId: data.userId || null,
      createdAt: FieldValue.serverTimestamp(),
      read: false,
    });
    
    const model = plan === "premium" ? "gpt-4" : "gpt-3.5-turbo";
    const apiKey = plan === "premium"
      ? functions.config().openai.gpt40
      : functions.config().openai.gpt35;

    if (!apiKey) {
      console.error("❌ OpenAI API 키가 설정되지 않았습니다.");
      return null;
    }

    try {
      const openai = new OpenAI({ apiKey });

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "당신은 친절한 고객 상담원입니다. 질문에 간단하고 명확하게 답해주세요.",
          },
          {
            role: "user",
            content: data.text,
          },
        ],
      });

      const reply =
        response.choices[0]?.message?.content ??
        "죄송합니다. 답변을 생성하지 못했습니다.";

      await db
        .collection(`chatLogs/${sellerId}/rooms/${chatId}/messages`)
        .add({
          sender: "gpt",
          text: reply,
          createdAt: FieldValue.serverTimestamp(),
        });
    } catch (err) {
      console.error("❌ GPT 오류:", err);
    }
    exports.updateAdminActive = functions.pubsub
  .schedule('every 9 minutes 30 seconds')
  .onRun(async () => {
    const usersSnap = await db.collection('users').get();

    const now = admin.firestore.FieldValue.serverTimestamp();
    const updates = [];

    for (const userDoc of usersSnap.docs) {
      const sellerRef = db.collection('users').doc(userDoc.id).collection('seller').doc('profile');
      updates.push(
        sellerRef.update({ lastAdminActive: now }).catch((e: any) => console.log(`❌ ${userDoc.id} 실패`, e))
      );
    }

    await Promise.all(updates);
    console.log('✅ lastAdminActive 갱신 완료');
  });
  
    return null;
  });
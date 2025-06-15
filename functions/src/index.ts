// functions/src/index.ts

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const OpenAI = require("openai").default;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: functions.config().fb.project_id,
    clientEmail: functions.config().fb.client_email,
    privateKey: functions.config().fb.private_key.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();

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

export const helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase Functions!");
});

export const onUserMessage = functions.firestore
  .document("chatLogs/{sellerId}/rooms/{chatId}/messages/{messageId}")
  .onCreate(async (snap, context) => {
    const { sellerId, chatId } = context.params;
    const data = snap.data();

    if (data.sender !== "user") return null;

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

    return null;
  });

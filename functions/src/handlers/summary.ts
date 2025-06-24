// src/handlers/summary.ts
import * as functions from "firebase-functions";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { db } from "../lib/firebase-admin";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_GPT35,
});

function getCurrentDateKey() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getCurrentMonthKey() {
  const now = new Date();
  return now.toISOString().slice(0, 7); // YYYY-MM
}

export const summary = functions
  .runWith({ timeoutSeconds: 15, memory: "256MB" })
  .https.onRequest(async (req, res) => {
    try {
      const { messages, sellerId, inquiryId } = req.body;

      if (!Array.isArray(messages) || !sellerId) {
        res.status(400).send("Invalid request");
        return;
      }

      // 🔐 요금제 확인
      const sellerSnap = await db.doc(`sellers/${sellerId}`).get();
      const sellerData = sellerSnap.exists ? sellerSnap.data() : null;
      if (!sellerData) {
        res.status(403).json({ error: "판매자 정보가 없습니다." });
        return;
      }
      const plan = sellerData.plan || "free";

      // 📊 사용량 제한 확인
      const usageRef = db.doc(`usageStats/${sellerId}`);
      const usageSnap = await usageRef.get();
      const usageData = usageSnap.exists ? usageSnap.data() || {} : {};

      const monthlyCount = usageData.monthlyChatCount || 0;
      const dailyKey = getCurrentDateKey();
      const dailyCount = usageData.daily?.[dailyKey] || 0;

      if (plan === "free") {
        if (dailyCount >= 5 || monthlyCount >= 30) {
          res.status(403).json({ error: "Free 요금제는 요약 기능이 일 5회, 월 30회로 제한됩니다." });
          return;
        }
      } else {
        if (monthlyCount >= 1000) {
          res.status(403).json({ error: "GPT 챗봇 사용량이 초과되었습니다." });
          return;
        }
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
      });

      const summary = completion.choices[0]?.message?.content ?? "요약 실패";

      await db.collection("admin").doc("chat-logs").collection("logs").add({
        sellerId,
        inquiryId,
        reply: summary,
        source: "api-summary",
        createdAt: new Date(),
      });

      await db
        .collection("admin")
        .doc("chat-logs")
        .collection("rooms")
        .doc(`${sellerId}-${inquiryId}`)
        .collection("messages")
        .add({
          text: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
          reply: summary,
          sender: "gpt",
          createdAt: new Date(),
        });

      // 🔄 사용량 업데이트
      const monthKey = getCurrentMonthKey();
      const updateData: any = {
        monthlyChatCount: monthlyCount + 1,
        lastMonth: monthKey,
      };
      updateData[`daily.${dailyKey}`] = dailyCount + 1;
      await usageRef.set(updateData, { merge: true });

      res.status(200).json({ summary });
    } catch (err) {
      console.error("Summary error", err);
      res.status(500).send("Internal server error");
    }
  });

// src/handlers/summary.ts
import * as functions from "firebase-functions";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { db } from "../lib/firebase-admin";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_GPT35,
});

export const summary = functions
  .runWith({ timeoutSeconds: 15, memory: "256MB" })
  .https.onRequest(async (req, res) => {
    try {
      const { messages, sellerId, inquiryId } = req.body;

      if (!Array.isArray(messages)) {
        res.status(400).send("Invalid message format");
        return;
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

      // ✅ 관리자용 GPT 응답 로그 저장 (src/handlers/summary.ts)
      await db.collection("admin")
        .doc("chat-logs")
        .collection("rooms")
        .doc(`${sellerId}-${inquiryId}`)
        .collection("messages")
        .add({
          text: messages.map(m => `${m.role}: ${m.content}`).join("\n"),
          reply: summary,
          sender: "gpt",
          createdAt: new Date(),
        });

      res.status(200).json({ summary });
    } catch (err) {
      console.error("Summary error:", err);
      res.status(500).send("Server error");
    }
  });

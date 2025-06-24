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

export { aggregateStats };

export const helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase Functions!");
});

export const onUserMessage = functions.firestore
  .document("chatLogs/{sellerId}/rooms/{chatId}/messages/{messageId}")
  .onCreate(
    async (
      snap: admin.firestore.DocumentSnapshot,
      context: functions.EventContext
    ) => {
      const { sellerId, chatId } = context.params;
      const data = snap.data();

      if (!data) return null;
      if (data.sender !== "user") return null;

      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_GPT35 });

        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
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
          .collection("chatLogs")
          .doc(sellerId)
          .collection("rooms")
          .doc(chatId)
          .collection("messages")
          .add({
            text: reply,
            sender: "gpt",
            createdAt: new Date(),
          });
      } catch (error) {
        console.error("OpenAI 응답 오류:", error);
      }

      return null;
    }
  );

export const deleteOldMessages = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context: functions.EventContext) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const snapshot = await db
      .collectionGroup("messages")
      .where("createdAt", "<", cutoff)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();
    console.log(`${snapshot.size} old messages deleted.`);
  });

export const syncSellerStats = functions.firestore
  .document("sellers/{sellerId}")
  .onUpdate(
    async (
      change: functions.Change<admin.firestore.DocumentSnapshot>,
      context: functions.EventContext
    ) => {
      const before = change.before.data();
      const after = change.after.data();
      if (before?.name !== after?.name) {
        await db.doc(`sellerStats/${context.params.sellerId}`).set(
          { name: after?.name },
          { merge: true }
        );
      }
    }
  );

export const handleAdminCommand = functions.firestore
  .document("adminCommands/{commandId}")
  .onCreate(
    async (
      snap: admin.firestore.DocumentSnapshot,
      context: functions.EventContext
    ) => {
      try {
        const command = snap.data();
        if (!command) {
          console.warn("Empty command data", context.params.commandId);
          return;
        }
        if (command.type === "broadcast") {
          const sellersSnap = await db.collection("sellers").get();
          const batch = db.batch();

          sellersSnap.forEach((doc) => {
            batch.set(
              db.doc(`sellers/${doc.id}/notifications/${context.params.commandId}`),
              {
                message: command.message,
                createdAt: new Date(),
              }
            );
          });

          await batch.commit();
        }
      } catch (error) {
        console.error("handleAdminCommand error:", error);
      }
    }
  );

export const unused = functions.https.onRequest((req, res) => {
  res.send("This is a placeholder for future exports.");
});

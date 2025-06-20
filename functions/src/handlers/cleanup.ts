// functions/src/handlers/cleanup.ts

import * as functions from "firebase-functions";
import { db } from "../lib/firebase-admin";

export const cleanupSummaries = functions.pubsub.schedule("every 24 hours").onRun(async (context) => {
  const now = new Date();

  const deleteExpired = async (days: number) => {
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const snap = await db.collection("summaryLogs").where("createdAt", "<", cutoff).get();
    const batch = db.batch();
    snap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`🧹 Deleted ${snap.size} expired summaries (${days}일 초과)`);
  };

  await deleteExpired(7);
  await deleteExpired(30);

  return null;
});

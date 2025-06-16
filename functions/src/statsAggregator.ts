// functions/src/statsAggregator.ts

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

const db = admin.firestore();

export const aggregateStats = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  console.log("Stats aggregation started");

  const sellersSnap = await db.collection('sellers').get();

  for (const sellerDoc of sellersSnap.docs) {
    const sellerId = sellerDoc.id;

    // 예: 지난 하루 동안 채팅 메시지 수 집계
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(yesterday.setHours(0,0,0,0)));
    const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(yesterday.setHours(23,59,59,999)));

    // 채팅 메시지 수 조회
    const chatMessagesSnap = await db.collectionGroup('messages')
      .where('createdAt', '>=', startTimestamp)
      .where('createdAt', '<=', endTimestamp)
      .where('sender', '==', 'user')
      .get();

    const chatCount = chatMessagesSnap.size;

    // 요약 요청 수 (예시, summaryLogs 컬렉션 구조에 맞게 수정 필요)
    const summarySnap = await db.collection('summaryLogs').doc(sellerId).collection('summaries')
      .where('createdAt', '>=', startTimestamp)
      .where('createdAt', '<=', endTimestamp)
      .get();

    const summaryCount = summarySnap.size;

    // 기타 집계도 같은 방식으로 추가 가능

    // 결과 저장
    await db.collection('sellers').doc(sellerId).collection('stats').doc('daily').set({
      date: startTimestamp,
      chatCount,
      summaryCount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Stats updated for seller ${sellerId}`);
  }

  console.log("Stats aggregation completed");
});

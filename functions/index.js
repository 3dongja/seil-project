// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

// ✅ 상담 통계 업데이트 (채팅 기준)
exports.updateStatsOnChatChange = functions.firestore
  .document("chats/{chatId}")
  .onWrite(async (change, context) => {
    const newValue = change.after.exists ? change.after.data() : null;
    const oldValue = change.before.exists ? change.before.data() : null;

    const sellerId = newValue?.sellerId || oldValue?.sellerId;
    if (!sellerId) return;

    const sellerRef = db.collection("sellers").doc(sellerId);
    const sellerSnap = await sellerRef.get();
    const stats = sellerSnap.data().stats || {
      상담수: 0,
      채팅접수: 0,
      완료: 0,
      자동응답횟수: 0
    };

    if (!oldValue && newValue) {
      stats.채팅접수 += 1;
    }

    if (oldValue && newValue && oldValue.status !== newValue.status) {
      if (newValue.status === "완료") {
        stats.완료 += 1;
      }
    }

    stats.상담수 = stats.채팅접수 + stats.완료;
    await sellerRef.update({ stats });
  });

// ✅ 자동응답 횟수 누적 및 요금제 처리
exports.trackGptReplyUsage = functions.firestore
  .document("replies/{replyId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const sellerId = data.sellerId;
    if (!sellerId) return;

    const sellerRef = db.collection("sellers").doc(sellerId);
    const sellerSnap = await sellerRef.get();
    const sellerData = sellerSnap.data();
    const stats = sellerData.stats || {};
    const replyCount = stats.자동응답횟수 || 0;
    const 추가이용가능 = sellerData.settings?.추가이용가능 || false;
    const 자동차감모드 = sellerData.settings?.자동차감모드 || false;

    const newCount = replyCount + 1;
    const reachedLimit = newCount >= 1000;

    // 응답 누적
    const updateData = {
      "stats.자동응답횟수": newCount
    };

    if (reachedLimit && !추가이용가능) {
      updateData["settings.gptEnabled"] = false;
    }

    await sellerRef.update(updateData);

    // 🚨 자동차감모드이면 요금 차감 로그 기록 (예: billingLogs 콜렉션)
    if (reachedLimit && 추가이용가능 && 자동차감모드) {
      await db.collection("billingLogs").add({
        sellerId,
        type: "GPT 추가사용",
        amount: 100,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "pending"
      });
    }
  });

// ✅ 요약 사용 제한 (Free 요금제 하루 5회 / 월 20회 제한)
exports.trackSummaryUsage = functions.https.onCall(async (data, context) => {
  const { sellerId } = data;
  if (!sellerId) throw new functions.https.HttpsError("invalid-argument", "sellerId 필요");

  const sellerRef = db.collection("sellers").doc(sellerId);
  const sellerSnap = await sellerRef.get();
  const sellerData = sellerSnap.data();
  const plan = sellerData.plan || "free";

  if (plan !== "free") return { allowed: true };

  const today = new Date().toISOString().split("T")[0];
  const usageRef = db.collection("summaryUsage").doc(`${sellerId}_${today}`);
  const usageSnap = await usageRef.get();
  const todayCount = usageSnap.exists ? usageSnap.data().count : 0;

  if (todayCount >= 5) {
    return { allowed: false, reason: "일일 요약 횟수 초과" };
  }

  await usageRef.set({ count: todayCount + 1 }, { merge: true });
  return { allowed: true };
});

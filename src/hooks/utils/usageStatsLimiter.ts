import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

export async function incrementFreePlanSummaryCount(sellerId: string) {
  const ref = db.doc(`usageStats/${sellerId}`);
  const snapshot = await ref.get();
  const today = new Date();
  const currentDay = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

  if (!snapshot.exists) {
    await ref.set({
      dailyCount: { [currentDay]: 1 },
      monthlyCount: 1,
      lastMonth: currentMonth,
    });
    return { blocked: false, daily: 1, monthly: 1 };
  }

  const data = snapshot.data() ?? {};
  let dailyCount = data.dailyCount || {};
  let monthlyCount = data.monthlyCount || 0;

  if (data.lastMonth !== currentMonth) {
    dailyCount = { [currentDay]: 1 };
    monthlyCount = 1;
  } else {
    dailyCount[currentDay] = (dailyCount[currentDay] || 0) + 1;
    monthlyCount += 1;
  }

  const blocked = dailyCount[currentDay] > 5 || monthlyCount > 20;

  await ref.set(
    {
      dailyCount,
      monthlyCount,
      lastMonth: currentMonth,
    },
    { merge: true }
  );

  return { blocked, daily: dailyCount[currentDay], monthly: monthlyCount };
}
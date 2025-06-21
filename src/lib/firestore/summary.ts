// 🔧 src/lib/firestore/summary.ts
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";

const PLAN_LIMITS: Record<string, number> = {
  basic: 2000,
  premium: 10000,
  free: 100,
};

/**
 * 요약 사용량 확인 및 증가 (요금제별 제한 적용)
 * @throws Error("요금제 초과")
 */
export async function checkUsageLimitAndIncrement(sellerId: string) {
  const sellerRef = doc(db, "sellers", sellerId);
  const sellerSnap = await getDoc(sellerRef);
  const data = sellerSnap.exists() ? sellerSnap.data() : {};
  const usage = data?.usage?.count ?? 0;
  const plan = data?.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? 100;

  if (usage >= limit) {
    throw new Error("요금제 초과");
  }

  await updateDoc(sellerRef, {
    "usage.count": increment(1),
    "usage.updatedAt": Timestamp.now(),
  });
}

/**
 * adminSummaryStore에 요약 저장 + inquiries 문서 요약 필드 추가
 */
export async function storeSummaryToAdminStore(
  sellerId: string,
  inquiryId: string,
  summary: string
) {
  try {
    const ref = doc(db, "adminSummaryStore", sellerId, "inquiries", inquiryId);
    const inquiryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId);
    const createdAt = Timestamp.now();

    await Promise.all([
      setDoc(ref, { summary, createdAt }),
      updateDoc(inquiryRef, { summary, updatedAt: createdAt })
    ]);
  } catch (err) {
    console.error("[storeSummaryToAdminStore] 요약 저장 실패:", err);
  }
}

/**
 * 키워드 조건 템플릿 응답 삽입
 */
export async function applyTemplateIfMatched(
  sellerId: string,
  inquiryId: string,
  summary: string,
  category: string
) {
  try {
    const templatesSnap = await getDocs(query(
      collection(db, "templates"),
      where("sellerId", "==", sellerId),
      where("category", "==", category)
    ));

    const now = Timestamp.now();

    for (const docSnap of templatesSnap.docs) {
      const t = docSnap.data();
      const matchedKeyword = t.keywords?.find((kw: string) => summary.includes(kw));
      if (matchedKeyword) {
        const templateText = t.message.length > 1000 ? t.message.slice(0, 1000) : t.message;

        const messageWrite = addDoc(
          collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"),
          {
            sender: "system",
            text: templateText,
            createdAt: now,
            type: "template",
            status: "done",
            templateId: docSnap.id,
          }
        );

        const logWrite = addDoc(
          collection(db, "admin", "chat-logs", "logs"),
          {
            sellerId,
            inquiryId,
            reply: templateText,
            source: "template",
            templateId: docSnap.id,
            matchedKeyword,
            createdAt: now,
          }
        );

        await Promise.all([messageWrite, logWrite]);
        break;
      }
    }
  } catch (err) {
    console.error("[applyTemplateIfMatched] 템플릿 응답 실패:", err);
  }
}

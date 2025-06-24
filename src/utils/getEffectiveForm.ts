// src/utils/getEffectiveForm.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { defaultForms } from "@/constants/defaultForms";

const categoryKeys = ["주문", "예약", "상담", "문의", "반품", "교환"] as const;
export type Category = (typeof categoryKeys)[number];

export async function getEffectiveForm(category: string, sellerId: string) {
  const ref = doc(db, "sellers", sellerId, "questionForms", category);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data(); // 커스텀 설정 존재 시 사용
  }
  if ((categoryKeys as readonly string[]).includes(category)) {
    return defaultForms[category as Category]; // 타입 단언으로 오류 제거
  }
  return null;
}
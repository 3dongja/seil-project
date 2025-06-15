// src/lib/firestore/registerSeller.ts
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

export async function registerSellerIfNeeded(uid: string, sellerId: string) {
  const userRef = doc(db, "sellersByUser", uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) return // 이미 등록된 사용자면 무시

  // 기본 seller 문서 생성
  await setDoc(doc(db, "sellers", sellerId), {
    plan: "free",
    createdAt: Date.now(),
    currentUsage: 0
  })

  // uid → sellerId 매핑
  await setDoc(userRef, { sellerId })
}

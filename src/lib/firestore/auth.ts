// src/lib/firestore/auth.ts
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function getSellerIdByUid(uid: string): Promise<string | null> {
  const ref = doc(db, "sellersByUser", uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data().sellerId : null
}

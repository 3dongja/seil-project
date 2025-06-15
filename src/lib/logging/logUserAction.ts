// src/lib/logging/logUserAction.ts

import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function logUserAction({
  uid,
  action,
  detail,
}: {
  uid: string
  action: string
  detail: string
}) {
  try {
    await addDoc(collection(db, "userLogs"), {
      uid,
      action,
      detail,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("로그 저장 실패:", error)
  }
}


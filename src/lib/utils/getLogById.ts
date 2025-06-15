// src/lib/utils/getLogById.ts
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ChatLog } from "@/types/ChatLog"

export async function getLogById(logId: string): Promise<ChatLog | null> {
  const docRef = doc(db, "emotion_logs", logId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data() as ChatLog
  } else {
    return null
  }
}

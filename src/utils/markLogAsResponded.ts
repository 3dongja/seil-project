import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

export const markLogAsResponded = async (userId: string, logId: string) => {
  try {
    const logRef = doc(db, `users/${userId}/chatLogs/${logId}`)
    await updateDoc(logRef, { responded: true })
    console.log("응답 완료로 표시됨:", logId)
  } catch (error) {
    console.error("응답 완료 표시 실패:", error)
  }
}

import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function logAdminAction({
  uid,
  action,
  detail,
}: {
  uid: string
  action: string
  detail: string
}) {
  try {
    await addDoc(collection(db, "adminLogs"), {
      uid,
      action,
      detail,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("관리자 로그 저장 실패:", error)
  }
}

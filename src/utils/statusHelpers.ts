// src/utils/statusHelpers.ts

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * 사용자 메시지 상태 자동 전환
 * @param sellerId - 판매자 ID
 * @param messageId - 메시지 문서 ID
 * @param newStatus - '대기중' | '처리중' | '답변완료'
 */
export async function updateMessageStatus(sellerId: string, messageId: string, newStatus: string) {
  try {
    const msgRef = doc(db, `chatLogs/${sellerId}/messages/${messageId}`);
    await updateDoc(msgRef, {
      status: newStatus,
    });
  } catch (error) {
    console.error("상태 전환 실패:", error);
  }
}

/**
 * 응답 완료 후 상태 전환을 위한 헬퍼
 */
export async function markMessageAsCompleted(sellerId: string, messageId: string) {
  await updateMessageStatus(sellerId, messageId, "답변완료");
}

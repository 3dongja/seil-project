// src/app/chat-entry/[sellerId]/page.tsx

import { getFirestore } from "firebase-admin/firestore";
import { redirect } from "next/navigation";

// 타입 충돌 방지: any로 우회
export default async function Page({ params }: any) {
  const firestore = getFirestore();
  const { sellerId } = params;

  const snapshot = await firestore
    .collection("sellers")
    .doc(sellerId)
    .collection("inquiries")
    .where("status", "==", "open")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  const inquiryId = snapshot.empty ? "none" : snapshot.docs[0].id;
  redirect(`/chat-summary/${sellerId}/${inquiryId}`);
}

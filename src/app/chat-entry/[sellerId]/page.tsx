// src/app/chat-entry/[sellerId]/page.tsx

import { getFirestore } from "firebase-admin/firestore";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { sellerId: string } }) {
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

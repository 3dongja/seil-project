// src/app/chat-entry/[sellerId]/page.tsx

import { getFirestore } from "firebase-admin/firestore";
import { admin } from "@/lib/firebase-admin";
import ChatScreenWrapper from "@/components/chat/ChatScreenWrapper";

export default async function Page(props: any) {
  const { sellerId } = props.params as { sellerId: string };
  const firestore = getFirestore();

  const settingsRef = firestore
    .collection("sellers")
    .doc(sellerId)
    .collection("settings")
    .doc("chatbot");
  const settingsSnap = await settingsRef.get();

  const settings = settingsSnap.data();
  const openTime = settings?.openTime ?? "00:00";
  const closeTime = settings?.closeTime ?? "23:59";

  const inquiriesRef = firestore
    .collection("sellers")
    .doc(sellerId)
    .collection("inquiries");
  const snapshot = await inquiriesRef
    .where("status", "==", "open")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) {
    return <div className="p-4 text-center">진행 중인 문의가 없습니다.</div>;
  }

  const inquiryId = snapshot.docs[0].id;

  return (
    <>
      <div className="text-sm text-center text-gray-600 py-2">
        상담 가능 시간: {openTime} ~ {closeTime}
      </div>
      <ChatScreenWrapper sellerId={sellerId} inquiryId={inquiryId} />
    </>
  );
}

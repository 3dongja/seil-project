// src/app/chat-entry/[sellerId]/page.tsx

import { getFirestore } from "firebase-admin/firestore";
import { admin } from "@/lib/firebase-admin";
import ChatScreen from "@/components/chat/ChatScreen";

export default async function Page({ params }: { params: { sellerId: string } }) {
  const { sellerId } = params;
  const firestore = getFirestore();

  const settingsRef = firestore.collection("sellers").doc(sellerId).collection("settings").doc("chatbot");
  const settingsSnap = await settingsRef.get();

  if (!settingsSnap.exists) {
    return <div className="p-4 text-center">상담 설정 정보를 찾을 수 없습니다.</div>;
  }

  const settings = settingsSnap.data();
  const openTime = settings?.openTime ?? "00:00";
  const closeTime = settings?.closeTime ?? "23:59";

  const inquiriesRef = firestore.collection("sellers").doc(sellerId).collection("inquiries");
  const q = inquiriesRef
    .where("status", "==", "open")
    .orderBy("createdAt", "desc")
    .limit(1);

  const snapshot = await q.get();

  if (!snapshot.empty) {
    const firstInquiry = snapshot.docs[0];
    return (
      <>
        <div className="text-sm text-center text-gray-600 py-2">
          상담 가능 시간: {openTime} ~ {closeTime}
        </div>
        <ChatScreen
          sellerId={sellerId}
          inquiryId={firstInquiry.id}
          userType="consumer"
        />
      </>
    );
  }

  return <div className="p-4 text-center">진행 중인 문의가 없습니다.</div>;
}

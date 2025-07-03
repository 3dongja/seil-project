// /src/app/chat-summary/[sellerId]/[inquiryId]/page.tsx
import ChatScreen from "@/components/chat/ChatScreen";
import { notFound, redirect } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function Page({ params }: any) {
  const { sellerId, inquiryId } = params || {};

  if (!sellerId || !inquiryId) return notFound();

  const ref = doc(db, "sellers", sellerId, "inquiries", inquiryId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    redirect(`/chat-summary/${sellerId}`); // 🔒 문의 ID 유효성 체크 실패 시 홈으로 이동
  }

  return (
    <ChatScreen
      sellerId={sellerId}
      inquiryId={inquiryId}
      userType="consumer"
      useApiSummary={true}
    />
  );
}

import ChatScreen from "@/components/chat/ChatScreen";
import { notFound } from "next/navigation";

export default async function Page({ params }: any) {
  const { sellerId, inquiryId } = params || {};

  if (!sellerId || !inquiryId) return notFound();

  return (
    <ChatScreen
      sellerId={sellerId}
      inquiryId={inquiryId}
      userType="consumer"
      useApiSummary={true}
    />
  );
}
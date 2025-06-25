import ChatBotScreen from "@/components/chat/ChatBotScreen";
import { notFound } from "next/navigation";

export default async function Page({ params }: any) {
  const { sellerId, inquiryId } = params || {};

  if (!sellerId || !inquiryId) return notFound();

  return <ChatBotScreen sellerId={sellerId} inquiryId={inquiryId} />;
}
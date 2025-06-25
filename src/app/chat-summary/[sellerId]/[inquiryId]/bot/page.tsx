import ChatBotScreen from "@/components/chat/ChatBotScreen";

export default function Page({ params }: { params: { sellerId: string; inquiryId: string } }) {
  return <ChatBotScreen sellerId={params.sellerId} inquiryId={params.inquiryId} />;
}
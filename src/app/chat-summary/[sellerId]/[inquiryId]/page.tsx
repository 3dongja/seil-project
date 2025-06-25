import ChatScreen from "@/components/chat/ChatScreen";

export default function Page({ params }: { params: { sellerId: string; inquiryId: string } }) {
  return (
    <ChatScreen
      sellerId={params.sellerId}
      inquiryId={params.inquiryId}
      userType="consumer"
      useApiSummary={false} // 🔴 요약 사용하지 않음: 실시간 라이브챗 전용
    />
  );
}

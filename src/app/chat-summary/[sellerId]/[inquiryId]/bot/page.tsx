import ChatBotScreen from "@/components/chat/ChatBotScreen";
import { notFound } from "next/navigation";
import { FC } from "react";

interface Props {
  params: {
    sellerId: string;
    inquiryId: string;
  };
}

const Page: FC<Props> = async ({ params }) => {
  const { sellerId, inquiryId } = params;

  if (!sellerId || !inquiryId) return notFound();

  return <ChatBotScreen sellerId={sellerId} inquiryId={inquiryId} />;
};

export default Page;
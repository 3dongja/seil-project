import { Suspense } from "react";
import ChatPageContent from "./ChatPageContent";

export default async function ChatPage({ params }: any) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent sellerId={params.sellerId} />
    </Suspense>
  );
}
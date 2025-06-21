// src/app/seller-live-chat/page.tsx
import dynamic from "next/dynamic";

const SellerLiveChatWrapper = dynamic(() => import("@/components/chat/SellerLiveChatWrapper"), {
  ssr: false,
});

export default function SellerLiveChatPage() {
  return <SellerLiveChatWrapper />;
}
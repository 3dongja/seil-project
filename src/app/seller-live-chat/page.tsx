// src/app/seller-live-chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collectionGroup, getDocs } from "firebase/firestore";
import ChatScreen from "@/components/chat/ChatScreen";

export default function SellerLiveChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [sellerId, setSellerId] = useState(searchParams.get("seller") || "");
  const inquiryId = searchParams.get("id") || "";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!sellerId && inquiryId) {
      const fetchSeller = async () => {
        const snap = await getDocs(collectionGroup(db, "inquiries"));
        const match = snap.docs.find(doc => doc.id === inquiryId);
        if (match) {
          const path = match.ref.path.split("/");
          const foundSellerId = path[path.indexOf("sellers") + 1];
          setSellerId(foundSellerId);
        }
      };
      fetchSeller();
    }
  }, [inquiryId, sellerId]);

  const handleExit = () => {
    router.push("/seller-logs");
  };

  return (
    <div className="h-screen flex flex-col">
      {isMobile && (
        <button
          onClick={handleExit}
          className="p-3 text-left text-blue-600 font-bold border-b"
        >
          ← 나가기
        </button>
      )}

      <div className="flex-1 overflow-hidden">
        {inquiryId && sellerId ? (
          <ChatScreen sellerId={sellerId} inquiryId={inquiryId} userType="seller" />
        ) : (
          <div className="p-4 text-center text-gray-500">채팅을 선택해주세요.</div>
        )}
      </div>
    </div>
  );
}

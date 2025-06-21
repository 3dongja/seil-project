// src/components/chat/SellerLiveChatWrapper.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collectionGroup, getDocs } from "firebase/firestore";
import ChatScreen from "./ChatScreen";

export default function SellerLiveChatWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sellerId, setSellerId] = useState(searchParams.get("seller") || "");
  const inquiryId = searchParams.get("id") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
      <button
        onClick={handleExit}
        className="p-3 text-left text-blue-600 font-bold border-b md:hidden"
      >
        ← 나가기
      </button>

      <div className="flex items-center justify-between p-2 border-b">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="메시지 검색..."
          className="flex-1 p-2 border rounded mr-2"
        />
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-3 py-2 border rounded text-sm"
        >
          {sortOrder === "asc" ? "오래된순" : "최신순"}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {inquiryId && sellerId ? (
          <ChatScreen
            sellerId={sellerId}
            inquiryId={inquiryId}
            userType="seller"
            searchTerm={searchTerm}
            sortOrder={sortOrder}
          />
        ) : (
          <div className="p-4 text-center text-gray-500">채팅을 선택해주세요.</div>
        )}
      </div>
    </div>
  );
}

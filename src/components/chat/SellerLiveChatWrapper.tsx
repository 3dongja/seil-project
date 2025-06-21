import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { onSnapshot, doc, collection, collectionGroup, getDocs, query, orderBy, limit } from "firebase/firestore";

import { db } from "@/lib/firebase";
import ChatScreen from "@/components/chat/ChatScreen";

interface Props {
  uid: string;
  inquiryId?: string; // 소비자가 직접 접근한 경우
}

export default function SellerLiveChatWrapper({ uid, inquiryId }: Props) {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(inquiryId || null);
  const [sellerId, setSellerId] = useState<string>(uid);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState<boolean>(!!inquiryId);

  // inquiryId로 접근 시 sellerId 추출
  useEffect(() => {
    const fetchSellerAndValidate = async () => {
      if (inquiryId) {
        const snap = await getDocs(collectionGroup(db, "inquiries"));
        const match = snap.docs.find(doc => doc.id === inquiryId);
        if (match) {
          const path = match.ref.path.split("/");
          const foundSellerId = path[path.indexOf("sellers") + 1];
          setSellerId(foundSellerId);
          setSelectedInquiryId(inquiryId);
        }
      }
      setLoading(false);
    };
    fetchSellerAndValidate();
  }, [inquiryId]);

  // 실시간 seller 상태 감지 (사업자 접속 시)
  useEffect(() => {
    if (sellerId && !selectedInquiryId && !inquiryId) {
      const unsubscribe = onSnapshot(doc(db, "sellers", sellerId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.selectedInquiryId) {
            setSelectedInquiryId(data.selectedInquiryId);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [sellerId, selectedInquiryId, inquiryId]);

  // fallback: 가장 최근 채팅으로 진입
  useEffect(() => {
    if (!selectedInquiryId && sellerId) {
      const fetchLatestInquiry = async () => {
        const snap = await getDocs(
          query(collection(db, "sellers", sellerId, "inquiries"), orderBy("createdAt", "desc"), limit(1))
        );
        if (!snap.empty) {
          const latest = snap.docs[0];
          setSelectedInquiryId(latest.id);
        }
      };
      fetchLatestInquiry();
    }
  }, [sellerId, selectedInquiryId]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center p-2 border-b">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="검색어 입력"
          className="border rounded px-2 py-1 text-sm"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="desc">최신순</option>
          <option value="asc">오래된순</option>
        </select>
        <button
          onClick={() => router.push("/seller-logs")}
          className="text-sm text-blue-600 underline"
        >
          나가기
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {selectedInquiryId ? (
          <ChatScreen
            sellerId={sellerId}
            inquiryId={selectedInquiryId}
            userType="seller"
            searchTerm={searchTerm}
            sortOrder={sortOrder}
          />
        ) : loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            채팅을 불러오는 중입니다...
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            활성화된 채팅이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
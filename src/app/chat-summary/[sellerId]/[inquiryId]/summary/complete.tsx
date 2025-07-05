// ✅ src/app/chat-summary/[sellerId]/[inquiryId]/summary/complete.tsx (보안 강화 + 중복 방지)

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { buildPrompt, generateSummary } from "@/lib/gpt/prompt";
import { getAuth } from "firebase/auth";

const SummaryCompletePage = () => {
  const params = useParams();
  const router = useRouter();
  const sellerId = typeof params.sellerId === 'string' ? params.sellerId : params.sellerId?.[0];
  const inquiryId = typeof params.inquiryId === 'string' ? params.inquiryId : params.inquiryId?.[0];
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        if (!sellerId || !inquiryId) return;

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user || user.uid !== sellerId) {
          console.warn("비인가 사용자 접근 차단");
          router.replace(`/chat-summary/${sellerId}`);
          return;
        }

        const inquiryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId);
        const inquirySnap = await getDoc(inquiryRef);
        if (!inquirySnap.exists()) {
          alert("접근 권한이 없습니다. 메인 화면으로 이동합니다.");
          router.replace(`/chat-summary/${sellerId}`);
          return;
        }
        const data = inquirySnap.data();
        if (!data?.name || !data?.phone || !data?.details) {
          alert("사용자 정보가 누락되어 있습니다.");
          router.replace(`/chat-summary/${sellerId}`);
          return;
        }

        // 요약 문서 존재 여부 확인 → 없을 때만 생성
        const summaryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId, "summary", "auto");
        const summarySnap = await getDoc(summaryRef);
        if (!summarySnap.exists()) {
          const prompt = buildPrompt({ name: data.name, phone: data.phone, details: data.details });
          await generateSummary(prompt);
        } else {
          console.log("이미 요약이 생성되어 있음. 재생성 생략");
        }

        const planSnap = await getDoc(doc(db, "sellers", sellerId, "settings", "chatbot"));
        const planData = planSnap.data();
        if (planData?.plan) setPlan(planData.plan);
      } catch (err) {
        console.error("정보 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccess();
  }, [sellerId, inquiryId]);

  const handleBot = () => router.push(`/chat-summary/${sellerId}/${inquiryId}/bot`);
  const handleLiveChat = () => router.push(`/chat-summary/${sellerId}/${inquiryId}`);
  const handleEdit = () => router.push(`/chat-summary/${sellerId}`);

  if (loading) return <div className="text-center py-10">⏳ 로딩 중...</div>;

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6 text-center animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={handleEdit} className="text-gray-600 hover:text-black">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">요약 정보 확인</h1>
      </div>

      <p className="text-gray-600 text-sm">
        추가적인 상담이 필요하시면 아래 방법을 선택하세요. <br />
        단순 저장만 원하실 경우, 이 화면을 닫으셔도 됩니다.
      </p>

      <div className="flex flex-col gap-4">
        {plan !== "free" && (
          <Button onClick={handleBot} className="w-full text-base">
            🤖 AI 챗봇 상담 시작
          </Button>
        )}
        <Button onClick={handleLiveChat} className="w-full text-base">
          🗣 사업주 라이브 상담 연결
        </Button>
        <Button onClick={handleEdit} className="w-full text-sm text-gray-500">
          ✏️ 입력 정보 수정하기
        </Button>
      </div>
    </div>
  );
};

export default SummaryCompletePage;

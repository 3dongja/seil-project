"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Loading from "@/components/layout/Loading";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { buildPrompt, generateSummary } from "@/lib/gpt/prompt";

export default function SummaryCompletePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sellerId = typeof params.sellerId === 'string' ? params.sellerId : params.sellerId?.[0];
  const inquiryId = typeof params.inquiryId === 'string' ? params.inquiryId : params.inquiryId?.[0];
  const message = searchParams.get("message");

  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        alert("로그인이 필요합니다");
        return router.replace("/");
      }
      setUser(currentUser);

      if (!sellerId || !inquiryId) {
        alert("잘못된 접근입니다");
        return router.replace("/");
      }

      const inquiryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId);
      const inquirySnap = await getDoc(inquiryRef);
      if (!inquirySnap.exists()) {
        alert("접근 권한이 없습니다. 메인 화면으로 이동합니다.");
        return router.replace(`/chat-summary/${sellerId}`);
      }
      const data = inquirySnap.data();
      if (!data?.name || !data?.phone || !data?.details) {
        alert("사용자 정보가 누락되어 있습니다.");
        return router.replace(`/chat-summary/${sellerId}`);
      }

      const summaryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId, "summary", "auto");
      const summarySnap = await getDoc(summaryRef);

      if (!summarySnap.exists()) {
        const prompt = buildPrompt({ name: data.name, phone: data.phone, details: data.details });

        // GPT 요약 응답값 저장
        const summary = await generateSummary({
          prompt,
          sellerId,
          inquiryId,
          message: data.details ?? "(내용 없음)",
        });

        await setDoc(summaryRef, {
          content: summary,
          createdAt: serverTimestamp(),
          sellerId,
          inquiryId,
          state: "done"
        });

        setSummary(summary);
      } else {
        setSummary(summarySnap.data().content);
      }

      // ✅ 안정적인 요금제 데이터 불러오기
      const sellerDocRef = doc(db, "sellers", sellerId);
      const profileSnap = await getDoc(sellerDocRef);
      const planData = profileSnap.data();
      console.log("현재 요금제(plan):", planData?.plan);
      if (planData?.plan) setPlan(planData.plan);

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, sellerId, inquiryId, message]);

  const handleBot = () => router.push(`/chat-summary/${sellerId}/${inquiryId}/bot`);
  const handleLiveChat = () => router.push(`/chat-summary/${sellerId}/${inquiryId}`);
  const handleEdit = () => router.push(`/chat-summary/${sellerId}`);

  if (loading) return <Loading />;

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6 text-center animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={handleEdit} className="text-gray-600 hover:text-black">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">요약 정보 확인</h1>
      </div>

      <h2 className="text-xl font-bold mb-4">🎉 요약이 성공적으로 저장되었습니다!</h2>
      {summary ? (
        <>
          <p className="text-sm text-gray-500 whitespace-pre-wrap">{summary}</p>
          <button
            className="mt-2 text-xs underline text-blue-500"
            onClick={() => navigator.clipboard.writeText(summary)}
          >
            복사하기
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-400 italic">추가 메시지 없이 저장되었습니다.</p>
      )}

      <p className="text-gray-600 text-sm">
        추가적인 상담이 필요하시면 아래 방법을 선택하세요. <br />
        단순 저장만 원하실 경우, 이 화면을 닫으셔도 됩니다.
      </p>

      <div className="flex flex-col gap-4">
        {plan && plan !== "free" && (
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
}

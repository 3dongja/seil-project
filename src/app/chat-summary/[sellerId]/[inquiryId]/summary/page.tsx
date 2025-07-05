"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Props {
  sellerId: string;
  inquiryId: string;
  onSelect: (mode: "chat" | "summary" | "bot") => void;
}

export default function SummaryResultModal({ sellerId, inquiryId, onSelect }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    const fetchPlan = async () => {
      if (!sellerId) return;
      const planRef = doc(db, "plans", sellerId);
      const planSnap = await getDoc(planRef);
      if (planSnap.exists()) {
        const data = planSnap.data();
        setPlan(data.tier || "free");
      }
    };
    fetchPlan();
  }, [sellerId]);

  const validateBeforePush = async (sellerId: string, inquiryId: string) => {
    if (!sellerId || !inquiryId) {
      alert("잘못된 접근입니다. 판매자 또는 문의 ID가 없습니다.");
      return false;
    }
    const inquiryRef = doc(db, "inquiries", inquiryId);
    const inquirySnap = await getDoc(inquiryRef);
    if (!inquirySnap.exists()) {
      alert("해당 문의 내역을 찾을 수 없습니다.");
      return false;
    }
    return true;
  };

  const handleClick = async (mode: "chat" | "summary" | "bot") => {
    if (mode === "bot" && plan === "free") {
      alert("챗봇 기능은 유료 요금제에서만 사용 가능합니다.");
      return;
    }
    const isValid = await validateBeforePush(sellerId, inquiryId);
    if (!isValid) return;
    await router.push(`/chat-summary/${sellerId}/${inquiryId}/${mode}`);
    onSelect(mode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl w-80 px-4 pt-6 pb-4 space-y-4">
        <Option
          title="정보사항 저장하기"
          image="/bot-3.png"
          description="내용을 저장하고 추후에 요약 검토나 후속 처리를 진행할 수 있습니다."
          onClick={() => handleClick("summary")}
        />
        <Option
          title="상담원 1:1 신청"
          image="/bot-2.png"
          description="대기 시간이 발생할 수 있습니다. 정확하게 정보를 남겨주시면 빠르게 답변 드리겠습니다."
          onClick={() => handleClick("chat")}
        />
        <Option
          title="챗봇 자동응답"
          image="/bot-1.png"
          description="바로 답변 가능하지만 AI 특성상 정확하지 않은 답변이 있을 수 있습니다. 정확하고 간단하게 넘겨주시면 빠르게 확인드리겠습니다."
          onClick={() => handleClick("bot")}
          disabled={plan === "free"}
        />
      </div>
    </div>
  );
}

function Option({ title, image, description, onClick, disabled = false }: any) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:ring-2 hover:ring-blue-500 cursor-pointer w-72 h-80 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <Image src={image} width={320} height={160} className="w-full object-cover h-40" alt={title} />
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-lg text-center">{title}</h3>
        <p className="text-gray-500 text-sm text-center whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
}

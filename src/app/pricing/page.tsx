// src/app/pricing/page.tsx

"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import useUserRoles from "@/hooks/useUserRoles";

const plans = [
  {
    name: "Free",
    price: "0원",
    features: [
      "❌ 1:1 AI 채팅 없음",
      "✅ GPT 요약 제공 (하루 5회 / 월 20회 제한)"
    ],
    value: "free",
    highlight: false,
    description: ""
  },
  {
    name: "Basic",
    price: "월 9,900원",
    features: [
      "✅ GPT-3.5 (Basic) 1:1 AI 채팅봇",
      "gpt 요약제공 무제한",
      "→ 채팅봇 1,000회 초과 시 건당 100원씩 별도 과금됨"
    ],
    value: "basic",
    highlight: true,
    description: "추천 요금제"
  },
  {
    name: "Premium",
    price: "월 49,900원",
    features: [
      "✅ GPT-4.0 (Premium) 1:1 AI 채팅봇",
      "gpt 요약제공 무제한",
      "→ 채팅봇 1,000회 초과 시 건당 100원씩 별도 과금됨"
    ],
    value: "premium",
    highlight: true,
    description: "최고 성능 사람같은AI 추천"
  },
];

export default function PricingPage() {
  const { user } = useUserRoles();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "sellers", user.uid)).then((snap) => {
        setCurrentPlan(snap.data()?.plan || "free");
      });
    }
  }, [user]);

  const handleSelect = async (plan: string) => {
    if (!user) return;
    await updateDoc(doc(db, "sellers", user.uid), { plan });
    setCurrentPlan(plan);
    router.push("/seller-info");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 bg-white rounded-lg shadow-md p-6">
      <button onClick={() => router.back()} className="text-sm text-blue-600 underline mb-4">
        ← 뒤로가기
      </button>
      <h1 className="text-2xl font-bold text-center mb-6">요금제 선택</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = p.value === currentPlan;
          return (
            <div
              key={p.value}
              className={`border rounded-lg p-4 shadow-sm hover:shadow-md relative ${p.highlight ? 'border-blue-500 ring-1 ring-blue-400' : ''} ${isCurrent ? 'bg-green-50 border-green-500' : ''}`}
            >
              {p.description && (
                <div className="absolute -top-3 left-3 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  {p.description}
                </div>
              )}
              <h2 className="text-lg font-semibold mb-1">{p.name}</h2>
              <p className="text-blue-600 font-bold mb-2">{p.price}</p>
              <ul className="text-sm text-gray-700 mb-3 list-disc list-inside space-y-1">
                {p.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <button
                onClick={() => handleSelect(p.value)}
                className={`w-full py-2 rounded text-white ${isCurrent ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                disabled={isCurrent}
              >
                {isCurrent ? "현재 요금제" : "지금 시작하기"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400 text-center mt-8">
        * 요금제별 기능은 이용 조건 및 GPT API 정책에 따라 일부 변경될 수 있습니다.
      </p>
    </div>
  );
}

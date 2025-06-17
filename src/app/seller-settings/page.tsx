"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import useUserRoles from "@/hooks/useUserRoles";

export default function SellerSettingsPage() {
  const { user, isSeller, loading } = useUserRoles();
  const [form, setForm] = useState({
    industry: "",
    products: "",
    promptCue: "",
    welcomeMessage: ""
  });
  const [systemPrompt, setSystemPrompt] = useState("");

  useEffect(() => {
    if (!loading && user && isSeller) {
      const sellerId = user.uid;
      const ref = doc(db, "sellers", sellerId, "settings", "chatbot");
      getDoc(ref).then((snap) => {
        const data = snap.data();
        if (data) {
          setForm((prev) => ({ ...prev, ...data }));
        }
      });
    }
  }, [loading, user, isSeller]);

  useEffect(() => {
    const { industry, products, promptCue, welcomeMessage } = form;
    const prompt = `업종은 ${industry}, 판매상품은 ${products}입니다. 고객에게는 다음과 같이 안내하세요: "${welcomeMessage}" 유도 질문: ${promptCue}`;
    setSystemPrompt(prompt);
  }, [form]);

  const updateField = (field: string, value: string) => {
    if (field === "promptCue" && value.length > 50) return;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    const ref = doc(db, "sellers", user.uid, "settings", "chatbot");
    await setDoc(ref, form, { merge: true });
    alert("저장 완료!");
  };

  if (loading) return <div className="p-4">로딩 중...</div>;

  return (
    <main className="p-4 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">⚙️ 챗봇 응답 설정</h1>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-lg font-semibold mb-2">🧠 GPT 프롬프트 정보</h2>

        <div className="mb-8 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm space-y-5">
          <div>
            <label className="font-medium">📦 업종</label>
            <input
              className="input w-full mt-1 border rounded px-3 py-2"
              value={form.industry}
              onChange={(e) => updateField("industry", e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">🛍️ 판매상품</label>
            <input
              className="input w-full mt-1 border rounded px-3 py-2"
              value={form.products}
              onChange={(e) => updateField("products", e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium flex justify-between items-center">
              💬 유도 질문 <span className="text-sm text-gray-500">{form.promptCue.length}/50자</span>
            </label>
            <input
              className="input w-full mt-1 border rounded px-3 py-2"
              value={form.promptCue}
              onChange={(e) => updateField("promptCue", e.target.value)}
              placeholder="예: 이름과 날짜를 입력해주세요"
              maxLength={50}
            />
            <p className="text-xs text-gray-400 mt-1">예시: 예약 날짜와 연락 가능한 번호</p>
            <p className="text-xs text-gray-400">예시: 문의하신 상품명을 입력해주세요</p>
          </div>

          <div>
            <label className="font-medium">👋 안내문 멘트</label>
            <textarea
              className="input w-full mt-1 border rounded px-3 py-2"
              rows={3}
              value={form.welcomeMessage}
              onChange={(e) => updateField("welcomeMessage", e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="font-medium">🔍 GPT systemPrompt 미리보기</label>
          <div className="p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap">
            {systemPrompt}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 text-white rounded font-bold"
        >
          저장하기
        </button>
      </div>
    </main>
  );
}
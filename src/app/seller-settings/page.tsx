// src/app/seller-settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import useUserRoles from "@/hooks/useUserRoles";

const categories = ["주문", "예약", "상담", "문의", "반품", "교환", "기타"];

export default function SellerSettingsPage() {
  const { user, isSeller, loading } = useUserRoles();
  const [form, setForm] = useState({
    industry: "",
    products: "",
    promptCue: "",
    welcomeMessage: "",
    category: "상담"
  });
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!loading && user && isSeller) {
      const ref = doc(db, "sellers", user.uid, "settings", "chatbot");
      getDoc(ref).then((snap) => {
        const data = snap.data();
        if (data) {
          setForm((prev) => ({ ...prev, ...data }));
        }
      });
    }
  }, [loading, user, isSeller]);

  useEffect(() => {
    const { industry, products, promptCue, welcomeMessage, category } = form;
    const systemPrompt = `당신은 고객센터 요약 AI입니다. 
판매자의 업종과 판매 품목을 참고하되, 그 외 주제나 과거 정보로 벗어나지 말고 고객의 말과 해당 판매자의 업종/상품 안에서만 집중해서 요약하세요.

업종: ${industry}
카테고리: ${category}
판매상품: ${products}

고객에게는 다음과 같이 안내하세요: "${welcomeMessage}"
유도 질문: ${promptCue}`;
    setPreview(systemPrompt);
  }, [form.industry, form.products, form.promptCue, form.welcomeMessage, form.category]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    if (form.welcomeMessage.length > 20) {
      alert("고객 안내 멘트는 20자 이내로 입력해주세요.");
      return;
    }
    if (form.promptCue.length > 50) {
      alert("유도 질문은 50자 이내로 입력해주세요.");
      return;
    }
    const ref = doc(db, "sellers", user.uid, "settings", "chatbot");
    await setDoc(ref, form, { merge: true });
    alert("설정이 저장되었습니다.");
  };

  if (loading) return <div className="p-4">로딩 중...</div>;

  return (
    <main className="p-4 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">💬 상담 요약 맞춤 설정</h1>
      <p className="text-gray-600 text-sm">
        고객의 입력 내용을 GPT가 더 잘 요약하도록, 업종/판매상품/유도질문 등을 설정할 수 있어요.
        이 정보는 실제 상담 화면에서 자동 반영됩니다.
      </p>

      <div className="space-y-4">
        <label className="font-medium">1️⃣ 상담 카테고리</label>
        <p className="text-sm text-gray-500">상담 유형을 선택하세요. 고객 입력에 대한 분류 기준입니다.</p>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateField("category", cat)}
              className={`px-4 py-2 border rounded-full font-medium text-sm whitespace-nowrap transition ${
                form.category === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="font-medium">2️⃣ 업종</label>
        <p className="text-sm text-gray-500">예: 과일 유통, 뷰티샵, 택배, 반찬가게 등</p>
        <input className="w-full p-2 border rounded" placeholder="예: 과일 유통" value={form.industry} onChange={(e) => updateField("industry", e.target.value)} />

        <label className="font-medium">3️⃣ 주요 판매상품</label>
        <p className="text-sm text-gray-500">예: 수박, 고구마, 멜론</p>
        <input className="w-full p-2 border rounded" placeholder="예: 수박, 고구마" value={form.products} onChange={(e) => updateField("products", e.target.value)} />

        <label className="font-medium">4️⃣ 고객에게 보여줄 안내 멘트 (20자 이내)</label>
        <p className="text-sm text-gray-500">상담 시작 시 보여줄 친절한 문장</p>
        <textarea className="w-full p-2 border rounded" placeholder="예: 안녕하세요! 문의주세요." rows={2} maxLength={20} value={form.welcomeMessage} onChange={(e) => updateField("welcomeMessage", e.target.value)} />
        <p className="text-right text-xs text-gray-400">{form.welcomeMessage.length}/20자</p>

        <label className="font-medium">5️⃣ 고객 질문을 유도할 문장 (50자 이내)</label>
        <p className="text-sm text-gray-500">예: 어떤 상품을 반품 원하시나요?</p>
        <input className="w-full p-2 border rounded" placeholder="예: 어떤 상품을 반품 원하시나요?" maxLength={50} value={form.promptCue} onChange={(e) => updateField("promptCue", e.target.value)} />
        <p className="text-right text-xs text-gray-400">{form.promptCue.length}/50자</p>

        <div className="bg-gray-50 p-3 border rounded text-sm">
          <div className="font-semibold mb-1">🔍 요약 프롬프트 예시</div>
          <p className="text-gray-500 mb-1">아래와 같은 방식으로 요약 안내가 자동 적용됩니다.</p>
          <div className="whitespace-pre-wrap text-gray-700">{preview}</div>
        </div>

        <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded font-bold">
          저장하기
        </button>
      </div>
    </main>
  );
}

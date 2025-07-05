// ✅ 1. summary/page.tsx 수정본: 라우팅 지연 처리로 초기화 방지

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import CategoryForm from "@/components/chat/CategoryForm";
import { defaultForms } from "@/constants/defaultForms";

export default function SummaryPage() {
  const { sellerId, inquiryId } = useParams() as { sellerId: string; inquiryId: string };
  const router = useRouter();

  const [category, setCategory] = useState("상담");
  const [categoryData, setCategoryData] = useState<Record<string, string>>({});
  const [valid, setValid] = useState(true);
  const [questionForms, setQuestionForms] = useState<any>(defaultForms);

  useEffect(() => {
    const validateInquiry = async () => {
      if (!sellerId || !inquiryId) return;
      const ref = doc(db, "sellers", sellerId, "inquiries", inquiryId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        alert("문의 정보가 존재하지 않습니다. 메인 화면으로 이동합니다.");
        setTimeout(() => router.replace(`/chat-summary/${sellerId}`), 100);
      }
    };
    validateInquiry();
  }, [sellerId, inquiryId]);

  useEffect(() => {
    const fetchForms = async () => {
      const settingDoc = doc(db, "sellers", sellerId, "settings", "chatbot");
      const settingSnap = await getDoc(settingDoc);
      const formData = settingSnap.data();
      if (formData?.questionForms) {
        setQuestionForms(formData.questionForms);
      }
    };
    fetchForms();
  }, [sellerId]);

  const handleSubmit = async () => {
    const inquiryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId);

    const messages = [
      { role: "user", content: `카테고리: ${category}` },
      ...Object.entries(categoryData).filter(([_, v]) => v.trim()).map(
        ([k, v]) => ({ role: "user", content: `${k}: ${v}` })
      )
    ];

    let summary = "";
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, inquiryId, category, details: categoryData, messages })
      });
      const data = await res.json();
      summary = data.summary || "";
    } catch (e) {
      console.error("요약 생성 실패:", e);
    }

    await setDoc(inquiryRef, { details: categoryData, category, summary }, { merge: true });
    router.push("/complete");
  };

  return (
    <main className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-center">📝 문의 요약 작성</h1>
      <p className="text-center text-sm text-gray-500 mb-2">
        선택한 항목에 대해 정보를 입력해주세요.
      </p>

      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="w-full p-2 border rounded"
      >
        {Object.keys(questionForms).map(key => (
          <option key={key} value={key}>{key}</option>
        ))}
      </select>

      <CategoryForm
        category={category}
        onChange={setCategoryData}
        onValidate={setValid}
        defaultData={{}}
        forms={questionForms}
      />

      <button
        onClick={handleSubmit}
        disabled={!valid}
        className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
      >
        저장 후 제출하기
      </button>
    </main>
  );
}
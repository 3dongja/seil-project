// /src/app/seller-logs/[inquiryId]/summary/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import CategoryForm from "@/components/chat/CategoryForm";
import { defaultForms } from "@/constants/defaultForms";
import useUserRoles from "@/hooks/useUserRoles";

export default function ChatSummaryEditPage() {
  const { inquiryId } = useParams() as { inquiryId: string };
  const { user } = useUserRoles();
  const router = useRouter();

  const [category, setCategory] = useState("상담");
  const [categoryData, setCategoryData] = useState<Record<string, string>>({});
  const [questionForms, setQuestionForms] = useState<any>(defaultForms);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    const fetchInquiry = async () => {
      if (!user) return;
      const refDoc = doc(db, "sellers", user.uid, "inquiries", inquiryId);
      const snap = await getDoc(refDoc);
      const data = snap.data();
      if (data?.category) setCategory(data.category);
      if (data?.details) setCategoryData(data.details);
    };
    const fetchForms = async () => {
      if (!user) return;
      const settingDoc = doc(db, "sellers", user.uid, "settings", "chatbot");
      const settingSnap = await getDoc(settingDoc);
      const formData = settingSnap.data();
      if (formData?.questionForms) {
        setQuestionForms(formData.questionForms);
      }
    };
    fetchInquiry();
    fetchForms();
  }, [user, inquiryId]);

  const handleSave = async () => {
    if (!user) return;
    const refDoc = doc(db, "sellers", user.uid, "inquiries", inquiryId);
    await setDoc(refDoc, { details: categoryData }, { merge: true });
    router.push(`/seller-logs`); // ✅ 저장 후 사업주 로그 목록으로 이동
  };

  return (
    <main className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-center">✍️ 요약 작성 및 저장</h1>
      <p className="text-center text-sm text-gray-500 mb-2">
        카테고리: <span className="font-medium text-black">{category}</span>
      </p>
      <CategoryForm
        category={category}
        onChange={setCategoryData}
        onValidate={setValid}
        defaultData={categoryData}
        forms={questionForms}
      />
      <button
        onClick={handleSave}
        disabled={!valid}
        className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
      >
        저장하기
      </button>
    </main>
  );
}

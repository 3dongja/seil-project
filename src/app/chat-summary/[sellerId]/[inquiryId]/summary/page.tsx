"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import CategoryForm from "@/components/chat/CategoryForm";
import { defaultForms } from "@/constants/defaultForms";

export default function SummaryPage() {
  const { sellerId, inquiryId } = useParams() as { sellerId: string; inquiryId: string };
  const router = useRouter();
  const [category, setCategory] = useState("상담");
  const [categoryData, setCategoryData] = useState<Record<string, string>>({});
  const [valid, setValid] = useState(true);

  const handleSubmit = async () => {
    const inquiryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId);
    await setDoc(inquiryRef, { details: categoryData, category }, { merge: true });
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
        {Object.keys(defaultForms).map(key => (
          <option key={key} value={key}>{key}</option>
        ))}
      </select>

      <CategoryForm
        category={category}
        onChange={setCategoryData}
        onValidate={setValid}
        defaultData={{}}
        forms={defaultForms}
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
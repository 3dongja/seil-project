// src/app/seller-question-forms/page.tsx

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import Link from "next/link";

export default function SellerQuestionFormsPage() {
  const [selectedCategory, setSelectedCategory] = useState("문의");
  const [questions, setQuestions] = useState([
    { key: "name", label: "이름", required: true },
    { key: "phone", label: "연락처", required: true },
  ]);
  const [templates, setTemplates] = useState(["", "", "", "", ""]);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "questionForms", selectedCategory);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setQuestions(data.questions || []);
        setTemplates(data.templates || ["", "", "", "", ""]);
      } else {
        setQuestions([]);
        setTemplates(["", "", "", "", ""]);
      }
    };
    load();
  }, [selectedCategory]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, "questionForms", selectedCategory), {
      questions,
      templates,
    });
    alert("저장되었습니다");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-8">
      <h1 className="text-lg font-semibold">카테고리별 질문 설정</h1>

      <select
        className="border p-2 rounded"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="문의">문의</option>
        <option value="예약">예약</option>
        <option value="반품">반품</option>
        <option value="배송">배송</option>
        <option value="기타">기타</option>
      </select>

      <form onSubmit={save} className="space-y-4">
        <div className="space-y-2">
          <h2 className="font-semibold">질문 항목</h2>
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="border p-1 rounded w-1/4"
                placeholder="key"
                value={q.key}
                onChange={(e) => {
                  const copy = [...questions];
                  copy[i].key = e.target.value;
                  setQuestions(copy);
                }}
              />
              <input
                className="border p-1 rounded w-1/2"
                placeholder="label"
                value={q.label}
                onChange={(e) => {
                  const copy = [...questions];
                  copy[i].label = e.target.value;
                  setQuestions(copy);
                }}
              />
              <label className="text-sm">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => {
                    const copy = [...questions];
                    copy[i].required = e.target.checked;
                    setQuestions(copy);
                  }}
                />
                필수
              </label>
            </div>
          ))}
          <button
            type="button"
            className="text-blue-600 text-sm"
            onClick={() => setQuestions([...questions, { key: "", label: "", required: false }])}
          >
            + 항목 추가
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">GPT 응답 템플릿 (최대 5개)</h2>
          {templates.map((t, i) => (
            <input
              key={i}
              className="border p-1 rounded w-full"
              placeholder={`응답 ${i + 1}`}
              value={t}
              onChange={(e) => {
                const copy = [...templates];
                copy[i] = e.target.value;
                setTemplates(copy);
              }}
            />
          ))}
        </div>

        <div className="text-right">
          <Link
            href={`/chat-summary/demoSeller/demoInquiry?category=${selectedCategory}`}
            className="text-sm text-blue-600 underline block mb-2"
          >
            챗봇 미리보기 →
          </Link>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded text-sm"
          >
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
}

// seller-question-forms/page.tsx (기본값 자동 세팅 추가 + placeholder 지원)

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import Link from "next/link";
import useUserRoles from "@/hooks/useUserRoles";
import { defaultForms } from "@/constants/defaultForms";

export default function SellerQuestionFormsPage() {
  const [selectedCategory, setSelectedCategory] = useState("문의");
  const [questions, setQuestions] = useState([
    { key: "name", label: "이름", required: true, placeholder: "이름을 입력하세요" },
    { key: "phone", label: "연락처", required: true, placeholder: "010-0000-0000" },
  ]);
  const [templates, setTemplates] = useState(["", "", "", "", ""]);
  const { user, isSeller, loading } = useUserRoles();
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) return;
    const uid = user.uid as string;

    async function initializeDefaults() {
      const settingsRef = doc(db, "sellers", uid, "settings", "chatbot");
      const settingsSnap = await getDoc(settingsRef);
      const isCustom = settingsSnap.exists() && settingsSnap.data().isCustomConfigured;

      if (!isCustom) {
        await Promise.all(
          Object.entries(defaultForms).map(([category, data]) => {
            const ref = doc(db, "sellers", uid, "questionForms", category);
            return setDoc(ref, data);
          })
        );
        await setDoc(settingsRef, { isCustomConfigured: false }, { merge: true });
      }
    }

    initializeDefaults();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    const uid = user.uid as string;
    const ref = doc(db, "sellers", uid, "questionForms", selectedCategory);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setQuestions(data.questions || []);
        setTemplates(data.templates || ["", "", "", "", ""]);
      } else {
        setQuestions([]);
        setTemplates(["", "", "", "", ""]);
      }
    });
  }, [selectedCategory, user]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    const uid = user.uid as string;
    const ref = doc(db, "sellers", uid, "questionForms", selectedCategory);
    await setDoc(ref, {
      questions,
      templates,
    });
    await setDoc(doc(db, "sellers", uid, "settings", "chatbot"), { isCustomConfigured: true }, { merge: true });
    alert("저장되었습니다");
  };

  if (loading) return <div className="p-4">로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-8">
      <h1 className="text-lg font-semibold">카테고리별 질문 설정</h1>

      <select
        className="border p-2 rounded"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        {Object.keys(defaultForms).map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
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
                placeholder={q.placeholder || "질문 라벨"}
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
            onClick={() => setQuestions([...questions, { key: "", label: "", required: false, placeholder: "" }])}
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
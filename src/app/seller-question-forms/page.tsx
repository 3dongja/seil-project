// src/app/seller-question-forms/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SellerQuestionFormsPage() {
  const router = useRouter();
  const [category, setCategory] = useState("반품");
  const [fields, setFields] = useState<{ key: string; label: string; required: boolean }[]>([]);
  const [templates, setTemplates] = useState<string[]>(["", "", "", "", ""]);

  useEffect(() => {
    const fetch = async () => {
      const ref = doc(db, "questionForms", category);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setFields(data.fields || []);
        setTemplates(data.templates || ["", "", "", "", ""]);
      } else {
        setFields([]);
        setTemplates(["", "", "", "", ""]);
      }
    };
    fetch();
  }, [category]);

  const updateField = (index: number, key: keyof (typeof fields)[0], value: string | boolean) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const deleteTemplate = (index: number) => {
    const updated = [...templates];
    updated[index] = "";
    setTemplates(updated);
  };

  const save = async () => {
    await setDoc(doc(db, "questionForms", category), {
      fields,
      templates: templates.filter((t) => t.trim() !== "")
    });
    alert("설정이 저장되었습니다.");
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">질문 템플릿 설정</h1>
        <button onClick={() => router.back()} className="text-sm text-blue-600">← 나가기</button>
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded p-2 w-full"
      >
        <option value="반품">반품</option>
        <option value="문의">문의</option>
        <option value="예약">예약</option>
        <option value="기타">기타</option>
      </select>

      <div className="space-y-2">
        <h2 className="font-semibold">질문 항목</h2>
        {fields.map((field, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <input
              className="border p-1 rounded w-1/3"
              placeholder="key"
              value={field.key}
              onChange={(e) => updateField(idx, "key", e.target.value)}
            />
            <input
              className="border p-1 rounded w-1/2"
              placeholder="label"
              value={field.label}
              onChange={(e) => updateField(idx, "label", e.target.value)}
            />
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(idx, "required", e.target.checked)}
            />
          </div>
        ))}
        <button
          onClick={() => setFields([...fields, { key: "", label: "", required: false }])}
          className="text-sm text-blue-600"
        >
          + 항목 추가
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">템플릿 응답</h2>
        {templates.map((text, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <input
              className="border rounded p-2 w-full"
              placeholder={`템플릿 ${idx + 1}`}
              value={text}
              onChange={(e) => {
                const copy = [...templates];
                copy[idx] = e.target.value;
                setTemplates(copy);
              }}
            />
            {text.trim() !== "" && (
              <button onClick={() => deleteTemplate(idx)} className="text-red-500 text-sm">삭제</button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={save}
        className="bg-black text-white w-full py-2 rounded shadow"
      >
        저장하기
      </button>
    </div>
  );
}

// src/components/chat/CategoryForm.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Question {
  key: string;
  label: string;
  required?: boolean;
}

type Props = {
  category: string;
  onChange: (data: Record<string, string>) => void;
  onValidate?: (valid: boolean) => void;
};

export default function CategoryForm({ category, onChange, onValidate }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      const ref = doc(db, "questionForms", category);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setQuestions(data.fields || []);
      } else {
        setQuestions([]);
      }
    };
    fetchQuestions();
  }, [category]);

  useEffect(() => {
    onChange(answers);
    if (onValidate && questions.length > 0) {
      const valid = questions.every((q) => !q.required || answers[q.key]?.trim());
      onValidate(valid);
    }
  }, [answers, questions]);

  const update = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <div key={q.key}>
          <label className="block text-sm font-medium mb-1">
            {q.label} {q.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            className="w-full border rounded p-2 text-sm"
            placeholder={q.label}
            value={answers[q.key] || ""}
            onChange={(e) => update(q.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

// src/components/chat/CategoryForm.tsx
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export type Question = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
};

export type Props = {
  category: string;
  onChange: (data: Record<string, string>) => void;
  onValidate?: (valid: boolean) => void;
  defaultData?: Record<string, string>;
  forms?: Record<string, { questions: Question[] }>;
  readOnly?: boolean;
};

const CategoryForm = ({ category, onChange, onValidate, defaultData = {}, forms = {}, readOnly = false }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setAnswers(defaultData);
  }, [defaultData]);

  useEffect(() => {
    onChange(answers);
  }, [answers, onChange]);

  useEffect(() => {
    if (forms?.[category]?.questions?.length) {
      setQuestions(forms[category].questions);
    } else {
      const fetch = async () => {
        const ref = doc(db, "questionForms", category);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data?.fields) setQuestions(data.fields);
        }
      };
      fetch();
    }
  }, [category, forms]);

  useEffect(() => {
    if (onValidate && questions.length > 0) {
      const valid = questions.every((q) => !q.required || answers[q.key]);
      onValidate(valid);
    }
  }, [answers, questions, onValidate]);

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.key} className="space-y-1">
          <label className="block font-medium text-sm text-gray-700">{q.label}</label>
          <input
            type="text"
            placeholder={q.placeholder || "답변을 입력하세요"}
            value={answers[q.key] || ""}
            onChange={(e) => {
              const updated = { ...answers, [q.key]: e.target.value };
              setAnswers(updated);
              onChange(updated);
            }}
            disabled={readOnly}
            className="w-full border border-gray-300 p-2 rounded-md text-sm"
          />
        </div>
      ))}
    </div>
  );
};

export default CategoryForm;

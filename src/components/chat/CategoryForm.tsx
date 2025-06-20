// src/components/chat/CategoryForm.tsx
"use client";

import { useState, useEffect } from "react";

const questionBank: Record<string, { key: string; label: string; required?: boolean }[]> = {
  반품: [
    { key: "productName", label: "반품을 원하시는 상품명을 알려주세요", required: true },
    { key: "purchaseDate", label: "언제 구매하셨나요?" },
    { key: "reason", label: "어떤 이유로 반품을 원하시나요?" },
    { key: "status", label: "상품 상태를 간단히 설명해주세요" },
    { key: "contactInfo", label: "연락 가능한 정보를 입력해주세요 (전화번호, 이메일, 인스타 등)", required: true }
  ],
  예약: [
    { key: "reservationDate", label: "예약을 원하는 날짜와 시간을 입력해주세요" },
    { key: "partySize", label: "몇 명이 예약하시나요?" },
    { key: "requests", label: "특별한 요청사항이 있으신가요?" },
    { key: "contactInfo", label: "연락 가능한 정보를 입력해주세요 (전화번호, 이메일, 인스타 등)", required: true }
  ],
  문의: [
    { key: "subject", label: "어떤 상품 또는 서비스에 대해 문의하시는 건가요?" },
    { key: "question", label: "어떤 내용을 문의하고 싶으신가요?" },
    { key: "reason", label: "문의를 남기신 이유가 있으신가요?" },
    { key: "contactInfo", label: "연락 가능한 정보를 입력해주세요 (전화번호, 이메일, 인스타 등)", required: true }
  ],
  상담: [
    { key: "product", label: "어떤 제품/서비스에 대해 상담받고 싶으신가요?" },
    { key: "details", label: "현재 상황이나 궁금한 점을 간단히 적어주세요" },
    { key: "preferredTime", label: "상담을 원하는 시간대가 있으신가요?" },
    { key: "contactInfo", label: "연락 가능한 정보를 입력해주세요 (전화번호, 이메일, 인스타 등)", required: true }
  ],
  주문: [
    { key: "productName", label: "어떤 상품을 주문하셨나요?" },
    { key: "orderDate", label: "언제 주문하셨나요?" },
    { key: "problem", label: "현재 어떤 문제가 있나요?" },
    { key: "contactInfo", label: "연락 가능한 정보를 입력해주세요 (전화번호, 이메일, 인스타 등)", required: true }
  ],
  교환: [
    { key: "productName", label: "교환을 원하시는 상품은 무엇인가요?" },
    { key: "purchaseDate", label: "구매일자를 입력해주세요" },
    { key: "reason", label: "교환 사유를 알려주세요" },
    { key: "method", label: "원하시는 교환 방식(같은 상품/다른 옵션 등)을 알려주세요" },
    { key: "contactInfo", label: "연락 가능한 정보를 입력해주세요 (전화번호, 이메일, 인스타 등)", required: true }
  ],
  기타: [
    { key: "content", label: "내용을 입력해주세요" },
    { key: "contactInfo", label: "연락 가능한 정보를 입력해주세요 (전화번호, 이메일, 인스타 등)", required: true }
  ]
};

type Props = {
  category: string;
  onChange: (data: Record<string, string>) => void;
};

export default function CategoryForm({ category, onChange }: Props) {
  const questions = questionBank[category] || questionBank["기타"];
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    onChange(answers);
  }, [answers]);

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <div key={q.key}>
          <label className="block text-sm font-medium mb-1">{q.label}</label>
          <input
            type="text"
            className="w-full border rounded p-2 text-sm"
            placeholder={q.label}
            value={answers[q.key] || ""}
            onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

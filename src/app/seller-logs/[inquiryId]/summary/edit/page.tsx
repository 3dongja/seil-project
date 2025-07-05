// ✅ seller-logs/[inquiryId]/summary/edit/page.tsx → 소비자 입력 내용 보기 전용 (수정 불가)

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function SummaryViewPage() {
  const params = useParams();
  const { inquiryId } = params as { inquiryId: string };
  const [details, setDetails] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDetails = async () => {
      const inquiryRef = doc(db, "sellers", "demo", "inquiries", inquiryId);
      const snap = await getDoc(inquiryRef);
      if (snap.exists()) {
        const data = snap.data();
        setDetails(data.details || {});
      }
    };
    fetchDetails();
  }, [inquiryId]);

  return (
    <main className="min-h-screen bg-white p-4">
      <h1 className="text-lg font-bold mb-4">📝 소비자 입력 상세 보기</h1>
      <div className="space-y-2 text-sm">
        {Object.entries(details).map(([k, v]) => (
          <div key={k} className="border-b pb-2">
            <p className="text-gray-500 font-semibold">{k}</p>
            <p className="text-gray-800 whitespace-pre-line">{v}</p>
          </div>
        ))}
        {!Object.keys(details).length && (
          <p className="text-gray-500 italic">입력 내용이 없습니다.</p>
        )}
      </div>
    </main>
  );
}
// 🔧 src/app/admin/summaries/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collectionGroup,
  getDocs,
  Timestamp,
  DocumentData,
} from "firebase/firestore";

interface SummaryItem {
  sellerId: string;
  inquiryId: string;
  summary: string;
  createdAt: Timestamp;
}

export default function AdminSummariesPage() {
  const [summaries, setSummaries] = useState<SummaryItem[]>([]);

  useEffect(() => {
    async function fetchSummaries() {
      const snapshot = await getDocs(collectionGroup(db, "inquiries"));
      const items: SummaryItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        if (data.summary) {
          const pathSegments = doc.ref.path.split("/");
          const sellerId = pathSegments[1];
          const inquiryId = pathSegments[3];
          items.push({
            sellerId,
            inquiryId,
            summary: data.summary,
            createdAt: data.createdAt,
          });
        }
      });
      setSummaries(items);
    }
    fetchSummaries();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">요약 관리</h1>
      {summaries.map((s) => (
        <div
          key={s.sellerId + s.inquiryId}
          className="border rounded-xl p-4 shadow bg-white"
        >
          <div className="text-sm text-gray-500">
            판매자: {s.sellerId} / 문의: {s.inquiryId}
          </div>
          <div className="text-base mt-2">{s.summary}</div>
          <div className="text-xs text-gray-400 mt-1">
            {s.createdAt.toDate().toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

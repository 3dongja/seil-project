"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import {
  doc, setDoc, updateDoc, serverTimestamp,
  getDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";
import CategoryForm from "@/components/chat/CategoryForm";
import SummaryResultModal from "@/components/chat-summary/SummaryResultModal";

const ChatSummaryPage = () => {
  const router = useRouter();
  const { sellerId } = useParams() as { sellerId: string };

  const categories = ["주문", "예약", "상담", "문의", "반품", "교환", "기타"];

  const [category, setCategory] = useState("상담");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [externalId, setExternalId] = useState("");
  const [categoryData, setCategoryData] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [lastInquiryId, setLastInquiryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const refDoc = doc(db, "sellers", sellerId, "settings", "chatbot");
        const snap = await getDoc(refDoc);
        const data = snap.data();
        if (data?.openTime) setOpenTime(data.openTime);
        if (data?.closeTime) setCloseTime(data.closeTime);
      } catch (error) {
        console.error("운영 시간 불러오기 실패:", error);
      }
    };
    fetchTimes();
  }, [sellerId]);

  const handleSave = async () => {
    if (!name || !phone || Object.values(categoryData).some(v => !v)) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert("첨부파일은 최대 5MB까지 가능합니다.");
      return;
    }

    setLoading(true);
    const id = uuid();
    setLastInquiryId(id);
    let fileUrl: string | null = null;

    try {
      if (file) {
        const storageRef = ref(storage, `sellers/${sellerId}/inquiries/${id}/${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }

      const summaryInput = {
        name, phone, email, externalId, category,
        details: categoryData,
        createdAt: serverTimestamp(),
        fileName: file?.name || null,
        fileUrl: fileUrl
      };

      const refDoc = doc(db, "sellers", sellerId, "inquiries", id);
      await setDoc(refDoc, summaryInput);

      const messages = [
        { role: "user", content: `카테고리: ${category}` },
        ...Object.entries(categoryData || {})
          .filter(([_, v]) => v?.trim())
          .map(([k, v]) => ({ role: "user", content: `${k}: ${v}` }))
      ];

      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, inquiryId: id, name, phone, category, details: categoryData, messages })
      });
      const data = await res.json();

      if (data.summary) {
        await updateDoc(refDoc, { summary: data.summary });
        localStorage.setItem("sellerId", sellerId);
        localStorage.setItem("inquiryId", id);
        setShowModal(true);
      }
    } catch (err) {
      console.error("저장 중 오류:", err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 space-y-4 max-w-md mx-auto">
      <div className="animate-fade-in-down bg-yellow-100 border border-yellow-300 text-yellow-900 p-3 rounded text-center text-sm font-medium shadow">
        빠르고 정확한 상담을 위해<br className="sm:hidden" />
        <span className="font-bold">간단한 요약 정보를 먼저 입력해주세요!</span>
      </div>

      <h1 className="text-xl font-bold text-center">📋 요약 요청</h1>
      <p className="text-center text-gray-600 text-sm">신규 / {phone || "전화번호 미입력"}</p>

      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`py-3 text-base rounded-xl border font-semibold ${
              category === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="text-sm text-center text-gray-500">
        상담 가능 시간: {openTime || "--:--"} ~ {closeTime || "--:--"}
      </div>

      <CategoryForm category={category} onChange={setCategoryData} />

      <div className="space-y-2">
        <input className="w-full border rounded p-2 text-sm" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded p-2 text-sm" placeholder="연락처 (예: 010-1234-5678)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="w-full border rounded p-2 text-sm" placeholder="이메일 (선택)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2 text-sm" placeholder="외부 ID (예: 주문번호 등, 선택)" value={externalId} onChange={(e) => setExternalId(e.target.value)} />

        <div>
          <label className="block text-sm font-medium mb-1">파일 첨부 (최대 5MB)</label>
          <input type="file" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} className="w-full text-sm" />
          {file && file.size > 5 * 1024 * 1024 && (
            <p className="text-red-500 text-sm">5MB 이하 파일만 첨부할 수 있습니다.</p>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-2 pt-4">
        <button onClick={() => router.back()} className="w-1/2 py-3 bg-gray-200 rounded font-semibold">취소하기</button>
        <button onClick={handleSave} className="w-1/2 py-3 bg-blue-600 text-white rounded font-bold" disabled={loading}>{loading ? "처리 중..." : "저장하기"}</button>
      </div>

      {showModal && lastInquiryId && (
        <SummaryResultModal
          sellerId={sellerId}
          inquiryId={lastInquiryId}
          onSelect={(mode) => {
            setShowModal(false);
            if (!sellerId || !lastInquiryId) return;
           const resolvedMode = (["chat", "summary", "bot"].includes(mode as string)
              ? (mode as "chat" | "summary" | "bot")
              : "summary");
            switch (resolvedMode) {
              case "chat":
                router.push(`/chat-summary/${sellerId}/${lastInquiryId}`);
                break;
              case "bot":
                router.push(`/chat-summary/${sellerId}/${lastInquiryId}/bot`);
                break;
              case "summary":
                router.push(`/chat-summary/${sellerId}/${lastInquiryId}/summary`);
                break;
            }
          }}
        />
      )}
    </main>
  );
};

export default ChatSummaryPage;

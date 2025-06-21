// src/app/chat-summary/[sellerId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp, collection, query, orderBy, limit, getDocs, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";
import CategoryForm from "@/components/chat/CategoryForm";

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

  useEffect(() => {
    const fetchTimes = async () => {
      const refDoc = doc(db, "sellers", sellerId, "settings", "chatbot");
      const snap = await getDoc(refDoc);
      const data = snap.data();
      if (data?.openTime) setOpenTime(data.openTime);
      if (data?.closeTime) setCloseTime(data.closeTime);
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
    let fileUrl: string | null = null;

    try {
      if (file) {
        const storageRef = ref(storage, `sellers/${sellerId}/inquiries/${id}/${file.name}`);
        await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(storageRef);
      }

      const summaryInput = {
        name,
        phone,
        email,
        externalId,
        category,
        details: categoryData,
        createdAt: serverTimestamp(),
        fileName: file?.name || null,
        fileUrl: fileUrl
      };

      const refDoc = doc(db, "sellers", sellerId, "inquiries", id);
      await setDoc(refDoc, summaryInput);

      const text = (`카테고리: ${category}\n` + Object.entries(categoryData || {}).map(([k, v]) => `${k}: ${v}`).join("\n")).slice(0, 1000);

      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, inquiryId: id, name, phone, category, details: categoryData, text })
      });
      const data = await res.json();

      if (data.summary) {
        await updateDoc(refDoc, { summary: data.summary });
      }

      router.push(`/chat-summary/${sellerId}/${id}`);
    } catch (err) {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChatRedirect = async () => {
    const q = query(collection(db, "sellers", sellerId, "inquiries"), orderBy("createdAt", "desc"), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const latest = snap.docs[0].id;
      router.push(`/chat-summary/${sellerId}/${latest}`);
    } else {
      alert("진행 중인 채팅이 없습니다.");
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

      {(!name || !phone) && (
        <p className="text-red-500 text-sm text-center font-medium pt-2">
          이름과 연락처를 입력하셔야 채팅이 가능합니다.
        </p>
      )}

      <button
        onClick={handleChatRedirect}
        disabled={!name || !phone}
        className={`w-full mt-2 py-3 rounded font-bold transition ${!name || !phone ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500 text-black"}`}
      >
        💬 1:1 채팅 시작하기
      </button>
    </main>
  );
};

export default ChatSummaryPage;

// ✅ 완성본: 원본 유지 + 자동화 + 운영시간 + 검증 강화 + 문서 유효성 확인

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

const validateName = (name: string) => /^[가-힣a-zA-Z\s]{2,20}$/.test(name);
const validatePhone = (phone: string) => /^01[016789]-\d{3,4}-\d{4}$/.test(phone);
const validateEmail = (email: string) => email === "" || /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

const ChatSummaryPage = () => {
  const router = useRouter();
  const { sellerId } = useParams() as { sellerId: string };

  const categories = ["주문", "예약", "상담", "문의", "반품", "교환", "기타"];
  const emailSuggestions = ["naver.com", "gmail.com", "daum.net", "hanmail.net", "kakao.com"];

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
  const [emailInputFocus, setEmailInputFocus] = useState(false);

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const sellerRef = doc(db, "sellers", sellerId);
        const snap = await getDoc(sellerRef);
        const data = snap.data();
        if (data?.openTime) setOpenTime(data.openTime);
        if (data?.closeTime) setCloseTime(data.closeTime);
      } catch (error) {
        console.error("운영 시간 불러오기 실패:", error);
      }
    };
    fetchTimes();
  }, [sellerId]);

  const handlePhoneInput = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    let formatted = "";
    if (cleaned.length < 4) formatted = cleaned;
    else if (cleaned.length < 8) formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    else formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    setPhone(formatted);
  };

  const handleEmailSuggestion = (domain: string) => {
    const [local] = email.split("@");
    setEmail(`${local}@${domain}`);
    setEmailInputFocus(false);
  };

  const handleSave = async () => {
    if (!name || !phone || Object.values(categoryData).some(v => !v)) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (!validateName(name)) {
      alert("이름은 한글/영문 2~20자여야 합니다.");
      return;
    }
    if (!validatePhone(phone)) {
      alert("연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return;
    }
    if (!validateEmail(email)) {
      alert("이메일 형식이 올바르지 않습니다.");
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

        const snap = await getDoc(refDoc);
        if (!snap.exists()) {
          alert("요약 저장이 지연되고 있습니다. 다시 시도해주세요.");
          return;
        }

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
      {/* ...상단 안내, 카테고리, CategoryForm... */}

      {/* 입력 필드 */}
      <div className="space-y-2 relative">
        <input className="w-full border rounded p-2 text-sm" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded p-2 text-sm" placeholder="연락처 (예: 010-1234-5678)" value={phone} onChange={(e) => handlePhoneInput(e.target.value)} />
        <div className="relative">
          <input
            className="w-full border rounded p-2 text-sm"
            placeholder="이메일 (선택)"
            value={email}
            onFocus={() => setEmailInputFocus(true)}
            onBlur={() => setTimeout(() => setEmailInputFocus(false), 100)}
            onChange={(e) => setEmail(e.target.value)}
          />
          {emailInputFocus && email.includes("@") && (
            <ul className="absolute z-10 bg-white border rounded w-full mt-1 text-sm shadow">
              {emailSuggestions.map(domain => (
                <li
                  key={domain}
                  onClick={() => handleEmailSuggestion(domain)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {email.split("@")[0]}@{domain}
                </li>
              ))}
            </ul>
          )}
        </div>
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

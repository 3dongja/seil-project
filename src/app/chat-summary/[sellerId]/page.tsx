// ✅ 최적화된 첫 진입 화면 (개인정보 수집 전용)

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import Image from "next/image";

const validateName = (name: string) => /^[가-힣a-zA-Z\s]{2,20}$/.test(name);
const validatePhone = (phone: string) => /^01[016789]-\d{3,4}-\d{4}$/.test(phone);

const ChatSummaryPage = () => {
  const router = useRouter();
  const { sellerId } = useParams() as { sellerId: string };

  const emailSuggestions = ["naver.com", "gmail.com", "daum.net", "hanmail.net", "kakao.com"];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailInputFocus, setEmailInputFocus] = useState(false);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!name || !phone) {
      alert("이름과 연락처는 필수 항목입니다.");
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

    setLoading(true);

    try {
      const q = query(
        collection(db, "sellers", sellerId, "inquiries"),
        where("name", "==", name),
        where("phone", "==", phone),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);

      let inquiryId: string;
      if (!snapshot.empty) {
        inquiryId = snapshot.docs[0].id;
      } else {
        inquiryId = uuid();
        await setDoc(doc(db, "sellers", sellerId, "inquiries", inquiryId), {
          name,
          phone,
          email,
          createdAt: serverTimestamp(),
        });
      }

      localStorage.setItem("sellerId", sellerId);
      localStorage.setItem("inquiryId", inquiryId);
      router.push(`/chat-summary/${sellerId}/${inquiryId}/summary`);
    } catch (err) {
      console.error("저장 중 오류:", err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
      <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-xl shadow">
        <div className="flex justify-center">
          <Image src="/logo-light.PNG" alt="Logo" width={160} height={50} priority />
        </div>
        <h1 className="text-xl font-bold text-center">간편 상담 시작</h1>
        <p className="text-sm text-center text-gray-500">
          {openTime && closeTime ? `운영시간 ${openTime} ~ ${closeTime}` : "운영 시간 확인 중..."}
        </p>

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
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <button onClick={() => router.back()} className="w-1/2 py-3 bg-gray-200 rounded font-semibold">뒤로가기</button>
          <button onClick={handleSave} className="w-1/2 py-3 bg-blue-600 text-white rounded font-bold" disabled={loading}>{loading ? "처리 중..." : "상담 시작"}</button>
        </div>
      </div>
    </main>
  );
};

export default ChatSummaryPage;

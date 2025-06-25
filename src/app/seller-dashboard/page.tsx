// 대시보드 문의 카드에 "요약 자세히 보기" 버튼 추가 및 스타일 modern하게 개선 + 알림 추가

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { useUser } from "@/hooks/useUser";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { ClipboardIcon, ChatBubbleLeftRightIcon, PencilIcon } from "@heroicons/react/24/solid";
import QRCode from "react-qr-code";
import copy from "copy-to-clipboard";

interface Inquiry {
  id: string;
  name?: string;
  phone?: string;
  content?: string;
  createdAt?: any;
  alert?: boolean;
  summary?: Record<string, string>;
}

export default function SellerDashboard() {
  const { user } = useUser();
  const [openTime, setOpenTime] = useState("10:00");
  const [closeTime, setCloseTime] = useState("18:00");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [lastInquiryId, setLastInquiryId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "sellers", user.uid);
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setOpenTime(data.openTime || "10:00");
        setCloseTime(data.closeTime || "18:00");
      }
    });

    const unsub = onSnapshot(
      query(
        collection(db, "inquiries"),
        where("sellerId", "==", user.uid),
        orderBy("createdAt", "desc")
      ),
      async (snap) => {
        const enriched = await Promise.all(snap.docs.map(async docSnap => {
          const data = docSnap.data();
          const id = docSnap.id;
          const inquiryRef = doc(db, "sellers", user.uid, "inquiries", id);
          const summarySnap = await getDoc(inquiryRef);
          const summaryData = summarySnap.exists() ? summarySnap.data().summary : undefined;
          return { id, ...data, summary: summaryData } as Inquiry;
        }));
        if (enriched.length > 0 && enriched[0].id !== lastInquiryId) {
          if (lastInquiryId !== null) {
            toast.success("새로운 소비자 채팅이 도착했습니다");
          }
          setLastInquiryId(enriched[0].id);
        }
        const sorted = enriched.sort((a, b) => (b.alert ? 1 : 0) - (a.alert ? 1 : 0));
        setInquiries(sorted.slice(0, 10));
      }
    );

    const activeRef = doc(db, "sellers", user.uid);
    const interval = setInterval(() => {
      updateDoc(activeRef, { lastAdminActive: serverTimestamp() });
    }, 570000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [user, lastInquiryId]);

  const handleCopy = () => {
    copy(`https://seil.ai.kr/chat-summary/${user?.uid}`);
    setCopied(true);
    toast.success("링크가 복사되었습니다");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTimeChange = async () => {
    if (!user) return;
    await setDoc(doc(db, "sellers", user.uid), {
      openTime,
      closeTime,
    }, { merge: true });
    toast.success("상담 가능 시간이 저장되었습니다");
  };

  const linkUrl = `https://seil.ai.kr/chat-summary/${user?.uid}`;
  const snsLinks = {
    twitter: `https://twitter.com/intent/tweet?text=상담링크&url=${encodeURIComponent(linkUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkUrl)}`,
    kakao: `https://story.kakao.com/share?url=${encodeURIComponent(linkUrl)}`
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">📊 사업주 대시보드</h1>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2">
        <label className="font-medium text-indigo-700 block mb-1">🕒 상담 가능 시간 설정</label>
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 items-start sm:items-center">
          <label className="text-sm">시작</label>
          <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} className="border px-2 py-1 rounded w-full sm:w-32" />
          <label className="text-sm">종료</label>
          <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} className="border px-2 py-1 rounded w-full sm:w-32" />
          <button onClick={handleTimeChange} className="bg-indigo-600 text-white px-3 py-1 rounded w-full sm:w-auto">저장</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
          <h2 className="font-semibold">📩 최근 문의</h2>
          <Link href={`/chat-summary/${user?.uid}`} className="text-blue-600 text-sm flex items-center gap-1">
            <ChatBubbleLeftRightIcon className="w-4 h-4" /> 요약 보기
          </Link>
        </div>
        <ul className="space-y-3">
          {inquiries.map(inq => (
            <li key={inq.id} className={`p-4 rounded-xl border shadow-sm transition hover:shadow-md ${inq.alert ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
              <Link href={`/seller-live-chat?id=${inq.id}`} className="block">
                <div className="text-sm font-semibold text-gray-800">{inq.name || "이름 없음"} - {inq.phone}</div>
                <div className="text-sm text-gray-600">{inq.content?.slice(0, 40)}...</div>
                {inq.summary && (
                  <div className="text-xs text-green-600 mt-2">
                    {Object.entries(inq.summary).slice(0, 2).map(([key, val]) => `${key}: ${val}`).join(" | ")}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-1">{inq.createdAt?.toDate?.().toLocaleString?.() || "시간 없음"}</div>
              </Link>
              {inq.summary && (
                <div className="mt-2 text-right">
                  <Link href={`/seller-logs/${inq.id}/summary/edit`} className="inline-flex items-center text-xs text-blue-600 hover:underline">
                    <PencilIcon className="w-4 h-4 mr-1" /> 요약 자세히 보기
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
        {inquiries.length >= 10 && (
          <div className="text-right mt-3">
            <Link href="/seller-logs" className="text-sm text-blue-600 hover:underline">전체보기 →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* /src/app/seller/dashboard/page.tsx */
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import useUserRoles from "@/hooks/useUserRoles";

export default function SellerDashboardPage() {
  const { user, isSeller, loading } = useUserRoles();
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [chatOn, setChatOn] = useState(true);

  useEffect(() => {
    if (!loading && user && isSeller) {
      const sellerId = user.uid;
      setLink(`https://seil.ai.kr/chat-summary/${sellerId}`);

      const ref = doc(db, "sellers", sellerId, "settings", "chatbot");
      getDoc(ref).then((snap) => {
        const data = snap.data();
        if (data?.openTime) setOpenTime(data.openTime);
        if (data?.closeTime) setCloseTime(data.closeTime);
        if (data?.chatOn !== undefined) setChatOn(data.chatOn);
      });

      const interval = setInterval(() => {
        updateDoc(doc(db, "users", sellerId, "seller", "profile"), {
          lastAdminActive: serverTimestamp(),
        });
      }, 570000); // 9분 30초

      return () => clearInterval(interval);
    }
  }, [loading, user, isSeller]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveTimes = async () => {
    if (!user?.uid) return;
    const ref = doc(db, "sellers", user.uid, "settings", "chatbot");
    await updateDoc(ref, { openTime, closeTime, chatOn });
    alert("저장 완료!");
  };

  if (loading) return <div className="p-4">로딩 중...</div>;

  return (
    <main className="p-4 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">📊 사장님 대시보드 요약</h1>

      <section className="space-y-2">
        <h2 className="font-semibold">🕓 최근 상담 미리보기</h2>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border p-3 rounded-lg bg-white shadow hover:bg-gray-50 cursor-pointer"
          >
            <p className="text-sm text-gray-500">2024-06-16 10:1{i}</p>
            <p className="font-medium">홍길동{i}</p>
            <p className="text-sm text-gray-700">상품 관련 문의드립니다 (예시 데이터)</p>
          </div>
        ))}
      </section>

      <div className="border p-4 rounded bg-gray-50">
        <p className="font-semibold mb-2">🔗 소비자 채팅 링크</p>
        <div className="flex items-center gap-2">
          <input value={link} readOnly className="flex-1 px-2 py-1 border rounded text-sm" />
          <button onClick={handleCopy} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">복사</button>
        </div>
        {copied && <p className="text-green-600 text-sm mt-2">✅ 복사되었습니다</p>}
      </div>

      <div className="border p-4 rounded bg-yellow-50">
        <p className="font-semibold mb-2">⏱️ 상담 가능 시간 설정</p>
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium">오픈</label>
          <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="border px-2 py-1 rounded" />
          <label className="text-sm font-medium">마감</label>
          <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="border px-2 py-1 rounded" />
        </div>
      </div>

      <div className="border p-4 rounded bg-blue-50 space-y-2">
        <p className="font-semibold">🤖 챗봇 상태</p>
        <button
          onClick={() => setChatOn((prev) => !prev)}
          className={`w-full py-3 font-bold rounded text-white transition ${chatOn ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"}`}
        >
          {chatOn ? "✅ 챗봇 응답 사용 중" : "⛔ 챗봇 꺼짐 (직접 응대)"}
        </button>
      </div>

      <button onClick={handleSaveTimes} className="w-full py-3 bg-indigo-600 text-white rounded font-bold">
        설정 저장하기
      </button>
    </main>
  );
}
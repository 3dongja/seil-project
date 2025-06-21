// src/app/seller-info/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDoc, doc, updateDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useUserRoles from "@/hooks/useUserRoles";
import BackButton from "@/components/common/BackButton";

interface Chat {
  userName?: string;
  status?: string;
}

interface Seller {
  name?: string;
  description?: string;
  createdAt?: any;
  plan?: string;
}

interface PlanLog {
  changedAt?: any;
  oldPlan?: string;
  newPlan?: string;
}

const PLAN_LABEL: Record<string, string> = {
  free: "Free 요금제",
  basic: "Basic 요금제",
  premium: "Premium 요금제",
};

export default function SellerInfoPage() {
  const { user, isSeller, loading } = useUserRoles();
  const router = useRouter();
  const [link, setLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ [key: string]: number }>({ 상담수: 0, 채팅접수: 0, 완료: 0, 자동응답횟수: 0 });
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [gptEnabled, setGptEnabled] = useState(true);
  const [sellerData, setSellerData] = useState<Seller | null>(null);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const [planLogs, setPlanLogs] = useState<PlanLog[]>([]);

  useEffect(() => {
    if (!loading && (!user || !isSeller)) {
      router.push("/login");
    }
    if (user) {
      const sellerId = user.uid;
      setLink(`https://seil.ai.kr/chat-summary/${user?.uid}`);

      getDoc(doc(db, "users", sellerId, "seller", "profile")).then((snap) => {
        const data = snap.data() as DocumentData | undefined;
        const settings = data?.settings;
        const statsData = data?.stats;
        if (settings?.gptEnabled !== undefined) {
          setGptEnabled(settings.gptEnabled);
        }
        if (statsData) {
          setStats(statsData);
        }
        if (data) {
          setSellerData(data as Seller);
        }
      });

      getDoc(doc(db, "users", sellerId, "seller", "usageStats")).then((snap) => {
        if (snap.exists()) {
          setUsageCount(snap.data().monthlyCount || 0);
        }
      });

      const fetchRecentChats = async () => {
        const q = query(
          collection(db, "users", sellerId, "chats"),
          orderBy("lastMessageAt", "desc"),
          limit(5)
        );
        const querySnap = await getDocs(q);
        const results = querySnap.docs.map(doc => doc.data() as Chat);
        setRecentChats(results);
      };
      fetchRecentChats();

      const fetchPlanLogs = async () => {
        const logRef = collection(db, "users", sellerId, "seller", "planLogs");
        const logQuery = query(logRef, orderBy("changedAt", "desc"));
        const snapshot = await getDocs(logQuery);
        setPlanLogs(snapshot.docs.map(doc => doc.data() as PlanLog));
      };
      fetchPlanLogs();
    }
  }, [loading, user, isSeller, router]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid, "seller", "profile"), {
        "settings.lastAdminActive": serverTimestamp(),
      });
    }, 570000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLinkVisit = () => {
    router.push("/pricing");
  };

  const isSummaryBlocked = stats.자동응답횟수 >= 1000 && !gptEnabled;

  return (
    <main className="min-h-screen p-4 pb-32 space-y-6">
      <BackButton />

      {isSummaryBlocked && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">
          ⚠️ 요약 사용량이 제한을 초과하여 중단되었습니다. 요금제를 업그레이드하면 계속 사용할 수 있습니다.
          <button
            onClick={handleLinkVisit}
            className="ml-2 underline text-blue-700 hover:text-blue-900"
          >요금제 보기</button>
        </div>
      )}

      {sellerData && (
        <section className="text-sm space-y-2">
          <h2 className="text-lg font-semibold mb-2">👤 내 정보</h2>
          <div><strong>업체명:</strong> {sellerData.name}</div>
          <div><strong>설명:</strong> {sellerData.description}</div>
          <div><strong>가입일:</strong> {sellerData.createdAt?.toDate().toLocaleDateString()}</div>
          <div><strong>요금제:</strong> {PLAN_LABEL[sellerData.plan || "free"]}</div>
          <div><strong>이번 달 요약 사용량:</strong> {usageCount !== null ? `${usageCount}회` : "로딩 중..."}</div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-2">상담 통계</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="p-4 bg-white rounded shadow text-center">
              <p className="text-sm text-gray-500">{key}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">최근 채팅</h2>
        <ul className="bg-white p-4 rounded shadow space-y-2">
          {recentChats.length > 0 ? recentChats.map((chat, i) => (
            <li key={i} className="text-sm text-gray-700">
              {chat.userName || "익명 사용자"} - {chat.status || "상태 없음"}
            </li>
          )) : <li className="text-sm text-gray-400">최근 채팅 없음</li>}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">채팅 링크</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={link}
            readOnly
            className="w-full border px-2 py-1 rounded"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >복사</button>
        </div>
        {copied && <p className="text-sm text-green-600 mt-1">복사되었습니다 ✅</p>}
      </section>

      {planLogs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">📜 요금제 변경 내역</h2>
          <ul className="text-sm space-y-1">
            {planLogs.map((log, idx) => (
              <li key={idx} className="text-gray-700">
                {log.changedAt?.toDate().toLocaleDateString()} - {log.oldPlan} → {log.newPlan}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
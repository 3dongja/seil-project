"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  User
} from "firebase/auth";

// 모듈 컴포넌트/함수 import
import ChatSelector from "./components/chat-setting";
import TestNavigation from "./components/test-navigation";
import showSellerInfo from "./components/seller-info";
import SummaryTest from "./components/SummaryTest";
import AdminTools from "./components/AdminTools";
import FirestoreReset from "./components/FirestoreReset";
import {
  onCreateSellerAccount,
  loginAsAdmin,
  handleLogout
} from "./account";

const ADMIN_EMAILS = ["jinhyung861009@gmail.com", "admin@seil.com"];
const PLANS = ["Free", "Basic", "Premium"];
const CHAT_IDS = ["chat1", "chat2", "chat3"];

export default function TestHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(CHAT_IDS[0]);
  const [selectedPlan, setSelectedPlan] = useState("Premium");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsAdmin(ADMIN_EMAILS.includes(currentUser.email ?? ""));
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="p-4">로딩 중...</div>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6 text-black">
      <h1 className="text-2xl font-bold">🧪 Seil 테스트 허브</h1>

      <section className="space-y-2">
        <div className="flex gap-2">
          {PLANS.map(plan => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`px-3 py-1 rounded ${selectedPlan === plan ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {plan}
            </button>
          ))}
        </div>

        <button
          onClick={() => onCreateSellerAccount(selectedPlan)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          테스트 계정 생성 및 로그인
        </button>

        <button
          onClick={loginAsAdmin}
          className="bg-orange-600 text-white px-4 py-2 rounded"
        >
          관리자 로그인
        </button>

        {user && (
          <button
            onClick={() => handleLogout(setUser)}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            로그아웃
          </button>
        )}
      </section>

      {user && (
        <section className="space-y-6">
          <ChatSelector
            selectedChatId={selectedChatId}
            setSelectedChatId={setSelectedChatId}
            chatIds={CHAT_IDS}
          />

          <TestNavigation
            uid={user.uid}
            showSellerInfo={() => showSellerInfo(user)}
          />

          <SummaryTest chatId={selectedChatId} />

          {isAdmin && (
            <div className="space-y-4">
              <AdminTools />
              <FirestoreReset />
            </div>
          )}
        </section>
      )}
    </main>
  );
}

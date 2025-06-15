"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  User,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const chatIds = ["chat1", "chat2", "chat3"];
const plans = ["Free", "Basic", "Premium"];

export default function TestHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(chatIds[0]);
  const [selectedPlan, setSelectedPlan] = useState("Premium");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const adminEmails = ["jinhyung861009@gmail.com", "admin@seil.com"];
        setIsAdmin(adminEmails.includes(currentUser.email ?? ""));
      }
    });
    return () => unsubscribe();
  }, [router]);

  const createSellerDocuments = async (user: User, plan: "Free" | "Basic" | "Premium") => {
    const commonData = {
      name: `테스트 ${plan} 사업자`,
      description: `${plan} 요금제 셀러`,
      plan: plan.toLowerCase(),
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "sellerInfo", user.uid), {
      uid: user.uid,
      email: user.email,
      industry: "food",
      ...commonData,
    });

    await setDoc(doc(db, "sellers", user.uid), commonData);
  };

  const onCreateSellerAccount = async () => {
    const email = `test-${selectedPlan.toLowerCase()}@seil.com`;
    const password = "test1234";

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("회원가입 오류", err.code, err.message);
      if (err.code === "auth/email-already-in-use") {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err2: any) {
          console.error("로그인 오류", err2.code, err2.message);
          alert(`로그인 실패: ${err2.code}`);
          return;
        }
      } else {
        alert(`회원가입 실패: ${err.code}`);
        return;
      }
    }

    const user = auth.currentUser;
    if (!user) return;

    await createSellerDocuments(user, selectedPlan as "Free" | "Basic" | "Premium");

    alert(`테스트 계정으로 로그인됨: ${email}`);
  };

  const loginAsAdmin = async () => {
    try {
      await signInWithEmailAndPassword(auth, "admin@seil.com", "admin1234");
      alert("관리자로 로그인되었습니다.");

      const currentUser = auth.currentUser;
      const adminEmails = ["jinhyung861009@gmail.com", "admin@seil.com"];
      if (currentUser && adminEmails.includes(currentUser.email ?? "")) {
        setIsAdmin(true); // ✅ 로그인 후 강제 설정
      }
    } catch (err: any) {
      console.error("관리자 로그인 오류", err.code, err.message);
      alert(`관리자 로그인 실패: ${err.code}`);
    }
  };

  const showSellerInfo = async () => {
    if (!user) return;
    const ref = doc(db, "sellerInfo", user.uid);
    const snapshot = await getDoc(ref);
    console.log("sellerInfo:", snapshot.data());
    alert("sellerInfo 콘솔 출력 완료");
  };

  const onChangeChatId = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedChatId(val);
    router.push(`/seller/seil/chat?chatId=${val}`);
  };

  const onChangePlan = (plan: string) => {
    setSelectedPlan(plan);
  };

  const onResetSettings = () => {
    alert("설정 초기화 완료");
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const goToLogPage = () => router.push("/seller-logs");
  const goToMessages = () => router.push("/seller-message/test-thread");
  const goToRegister = () => router.push("/seller-register");
  const goToConsumerView = () => {
    if (!user) return;
    router.push(`/chat/${user.uid}`);
  };
  const goToAdminDashboard = () => {
    if (!isAdmin) {
      alert("관리자만 접근 가능합니다.");
    } else {
      router.push("/admin/dashboard");
    }
  };

  if (loading) return <div className="p-4 text-gray-600">로딩 중...</div>;

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Seil 프로젝트 테스트 허브</h1>

      <div className="flex space-x-4 mb-4">
        {plans.map((plan) => (
          <button
            key={plan}
            onClick={() => onChangePlan(plan)}
            className={`px-4 py-2 rounded ${
              selectedPlan === plan
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {plan}
          </button>
        ))}
      </div>

      <button
        onClick={onCreateSellerAccount}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        테스트용 사업주 계정 생성 및 로그인
      </button>

      <button
        onClick={loginAsAdmin}
        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
      >
        관리자 계정 로그인
      </button>

      {!user && (
        <p className="text-gray-600 text-sm">로그인되어 있지 않음. 버튼 클릭 후 자동 로그인됨</p>
      )}

      {user && (
        <>
          <section className="mt-6">
            <label htmlFor="chatId" className="block mb-2 font-semibold">
              ChatId 선택
            </label>
            <select
              id="chatId"
              value={selectedChatId}
              onChange={onChangeChatId}
              className="border rounded px-3 py-2 w-full text-black"
            >
              {chatIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </section>

          <section className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold mb-2">현재 상태</h2>
            <p>요금제: <b>{selectedPlan}</b></p>
            <p>업종: <b>Food</b></p>
            <p>기본 프롬프트: <i>Welcome message test</i></p>
          </section>

          <section className="flex flex-wrap gap-2">
            <button onClick={goToAdminDashboard} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              관리자 대시보드
            </button>
            <button onClick={() => router.push("/seller-dashboard")} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              사업주 대시보드
            </button>
            <button onClick={goToLogPage} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              상담 로그 페이지
            </button>
            <button onClick={goToMessages} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              메시지 테스트
            </button>
            <button onClick={goToRegister} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              사업주 등록
            </button>
            <button onClick={goToConsumerView} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              소비자뷰 이동
            </button>
            <button onClick={showSellerInfo} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              sellerInfo 콘솔 확인
            </button>
          </section>

          <section>
            <button onClick={onResetSettings} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              설정 초기화
            </button>
          </section>

          <section className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold mb-2">테마 설정 미리보기</h2>
            <div className="p-4 border rounded text-center text-gray-500">
              테마 미리보기 컴포넌트 자리
            </div>
          </section>

          <div className="mt-4">
            <p className="mb-2">✅ 현재 로그인: {user.email}</p>
            <button onClick={handleLogout} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              로그아웃
            </button>
          </div>
        </>
      )}
    </main>
  );
}

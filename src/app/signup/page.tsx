// src/app/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [industry, setIndustry] = useState("");

  const handleSignup = async () => {
    if (!email || !password || !industry) return alert("모든 필드를 입력해주세요");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const commonData = {
        name: "신규 사업자",
        description: "가입한 셀러",
        plan: "free",
        createdAt: serverTimestamp(),
        email: user.email,
        industry,
        uid: user.uid,
      };

      await setDoc(doc(db, "users", user.uid, "seller", "profile"), commonData);

      router.push("/seller-dashboard");
    } catch (err: any) {
      alert(`회원가입 실패: ${err.message}`);
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">사업자 회원가입</h1>

      <input
        className="w-full border p-2 rounded"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="업종 (30자 이내)"
        maxLength={30}
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
      />

      <button
        className="w-full bg-blue-600 text-white p-2 rounded"
        onClick={handleSignup}
      >
        가입하기
      </button>

      <div className="pt-4 text-center">
        <button
          onClick={() => router.push("/community")}
          className="text-blue-500 text-sm underline"
        >
          커뮤니티 게시판 둘러보기
        </button>
      </div>
    </main>
  );
}

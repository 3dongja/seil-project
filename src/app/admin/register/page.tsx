// src/app/admin-tools/register/page.tsx (관리자 전용 사업자 등록)

"use client";

import { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const [uid, setUid] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [plan, setPlan] = useState("free");
  const router = useRouter();

  const handleRegister = async () => {
    if (!uid || !sellerId) return alert("UID와 Seller ID를 입력해주세요.");

    await setDoc(doc(db, "sellers", sellerId), {
      sellerId,
      uid,
      plan,
      createdAt: new Date(),
    });

    await setDoc(doc(db, "sellersByUser", uid), {
      sellerId,
      plan,
    });

    // 사용자 저장소에도 등록
    await setDoc(doc(db, "users", uid, "seller", "profile"), {
      sellerId,
      plan,
    });

    alert("등록 완료");
    router.push("/admin-tools");
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">📋 사업자 등록</h2>
      <input
        className="w-full border px-3 py-2 rounded"
        placeholder="사용자 UID"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
      />
      <input
        className="w-full border px-3 py-2 rounded"
        placeholder="Seller ID"
        value={sellerId}
        onChange={(e) => setSellerId(e.target.value)}
      />
      <select
        className="w-full border px-3 py-2 rounded"
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
      >
        <option value="free">Free</option>
        <option value="basic">Basic</option>
        <option value="premium">Premium</option>
      </select>
      <button
        onClick={handleRegister}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        등록하기
      </button>
    </div>
  );
}

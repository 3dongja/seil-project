// src/app/seller-settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import BackButton from "@/components/common/BackButton";

export default function SellerSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const user = getAuth().currentUser;

  const fetchSettings = async () => {
    if (!user) return;
    setLoading(true);
    const ref = doc(db, "users", user.uid, "seller", "settings");
    const snap = await getDoc(ref);
    if (snap.exists()) setSettings(snap.data());
    else alert("설정이 없습니다.");
    setLoading(false);
  };

  const saveSettings = async () => {
    if (!user || !settings) return;
    const ref = doc(db, "users", user.uid, "seller", "settings");
    await setDoc(ref, settings, { merge: true });
    alert("저장 완료");
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <BackButton />
      <h1 className="text-2xl font-bold">⚙️ 내 설정</h1>
      {loading && <p>불러오는 중...</p>}

      {settings && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">카테고리</h2>
          {settings.categories?.map((cat: string, i: number) => (
            <input
              key={i}
              className="border p-2 w-full"
              value={cat}
              onChange={(e) => {
                const newCats = [...settings.categories];
                newCats[i] = e.target.value;
                setSettings({ ...settings, categories: newCats });
              }}
            />
          ))}

          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={saveSettings}
          >
            저장하기
          </button>
        </div>
      )}
    </div>
  );
}

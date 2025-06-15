"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface ContactInfo {
  phone: string;
  email: string;
  kakao: string;
}

export default function AdminSettingsPage() {
  const [contact, setContact] = useState<ContactInfo>({ phone: "", email: "", kakao: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, "adminSettings", "contact"));
      if (snap.exists()) {
        const data = snap.data() as Partial<ContactInfo>;
        setContact({
          phone: data.phone ?? "",
          email: data.email ?? "",
          kakao: data.kakao ?? "",
        });
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    await setDoc(doc(db, "adminSettings", "contact"), contact);
    alert("저장되었습니다.");
  };

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-bold">📞 관리자 연락처 설정</h1>
      <input
        className="border p-2 w-full"
        placeholder="전화번호"
        value={contact.phone}
        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="이메일"
        value={contact.email}
        onChange={(e) => setContact({ ...contact, email: e.target.value })}
      />
      <input
        className="border p-2 w-full"
        placeholder="카카오톡 ID"
        value={contact.kakao}
        onChange={(e) => setContact({ ...contact, kakao: e.target.value })}
      />
      <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">
        저장
      </button>
    </main>
  );
}

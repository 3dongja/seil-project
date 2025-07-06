// src/app/support/SupportPageContent.tsx
"use client"

import BackButton from "@/components/common/BackButton"
import { useState, useEffect } from "react"
import { getAuth } from "firebase/auth"
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter, useSearchParams } from "next/navigation"

export default function SupportPageContent() {
  const [message, setMessage] = useState("")
  const [contact, setContact] = useState({ phone: "", email: "", kakao: "" })
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = getAuth().currentUser

  useEffect(() => {
    const fetchContact = async () => {
      const docRef = doc(db, "adminSettings", "contact");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setContact(snap.data() as any);
      }
    };
    fetchContact();
  }, [])

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason?.startsWith("upgrade")) {
      const plan = (reason ?? "").split("-")[1];
      const planName = plan === "premium" ? "프리미엄 요금제" : plan === "basic" ? "베이직 요금제" : "";
      setMessage(`요금제를 ${planName}로 업그레이드하고 싶습니다.`);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!user || !message.trim()) return alert("내용을 입력해주세요.");
    await addDoc(collection(db, "users", user.uid, "support", "tickets"), {
      uid: user.uid,
      email: user.email,
      message,
      createdAt: serverTimestamp(),
      status: "대기 중",
    });
    alert("문의가 등록되었습니다.");
    setMessage("");
    router.push("/seller-dashboard");
  };

  return (
    <main className="min-h-screen p-4 space-y-4">
      <BackButton />
      <h1 className="text-xl font-bold">📞 고객센터 문의</h1>

      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
        <p>☎️ 전화: {contact.phone || "미등록"}</p>
        <p>📧 이메일: {contact.email || "미등록"}</p>
        <p>💬 카카오톡: {contact.kakao || "미등록"}</p>
      </div>

      <textarea
        className="w-full p-2 border rounded min-h-[120px]"
        placeholder="문의 내용을 입력해주세요..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        문의 보내기
      </button>
    </main>
  )
}

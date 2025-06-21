"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import SellerLiveChatWrapper from "@/components/chat/SellerLiveChatWrapper";

export default function SellerLiveChatPage() {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  if (!uid) {
    return <div className="p-4">로그인 정보를 불러오는 중...</div>;
  }

  return (
    <Suspense fallback={<div className="p-4">로딩 중...</div>}>
      <SellerLiveChatWrapper uid={uid} />
    </Suspense>
  );
}

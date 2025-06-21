// src/app/seller-live-chat/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import SellerLiveChatWrapper from "@/components/chat/SellerLiveChatWrapper";

export default function SellerLiveChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-4">로딩 중...</div>;
  if (!user) return <div className="p-4">로그인이 필요합니다.</div>;

  return (
    <Suspense fallback={<div className="p-4">로딩 중...</div>}>
      <SellerLiveChatWrapper uid={user.uid} />
    </Suspense>
  );
}
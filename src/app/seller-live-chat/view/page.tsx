// src/app/seller-live-chat/view/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SellerLiveChatPage from "../SellerLiveChatPage";

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SellerLiveChatPage />
    </Suspense>
  );
}
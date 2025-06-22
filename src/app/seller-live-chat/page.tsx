// src/app/seller-live-chat/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ChatListPage from "./ChatListPage";

export default function Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ChatListPage />
    </Suspense>
  );
}

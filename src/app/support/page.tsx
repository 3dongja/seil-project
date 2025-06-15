// src/app/support/page.tsx
import { Suspense } from "react";
import SupportPageContent from "./SupportPageContent";

export default function SupportPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <SupportPageContent />
    </Suspense>
  );
}
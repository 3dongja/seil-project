// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const goToTestHub = () => {
    router.push("/test-hub");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
      <h1 className="text-3xl font-bold">Seil 프로젝트 홈</h1>
      <button
        onClick={goToTestHub}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
      >
        테스트 허브로 이동
      </button>
    </main>
  );
}
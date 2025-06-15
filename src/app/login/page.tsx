"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // 실제 로그인 처리 로직 추가 예정
    alert("테스트 계정으로 로그인 중...");
    router.push("/test-hub"); // 로그인 후 이동
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6">로그인 페이지</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
      >
        테스트 계정으로 로그인
      </button>
    </main>
  );
}
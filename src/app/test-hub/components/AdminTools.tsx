"use client";
import { useRouter } from "next/navigation";

export default function AdminTools() {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">🔓 관리자 도구</h2>
      <button
        onClick={() => router.push("/admin")}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        관리자 페이지로 이동
      </button>
    </div>
  );
}
"use client"

import { useSession, signIn } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/admin/logs")
    }
  }, [session, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">관리자 로그인</h1>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Google로 로그인
        </button>
      </div>
    </div>
  )
}
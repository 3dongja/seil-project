// src/components/AdminRoute.tsx
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"

interface AdminRouteProps {
  children: ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.replace("/admin/login")
    }
  }, [session, status, router])

  if (status === "loading" || !session || session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return <div className="p-8 text-gray-600">로딩 중...</div>
  }

  return <>{children}</>
}

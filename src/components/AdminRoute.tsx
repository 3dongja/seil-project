// src/components/AdminRoute.tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { useUserRoles as useAdminRoles } from "@/hooks/useUserRoles"

interface AdminRouteProps {
  children: ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter()
  const { isAdmin, loading } = useAdminRoles()

  useEffect(() => {
    if (loading) return
    if (!isAdmin) {
      router.replace("/admin/login")
    }
  }, [loading, isAdmin, router])

  if (loading || !isAdmin) {
    return <div className="p-8 text-gray-600">로딩 중...</div>
  }

  return <>{children}</>
}

// src/hooks/useUserRoles.ts
import { useSession } from "next-auth/react"
import { useUser } from "@/hooks/useUser"

export function useUserRoles() {
  const { data: session, status } = useSession()
  const { user } = useUser()

  const isAdmin = !!user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const loading = status === "loading"

  return { isAdmin, user, loading }
}
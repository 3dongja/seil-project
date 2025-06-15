// src/app/seller-dashboard/layout.tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import { ReactNode } from "react"

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="relative min-h-screen pb-20">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 text-sm">
        <button className={`${pathname === "/seller-dashboard" ? "text-green-700 font-bold" : "text-gray-600"}`}>대시보드</button>
        <button onClick={() => router.push("/seller-live-chat")} className={`${pathname === "/seller-live-chat" ? "text-green-700 font-bold" : "text-gray-600"}`}>채팅</button>
        <button onClick={() => router.push("/seller-logs")} className={`${pathname === "/seller-logs" ? "text-green-700 font-bold" : "text-gray-600"}`}>메시지</button>
        <button onClick={() => router.push("/seller-dashboard/my")} className={`${pathname === "/seller-dashboard/my" ? "text-green-700 font-bold" : "text-gray-600"}`}>전체 메뉴</button>
      </nav>
    </div>
  )
}

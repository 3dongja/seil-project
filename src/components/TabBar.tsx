'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TabBarItem } from './TabBarItem'

const routes = [
  { href: '/seller-dashboard', label: '대시보드', icon: '/icons/dashboard.svg' },
  { href: '/seller-live-chat', label: '채팅', icon: '/icons/chat.svg' },
  { href: '/seller-logs', label: '메시지', icon: '/icons/logs.svg' },
  { href: '/seller-dashboard/my', label: '전체 메뉴', icon: '/icons/menu.svg' },
]

export const TabBar = () => {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50 md:hidden">
      {routes.map((route) => (
        <TabBarItem
          key={route.href}
          href={route.href}
          icon={route.icon}
          label={route.label}
          active={pathname === route.href}
        />
      ))}
    </nav>
  )
}

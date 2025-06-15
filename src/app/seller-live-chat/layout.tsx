import { ReactNode } from "react"
import { TabBar } from "@/components/TabBar"

export default function SellerLiveChatLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="pb-20">
        {children}
      </main>
      <TabBar />
    </>
  )
}

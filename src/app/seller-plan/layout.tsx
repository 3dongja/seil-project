import { ReactNode } from "react"
import { TabBar } from "@/components/TabBar"

export default function SellerPlanLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="pb-20">
        {children}
      </main>
      <TabBar />
    </>
  )
}

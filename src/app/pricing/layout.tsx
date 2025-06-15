import { ReactNode } from "react";
import { TabBar } from "@/components/TabBar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="pb-20 p-4 space-y-4">
        {children}
      </main>
      <TabBar />
    </>
  );
}
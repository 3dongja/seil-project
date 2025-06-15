// src/app/community/layout.tsx

import { ReactNode } from "react";
import { TabBar } from "@/components/TabBar";
import BackButton from "@/components/common/BackButton";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="pb-20 p-4 space-y-4">
        <BackButton />
        {children}
      </main>
      <TabBar />
    </>
  );
}

// src/hooks/useSellerStatus.ts
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const useSellerStatus = (sellerId: string): [string, () => Promise<void>] => {
  const [statusColor, setStatusColor] = useState("gray");

  const checkStatus = async () => {
    const ref = doc(db, "users", sellerId, "seller", "profile");
    const snap = await getDoc(ref);
    const data = snap.data();
    if (!data?.lastAdminActive) return;

    const lastActive = data.lastAdminActive.toDate().getTime();
    const now = Date.now();
    const diff = now - lastActive;

    setStatusColor(
      diff < 5 * 60 * 1000 ? "green" :
      diff < 10 * 60 * 1000 ? "yellow" : "gray"
    );
  };

  return [statusColor, checkStatus];
};

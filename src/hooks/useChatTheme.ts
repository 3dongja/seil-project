import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ChatTheme {
  bubbleColor: string;
  bubbleTextColor: string;
  bgImageUrl: string;
  fontClass: string;
  reverseBubble: boolean;
  chatTitle: string;
  emojiAvatar: string;
}

export function useChatTheme(sellerId: string) {
  const [theme, setTheme] = useState<ChatTheme | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      const ref = doc(db, "users", sellerId, "seller", "settings");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        setTheme({
          bubbleColor: d.bubbleColor || "#f0f0f0",
          bubbleTextColor: d.bubbleTextColor || "#000",
          bgImageUrl: d.bgImageUrl || "",
          fontClass: d.fontClass || "font-sans",
          reverseBubble: d.reverseBubble || false,
          chatTitle: d.chatTitle || "",
          emojiAvatar: d.emojiAvatar || "😊",
        });
      }
    };
    if (sellerId) fetchTheme();
  }, [sellerId]);

  return theme;
}

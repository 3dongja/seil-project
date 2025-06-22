// src/lib/chat/useChatLogic.ts
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChatMessage {
  sender: string;
  text: string;
  createdAt?: any;
  type?: string;
  status?: string;
}

export function useChatLogic(sellerId: string, inquiryId: string) {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!sellerId || !inquiryId) return;

    const q = query(
      collection(db, "sellers", sellerId, "inquiries", inquiryId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data() as ChatMessage);
      setChat(messages);
    });

    return () => unsubscribe();
  }, [sellerId, inquiryId]);

  return { chat, setChat };
}

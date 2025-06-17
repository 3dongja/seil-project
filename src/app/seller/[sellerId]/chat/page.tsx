"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { buildPrompt } from "@/lib/gpt/prompt";
import KakaoChatInputBar from "@/components/chat/KakaoChatInputBar";

const categories = ['주문', '예약', '상담', '문의', '반품', '교환', '1:1채팅'];

export default function ConsumerChatPage() {
  const params = useParams();
  const sellerId = params?.sellerId as string;
  const [category, setCategory] = useState("예약");
  const [prompt, setPrompt] = useState("");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<string[]>([
    "🤖 안녕하세요! 원하시는 서비스 카테고리 버튼을 누르시고 대화를 시작해주세요."
  ]);
  // ✅ 안내문 상태 추가
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusColor, setStatusColor] = useState("// ✅ 안내문 불러오는 useEffect (sellerId 기준)
  useEffect(() => {
  const loadWelcomeMessage = async () => {
    if (!sellerId) return;
    const ref = doc(db, "sellers", sellerId, "settings", "chatbot");
    const snap = await getDoc(ref);
    const data = snap.data();
    const welcome = data?.welcomeMessage?.trim();
    if (welcome) {
      setWelcomeMessage(welcome);
      setChat([`🤖 ${welcome}`]);
    }
  };
  loadWelcomeMessage();
  }, [sellerId]);
const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const storedId = localStorage.getItem("consumer_uid") || uuidv4();
    localStorage.setItem("consumer_uid", storedId);
    setUserId(storedId);
  }, []);

  useEffect(() => {
    if (sellerId) {
      fetchPrompt();
      checkStatus();
    }
  }, [sellerId, category]);

  const fetchPrompt = async () => {
    const ref = doc(db, "sellers", sellerId, "settings", "chatbot");
    const snap = await getDoc(ref);
    const data = snap.data();
    if (!data) return;

    const promptText = buildPrompt({
      industry: data.industry,
      category,
      products: data.products,
      cue: data.promptCue,
      welcome: data.welcomeMessage
    });

    setPrompt(promptText);
  };

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

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const newChat = [...chat, `🙋‍♀️ ${input}`];
    setChat(newChat);

    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, userMessage: input })
    });

    const data = await res.json();
    const updatedChat = [...newChat, `🤖 ${data.reply}`];
    setChat(updatedChat);
    setInput("");
    setLoading(false);

    const threadRef = collection(db, "sellers", sellerId, "threads");
    const threadDoc = await addDoc(threadRef, { createdAt: serverTimestamp(), userId });

    await Promise.all([
      addDoc(collection(threadDoc, "messages"), {
        sender: "user", content: input, createdAt: serverTimestamp()
      }),
      addDoc(collection(threadDoc, "messages"), {
        sender: "gpt", content: data.reply, createdAt: serverTimestamp()
      }),
      addDoc(collection(db, "users", sellerId, "seller", "messages", userId, "thread"), {
        sender: "user", text: input, createdAt: serverTimestamp()
      }),
      addDoc(collection(db, "users", sellerId, "seller", "messages", userId, "thread"), {
        sender: "gpt", text: data.reply, createdAt: serverTimestamp()
      }),
      setDoc(doc(db, "users", sellerId, "seller", "chatUsers", userId), {
        name: "손님", lastMessage: input, updatedAt: serverTimestamp()
      })
    ]);

    const fullChat = updatedChat.join("\n");
    const hasContact = /(\d{2,3}-?\d{3,4}-?\d{4})/.test(fullChat);
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(fullChat);
    const hasName = /(성함|이름)[:\s]*[가-힣]{2,4}/.test(fullChat);
    const hasContent = /(환불|예약|문의|주문|교환|상담)/.test(fullChat);

    if ((hasContact || hasEmail) && hasName && hasContent) {
      const summaryRes = await fetch("/api/summarize-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedChat, model: "gpt-3.5-turbo" })
      });
      const summaryData = await summaryRes.json();
      await setDoc(doc(db, "sellers", sellerId, "inquiries", userId), {
        summary: summaryData.summary,
        customerName: "손님",
        createdAt: serverTimestamp()
      });
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-4 pb-32 text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full bg-${statusColor}-500`} />
        <span className="text-gray-700">사업자 상태</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full border text-sm ${
              cat === category
                ? "bg-yellow-400 text-white border-yellow-400"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-gray-50 p-3 rounded shadow min-h-[300px] space-y-2 max-h-[50vh] overflow-y-auto">
        {chat.map((msg, i) => (
          <div key={i} className="whitespace-pre-wrap">{msg}</div>
        ))}
      </div>

      <KakaoChatInputBar
        value={input}
        onChange={setInput}
        onSubmit={sendMessage}
        disabled={loading}
      />
    </main>
  );
}

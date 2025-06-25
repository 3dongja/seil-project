"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  getDocs,
  limit,
  deleteDoc,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  createdAt: any;
  lastMessage?: string;
  unread?: boolean;
  pinned?: boolean;
  read?: boolean;
  category?: string;
}

interface ChatListPageProps {
  sellerId: string;
}

export default function ChatListPage({ sellerId }: ChatListPageProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState<string>("");
  const [openTime, setOpenTime] = useState("11:00");
  const [closeTime, setCloseTime] = useState("15:00");
  const router = useRouter();
  const swipeRefs = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!sellerId) return;

    const sellerRef = doc(db, "sellers", sellerId);
    getDoc(sellerRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setOpenTime(data.openTime || "11:00");
        setCloseTime(data.closeTime || "15:00");
      }
    });

    const q = query(
      collection(db, "sellers", sellerId, "inquiries"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const results: Inquiry[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const id = docSnap.id;
          const data = docSnap.data();
          const messagesSnap = await getDocs(
            query(
              collection(db, "sellers", sellerId, "inquiries", id, "messages"),
              orderBy("createdAt", "desc"),
              limit(1)
            )
          );
          const lastMessage = messagesSnap.docs[0]?.data()?.text || "";
          const unread = data.alert === true;
          const read = data.alert === false;
          const pinned = data.pinned === true;
          const category = data.category || "일반";
          return {
            id,
            name: data.name,
            phone: data.phone,
            createdAt: data.createdAt,
            lastMessage,
            unread,
            read,
            pinned,
            category
          };
        })
      );
      const sorted = results.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      setInquiries(sorted);
    });
    return () => unsubscribe();
  }, [sellerId]);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "sellers", sellerId, "inquiries", id));
    } catch (e) {
      alert("삭제 중 오류 발생");
    }
  };

  const handleTogglePin = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "sellers", sellerId, "inquiries", id), {
        pinned: !current
      });
    } catch (e) {
      alert("핀 고정/해제 중 오류 발생");
    }
  };

  const filtered = inquiries.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.phone.includes(search)
  );

  const formatTime = (ts: any) => {
    if (!ts?.seconds) return "";
    const date = new Date(ts.seconds * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000 * 2 && date.getDate() === now.getDate() - 1) return "어제";
    return date.toLocaleDateString();
  };

  const handleTouchStart = (id: string, x: number) => {
    swipeRefs.current[id] = x;
  };

  const handleTouchEnd = (id: string, x: number) => {
    const delta = x - swipeRefs.current[id];
    const el = document.getElementById(`slide-${id}`);
    if (!el) return;
    if (delta < -30) el.classList.add("-translate-x-20");
    else el.classList.remove("-translate-x-20");
  };

  return (
    <main className="h-screen bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="🔍 이름 또는 전화번호 검색"
          className="w-full px-3 py-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.map((inq) => (
          <div
            key={inq.id}
            className="relative overflow-hidden rounded-xl shadow-md bg-white"
          >
            <div
              id={`slide-${inq.id}`}
              className="flex transform transition-transform duration-500 ease-in-out translate-x-0"
              onTouchStart={(e) => handleTouchStart(inq.id, e.touches[0].clientX)}
              onTouchEnd={(e) => handleTouchEnd(inq.id, e.changedTouches[0].clientX)}
            >
              <div
                className="flex-1 px-4 py-3 cursor-pointer"
                onClick={() => router.push(`/seller-live-chat/view?seller=${sellerId}&inquiry=${inq.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div className="truncate text-base font-semibold text-gray-900 max-w-[70%]">
                    {inq.name} / {inq.phone}
                  </div>
                  <div className="flex items-center space-x-2">
                    {inq.unread && <span className="text-blue-500 text-xs">●</span>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(inq.id, inq.pinned || false);
                      }}
                      className="text-gray-400 hover:text-yellow-500 text-sm"
                    >
                      {inq.pinned ? "📌" : "📍"}
                    </button>
                    <div className="text-xs text-gray-500">
                      {formatTime(inq.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {inq.lastMessage || "최근 메시지 없음"}
                </div>
              </div>

              <div className="w-20 bg-red-500 text-white text-sm flex justify-center items-center">
                <button
                  onClick={() => handleDelete(inq.id)}
                  className="w-full h-full"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

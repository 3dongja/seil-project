// ChatListPage.tsx - 채팅 목록 전용 분리
"use client";

import { useEffect, useState } from "react";
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
  getDoc
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

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map((inq) => (
          <div
            key={inq.id}
            className={`bg-white hover:bg-gray-100 transition rounded-lg px-4 py-3 flex flex-col shadow-sm relative group ${inq.pinned ? 'border-l-4 border-yellow-400' : ''}`}
          >
            <button
              onClick={() => handleDelete(inq.id)}
              className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 text-white text-sm hidden group-hover:flex justify-center items-center"
            >
              삭제
            </button>

            <div
              className="w-full cursor-pointer"
              onClick={() => router.push(`/seller-live-chat?seller=${sellerId}&inquiry=${inq.id}`)}
            >
              <div className="flex justify-between items-center">
                <div className="truncate text-base font-bold text-gray-800 max-w-[85%]">
                  {inq.name} / {inq.phone}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(inq.createdAt)}
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                {inq.lastMessage || "최근 메시지 없음"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

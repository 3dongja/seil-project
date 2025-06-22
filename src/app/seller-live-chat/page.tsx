"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  where
} from "firebase/firestore";
import ChatScreen from "@/components/chat/ChatScreen";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  createdAt: any;
  lastMessage?: string;
  unread?: boolean;
  pinned?: boolean;
  read?: boolean;
}

export default function SellerLiveChatWrapper() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [sellerId, setSellerId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedInquiryId = searchParams.get("inquiry");
  const selectedSellerId = searchParams.get("seller");

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    if (uid) setSellerId(uid);
  }, []);

  useEffect(() => {
    if (!sellerId) return;
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
          return {
            id,
            name: data.name,
            phone: data.phone,
            createdAt: data.createdAt,
            lastMessage,
            unread,
            read,
            pinned
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
            className={`bg-white shadow rounded-lg p-4 relative group overflow-hidden ${inq.pinned ? 'border-l-4 border-yellow-400' : ''}`}
          >
            <button
              onClick={() => handleDelete(inq.id)}
              className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 text-white text-sm hidden group-hover:block"
            >
              삭제
            </button>
            <div
              className="cursor-pointer pr-20"
              onClick={() => router.push(`/seller-live-chat?seller=${sellerId}&inquiry=${inq.id}`)}
            >
              <div className="flex justify-between">
                <div className="font-semibold flex gap-1 items-center">
                  {inq.name} / {inq.phone}
                  {inq.unread && <span className="text-xs bg-red-500 text-white px-1.5 rounded-full">N</span>}
                  {inq.read && <span className="text-xs text-gray-400">✓</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(inq.createdAt)}
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1 line-clamp-1">{inq.lastMessage}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedSellerId && selectedInquiryId && (
        <div className="fixed inset-0 z-50 bg-white border-l">
          <ChatScreen
            sellerId={selectedSellerId}
            inquiryId={selectedInquiryId}
            userType="seller"
          />
        </div>
      )}
    </main>
  );
}

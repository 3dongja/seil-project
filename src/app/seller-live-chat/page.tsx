// src/app/seller-live-chat/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, addDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function SellerLiveChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<any>({});
  const [logAlerts, setLogAlerts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchTheme = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid, "seller", "settings");
      const snap = await getDoc(ref);
      if (snap.exists()) setTheme(snap.data());
    };
    fetchTheme();
  }, [user]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      const sellerId = user.uid;
      const res = await getDocs(collection(db, "users", sellerId, "seller", "chatUsers"));
      const convos = res.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convos);
    };
    fetchConversations();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !selectedUser) return;
      const res = await getDocs(collection(db, "users", user.uid, "seller", "messages", selectedUser, "thread"));
      const msgs = res.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    const fetchLogAlerts = async () => {
      if (!user) return;
      const snap = await getDocs(collection(db, "users", user.uid, "seller", "messages"));
      const logs = snap.docs.map(doc => doc.data()).filter(log => log.alert);
      setLogAlerts(logs);
    };
    fetchLogAlerts();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !selectedUser || (!newMsg.trim() && !newFile)) return;
    const msgData: any = {
      sender: "seller",
      createdAt: serverTimestamp(),
    };
    if (newMsg.trim()) msgData.text = newMsg;
    if (newFile) msgData.fileUrl = URL.createObjectURL(newFile);

    await addDoc(collection(db, "users", user.uid, "seller", "messages", selectedUser, "thread"), msgData);
    setNewMsg("");
    setNewFile(null);
    setSelectedUser(selectedUser);
  };

  const bubbleStyle = theme.reverseBubble ? "self-end" : "self-start";
  const bubbleColor = theme.bubbleColor || "bg-blue-100";
  const fontClass = theme.fontClass || "";
  const sendButtonLabel = theme.sendButtonLabel || "전송";

  return (
    <div className="flex h-screen divide-x" style={{ backgroundImage: `url(${theme.bgImageUrl || ''})`, backgroundSize: 'cover' }}>
      <div className="w-1/3 p-4 overflow-y-auto bg-white/80">
        <h2 className="text-lg font-bold mb-4">고객 목록</h2>
        {conversations.map((c) => (
          <div key={c.id} className="p-2 border rounded mb-2 cursor-pointer hover:bg-gray-100"
               onClick={() => setSelectedUser(c.id)}>
            <div className="font-medium">{c.name || c.id}</div>
            <div className="text-xs text-gray-500">{c.lastMessage || "최근 메시지 없음"}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 p-4 flex flex-col relative">
        {logAlerts.length > 0 && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-100 text-sm px-4 py-2 rounded shadow z-10">
            {logAlerts.slice(0, 1).map((log, i) => (
              <div key={i}>
                ⚠️ {log.question?.slice(0, 40)}...
                <button onClick={() => setSelectedUser(log.userId)} className="ml-2 text-blue-600 underline">이동</button>
              </div>
            ))}
          </div>
        )}

        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-auto space-y-2 pb-32">
              {messages.map((msg, i) => (
                <div key={i} className={`${bubbleStyle} ${bubbleColor} ${fontClass} p-2 rounded max-w-md`}>
                  {msg.text && <p>{msg.text}</p>}
                  {msg.fileUrl && <img src={msg.fileUrl} alt="uploaded" className="mt-1 max-w-xs rounded" />}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="absolute bottom-4 left-0 w-full flex flex-col px-4 gap-2">
              <input type="file" onChange={(e) => e.target.files && setNewFile(e.target.files[0])} />
              <div className="flex gap-2">
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                       className="border rounded w-full px-3 py-2" placeholder="메시지 입력..." />
                <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">{sendButtonLabel}</button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500">사용자를 선택해주세요</div>
        )}
      </div>
    </div>
  );
}

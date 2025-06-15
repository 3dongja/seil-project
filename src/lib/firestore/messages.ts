// 쪽지 시스템 Firestore 함수들

import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

// 메시지 불러오기 (chatLogs/{sellerId}/rooms/{chatId}/messages)
export const fetchRoomMessages = async (sellerId: string, chatId: string) => {
  const q = query(
    collection(db, `chatLogs/${sellerId}/rooms/${chatId}/messages`),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 메시지 추가하기
export const sendMessageToRoom = async (
  sellerId: string,
  chatId: string,
  sender: "user" | "owner" | "gpt",
  text: string
) => {
  const message = {
    sender,
    text,
    createdAt: Timestamp.now()
  };
  await addDoc(collection(db, `chatLogs/${sellerId}/rooms/${chatId}/messages`), message);
};

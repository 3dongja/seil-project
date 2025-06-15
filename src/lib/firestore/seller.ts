// src/lib/firestore/seller.ts
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function createSeller(sellerId: string) {
  const ref = doc(db, "sellers", sellerId)

  const defaultData = {
    plan: "free",
    createdAt: serverTimestamp(),
    currentUsage: 0,
    settings: {
      categories: ["상품 문의", "주문 요청", "배송 문의", "환불 요청"],
      greetings: "안녕하세요! 무엇을 도와드릴까요?",
      quickReplies: ["배송 조회", "환불 요청", "주문 취소"],
      customFields: [
        { label: "이름", type: "text", required: true },
        { label: "전화번호", type: "tel", required: false }
      ],
      theme: {
        bgColor: "#ffffff",
        bubbleColor: "#333333",
        textColor: "#000000",
        logoUrl: ""
      }
    }
  }

  await setDoc(ref, defaultData)
  console.log(`✅ seller 생성됨: ${sellerId}`)
}

export async function updateSellerSettings(sellerId: string, newSettings: any) {
  const ref = doc(db, "sellers", sellerId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error("존재하지 않는 sellerId입니다")

  await updateDoc(ref, { settings: newSettings })
  console.log(`🔧 seller 설정 업데이트됨: ${sellerId}`)
}

export async function getSellerSettings(sellerId: string) {
  const ref = doc(db, "sellers", sellerId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error("존재하지 않는 sellerId입니다")

  return snap.data().settings
}

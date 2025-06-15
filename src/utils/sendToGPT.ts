// ✅ GPT 메시지 요청 유틸 (3.5 전용)
console.log("✅ GPT35 KEY:", process.env.OPENAI_API_KEY_GPT35)

import OpenAI from "openai"
import { getDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function sendToGPT(prompt: string, sellerId?: string) {
  if (sellerId) {
    const sellerRef = doc(db, "sellers", sellerId)
    const sellerSnap = await getDoc(sellerRef)
    const { gptEnabled, lastAdminActive } = sellerSnap.data()?.settings || {}

    const isAdminOnline =
      lastAdminActive && Date.now() - lastAdminActive.toMillis() < 10 * 60 * 1000

    if (!gptEnabled && !isAdminOnline) {
      await updateDoc(sellerRef, {
        "settings.gptEnabled": true,
      })
      console.log("🔄 GPT 자동 복구됨")
    }
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_GPT35! })

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  })

  return response.choices[0].message.content || ""
}

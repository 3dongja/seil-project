// pages/api/gpt.ts

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { adminDb, serverTimestamp } from "@/lib/firebase-admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message: prompt, sellerId, inquiryId, systemPrompt, model = "gpt-3.5-turbo" } = req.body;

    if (!prompt || !sellerId || !inquiryId) {
      return res.status(400).json({
        error: `필수 입력 누락: ${[
          !prompt && "prompt",
          !sellerId && "sellerId",
          !inquiryId && "inquiryId",
        ].filter(Boolean).join(", ")}`,
      });
    }

    const session = await getServerSession(req, res, authOptions);
    const user = session?.user;
    const selectedModel = typeof model === "string" && model.includes("gpt-4") ? "gpt-4" : "gpt-3.5-turbo";

    if (selectedModel === "gpt-4") {
      return res.status(403).json({ error: "GPT-4 모델은 현재 준비 중입니다." });
    }

    const apiKey = process.env.OPENAI_API_KEY_GPT35;
    if (!apiKey) return res.status(500).json({ error: "API 키 누락됨" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: "GPT 호출 오류: " + text });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content ?? "응답 없음";

    await adminDb.collection("logs").add({
      sellerId,
      inquiryId,
      user: user?.email ?? "anonymous",
      prompt,
      message,
      model: selectedModel,
      createdAt: serverTimestamp(),
      intent: "chat",
      status: "done",
    });

    return res.status(200).json({ message });
  } catch (err) {
    console.error("/pages/api/gpt 에러:", err);
    return res.status(500).json({ error: "서버 오류" });
  }
}

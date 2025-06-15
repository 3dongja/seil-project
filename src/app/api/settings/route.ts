// src/app/api/settings/route.ts
import { NextRequest } from "next/server"
import { getSellerSettings, updateSellerSettings } from "@/lib/firestore/seller"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sellerId = searchParams.get("sellerId")
  if (!sellerId) return new Response("Missing sellerId", { status: 400 })

  try {
    const settings = await getSellerSettings(sellerId)
    return Response.json(settings)
  } catch (e) {
    return new Response("설정을 찾을 수 없습니다", { status: 404 })
  }
}

export async function POST(req: NextRequest) {
  const { sellerId, settings } = await req.json()
  if (!sellerId || !settings) {
    return new Response("sellerId 또는 settings 누락", { status: 400 })
  }

  try {
    await updateSellerSettings(sellerId, settings)
    return new Response("설정이 저장되었습니다")
  } catch (e) {
    return new Response("저장 실패", { status: 500 })
  }
}

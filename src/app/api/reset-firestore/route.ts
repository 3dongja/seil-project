// src/app/api/reset-firestore/route.ts
import { NextResponse } from "next/server";
import { deleteCollection } from "@/lib/firestore-utils";

const collections = ["sellers", "sellerInfo", "inquiries", "messages"];

export async function POST() {
  try {
    for (const col of collections) {
      await deleteCollection(col);
    }
    return NextResponse.json({ success: true, message: "초기화 완료" });
  } catch (error) {
    console.error("Firestore 초기화 실패:", error);
    return NextResponse.json({ success: false, message: "초기화 실패" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[TEST] 수신된 요청 바디:", body);
    return new NextResponse(JSON.stringify({ received: body }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[TEST] JSON 파싱 실패:", error);
    return new NextResponse(JSON.stringify({ error: "JSON 파싱 실패" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
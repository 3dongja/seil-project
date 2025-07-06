export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { adminDb } from '@/lib/firebase-admin';

const useGpt4 = false;

const openai = new OpenAI({
  apiKey: useGpt4 ? process.env.OPENAI_API_KEY_GPT40! : process.env.OPENAI_API_KEY_GPT35!,
});

export async function POST(req: Request) {
  const { message, inquiryId, sellerId } = await req.json();

  if (!message || !inquiryId || !sellerId) {
    return new Response(
      `Missing fields: ${[
        !message && 'message',
        !inquiryId && 'inquiryId',
        !sellerId && 'sellerId',
      ].filter(Boolean).join(', ')}`,
      { status: 400 }
    );
  }

  const sellerRef = adminDb.collection('users').doc(sellerId);
  const sellerSnap = await sellerRef.get();
  const sellerProfile = sellerSnap.exists ? sellerSnap.data() : null;

  const settingsRef = adminDb.collection('sellers').doc(sellerId).collection('settings').doc('chatbot');
  const settingsSnap = await settingsRef.get();
  const settings = settingsSnap.exists ? settingsSnap.data() : {};

  const context = `
  [업체명] ${sellerProfile?.name ?? ''}
  [업종] ${settings?.industry ?? sellerProfile?.category ?? ''}
  [판매상품] ${settings?.products ?? ''}
  [상세 설명] ${sellerProfile?.description ?? ''}
  [상담 안내 문장] ${settings?.welcomeMessage ?? ''}
  [유도 질문] ${settings?.promptCue ?? ''}
  [카테고리] ${settings?.category ?? ''}
  `;

  const systemPrompt = `당신은 고객센터 요약 AI입니다. 
판매자의 업종과 판매 품목을 참고하되, 그 외 주제나 과거 정보로 벗어나지 말고 고객의 말과 해당 판매자의 업종/상품 안에서만 집중해서 요약하세요.`;

  const fullPrompt = `${systemPrompt}

${context}

[user] ${message}
[summary]`;

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[요약 프롬프트]', fullPrompt);
    }

    const completion = await openai.chat.completions.create({
      model: useGpt4 ? 'gpt-4' : 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? '요약을 생성하지 못했습니다.';
    return NextResponse.json({ summary: reply });
  } catch (error) {
    console.error('요약 GPT 처리 실패:', error);
    return new NextResponse('요약 호출 실패', { status: 500 });
  }
}

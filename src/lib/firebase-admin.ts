// lib/firebase-admin.ts

import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY!);

  // 환경변수 내 private_key 문자열의 이스케이프된 \\n을 실제 줄바꿈 문자 \n 으로 변환
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

export { admin };
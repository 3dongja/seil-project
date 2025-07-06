// /src/app/api/auth/[...nextauth]/route.ts

export const dynamic = 'force-dynamic';

console.log("🚀 NEXTAUTH route loaded on ", typeof window === "undefined" ? "server" : "client");

import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import admin from "firebase-admin"

function safeEnv(key: string): string {
  return process.env[key] ?? "";
}

function logEnvCheck() {
  console.log("[ENV CHECK]");
  [
    "NEXTAUTH_URL",
    "NEXTAUTH_URL_INTERNAL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "NEXTAUTH_SECRET",
    "NEXT_PUBLIC_ADMIN_EMAIL",
    "FIREBASE_ADMIN_KEY",
  ].forEach(key => {
    const val = process.env[key];
    console.log(`ENV::${key} =`, val ? `${val.slice(0, 4)}...` : "❌ NOT SET");
  });
}

function initializeFirebaseIfNeeded() {
  if (admin.apps.length > 0) return;

  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) {
    throw new Error("FIREBASE_ADMIN_KEY가 정의되지 않았습니다. Vercel 환경 변수 확인 필요.");
  }

  let parsed = {};
  try {
    parsed = JSON.parse(raw.replace(/\\n/g, "\n"));
    console.log("✅ FIREBASE_ADMIN_KEY 파싱 성공. 키들:", Object.keys(parsed));
  } catch (e) {
    console.error("❌ FIREBASE_ADMIN_KEY JSON 파싱 실패", e);
    throw new Error("FIREBASE_ADMIN_KEY가 유효한 JSON이 아닙니다.");
  }

  admin.initializeApp({
    credential: admin.credential.cert(parsed as admin.ServiceAccount),
  });
}

function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      GoogleProvider({
        clientId: safeEnv("GOOGLE_CLIENT_ID"),
        clientSecret: safeEnv("GOOGLE_CLIENT_SECRET"),
      }),
    ],
    secret: safeEnv("NEXTAUTH_SECRET"),
    pages: {
      signIn: "/admin/login",
    },
    callbacks: {
      async signIn({ user }: { user: any }) {
        const adminEmails = (safeEnv("NEXT_PUBLIC_ADMIN_EMAIL") ?? "")
          .split(",")
          .map(e => e.trim())
          .filter(Boolean);

        return adminEmails.includes(user.email ?? "");
      },
    },
  };
}

export const GET = async (req: any, res: any) => {
  try {
    logEnvCheck();
    initializeFirebaseIfNeeded();
    const authHandler = NextAuth(getAuthOptions());
    return await authHandler(req, res);
  } catch (err) {
    console.error("Auth handler error (GET):", err);
    throw err;
  }
};

export const POST = async (req: any, res: any) => {
  try {
    logEnvCheck();
    initializeFirebaseIfNeeded();
    const authHandler = NextAuth(getAuthOptions());
    return await authHandler(req, res);
  } catch (err) {
    console.error("Auth handler error (POST):", err);
    throw err;
  }
};
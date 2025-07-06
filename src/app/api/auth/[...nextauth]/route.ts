import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import admin from "firebase-admin"

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`환경 변수 ${key}가 누락되었습니다.`);
  return value;
}

console.log("[ENV CHECK]");
["NEXTAUTH_URL", "NEXTAUTH_URL_INTERNAL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXTAUTH_SECRET", "NEXT_PUBLIC_ADMIN_EMAIL", "FIREBASE_ADMIN_KEY"].forEach(key => {
  const val = process.env[key];
  console.log(`ENV::${key} =`, val ? `${val.slice(0, 4)}...` : "❌ NOT SET");
});

// 🔐 빌드 타임 검증 강화
const raw = process.env.FIREBASE_ADMIN_KEY;
if (!raw) {
  throw new Error("FIREBASE_ADMIN_KEY가 정의되지 않았습니다. Vercel 환경 변수 확인 필요.");
}

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(raw);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      GoogleProvider({
        clientId: requireEnv("GOOGLE_CLIENT_ID"),
        clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      }),
    ],
    secret: requireEnv("NEXTAUTH_SECRET"),
    pages: {
      signIn: "/admin/login",
    },
    callbacks: {
      async signIn({ user }: { user: any }) {
        return user.email === requireEnv("NEXT_PUBLIC_ADMIN_EMAIL");
      },
    },
  };
}

const handler = NextAuth(getAuthOptions());

export { handler as GET, handler as POST };
import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import admin from "firebase-admin"

// ✅ 디버그 로그 삽입 (환경 변수 누락 확인용)
console.log("ENV::NEXTAUTH_URL =", process.env.NEXTAUTH_URL ?? "❌ NOT SET");
console.log("ENV::NEXTAUTH_URL_INTERNAL =", process.env.NEXTAUTH_URL_INTERNAL ?? "❌ NOT SET");
console.log("ENV::GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID ?? "❌ NOT SET");
console.log("ENV::GOOGLE_CLIENT_SECRET =", process.env.GOOGLE_CLIENT_SECRET ?? "❌ NOT SET");
console.log("ENV::NEXTAUTH_SECRET =", process.env.NEXTAUTH_SECRET ?? "❌ NOT SET");
console.log("ENV::NEXT_PUBLIC_ADMIN_EMAIL =", process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "❌ NOT SET");

// ✅ Firebase Admin 서비스 계정 정보 로그 (개별 항목 확인용)
console.log("ENV::FIREBASE_PROJECT_ID =", process.env.FIREBASE_PROJECT_ID ?? "❌ NOT SET");
console.log("ENV::FIREBASE_CLIENT_EMAIL =", process.env.FIREBASE_CLIENT_EMAIL ?? "❌ NOT SET");
console.log("ENV::FIREBASE_PRIVATE_KEY length =", process.env.FIREBASE_PRIVATE_KEY?.length ?? "❌ NOT SET");

// ✅ Firebase Admin 초기화 보호
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      clientId: process.env.FIREBASE_CLIENT_ID!,
      authUri: process.env.FIREBASE_AUTH_URI!,
      tokenUri: process.env.FIREBASE_TOKEN_URI!,
      authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL!,
      clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL!,
      universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN!,
    } as any),
  });
}

function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/admin/login",
    },
    callbacks: {
      async signIn({ user }: { user: any }) {
        return user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      },
    },
  };
}

const handler = NextAuth(getAuthOptions());

export { handler as GET, handler as POST };

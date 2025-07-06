import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import admin from "firebase-admin"

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`환경 변수 ${key}가 누락되었습니다.`);
  return value;
}

console.log("[ENV CHECK]");
["NEXTAUTH_URL", "NEXTAUTH_URL_INTERNAL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXTAUTH_SECRET", "NEXT_PUBLIC_ADMIN_EMAIL", "FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"].forEach(key => {
  const val = process.env[key];
  console.log(`ENV::${key} =`, val ? `${val.slice(0, 4)}...` : "❌ NOT SET");
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: requireEnv("FIREBASE_PROJECT_ID"),
      privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\n/g, "\\n"),
      clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
    }),
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

import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// ✅ 디버그 로그 삽입
console.log("DEBUG: NEXTAUTH_URL =", process.env.NEXTAUTH_URL);
console.log("DEBUG: NEXTAUTH_URL_INTERNAL =", process.env.NEXTAUTH_URL_INTERNAL);
console.log("DEBUG: GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);

// ✅ Firebase Admin 서비스 계정 정보 로그 (개별 항목 확인용)
console.log("DEBUG: FIREBASE_PROJECT_ID =", process.env.FIREBASE_PROJECT_ID);
console.log("DEBUG: FIREBASE_CLIENT_EMAIL =", process.env.FIREBASE_CLIENT_EMAIL);
console.log("DEBUG: FIREBASE_PRIVATE_KEY (길이) =", process.env.FIREBASE_PRIVATE_KEY?.length);

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

import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// ✅ 디버그 로그 삽입
console.log("DEBUG: NEXTAUTH_URL =", process.env.NEXTAUTH_URL);
console.log("DEBUG: NEXTAUTH_URL_INTERNAL =", process.env.NEXTAUTH_URL_INTERNAL);
console.log("DEBUG: GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);

const authOptions: NextAuthOptions = {
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
      return user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

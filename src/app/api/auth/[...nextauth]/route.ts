import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions, User } from "next-auth"

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
    async signIn({ user }: { user: User }) {
      return user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

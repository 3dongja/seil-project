console.log("🚀 NEXTAUTH route loaded on ", typeof window === "undefined" ? "server" : "client");

import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import admin from "firebase-admin"

console.log("\uD83D\uDE80 NEXTAUTH route loaded on ", typeof window === "undefined" ? "server" : "client");

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`\uD658\uACBD \uBCC0\uC218 ${key}\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`);
  return value;
}

console.log("[ENV CHECK]");
["NEXTAUTH_URL", "NEXTAUTH_URL_INTERNAL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXTAUTH_SECRET", "NEXT_PUBLIC_ADMIN_EMAIL", "FIREBASE_ADMIN_KEY"].forEach(key => {
  const val = process.env[key];
  console.log(`ENV::${key} =`, val ? `${val.slice(0, 4)}...` : "\u274C NOT SET");
});

const raw = process.env.FIREBASE_ADMIN_KEY;
if (!raw) {
  throw new Error("FIREBASE_ADMIN_KEY\uAC00 \uC815\uC758\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. Vercel \uD658\uACBD \uBCC0\uC218 \uD655\uC778 \uD544\uC694.");
}

if (!admin.apps.length) {
  let parsed = {};
  try {
    parsed = JSON.parse(
      raw.replace(/\\n/g, "\n")
    );
    console.log("\u2705 FIREBASE_ADMIN_KEY \uD30C\uC2F1 \uC131\uACF5. \uD0A4\uB4E4:", Object.keys(parsed));
  } catch (e) {
    console.error("\u274C FIREBASE_ADMIN_KEY JSON \uD30C\uC2F1 \uC2E4\uD328", e);
    throw new Error("FIREBASE_ADMIN_KEY\uAC00 \uC720\uD6A8\uD55C JSON\uC774 \uC544\uB2D9\uB2C8\uB2E4.");
  }

  admin.initializeApp({
    credential: admin.credential.cert(parsed as admin.ServiceAccount),
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

const authHandler = NextAuth(getAuthOptions());

export const GET = async (req: any, res: any) => {
  try {
    return await authHandler(req, res);
  } catch (err) {
    console.error("Auth handler error (GET):", err);
    throw err;
  }
};

export const POST = async (req: any, res: any) => {
  try {
    return await authHandler(req, res);
  } catch (err) {
    console.error("Auth handler error (POST):", err);
    throw err;
  }
};
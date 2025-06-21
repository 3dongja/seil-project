import admin from "firebase-admin";

if (!admin.apps.length) {
  const rawKey = process.env.FIREBASE_ADMIN_KEY!;
  const parsed = JSON.parse(rawKey);
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert(parsed),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export { admin };

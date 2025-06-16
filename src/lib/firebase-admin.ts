import admin from "firebase-admin";

if (!admin.apps.length) {
  const rawKey = process.env.FIREBASE_ADMIN_KEY!;
  const intermediate = rawKey
    .replace(/\\\\\\\\n/g, "\\n") // 대응: 8 → 2
    .replace(/\\\\n/g, "\\n");    // 대응: 4 → 2

  const parsed = JSON.parse(intermediate);
  parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert(parsed),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export { admin };

// firestore-utils.ts
import { adminDb } from "@/lib/firebase-admin";

/**
 * 지정된 Firestore 컬렉션 내 모든 문서를 삭제합니다.
 * @param collectionName 삭제할 컬렉션 이름
 */
export async function deleteCollection(collectionName: string) {
  const snapshot = await adminDb.collection(collectionName).get();

  const deletions = snapshot.docs.map((docSnap) =>
    adminDb.collection(collectionName).doc(docSnap.id).delete()
  );
  await Promise.all(deletions);

  console.log(`컬렉션 '${collectionName}' 문서 ${deletions.length}개 삭제 완료`);
} 

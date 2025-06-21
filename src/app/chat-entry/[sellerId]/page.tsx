// page.tsx (서버 컴포넌트)
import { redirect } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

export default async function Page({ params }: { params: { sellerId: string } }) {
  const { sellerId } = params;

  const q = query(
    collection(db, "sellers", sellerId, "inquiries"),
    where("status", "==", "open"),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const firstInquiry = snapshot.docs[0];
    redirect(`/chat-summary/${sellerId}/${firstInquiry.id}`);
  }

  redirect("/");
}
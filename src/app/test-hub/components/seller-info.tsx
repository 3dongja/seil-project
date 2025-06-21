"use client";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

interface Props {
  user: User;
}

export default async function showSellerInfo(user: User) {
  const snap = await getDoc(doc(db, "sellerInfo", user.uid));
  console.log("sellerInfo:", snap.data());
}

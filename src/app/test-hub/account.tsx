"use client";

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function createSellerDocuments(user: User, plan: string) {
  const data = {
    name: `테스트 ${plan} 사업자`,
    description: `${plan} 요금제 셀러`,
    plan: plan.toLowerCase(),
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, "sellerInfo", user.uid), { uid: user.uid, email: user.email, industry: "food", ...data });
  await setDoc(doc(db, "sellers", user.uid), data);
}

export async function onCreateSellerAccount(selectedPlan: string): Promise<string | null> {
  const email = `test-${selectedPlan.toLowerCase()}@seil.com`;
  const password = "test1234";
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
    if (err.code === "auth/email-already-in-use") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      alert(`회원가입 실패: ${err.code}`);
      return null;
    }
  }
  const user = auth.currentUser;
  if (user) {
    await createSellerDocuments(user, selectedPlan);
    return email;
  }
  return null;
}

export async function loginAsAdmin() {
  try {
    await signInWithEmailAndPassword(auth, "admin@seil.com", "admin1234");
    alert("관리자 로그인됨");
  } catch (err: any) {
    alert(`관리자 로그인 실패: ${err.code}`);
  }
}

export async function handleLogout(setUser: (u: User | null) => void) {
  await signOut(auth);
  setUser(null);
}

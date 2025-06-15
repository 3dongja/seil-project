import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// 기존 User 타입 확장
type ExtendedUser = User & { currentPlan?: string };

function useUserRoles() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isConsumer, setIsConsumer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setIsSeller(false);
        setIsConsumer(false);
        setLoading(false);
        return;
      }

      const adminRef = doc(db, "admins", currentUser.uid);
      const sellerRef = doc(db, "sellerInfo", currentUser.uid);
      const consumerRef = doc(db, "consumers", currentUser.uid);
      const sellerMapRef = doc(db, "sellersByUser", currentUser.uid);

      const [adminSnap, sellerSnap, consumerSnap, sellerMapSnap] = await Promise.all([
        getDoc(adminRef),
        getDoc(sellerRef),
        getDoc(consumerRef),
        getDoc(sellerMapRef)
      ]);

      const sellerId = sellerMapSnap.data()?.sellerId;
      let currentPlan = "free";

      if (sellerId) {
        const sellerDataSnap = await getDoc(doc(db, "sellers", sellerId));
        currentPlan = sellerDataSnap.data()?.plan || "free";
      }

      const extendedUser = {
        ...currentUser,
        currentPlan
      } as ExtendedUser;

      setUser(extendedUser);
      setIsAdmin(adminSnap.exists());
      setIsSeller(adminSnap.exists() || sellerSnap.exists());
      setIsConsumer(adminSnap.exists() || consumerSnap.exists());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin, isSeller, isConsumer, loading };
}

export default useUserRoles;
export { useUserRoles };

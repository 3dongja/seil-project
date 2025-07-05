import { useEffect } from "react";
import { QuerySnapshot, DocumentData } from "firebase/firestore";

export const useAutoScroll = (
  snapshot: QuerySnapshot<DocumentData> | undefined,
  dummyRef: React.RefObject<HTMLDivElement>
) => {
  useEffect(() => {
    if (!snapshot || !dummyRef.current) return;
    dummyRef.current.scrollIntoView({ behavior: "smooth" });
  }, [snapshot]);
};

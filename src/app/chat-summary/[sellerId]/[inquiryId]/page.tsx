// page.tsx (서버 컴포넌트)
import dynamic from "next/dynamic";

const Client = dynamic(() => import("./Client"), { ssr: false });

export default function Page() {
  return <Client />;
}

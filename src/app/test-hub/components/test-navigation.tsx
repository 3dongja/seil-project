"use client";
import { useRouter } from "next/navigation";

interface Props {
  uid?: string;
  showSellerInfo: () => void;
}

export default function TestNavigation({ uid, showSellerInfo }: Props) {
  const router = useRouter();
  const go = (path: string) => () => router.push(path);

  return (
    <section className="bg-gray-50 p-4 rounded space-y-2">
      <h2 className="font-semibold">🔧 테스트 라우팅</h2>
      <div className="flex flex-wrap gap-2">
        <button onClick={go("/seller-dashboard")} className="bg-purple-600 text-white px-4 py-2 rounded">사업주 대시보드</button>
        <button onClick={go("/seller-logs")} className="bg-gray-600 text-white px-4 py-2 rounded">상담 로그</button>
        <button onClick={go("/seller-register")} className="bg-gray-600 text-white px-4 py-2 rounded">사업주 등록</button>
        <button onClick={go("/seller-message/test-thread")} className="bg-gray-600 text-white px-4 py-2 rounded">쪽지 테스트</button>
        {uid && (
          <button
            onClick={() => go(`/chat/${uid}`)()}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            소비자 뷰
          </button>
        )}
        <button
          onClick={() => showSellerInfo()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          sellerInfo 확인
        </button>
      </div>
    </section>
  );
}

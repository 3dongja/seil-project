import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SummaryResultModal({ plan }: {
  plan: "free" | "basic" | "premium";
}) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const isFree = plan === "free";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center overflow-y-auto p-4">
      <div className="flex flex-col gap-6 w-full max-w-md">
        <button
          onClick={() => {
            router.push(`/chat-summary/${localStorage.getItem("sellerId")}/${localStorage.getItem("inquiryId")}`);
          }}
          className="bg-white rounded-2xl shadow-lg p-6 w-full flex flex-col items-center justify-between hover:ring-2 ring-blue-400"
        >
          <Image
            src="/curious.GIF"
            alt="1:1 상담원"
            width={160}
            height={160}
            className="object-contain"
          />
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">상담원 1:1 신청</h2>
            <p className="text-sm text-gray-600">
              대기 시간이 발생할 수 있습니다. 정확하게 정보를 남겨주시면 빠르게 답변 드리겠습니다.
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            if (isFree) {
              alert("챗봇 기능은 베이직 요금제 이상부터 이용 가능합니다.");
              return;
            }
            router.push(`/chat-summary/${localStorage.getItem("sellerId")}/${localStorage.getItem("inquiryId")}/bot`);
          }}
          className={`bg-white rounded-2xl shadow-lg p-6 w-full flex flex-col items-center justify-between ${isFree ? "opacity-50 cursor-not-allowed" : "hover:ring-2 ring-green-400"}`}
          disabled={isFree}
        >
          <Image
            src="/Calm.gif"
            alt="챗봇 자동응답"
            width={160}
            height={160}
            className="object-contain"
          />
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">챗봇 자동응답</h2>
            <p className="text-sm text-gray-600">
              바로 답변 가능하지만 AI 특성상 정확하지 않은 답변이 있을 수 있습니다. 정확하고 간단하게 남겨주시면 빠르게 확인드리겠습니다.
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            router.push(`/chat-summary/${localStorage.getItem("sellerId")}/${localStorage.getItem("inquiryId")}/summary`);
          }}
          className="bg-white rounded-2xl shadow-lg p-6 w-full flex flex-col items-center justify-center hover:ring-2 ring-gray-400"
        >
          <Image
            src="/happy.GIF"
            alt="정보 저장"
            width={120}
            height={120}
            className="object-contain mb-4"
          />
          <span className="text-xl font-bold">정보사항 저장하기</span>
        </button>
      </div>
    </div>
  );
}
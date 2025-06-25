import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SummaryResultModal({
  plan,
  onSelect,
}: {
  plan: "free" | "basic" | "premium";
  onSelect: (option: "chat" | "bot" | "log") => void;
}) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center gap-6 p-4 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => {
            router.push(`/chat/${localStorage.getItem("sellerId")}/${localStorage.getItem("inquiryId")}`);
            onSelect("chat");
          }}
          className="bg-white rounded-2xl shadow-lg p-6 w-72 h-80 flex flex-col items-center justify-between hover:ring-2 ring-blue-400"
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

        {(plan === "basic" || plan === "premium") && (
          <button
            onClick={() => {
              router.push(`/chat-summary/${localStorage.getItem("sellerId")}/${localStorage.getItem("inquiryId")}/bot`);
              onSelect("bot");
            }}
            className="bg-white rounded-2xl shadow-lg p-6 w-72 h-80 flex flex-col items-center justify-between hover:ring-2 ring-green-400"
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
        )}

        {plan === "free" && (
          <button
            onClick={() => alert("챗봇 기능은 베이직 요금제 이상부터 이용 가능합니다.")}
            className="bg-white rounded-2xl shadow-lg p-6 w-72 h-80 flex flex-col items-center justify-between opacity-50 cursor-not-allowed"
            disabled
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
        )}
      </div>

      <button
        onClick={() => {
          router.push(`/chat-summary/${localStorage.getItem("sellerId")}/${localStorage.getItem("inquiryId")}/summary`);
          onSelect("log");
        }}
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md flex flex-col items-center justify-center hover:ring-2 ring-gray-400"
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
  );
}

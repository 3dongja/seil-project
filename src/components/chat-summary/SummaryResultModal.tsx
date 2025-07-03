import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SummaryResultModal({
  sellerId,
  inquiryId,
  onSelect,
}: {
  sellerId: string;
  inquiryId: string;
  onSelect: (option: "chat" | "bot" | "log") => void;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<"free" | "basic" | "premium">("free");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (!sellerId || !inquiryId) return;
    const inquiryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId);
    getDoc(inquiryRef).then((snap) => {
      if (!snap.exists()) {
        alert("요약 정보가 존재하지 않아 처음 화면으로 이동합니다.");
        router.replace(`/chat-summary/${sellerId}`);
      }
    });
  }, [sellerId, inquiryId]);

  useEffect(() => {
    if (!sellerId) return;
    const ref = doc(db, "sellers", sellerId);
    getDoc(ref).then((snap) => {
      const data = snap.data();
      if (data?.plan === "basic" || data?.plan === "premium") {
        setPlan(data.plan);
      } else {
        setPlan("free");
      }
    });
  }, [sellerId]);

  const validateBeforePush = async (path: string, mode: "chat" | "bot" | "log") => {
    if (!sellerId || !inquiryId) {
      alert("요약을 먼저 저장해주세요.");
      return;
    }
    const inquiryRef = doc(db, "sellers", sellerId, "inquiries", inquiryId);
    const inquirySnap = await getDoc(inquiryRef);
    if (!inquirySnap.exists()) {
      alert("요약을 먼저 저장해주세요.");
      return;
    }
    await router.push(path);
    setTimeout(() => onSelect(mode), 100); // 모달 닫힘 지연
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center gap-6 p-4 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(plan === "basic" || plan === "premium") && (
          <button
            onClick={() => validateBeforePush(`/chat-summary/${sellerId}/${inquiryId}/bot`, "bot")}
            className="bg-white rounded-2xl shadow-lg p-6 w-72 h-80 flex flex-col items-center justify-between hover:ring-2 ring-green-400"
          >
            <Image src="/Calm.gif" alt="챗봇 자동응답" width={160} height={160} className="object-contain" />
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
            <Image src="/Calm.gif" alt="챗봇 자동응답" width={160} height={160} className="object-contain" />
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">챗봇 자동응답</h2>
              <p className="text-sm text-gray-600">
                바로 답변 가능하지만 AI 특성상 정확하지 않은 답변이 있을 수 있습니다. 정확하고 간단하게 남겨주시면 빠르게 확인드리겠습니다.
              </p>
            </div>
          </button>
        )}

        <button
          onClick={() => validateBeforePush(`/chat/${sellerId}/${inquiryId}`, "chat")}
          className="bg-white rounded-2xl shadow-lg p-6 w-72 h-80 flex flex-col items-center justify-between hover:ring-2 ring-blue-400"
        >
          <Image src="/curious.GIF" alt="1:1 상담원" width={160} height={160} className="object-contain" />
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">상담원 1:1 신청</h2>
            <p className="text-sm text-gray-600">
              대기 시간이 발생할 수 있습니다. 정확하게 정보를 남겨주시면 빠르게 답변 드리겠습니다.
            </p>
          </div>
        </button>

        <button
          onClick={() => validateBeforePush(`/chat-summary/${sellerId}/${inquiryId}/summary`, "log")}
          className="bg-white rounded-2xl shadow-lg p-6 w-72 h-80 flex flex-col items-center justify-between hover:ring-2 ring-gray-400"
        >
          <Image src="/happy.GIF" alt="정보 저장" width={120} height={120} className="object-contain" />
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">정보사항 저장하기</h2>
            <p className="text-sm text-gray-600">
              사업주의 질문에 답만 적어주세요. 입력한 내용은 요약되어 상담에 활용되며 바로 전달 후 연락을 드립니다.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

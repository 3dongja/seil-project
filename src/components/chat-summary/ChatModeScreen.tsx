import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";


interface ChatModeScreenProps {
  mode: "chat" | "bot" | "log";
  sellerId: string;
  inquiryId: string;
}

export default function ChatModeScreen({ mode, sellerId, inquiryId }: ChatModeScreenProps) {
  const router = useRouter();

  const goBack = () => router.back();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">
        {mode === "chat" && "상담원 1:1 연결 준비중..."}
        {mode === "bot" && "AI 챗봇 자동응답 시작!"}
        {mode === "log" && "문의 정보가 저장되었습니다."}
      </h1>

      <div className="text-gray-700 text-center max-w-md">
        {mode === "chat" && (
          <>
            담당 상담원이 순차적으로 연결됩니다. <br />
            입력하신 정보는 빠르게 전달될 예정입니다.
          </>
        )}
        {mode === "bot" && (
          <>
            챗봇이 문의 내용을 분석하여 자동으로 답변을 생성합니다. <br />
            잠시만 기다려 주세요.
          </>
        )}
        {mode === "log" && (
          <>
            고객님의 문의 내용은 성공적으로 저장되었으며, <br />
            추후 확인 후 연락드리겠습니다.
          </>
        )}
      </div>

      <Button onClick={goBack} className="mt-6">
        돌아가기
      </Button>
    </div>
  );
}

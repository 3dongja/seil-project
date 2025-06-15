import { Suspense } from "react"
import SendMessageContent from "./SendMessageContent"

export default function SendMessagePage() {
  return (
    <Suspense fallback={<div>쪽지 작성 화면 로딩 중...</div>}>
      <SendMessageContent />
    </Suspense>
  )
}


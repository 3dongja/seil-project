// src/constants/defaultForms.ts (placeholder 추가 완료)

export const defaultForms = {
  "주문": {
    questions: [
      { key: "product", label: "어떤 상품을 주문하셨나요?", placeholder: "수박이요", required: true },
      { key: "date", label: "언제 주문하셨나요?", placeholder: "어제요", required: true },
      { key: "problem", label: "현재 어떤 문제가 있나요?", placeholder: "아직 안 왔어요", required: true },
      { key: "phone", label: "연락 가능한 전화번호를 알려주세요", placeholder: "010-1234-5678", required: true }
    ],
    templates: [
      "고객님은 {product} 상품을 {date}에 주문하셨으며, 현재 '{problem}' 문제를 겪고 계십니다. 연락처: {phone}"
    ]
  },
  "예약": {
    questions: [
      { key: "date", label: "예약을 원하는 날짜와 시간을 입력해주세요", placeholder: "6월 30일 오후 2시", required: true },
      { key: "people", label: "몇 명이 예약하시나요?", placeholder: "2명", required: true },
      { key: "request", label: "특별한 요청사항이 있으신가요?", placeholder: "창가 자리 주세요", required: false },
      { key: "phone", label: "연락 가능한 전화번호를 알려주세요", placeholder: "010-9876-5432", required: true }
    ],
    templates: [
      "{date}에 {people}명 예약 요청. 요청사항: {request}. 연락처: {phone}"
    ]
  },
  "상담": {
    questions: [
      { key: "target", label: "어떤 제품/서비스에 대해 상담받고 싶으신가요?", placeholder: "프리미엄 멤버십", required: true },
      { key: "question", label: "현재 상황이나 궁금한 점을 간단히 적어주세요", placeholder: "가격 정책이 궁금해요", required: true },
      { key: "time", label: "상담을 원하는 시간대가 있으신가요?", placeholder: "오후 3시 이후", required: false },
      { key: "phone", label: "연락 가능한 전화번호를 알려주세요", placeholder: "010-4567-8910", required: true }
    ],
    templates: [
      "{target}에 대한 상담 요청. 질문: {question}. 희망 시간대: {time}. 연락처: {phone}"
    ]
  },
  "문의": {
    questions: [
      { key: "target", label: "어떤 상품 또는 서비스에 대해 문의하시는 건가요?", placeholder: "서비스 이용 방법", required: true },
      { key: "content", label: "어떤 내용을 문의하고 싶으신가요?", placeholder: "결제 취소가 안돼요", required: true },
      { key: "reason", label: "문의를 남기신 이유가 있으신가요?", placeholder: "긴급해서요", required: false },
      { key: "phone", label: "연락 가능한 전화번호를 알려주세요", placeholder: "010-0000-0000", required: true }
    ],
    templates: [
      "{target}에 대한 문의: {content}. 이유: {reason}. 연락처: {phone}"
    ]
  },
  "반품": {
    questions: [
      { key: "product", label: "반품을 원하시는 상품명을 알려주세요", placeholder: "무선 이어폰", required: true },
      { key: "date", label: "언제 구매하셨나요?", placeholder: "6월 10일", required: true },
      { key: "reason", label: "어떤 이유로 반품을 원하시나요?", placeholder: "작동이 안돼요", required: true },
      { key: "condition", label: "상품 상태를 간단히 설명해주세요", placeholder: "포장 개봉만 했어요", required: false },
      { key: "phone", label: "연락 가능한 전화번호를 알려주세요", placeholder: "010-2222-3333", required: true }
    ],
    templates: [
      "{product} 상품을 {date}에 구매하였고, 반품 사유: {reason}, 상태: {condition}. 연락처: {phone}"
    ]
  },
  "교환": {
    questions: [
      { key: "product", label: "교환을 원하시는 상품은 무엇인가요?", placeholder: "블루투스 스피커", required: true },
      { key: "date", label: "구매일자를 입력해주세요", placeholder: "6월 5일", required: true },
      { key: "reason", label: "교환 사유를 알려주세요", placeholder: "색상이 달라요", required: true },
      { key: "method", label: "원하시는 교환 방식(같은 상품/다른 옵션 등)을 알려주세요", placeholder: "같은 상품으로 교환 원해요", required: false },
      { key: "phone", label: "연락 가능한 전화번호를 알려주세요", placeholder: "010-5555-6666", required: true }
    ],
    templates: [
      "{product} 상품을 {date}에 구매하였고, 교환 사유: {reason}, 방법: {method}. 연락처: {phone}"
    ]
  }
};
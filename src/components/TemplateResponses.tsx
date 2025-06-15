// src/components/TemplateResponses.tsx

interface TemplateResponsesProps {
  onSelect: (text: string) => void;
}

const templates = [
  "문의 감사합니다. 빠르게 확인 후 안내드리겠습니다.",
  "주문 관련 문의는 주문 번호와 함께 남겨주세요.",
  "반품은 수령일로부터 7일 이내 신청 가능합니다.",
  "상담이 필요하신 경우, 보다 구체적으로 말씀해주세요."
];

export default function TemplateResponses({ onSelect }: TemplateResponsesProps) {
  return (
    <div className="mb-3">
      <p className="text-sm text-gray-600 mb-2">📋 템플릿 응답</p>
      <div className="flex flex-wrap gap-2">
        {templates.map((msg, i) => (
          <button
            key={i}
            onClick={() => onSelect(msg)}
            className="px-3 py-1 bg-gray-100 text-sm rounded-full hover:bg-gray-200"
          >
            {msg}
          </button>
        ))}
      </div>
    </div>
  );
}

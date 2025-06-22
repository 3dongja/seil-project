// src/components/TemplateResponses.tsx

interface Props {
  templates: string[];
  onSelect: (text: string) => void;
}

export default function TemplateResponses({ templates, onSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap px-2 pb-2">
      {templates.map(
        (template, index) =>
          template && (
            <button
              key={index}
              className="text-sm bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 border"
              onClick={() => onSelect(template)}
            >
              {template.length > 20 ? template.slice(0, 20) + "…" : template}
            </button>
          )
      )}
    </div>
  );
}
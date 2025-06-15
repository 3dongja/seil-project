// src/app/seller/[sellerId]/chat/components/TemplateResponses.tsx
"use client"

import { useEffect, useState } from "react"
import { collection, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Props {
  sellerId: string
}

export default function TemplateResponses({ sellerId }: Props) {
  const [templates, setTemplates] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      const snap = await getDoc(doc(db, "sellers", sellerId))
      const list = snap.data()?.settings?.templateResponses || []
      setTemplates(list)
    }
    fetchTemplates()
  }, [sellerId])

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-sm text-gray-600">문의 유형 선택</h2>
      <div className="flex flex-wrap gap-2">
        {templates.map((t, i) => (
          <button
            key={i}
            onClick={() => setSelected(t)}
            className="px-3 py-1 bg-gray-200 rounded-full text-sm"
          >
            {t}
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-2 bg-blue-50 p-3 rounded text-sm text-gray-700">
          <strong>안내:</strong> {selected}
        </div>
      )}
    </div>
  )
}

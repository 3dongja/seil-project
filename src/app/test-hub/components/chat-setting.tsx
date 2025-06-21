"use client";
import { Dispatch, SetStateAction } from "react";

interface ChatSelectorProps {
  selectedChatId: string;
  setSelectedChatId: Dispatch<SetStateAction<string>>;
  chatIds: string[];
}

export default function ChatSelector({ selectedChatId, setSelectedChatId, chatIds }: ChatSelectorProps) {
  return (
    <section>
      <label className="block font-semibold mb-1">Chat ID 선택</label>
      <select value={selectedChatId} onChange={e => setSelectedChatId(e.target.value)} className="border px-3 py-2 w-full">
        {chatIds.map(id => <option key={id}>{id}</option>)}
      </select>
    </section>
  );
}

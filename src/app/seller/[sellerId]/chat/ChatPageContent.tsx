"use client";

import { useSearchParams } from "next/navigation";
import ChatPanel from "./components/ChatPanel";
import SummaryPanel from "./components/SummaryPanel";
import HistoryPanel from "./components/HistoryPanel";
import React from "react";

type Props = {
  sellerId: string;
};

const ChatPageContent: React.FC<Props> = ({ sellerId }) => {
  const page = useSearchParams().get("page") || "chat";

  if (page === "summary") return <SummaryPanel sellerId={sellerId} />;
  if (page === "history") return <HistoryPanel sellerId={sellerId} />;
  return <ChatPanel sellerId={sellerId} />;
};

export default ChatPageContent;
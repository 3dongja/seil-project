// Textarea.tsx
import { TextareaHTMLAttributes } from "react";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="w-full p-2 border rounded resize-none" {...props} />;
}

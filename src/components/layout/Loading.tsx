// src/components/layout/Loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen animate-pulse text-gray-400">
      <div className="text-center space-y-2">
        <div className="text-lg font-semibold">잠시만 기다려주세요...</div>
        <div className="text-sm">데이터를 불러오고 있습니다</div>
      </div>
    </div>
  );
}

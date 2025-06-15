// 게시글 카드 컴포넌트
export default function PostCard({ title }: { title: string }) {
  return <div className="p-4 border rounded">{title}</div>;
}

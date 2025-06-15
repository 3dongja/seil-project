// src/app/community/[postId]/page.tsx
"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

export default function CommunityPostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});

  const user = getAuth().currentUser;
  const uid = user?.uid;

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, "posts", postId as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setPost(data);
        setLikesCount(data.likes?.length || 0);
        setLiked(data.likes?.includes(uid));
      }
    };
    fetchPost();
  }, [postId, uid]);

  useEffect(() => {
    const fetchComments = async () => {
      const querySnapshot = await getDocs(collection(db, "posts", postId as string, "comments"));
      const list: any[] = [];
      const likes: Record<string, boolean> = {};
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ id: docSnap.id, ...data });
        likes[docSnap.id] = data.likes?.includes(uid) || false;
      });
      setComments(list);
      setCommentLikes(likes);
    };
    fetchComments();
  }, [postId, uid]);

  const handleLike = async () => {
    if (!user || !postId) return;
    const docRef = doc(db, "posts", postId as string);
    await updateDoc(docRef, {
      likes: liked ? arrayRemove(uid) : arrayUnion(uid),
    });
    setLiked(!liked);
    setLikesCount((prev) => prev + (liked ? -1 : 1));
  };

  const handleCommentLike = async (commentId: string) => {
    if (!user) return;
    const ref = doc(db, "posts", postId as string, "comments", commentId);
    await updateDoc(ref, {
      likes: commentLikes[commentId] ? arrayRemove(uid) : arrayUnion(uid),
    });
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !user) return;
    await addDoc(collection(db, "posts", postId as string, "comments"), {
      uid,
      content: newComment,
      createdAt: new Date(),
      likes: [],
    });
    setNewComment("");
    const querySnapshot = await getDocs(collection(db, "posts", postId as string, "comments"));
    const list: any[] = [];
    const likes: Record<string, boolean> = {};
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({ id: docSnap.id, ...data });
      likes[docSnap.id] = data.likes?.includes(uid) || false;
    });
    setComments(list);
    setCommentLikes(likes);
  };

  if (!post) return <p className="p-4">게시글을 불러오는 중입니다...</p>;

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

      <div className="flex items-center space-x-2">
        <button
          className={`px-3 py-1 rounded text-sm ${liked ? "bg-red-100 text-red-600" : "bg-gray-100"}`}
          onClick={handleLike}
        >
          ❤️ 좋아요 {likesCount}
        </button>
      </div>

      <hr />
      <h2 className="text-lg font-semibold">💬 댓글</h2>
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="p-2 border rounded">
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            <button
              className={`text-xs mt-1 ${commentLikes[comment.id] ? "text-blue-600" : "text-gray-500"}`}
              onClick={() => handleCommentLike(comment.id)}
            >
              👍 좋아요
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <textarea
          className="w-full border p-2 rounded min-h-[80px]"
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleCommentSubmit}
        >
          등록하기
        </button>
      </div>
    </div>
  );
}

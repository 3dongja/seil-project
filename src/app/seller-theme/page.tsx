"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useSession } from "next-auth/react";
import BackButton from "@/components/common/BackButton";

interface SessionUserWithUID {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  uid?: string;
}

export default function ThemeSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as SessionUserWithUID;
  const [chatTitle, setChatTitle] = useState("");
  const [bubbleColor, setBubbleColor] = useState("#f0f0f0");
  const [bubbleTextColor, setBubbleTextColor] = useState("#000000");
  const [emojiAvatar, setEmojiAvatar] = useState("😊");
  const [emojiAvatarFile, setEmojiAvatarFile] = useState<File | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [fontClass, setFontClass] = useState("font-sans");
  const [reverseBubble, setReverseBubble] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.uid) return;
      const docRef = doc(db, "users", user.uid, "seller", "settings");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setChatTitle(data.chatTitle || "");
        setBubbleColor(data.bubbleColor || "#f0f0f0");
        setBubbleTextColor(data.bubbleTextColor || "#000000");
        setEmojiAvatar(data.emojiAvatar || "😊");
        setBgImageUrl(data.bgImageUrl || "");
        setFontClass(data.fontClass || "font-sans");
        setReverseBubble(data.reverseBubble || false);
      }
    };
    loadSettings();
  }, [user]);

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const saveSettings = async () => {
    if (!user?.uid) return;
    const userPath = user.uid;

    if (emojiAvatarFile && emojiAvatarFile.size > 1024 * 1024) {
      alert("이모지 이미지 파일은 최대 1MB까지 업로드할 수 있습니다.");
      return;
    }
    if (bgImageFile && bgImageFile.size > 2 * 1024 * 1024) {
      alert("배경 이미지 파일은 최대 2MB까지 업로드할 수 있습니다.");
      return;
    }

    let uploadedEmojiUrl = emojiAvatar;
    let uploadedBgUrl = bgImageUrl;

    if (emojiAvatarFile) {
      uploadedEmojiUrl = await uploadImage(emojiAvatarFile, `avatars/${userPath}`);
    }
    if (bgImageFile) {
      uploadedBgUrl = await uploadImage(bgImageFile, `backgrounds/${userPath}`);
    }

    const docRef = doc(db, "users", userPath, "seller", "settings");
    await setDoc(
      docRef,
      {
        chatTitle,
        bubbleColor,
        bubbleTextColor,
        emojiAvatar: uploadedEmojiUrl,
        bgImageUrl: uploadedBgUrl,
        fontClass,
        reverseBubble,
      },
      { merge: true }
    );
    alert("테마 설정이 저장되었습니다.");
  };

  return (
    <main className="p-6 max-w-3xl mx-auto bg-white text-black">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4">🎨 테마 설정</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1">상단 문구</label>
          <input value={chatTitle} onChange={(e) => setChatTitle(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1">말풍선 색상</label>
          <input type="color" value={bubbleColor} onChange={(e) => setBubbleColor(e.target.value)} className="w-full h-10 p-1 rounded" />
        </div>
        <div>
          <label className="block mb-1">말풍선 글자 색</label>
          <input type="color" value={bubbleTextColor} onChange={(e) => setBubbleTextColor(e.target.value)} className="w-full h-10 p-1 rounded" />
        </div>
        <div>
          <label className="block mb-1">이모지 또는 사업자 얼굴 이미지</label>
          <input type="file" accept="image/*" onChange={(e) => setEmojiAvatarFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded" />
          <p className="text-sm text-gray-500 mt-1">최대 1MB, JPG/PNG 권장</p>
        </div>
        <div>
          <label className="block mb-1">배경 이미지 업로드</label>
          <input type="file" accept="image/*" onChange={(e) => setBgImageFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded" />
          <p className="text-sm text-gray-500 mt-1">최대 2MB, JPG/PNG 권장</p>
        </div>
        <div>
          <label className="block mb-1">폰트 스타일</label>
          <select value={fontClass} onChange={(e) => setFontClass(e.target.value)} className="w-full p-2 border rounded">
            <option value="font-sans">산세리프 (기본)</option>
            <option value="font-serif">세리프</option>
            <option value="font-mono">모노스페이스</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">말풍선 좌우 반전</label>
          <input type="checkbox" checked={reverseBubble} onChange={(e) => setReverseBubble(e.target.checked)} /> 좌우 반전
        </div>
        <button onClick={saveSettings} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          저장하기
        </button>
      </div>
    </main>
  );
}
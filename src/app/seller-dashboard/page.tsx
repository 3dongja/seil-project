"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import useUserRoles from "@/hooks/useUserRoles"
import Image from "next/image"
import Link from "next/link"
import { getDoc, updateDoc, doc, serverTimestamp, collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Chat {
  customerName?: string
  status?: string
}

interface Theme {
  backgroundColor: string
  fontColor: string
  fontFamily: string
}

export default function SellerDashboardPage() {
  const { user, isSeller, loading } = useUserRoles()
  const router = useRouter()
  const pathname = usePathname()
  const [link, setLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ 상담수: 0, 채팅접수: 0, 완료: 0 })
  const [recentChats, setRecentChats] = useState<Chat[]>([])
  const [openTime, setOpenTime] = useState("09:00")
  const [closeTime, setCloseTime] = useState("22:00")
  const [chatOn, setChatOn] = useState(true)
  const [gptEnabled, setGptEnabled] = useState(true)
  const [industry, setIndustry] = useState("")
  const [summary, setSummary] = useState("")
  const [chatTitle, setChatTitle] = useState("")
  const [theme, setTheme] = useState<Theme>({ backgroundColor: "#ffffff", fontColor: "#000000", fontFamily: "inherit" })

  useEffect(() => {
    if (!loading && (!user || !isSeller)) {
      router.push("/login")
    }
    if (user) {
      const sellerId = user.uid
      setLink(`https://seil.chat/seller/${sellerId}`)

      getDoc(doc(db, "users", sellerId, "seller", "settings")).then((snap) => {
        const settings = snap.data()
        const theme = settings?.theme
        if (theme) {
          setTheme({
            backgroundColor: theme.backgroundColor || "#ffffff",
            fontColor: theme.fontColor || "#000000",
            fontFamily: theme.fontFamily || "inherit",
          })
        }
        if (settings?.chatTitle) setChatTitle(settings.chatTitle)
        if (settings?.gptEnabled !== undefined) setGptEnabled(settings.gptEnabled)
      })

      getDoc(doc(db, "users", sellerId, "seller", "profile")).then((snap) => {
        const data = snap.data()
        if (data?.industry) setIndustry(data.industry)
        if (data?.stats) setStats(data.stats)
      })

      const fetchRecentChats = async () => {
        const q = query(
          collection(db, "users", sellerId, "chats"),
          orderBy("lastMessageAt", "desc"),
          limit(5)
        )
        const querySnap = await getDocs(q)
        const results = querySnap.docs.map(doc => doc.data() as Chat)
        setRecentChats(results)
      }
      fetchRecentChats()

      const fetchMessages = async () => {
        const q = query(collection(db, `users/${sellerId}/chatLogs/messages`), orderBy("createdAt"))
        const querySnap = await getDocs(q)
        const texts = querySnap.docs.map(doc => doc.data().text)
        const keywords = texts.join(" ").split(" ").filter(w => w.length > 1)
        const unique = [...new Set(keywords)].slice(0, 5).join(", ")
        setSummary(unique)
      }
      fetchMessages()

      const interval = setInterval(() => {
        updateDoc(doc(db, "users", sellerId, "seller", "profile"), {
          lastAdminActive: serverTimestamp(),
        })
      }, 570000)

      return () => clearInterval(interval)
    }
  }, [loading, user, isSeller, router])

  const handleToggleGpt = async () => {
    if (!user) return
    const sellerId = user.uid
    const newValue = !gptEnabled
    await updateDoc(doc(db, "users", sellerId, "seller", "settings"), {
      gptEnabled: newValue,
    })
    setGptEnabled(newValue)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleLinkVisit = () => {
    router.push("/pricing")
  }

  if (loading) return <div className="p-4">로딩 중...</div>

  return (
    <main className="min-h-screen p-4 pb-32 space-y-6" style={{ backgroundColor: theme.backgroundColor, color: theme.fontColor, fontFamily: theme.fontFamily }}>
      <h1 className="text-xl font-bold mb-4">🎯 성공하는 사장님 대시보드</h1>

      {chatTitle && (
        <div className="border p-4 rounded-lg bg-white">
          <p className="text-sm font-semibold">🏪 상호명</p>
          <p className="text-base text-gray-700">{chatTitle}</p>
        </div>
      )}

      {industry && (
        <div className="border p-4 rounded-lg bg-blue-50">
          <p className="font-semibold mb-2">📦 판매 업종</p>
          <p className="text-sm text-gray-700">{industry}</p>
        </div>
      )}

      <div className="border p-4 rounded-lg bg-yellow-50">
        <p className="font-semibold mb-2">🧠 AI 요약 키워드</p>
        <p className="text-sm text-gray-700">{summary || "요약 정보 없음"}</p>
      </div>

      <div className="border p-4 rounded-lg bg-blue-50">
        <p className="font-semibold mb-2">🤖 GPT 응답 설정</p>
        <button
          onClick={handleToggleGpt}
          className={`w-full py-4 rounded-lg text-white font-bold text-lg transition ${gptEnabled ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"}`}
        >
          {gptEnabled ? "✅ GPT 응답 사용 중" : "⛔ GPT 응답 꺼짐 (관리자 직접 응답)"}
        </button>
      </div>

      <div className="border p-4 rounded-lg bg-gray-50">
        <p className="text-sm mb-2">🔗 소비자 전용 채팅 링크</p>
        <div className="flex items-center gap-2">
          <input value={link} readOnly className="flex-1 px-2 py-1 border rounded text-sm" />
          <button onClick={handleCopy} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">복사</button>
        </div>
        {copied && <p className="text-green-600 text-sm mt-2">✅ 복사되었습니다</p>}
      </div>

      <div className="grid grid-cols-3 text-center gap-2">
        {Object.entries(stats).map(([label, count]) => (
          <div key={label} className="bg-white border rounded-lg p-3 shadow">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-lg font-bold text-blue-600">{count}</p>
          </div>
        ))}
      </div>

      <div className="border p-4 rounded-lg">
        <p className="font-semibold mb-2">💬 최근 상담중인 채팅</p>
        <ul className="text-sm list-disc list-inside text-gray-700">
          {recentChats.length === 0 && <li>최근 채팅 없음</li>}
          {recentChats.map((chat, i) => (
            <li key={i}>{chat.customerName || "고객"} - {chat.status || "진행중"}</li>
          ))}
        </ul>
      </div>

      <div className="border p-4 rounded-lg space-y-4">
        <p className="font-semibold">⏱️ 소비자에게 표시할 상담시간</p>
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium">오픈</label>
          <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="border px-2 py-1 rounded" />
          <label className="text-sm font-medium">~ 마감</label>
          <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="border px-2 py-1 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">1:1 채팅 가능</label>
          <input type="checkbox" checked={chatOn} onChange={() => setChatOn(!chatOn)} />
        </div>
      </div>

      <div className="border p-4 rounded-xl shadow-md bg-gradient-to-br from-yellow-50 to-white">
        <h2 className="text-lg font-bold mb-2">💎 현재 요금제 혜택</h2>
        <p className="text-sm text-gray-700 mb-3">Premium 요금제에서는 1:1 채팅 자동화, GPT 응답, 테마 설정 등 다양한 기능을 이용할 수 있어요.</p>
        <button onClick={handleLinkVisit} className="block w-full rounded overflow-hidden">
          <Image src="/plan-premium.png" alt="요금제 이미지" width={500} height={300} className="rounded-lg w-full object-cover transition hover:brightness-110" />
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 text-sm">
        <button className={`${pathname === "/seller-dashboard" ? "text-green-700 font-bold" : "text-gray-600"}`}>대시보드</button>
        <button onClick={() => router.push("/seller-live-chat")} className={`${pathname === "/seller-live-chat" ? "text-green-700 font-bold" : "text-gray-600"}`}>채팅</button>
        <button onClick={() => router.push("/seller-logs")} className={`${pathname === "/seller-logs" ? "text-green-700 font-bold" : "text-gray-600"}`}>메시지</button>
        <button onClick={() => router.push("/seller-dashboard/my")} className={`${pathname === "/seller-dashboard/my" ? "text-green-700 font-bold" : "text-gray-600"}`}>전체 메뉴</button>
      </nav>
    </main>
  )
}

// src/app/seller-stats/page.tsx
"use client"

import { useEffect, useState } from "react"
import { getAuth } from "firebase/auth"
import { collection, doc, getCountFromServer, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import BackButton from "@/components/common/BackButton"

export default function SellerStatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [topWords, setTopWords] = useState<string[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      const user = getAuth().currentUser
      if (!user) return

      const uid = user.uid
      const msgSnap = await getCountFromServer(collection(db, `users/${uid}/seller/messages`))
      const replySnap = await getCountFromServer(collection(db, `users/${uid}/seller/replies`))

      const timeMap = Array.from({ length: 24 }, () => 0)
      const dayMap = Array.from({ length: 7 }, () => 0)
      const wordCount: Record<string, number> = {}
      const catCount: Record<string, number> = {}

      const msgDocs = await getDocs(collection(db, `users/${uid}/seller/messages`))
      msgDocs.forEach(doc => {
        const data = doc.data()
        const date = data.createdAt?.toDate?.() || new Date()
        timeMap[date.getHours()]++
        dayMap[date.getDay()]++

        const text = data.content || ""
        text
          .replace(/[^가-힣a-zA-Z0-9]/g, " ")
          .split(" ")
          .filter((w: string) => w.length >= 2)
          .forEach((word: string) => {
            wordCount[word] = (wordCount[word] || 0) + 1
          })

        const cat = data.summary?.category || "기타"
        catCount[cat] = (catCount[cat] || 0) + 1
      })

      const topWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word)

      const categoryChart = Object.entries(catCount).map(([name, value]) => ({ name, value }))

      setStats({
        messages: msgSnap.data().count,
        replies: replySnap.data().count,
        byHour: timeMap,
        byDay: dayMap
      })
      setTopWords(topWords)
      setCategoryData(categoryChart)
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return <p>불러오는 중...</p>

  const hourData = stats.byHour.map((v: number, i: number) => ({ hour: `${i}시`, count: v }))
  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"]
  const dayData = stats.byDay.map((v: number, i: number) => ({ day: dayLabels[i], count: v }))

  return (
    <div className="p-6 max-w-md mx-auto h-screen overflow-y-auto pb-[env(safe-area-inset-bottom)]">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4">사용 통계</h1>
      <ul className="space-y-2 mb-6">
        <li><strong>총 문의 수:</strong> {stats?.messages}건</li>
        <li><strong>자동 응답 수:</strong> {stats?.replies}건</li>
      </ul>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Top 5 질문 키워드</h2>
        <ul className="list-disc list-inside text-sm text-gray-800">
          {topWords.map((word, i) => <li key={i}>{word}</li>)}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-2">시간대별 분포</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourData}>
            <XAxis dataKey="hour" fontSize={10} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-2">요일별 분포</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dayData}>
            <XAxis dataKey="day" fontSize={10} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-2">요약 카테고리 분포</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryData}>
            <XAxis dataKey="name" fontSize={10} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#facc15" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

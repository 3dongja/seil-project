// src/lib/logging/trackSuspiciousUserBehavior.ts

import { logUserAction } from "@/lib/logging/logUserAction"

interface BehaviorEvent {
  uid: string
  event: "search" | "navigation" | "bounce" | "feature"
  keyword?: string
  path?: string
}

const keywordCounts: Record<string, Record<string, number>> = {}
const navigationTimestamps: Record<string, number[]> = {}
const bounceCounts: Record<string, number> = {}
const featureCounts: Record<string, Record<string, number>> = {}

export async function trackSuspiciousUserBehavior({ uid, event, keyword, path }: BehaviorEvent) {
  const now = Date.now()

  if (event === "search" && keyword) {
    keywordCounts[uid] ||= {}
    keywordCounts[uid][keyword] = (keywordCounts[uid][keyword] || 0) + 1

    if (keywordCounts[uid][keyword] >= 5) {
      await logUserAction({
        uid,
        action: "반복 검색",
        detail: `키워드 '${keyword}' ${keywordCounts[uid][keyword]}회 반복 검색`,
      })
    }
  }

  if (event === "navigation" && path) {
    navigationTimestamps[uid] ||= []
    navigationTimestamps[uid].push(now)
    navigationTimestamps[uid] = navigationTimestamps[uid].filter(t => now - t < 10000)

    if (navigationTimestamps[uid].length >= 5) {
      await logUserAction({
        uid,
        action: "비정상 이동 패턴",
        detail: `10초 내 ${navigationTimestamps[uid].length}회 이동`,
      })
    }
  }

  if (event === "bounce" && path === "/support") {
    bounceCounts[uid] = (bounceCounts[uid] || 0) + 1
    if (bounceCounts[uid] >= 3) {
      await logUserAction({
        uid,
        action: "고객센터 즉시 이탈",
        detail: `빠른 이탈 ${bounceCounts[uid]}회 반복`,
      })
    }
  }

  if (event === "feature" && keyword) {
    featureCounts[uid] ||= {}
    featureCounts[uid][keyword] = (featureCounts[uid][keyword] || 0) + 1
    if (featureCounts[uid][keyword] >= 10) {
      await logUserAction({
        uid,
        action: "비정상 기능 반복",
        detail: `${keyword} 기능 ${featureCounts[uid][keyword]}회 사용`,
      })
    }
  }
}

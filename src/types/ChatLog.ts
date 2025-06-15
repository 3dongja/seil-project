export interface ChatLog {
  id: string
  createdAt: number // Timestamp.toMillis()
  text: string
  emotion: string
  summary: string
  contextTag: string
  responded: boolean
}

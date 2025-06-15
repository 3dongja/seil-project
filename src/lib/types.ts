export interface ChatLogInput {
  text: string
  emotion: string
  summary: string
  createdAt: number
  responded: boolean
  gptReply?: string
}

export interface ChatLog extends ChatLogInput {
  id: string
  userId: string
}
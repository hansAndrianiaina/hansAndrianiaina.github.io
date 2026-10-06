import type { ChatTurn } from '../store/chatStore'

export interface ChatRequest {
  message: string
  history: ChatTurn[]
  lastClicked: string | null
}

export async function sendMessage(req: ChatRequest): Promise<string> {
  await new Promise((r) => setTimeout(r, 800))
  return `(fake reply) You said "${req.message}". Last object you clicked: ${req.lastClicked ?? 'none'}.`
}
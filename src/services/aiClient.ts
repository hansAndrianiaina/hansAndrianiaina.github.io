import type { ChatTurn } from '../store/chatStore'

export interface ChatRequest {
  message: string
  history: ChatTurn[]
  lastClicked: string | null
}

// export async function sendMessage(req: ChatRequest): Promise<string> {
//   await new Promise((r) => setTimeout(r, 800))
//   return `(fake reply) You said "${req.message}". Last object you clicked: ${req.lastClicked ?? 'none'}.`
// }

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
const MAX_HISTORY = 10      // the backend trims too, this just keeps the payload small
const TIMEOUT_MS = 75_000   // a cold-started free server can take about a minute

// Fire-and-forget request that wakes a sleeping free-tier server.
export function warmUp(): void {
  if (!API_URL) return
  fetch(`${API_URL}/`).catch(() => {})
}

// Resolves with the reply text. On failure it throws an Error whose message is
// safe to show to the visitor (ChatPanel displays it as Robutler's line).
export async function sendMessage(req: ChatRequest): Promise<string> {
  if (!API_URL) throw new Error('Robutler is not configured yet (missing VITE_API_URL).')

  let res: Response
  let body_content = JSON.stringify({
        message: req.message,
        history: req.history.slice(-MAX_HISTORY),
        lastClicked: req.lastClicked,
      })
  console.log(body_content)
  try {
    res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body_content,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    throw new Error("I can't reach my brain right now. Try again in a moment.")
  }

  if (!res.ok) {
    // FastAPI errors look like { "detail": "..." }. Use it when it's a plain string
    // (our 429 and 502 messages), but not for 422, where detail is a technical array.
    let detail: unknown
    try {
      detail = (await res.json()).detail
    } catch {
      /* body wasn't JSON */
    }
    if (typeof detail === 'string') throw new Error(detail)
    throw new Error(
      res.status === 422
        ? "I couldn't process that message."
        : 'Something went wrong on my side. Try again.',
    )
  }

  const data = (await res.json()) as { reply?: string }
  return data.reply ?? '…'
}
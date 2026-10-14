import { create } from 'zustand'

// What the backend sees
export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

// What the UI stores: a turn plus the time it was added (drives the fade)
export interface ChatMessage extends ChatTurn {
  ts: number
}

interface ChatState {
  chatOpen: boolean            // HUD meaning: the input is active
  messages: ChatMessage[]
  isThinking: boolean
  lastClicked: string | null

  openChat: () => void
  closeChat: () => void
  addMessage: (m: ChatTurn) => void
  setThinking: (v: boolean) => void
  setLastClicked: (id: string) => void
}

export const useChatStore = create<ChatState>()((set) => ({
  chatOpen: false,
  messages: [
    { role: 'assistant', content: "Hi, I'm Robutler. Ask me anything about Hanssi's work.", ts: Date.now() },
  ],
  isThinking: false,
  lastClicked: null,

  openChat: () => set({ chatOpen: true }),
  closeChat: () => set({ chatOpen: false }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, { ...m, ts: Date.now() }] })),
  setThinking: (v) => set({ isThinking: v }),
  setLastClicked: (id) => set({ lastClicked: id }),
}))
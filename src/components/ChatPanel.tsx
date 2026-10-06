import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useChatStore } from '../store/chatStore'
import type { ChatTurn } from '../store/chatStore'
import { sendMessage } from '../services/aiClient'

// ---- HUD tuning knobs ----
const HOLD_MS = 7000        // a message stays fully visible this long
const FADE_MS = 3000        // then fades out over this long
const MAX_IDLE_LINES = 6    // inactive: never show more than this many
const LIST_MAX_HEIGHT = 220
const SCROLL_STICK_PX = 24  // "at the bottom" tolerance
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
const CLIP = 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)'
const CHIP_CLIP = 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)'

// 1 while fresh, linear fade to 0 after HOLD_MS
function ageOpacity(age: number) {
  if (age <= HOLD_MS) return 1
  if (age >= HOLD_MS + FADE_MS) return 0
  return 1 - (age - HOLD_MS) / FADE_MS
}

// // Re-render a few times a second, but only while something is still fading.
// function useNow(enabled: boolean, intervalMs = 250) {
//   const [now, setNow] = useState(() => Date.now())
//   useEffect(() => {
//     if (!enabled) return
//     setNow(Date.now())
//     const id = setInterval(() => setNow(Date.now()), intervalMs)
//     return () => clearInterval(id)
//   }, [enabled, intervalMs])
//   return now
// }

export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages)
  const active = useChatStore((s) => s.chatOpen)
  const isThinking = useChatStore((s) => s.isThinking)
  const lastClicked = useChatStore((s) => s.lastClicked)
  const addMessage = useChatStore((s) => s.addMessage)
  const setThinking = useChatStore((s) => s.setThinking)
  const openChat = useChatStore((s) => s.openChat)
  const closeChat = useChatStore((s) => s.closeChat)

  const [input, setInput] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const stickRef = useRef(true)        // is the user at the bottom of the list?
  const forceScrollRef = useRef(false) // set when the user sends a message

//   const lastTs = messages[messages.length - 1]?.ts ?? 0
//   const now = useNow(!active && now0Check())
//   function now0Check() {
//     // tick only while the newest message may still be fading
//     return Date.now() - lastTs < HOLD_MS + FADE_MS + 500
//   }

    const lastTs = messages[messages.length - 1]?.ts ?? 0
    const [now, setNow] = useState(() => Date.now())
    const fading = !active && now - lastTs < HOLD_MS + FADE_MS + 500
    useEffect(() => {
        if (!fading) return
        setNow(Date.now())
        const id = setInterval(() => setNow(Date.now()), 250)
        return () => clearInterval(id)
    }, [fading])

  // ---- activation: stick to bottom + focus the input ----
  useEffect(() => {
    if (!active) return
    stickRef.current = true
    inputRef.current?.focus({ preventScroll: true })
  }, [active])

  // ---- auto-scroll only if the user is at the bottom (or just sent) ----
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    if (forceScrollRef.current || stickRef.current) {
      el.scrollTop = el.scrollHeight
      forceScrollRef.current = false
    }
  }, [messages.length, isThinking, active])

  const onScroll = () => {
    const el = listRef.current
    if (!el) return
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_STICK_PX
  }

  // ---- Enter opens the chat (when not already typing somewhere) ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || active) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      e.preventDefault()
      openChat()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, openChat])

  // ---- clicking outside the panel (e.g. on the scene) closes it ----
  useEffect(() => {
    if (!active) return
    const onDown = (e: PointerEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) closeChat()
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [active, closeChat])

  const handleSend = useCallback(async () => {
    if (isThinking) return
    const text = input.trim()
    if (!text) {            // empty Enter just closes, like most game chats
      closeChat()
      return
    }
    const history: ChatTurn[] = messages.map(({ role, content }) => ({ role, content }))
    forceScrollRef.current = true
    setInput('')
    addMessage({ role: 'user', content: text })
    closeChat()             // back to compact state right after sending
    setThinking(true)
    try {
      const reply = await sendMessage({ message: text, history, lastClicked })
      addMessage({ role: 'assistant', content: reply })
    } catch {
      addMessage({ role: 'assistant', content: 'Sorry, something went wrong. Try again.' })
    } finally {
      setThinking(false)
    }
  }, [input, isThinking, messages, lastClicked, addMessage, closeChat, setThinking])

    const handleCancel = useCallback(() => {
    setInput('')
    closeChat()
    }, [closeChat])

  // ---- which lines to show, and how strongly ----
  const start = active ? 0 : Math.max(0, messages.length - MAX_IDLE_LINES)
  const lines = messages
    .slice(start)
    .map((m, i, arr) => {
      if (active) return { m, key: start + i, opacity: 1 }
      const rank = arr.length - 1 - i // 0 = newest
      const opacity = ageOpacity(now - m.ts) * Math.max(0.4, 1 - rank * 0.15)
      return { m, key: start + i, opacity }
    })
    .filter((l) => l.opacity > 0.02)

  // ---- styles ----
  const wrapper: CSSProperties = {
    position: 'absolute',
    bottom: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(440px, 92vw)',
    pointerEvents: 'none', // inactive: clicks go through to the scene
  }
  const panel: CSSProperties = {
    position: 'relative',
    padding: '8px 10px',
    color: '#eafcff',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    pointerEvents: active ? 'auto' : 'none',
  }
  const bgLayer: CSSProperties = {
    position: 'absolute',
    inset: 0,
    clipPath: CLIP,
    WebkitClipPath: CLIP,
    background: 'linear-gradient(155deg, rgba(11,27,36,0.82) 0%, rgba(18,58,68,0.78) 100%)',
    border: '1px solid rgba(190,240,245,0.15)',
    opacity: active ? 1 : 0,
    transition: 'opacity 0.35s ease',
  }
  const list: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: LIST_MAX_HEIGHT,
    overflowY: active ? 'auto' : 'hidden',
  }
  const line = (opacity: number): CSSProperties => ({
    padding: '2px 8px',
    fontSize: 13,
    lineHeight: 1.35,
    wordBreak: 'break-word',
    textShadow: '0 1px 2px rgba(0,0,0,0.85)',
    background: 'linear-gradient(90deg, rgba(11,27,36,0.45), rgba(11,27,36,0))',
    opacity,
    transition: 'opacity 0.5s linear',
  })
  const label = (role: ChatTurn['role']): CSSProperties => ({
    marginRight: 8,
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: role === 'user' ? '#8fdee6' : 'rgba(234,252,255,0.65)',
  })
  const inputRow: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
    maxHeight: active ? 36 : 0,
    marginTop: active ? 8 : 0,
    opacity: active ? 1 : 0,
    transition: 'max-height 0.25s ease, margin-top 0.25s ease, opacity 0.2s ease',
  }
  const trigger: CSSProperties = {
    position: 'relative',
    display: 'block',
    width: 'fit-content',
    minWidth: 140,
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'hidden',
    maxHeight: active ? 0 : 44,
    marginTop: active ? 0 : 6,
    padding: active ? 0 : '4px 10px',
    border: 'none',
    clipPath: CHIP_CLIP,
    WebkitClipPath: CHIP_CLIP,
    background: 'rgba(11,27,36,0.55)',
    color: 'rgba(234,252,255,0.7)',
    fontFamily: MONO,
    fontSize: 13,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    opacity: active ? 0 : 0.85,
    pointerEvents: active ? 'none' : 'auto', // the one clickable thing when inactive
    transition: 'max-height 0.25s ease, margin-top 0.25s ease, opacity 0.2s ease',
  }

    const actionBtn = (primary: boolean): CSSProperties => ({
    flexShrink: 0,
    height: 26,
    padding: primary ? '0 12px' : '0 9px',
    border: 'none',
    clipPath: CHIP_CLIP,
    WebkitClipPath: CHIP_CLIP,
    cursor: 'pointer',
    fontFamily: MONO,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    background: primary
        ? 'linear-gradient(135deg, #d3f6f8 0%, #8fdee6 100%)'
        : 'rgba(255,255,255,0.08)',
    color: primary ? '#0b1b24' : 'rgba(234,252,255,0.8)',
    transition: 'opacity 0.2s ease',
    })

  return (
    <div style={wrapper}>
      <div ref={panelRef} style={panel}>
        <div style={bgLayer} />

        <div ref={listRef} className="chat-list" style={list} onScroll={onScroll}>
          {/* margin-top:auto keeps the stack bottom-anchored AND scrollable */}
          <div style={{ marginTop: 'auto' }}>
            {lines.map(({ m, key, opacity }) => (
              <div key={key} className="chat-line" style={line(opacity)}>
                <span style={label(m.role)}>{m.role === 'user' ? 'You' : 'Robutler'}</span>
                {m.content}
              </div>
            ))}
            {isThinking && (
              <div className="chat-line" style={line(1)}>
                <span style={label('assistant')}>Robutler</span>…
              </div>
            )}
          </div>
        </div>

        <div style={inputRow}>
          <span style={{ fontFamily: MONO, fontSize: 13, color: '#8fdee6' }}>&gt;</span>
          <input
            ref={inputRef}
            value={input}
            disabled={!active}
            maxLength={500}
            placeholder="Message Robutler…  (Enter to send, Esc to cancel)"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation() // keep WASD etc. from reaching WalkControls
              if (e.nativeEvent.isComposing) return
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSend()
              } else if (e.key === 'Escape') {
                handleCancel()
              }
            }}
            onKeyUp={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              padding: '5px 2px',
              fontSize: 13,
              fontFamily: MONO,
              color: '#eafcff',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(190,240,245,0.35)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            aria-label="Send message"
            onClick={handleSend}
            disabled={!active || isThinking || !input.trim()}
            style={{
                ...actionBtn(true),
                opacity: isThinking || !input.trim() ? 0.4 : 1,
                cursor: isThinking || !input.trim() ? 'default' : 'pointer',
            }}
            >
            Send
            </button>

            <button
            type="button"
            aria-label="Close chat"
            onClick={handleCancel}
            disabled={!active}
            style={actionBtn(false)}
            >
            ✕
            </button>
        </div>

        <button type="button" style={trigger} onClick={openChat} tabIndex={active ? -1 : 0}>
          Chat ↵
        </button>
      </div>

      <style>{`
        @keyframes chat-in { from { opacity: 0; transform: translateY(3px); } }
        .chat-line { animation: chat-in 0.25s ease-out; }
        .chat-list { scrollbar-width: thin; scrollbar-color: rgba(190,240,245,0.35) transparent; }
        .chat-list::-webkit-scrollbar { width: 4px; }
        .chat-list::-webkit-scrollbar-thumb { background: rgba(190,240,245,0.35); }
        @media (prefers-reduced-motion: reduce) { .chat-line { animation: none; } }
      `}</style>
    </div>
  )
}
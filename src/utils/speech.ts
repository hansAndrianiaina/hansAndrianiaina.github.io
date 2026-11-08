// src/utils/speech.ts
import { getAudioContext } from './audio'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
const TTS_TIMEOUT_MS = 30_000

let enabled = true
let current: AudioBufferSourceNode | null = null
let controller: AbortController | null = null

export function setVoiceEnabled(on: boolean): void {
  enabled = on
  if (!on) stopSpeech()
}

export function stopSpeech(): void {
  controller?.abort()
  controller = null
  try { current?.stop() } catch { /* already stopped */ }
  current = null
}

// Call synchronously inside the click/keypress that sends the message, so the
// browser lets the AudioContext start even though playback happens after a fetch.
export function primeAudio(): void {
  getAudioContext() // creates + resumes the shared context
}

// Strip markdown so the voice doesn't read symbols aloud
const clean = (t: string) =>
  t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`#>]/g, '').trim()

export async function speak(text: string): Promise<void> {
  if (!enabled || !API_URL) return
  stopSpeech() // a new reply interrupts the previous one
  const input = clean(text)
  if (!input) return

  const ctrl = new AbortController()
  controller = ctrl

  try {
    const res = await fetch(`${API_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
      signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(TTS_TIMEOUT_MS)]),
    })
    if (!res.ok) throw new Error(`TTS ${res.status}`)

    const ctx = getAudioContext()
    const buffer = await ctx.decodeAudioData(await res.arrayBuffer())
    if (ctrl.signal.aborted || !enabled) return // user moved on or muted meanwhile

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.onended = () => { if (current === source) current = null }
    source.start()
    current = source
  } catch (err) {
    if ((err as Error).name !== 'AbortError') console.warn('Voice unavailable:', err)
  }
}
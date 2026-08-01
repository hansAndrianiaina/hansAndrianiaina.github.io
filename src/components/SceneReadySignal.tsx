// src/components/SceneReadySignal.tsx
import { useEffect } from 'react'

/**
 * Invisible marker. Render this *inside* the same <Suspense> boundary as
 * the scene content (Model, Environment, etc), anywhere as a sibling.
 *
 * React only renders a Suspense boundary's children once every suspending
 * descendant inside it has resolved — so by the time this component's
 * effect fires, the model (and anything else in that boundary) is
 * guaranteed to be loaded and about to paint.
 *
 * This is more reliable than drei's `useProgress()` alone for detecting
 * "done": useProgress tracks THREE's global loading manager, which never
 * fires start/load events for an instant cache hit — so on a warm cache
 * `active` can stay `false` the entire time, i.e. "done" from frame one,
 * before the model has actually rendered.
 */
export default function SceneReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])

  return null
}
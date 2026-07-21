import { useEffect, useRef } from 'react'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  const tag = target.tagName

  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true

  return false
}

export function useKeySequence(sequence: readonly string[], callback: () => void, timeout = 1000) {
  const indexRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    function reset() {
      indexRef.current = 0

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      // Ignore combinations like Ctrl+C, Cmd+K, etc.
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      // Ignore keystrokes while typing in a form field or contenteditable
      if (isTypingTarget(event.target)) {
        return
      }

      const key = event.key.toLowerCase()
      const expected = sequence[indexRef.current]?.toLowerCase()

      if (key !== expected) {
        reset()
        return
      }

      indexRef.current++

      if (indexRef.current === sequence.length) {
        callback()
        reset()
        return
      }

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = window.setTimeout(reset, timeout)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      reset()
    }
  }, [sequence, callback, timeout])
}
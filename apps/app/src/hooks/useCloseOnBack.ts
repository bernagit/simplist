'use client'

import { useEffect, useRef } from 'react'

/**
 * Makes the browser/OS "back" action (Android back gesture/button, iOS swipe, browser
 * back button) close the top-most open overlay instead of navigating the page under it.
 *
 * - Opening an overlay pushes a history entry with the same URL. Next.js copies its router
 *   state into entries pushed with `pushState`, so returning to the previous entry just
 *   restores the same page (no reload, no navigation).
 * - "Back" pops that entry (popstate) and we close the top overlay.
 * - Closing from the UI can't remove the entry without calling `history.back()`, which
 *   would race with a navigation started by the same click (e.g. a link in the mobile
 *   sidebar) and could undo it. So the entry is left in place as stale, and the next
 *   "back" that leaves or lands on a stale entry is repeated automatically.
 */

type OverlayEntry = { id: string; close: () => void }

const STATE_KEY = '__overlay'

/** Open overlays, in opening order: the last one is on top. Shared by all overlays. */
const stack: OverlayEntry[] = []
/** The current history entry belongs to an overlay that was closed from the UI. */
let onStaleEntry = false
let installed = false

function currentOverlayId(): string | undefined {
  const state: unknown = window.history.state
  if (typeof state !== 'object' || state === null) return undefined
  const id = (state as Record<string, unknown>)[STATE_KEY]
  return typeof id === 'string' ? id : undefined
}

function onPopState() {
  // This "back" only left a stale entry, which would look like nothing happened.
  if (onStaleEntry) {
    onStaleEntry = false
    window.history.back()
    return
  }
  // Landed on the entry of an overlay that is already closed: skip it as well.
  const id = currentOverlayId()
  if (id !== undefined && !stack.some(entry => entry.id === id)) {
    window.history.back()
    return
  }
  stack.pop()?.close()
}

function install() {
  if (installed) return
  installed = true
  window.addEventListener('popstate', onPopState)

  // Any new entry (a navigation, another overlay) buries the stale one: it will be
  // recognised by its id if the user ever goes back to it.
  const pushState = window.history.pushState.bind(window.history)
  window.history.pushState = (...args: Parameters<History['pushState']>) => {
    onStaleEntry = false
    pushState(...args)
  }
}

export function useCloseOnBack(opened: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!opened) return
    install()

    const entry: OverlayEntry = {
      id: Math.random().toString(36).slice(2),
      close: () => onCloseRef.current()
    }
    stack.push(entry)
    // No URL: Next.js keeps the current route and copies its router state into the entry.
    window.history.pushState({ [STATE_KEY]: entry.id }, '')

    return () => {
      const index = stack.indexOf(entry)
      // Already removed by onPopState: closed by "back", its entry is consumed.
      if (index === -1) return
      stack.splice(index, 1)
      // Closed from the UI while its entry is the current one: mark it stale.
      if (currentOverlayId() === entry.id) onStaleEntry = true
    }
  }, [opened])
}

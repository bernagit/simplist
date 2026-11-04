/**
 * Deletes that can still be undone: the task is already hidden, the request is sent when the
 * undo window ends. The list query filters these ids out, so a refetch during the window
 * doesn't bring the task back.
 */
type PendingDelete = { timer: ReturnType<typeof setTimeout>; commit: (closing?: boolean) => void }

const pending = new Map<string, PendingDelete>()
const listeners = new Set<() => void>()
let snapshot: ReadonlySet<string> = new Set()

function emit() {
  snapshot = new Set(pending.keys())
  listeners.forEach(listener => listener())
}

export const pendingDeletes = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => snapshot,

  /** Runs `commit` after `delayMs`, unless cancelled first. */
  schedule(taskId: string, delayMs: number, commit: (closing?: boolean) => void) {
    pendingDeletes.cancel(taskId)
    const timer = setTimeout(() => {
      pending.delete(taskId)
      emit()
      commit()
    }, delayMs)
    pending.set(taskId, { timer, commit })
    emit()
  },

  /** Undo: returns false when it's too late (already sent). */
  cancel(taskId: string) {
    const entry = pending.get(taskId)
    if (!entry) return false
    clearTimeout(entry.timer)
    pending.delete(taskId)
    emit()
    return true
  },

  /** Sends every pending delete now: the page is being closed or put in the background. */
  flush() {
    if (pending.size === 0) return
    const entries = [...pending.values()]
    pending.clear()
    emit()
    entries.forEach(entry => {
      clearTimeout(entry.timer)
      entry.commit(true)
    })
  }
}

if (typeof window !== 'undefined') {
  // A phone can kill a backgrounded PWA without any further event: send them when hidden
  window.addEventListener('pagehide', pendingDeletes.flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') pendingDeletes.flush()
  })
}

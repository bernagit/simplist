import rawNotes from '../../release-notes.json'

export type ReleaseNoteType = 'new' | 'improved' | 'fixed'

export type ReleaseNote = { type: ReleaseNoteType; it: string; en: string }

/** One version's user-facing notes. The full changelog lives in the docs (apps/app/CHANGELOG.md). */
export type Release = { version: string; date: string; notes: ReleaseNote[] }

/** Newest first, as written in release-notes.json */
export const RELEASES = rawNotes as Release[]

/** Compares "x.y.z" versions: negative if a < b, positive if a > b. */
export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(Number)
  const pb = b.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0)
    if (diff !== 0) return diff
  }
  return 0
}

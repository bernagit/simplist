export interface ChangelogEntry {
  version: string
  sections: {
    type: string
    items: string[]
  }[]
}

export function parseChangelog(rawMarkdown: string): ChangelogEntry[] {
  if (!rawMarkdown) return []

  const entries: ChangelogEntry[] = []
  const lines = rawMarkdown.split('\n')

  let currentEntry: ChangelogEntry | null = null
  let currentSection: { type: string; items: string[] } | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()

    // Match Version Headers (e.g. ## 0.2.1 or ## v0.2.0)
    if (line.startsWith('## ')) {
      if (currentEntry) {
        if (currentSection) currentEntry.sections.push(currentSection)
        entries.push(currentEntry)
      }
      currentEntry = {
        version: line.replace('## ', '').trim(),
        sections: []
      }
      currentSection = null;
      continue
    }

    // Match Change Section Headers (e.g. ### Patch Changes, ### Added)
    if (line.startsWith('### ') && currentEntry) {
      if (currentSection) {
        currentEntry.sections.push(currentSection)
      }
      currentSection = {
        type: line.replace('### ', '').trim(),
        items: []
      }
      continue
    }

    // Match Bullet List Items (- item or * item)
    if ((line.startsWith('- ') || line.startsWith('* ')) && currentSection) {
      const itemText = line.replace(/^[-*]\s+/, '').trim()
      currentSection.items.push(itemText)
    }
  }

  // Push remaining trailing items
  if (currentEntry) {
    if (currentSection) currentEntry.sections.push(currentSection)
    entries.push(currentEntry)
  }

  return entries
}

export function getSectionBadgeColor(type: string): string {
  const normalized = type.toLowerCase()

  if (normalized.includes('breaking') || normalized.includes('major')) return 'red'
  if (normalized.includes('minor') || normalized.includes('feature')) return 'blue'
  if (normalized.includes('patch') || normalized.includes('fix')) return 'green'
  if (normalized.includes('added')) return 'violet'
  if (normalized.includes('changed')) return 'orange'
  if (normalized.includes('deprecated') || normalized.includes('removed')) return 'red'
  if (normalized.includes('security')) return 'teal'

  return 'gray'
}
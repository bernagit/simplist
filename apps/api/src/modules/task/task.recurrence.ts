import rrule from 'rrule'

const { RRule } = rrule

/** Keeps only the RRULE part of a rule that may also carry DTSTART/EXDATE lines. */
function getRRuleString(rule: string) {
  const normalized = rule.trim()
  const rruleLine = normalized
    .split('\n')
    .map(line => line.trim())
    .find(line => line.startsWith('RRULE:'))
  return (rruleLine ?? normalized).replace(/^RRULE:/, '')
}

/** 'YYYY-MM-DD' -> Date at UTC midnight, so the rule is expanded on calendar days only. */
function toUtcDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year!, month! - 1, day))
}

function toDateString(value: Date) {
  return value.toISOString().slice(0, 'YYYY-MM-DD'.length)
}

export type NextOccurrence = {
  /** Next due date, 'YYYY-MM-DD' */
  dueDate: string
  /** Rule to store from now on (COUNT is decremented, since the series restarts at `dueDate`) */
  recurrenceRule: string
}

/**
 * Next occurrence of a recurring task strictly after `dueDate` ('YYYY-MM-DD').
 * The series starts at `dueDate`, the same way the calendar expands it.
 * Returns null when the rule is invalid or the series has ended (UNTIL reached or COUNT used up).
 */
export function getNextOccurrence(rule: string, dueDate: string): NextOccurrence | null {
  try {
    const options = RRule.parseString(getRRuleString(rule))
    // COUNT includes the current occurrence: 1 means this was the last one
    if (options.count != null && options.count <= 1) return null

    const dtstart = toUtcDate(dueDate)
    const next = new RRule({ ...options, dtstart }).after(dtstart, false)
    if (!next) return null

    // Keep the stored string as is (the app matches presets like 'FREQ=WEEKLY' on it)
    // unless COUNT has to change
    const recurrenceRule =
      options.count != null
        ? RRule.optionsToString({ ...options, count: options.count - 1 }).replace(/^RRULE:/, '')
        : rule
    return { dueDate: toDateString(next), recurrenceRule }
  } catch {
    return null
  }
}

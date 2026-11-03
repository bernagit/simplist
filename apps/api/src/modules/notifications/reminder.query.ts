import { sql } from 'drizzle-orm'

export type DueReminderRow = {
  task_id: string
  user_id: string
  due_at: Date | string
  title: string
  due_time: string | null
  list_id: string
  section_id: string
  list_title: string
  section_title: string | null
  shared: boolean
}

/**
 * Reminders due now: open tasks with a date, for every list member who turned reminders on
 * and has at least one device, not sent yet for this occurrence.
 *
 * The due instant is the task's wall-clock date and time (or the user's time for all-day
 * tasks) in the user's time zone; timed tasks are reminded `lead_minutes` earlier.
 * Reminders more than `graceMinutes` late are skipped (e.g. after downtime), so a restart
 * never floods devices with old reminders.
 */
export function dueRemindersQuery(now: Date, graceMinutes: number, limit: number) {
  return sql`
  select
    t.id as task_id,
    m.user_id,
    d.due_at,
    t.title,
    t.due_time::text as due_time,
    t.list_id,
    t.section_id,
    l.title as list_title,
    s.title as section_title,
    l.owner_id <> m.user_id as shared
  from tasks t
  join lists l on l.id = t.list_id and l.deleted_at is null and l.archived_at is null
  join list_members m on m.list_id = t.list_id
  join notification_settings ns on ns.user_id = m.user_id and ns.enabled
  left join sections s on s.id = t.section_id
  cross join lateral (
    select (t.due_date + coalesce(t.due_time, ns.all_day_time)) at time zone ns.timezone as due_at
  ) d
  cross join lateral (
    select d.due_at - case
      when t.due_time is null then interval '0'
      else make_interval(mins => ns.lead_minutes)
    end as remind_at
  ) r
  where t.completed = false
    and t.due_date is not null
    -- Index-friendly window: time zones are within ±14h and the lead is at most a day
    and t.due_date between (${now}::timestamptz - interval '2 days')::date
                       and (${now}::timestamptz + interval '2 days')::date
    and r.remind_at <= ${now}::timestamptz
    and r.remind_at > ${now}::timestamptz - make_interval(mins => ${graceMinutes})
    and (ns.shared_lists or l.owner_id = m.user_id)
    and exists (select 1 from push_subscriptions ps where ps.user_id = m.user_id)
    and not exists (
      select 1 from task_reminders tr
      where tr.task_id = t.id and tr.user_id = m.user_id and tr.due_at = d.due_at
    )
  order by r.remind_at
  limit ${limit}
`
}

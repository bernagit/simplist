# app

## 0.7.2

### Patch Changes

- docs: new documentation, in Italian and English: a step-by-step guide to deploy Simplist with Docker (session keys, configuration, notifications, first user, HTTPS), every configuration option, updates and backups, and a user guide for lists, tasks, repeats, reminders, calendar, search, sharing, notifications and shortcuts. Open it from "Help & Support" > "Documentation"
- fix: the Docker example configuration now includes APP_URL, so the first user's registration link and email links point to your domain instead of localhost

## 0.7.1

### Patch Changes

- fix: less bright top bar border in dark mode and more room at the bottom of the list pages
- feat: leave a list shared with you, from its menu in Shared with me or from the list page
- feat: list info shows open and done tasks, sections, members with their role, and opens the list
- feat: redesigned My lists and Shared with me: New list button (floating on phones), search, sorting, the archived filter always visible, task progress on every list and a compact layout on phones
- fix: the owner of a list can no longer be removed from it or have their role changed
- fix: the task window closes when clicking outside it, and a title being edited is saved
- fix: the whole task row opens the task, a bigger target on phones

## 0.7.0

### Minor Changes

- feat: new repeat options based on the due date (every weekday, every week on Tuesday, every month on day 3...) and custom repeats: every N days, weeks, months or years, on chosen weekdays, until a date or for a number of times
- feat: search now finds tasks too, also in shared lists, and opens them directly in their list
- feat: redesigned task details and add task: date with quick picks (today, tomorrow, next week), time and duration, repeat, reminder and priority, with the same pickers on desktop and phones
- feat: task reminders with push notifications: turn them on for each device in Settings > Notifications, then set a reminder on a task (bell). Default times are in the settings, each task can use its own. Self-hosting: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY (generate them once with `yarn workspace api push:keys`)
- feat: task rows show Today, Tomorrow or the weekday, overdue dates in red, and icons for repeating tasks and reminders

### Patch Changes

- fix: recurring tasks show in the calendar in every month, not only in the one they start in, and every occurrence opens its task
- fix: completing a recurring task moves it to its next date instead of closing it
- fix: members who can only view a list no longer see the section menu (rename, delete)
- fix: the top bar no longer flashes the desktop buttons on phones while the page loads

## 0.6.0

### Minor Changes

- feat: the app now talks to the API directly through nginx, faster and ready for developer access to the API. Self-hosting: add the nginx service from docker/nginx; everyone needs to log in again once after updating
- feat: the documentation is now online, open it from "Help & Support" > "Documentation"

### Patch Changes

- fix: the API now logs the real error when it fails to start
- fix: Docker image builds no longer fail because of the documentation dependencies
- fix: fewer unexpected logouts: expired sessions are renewed once, also with several tabs open

## 0.5.0

### Minor Changes

- feat: "..." button on tasks and lists to reach their actions without a long-press (iPhone)
- feat: modals are full screen on phones and the back gesture closes them instead of leaving the page

### Patch Changes

- fix: drag and drop no longer blocks scrolling on touch devices; sections are now dragged from a handle
- fix: iOS no longer zooms in when tapping a text field
- fix: calendar, top bar, list header, sharing and settings adapted to small screens
- fix: better support for tablets and touch devices: controls shown on hover are now always visible
- fix: larger touch targets, section rename from the menu and other small mobile fixes
- fix: the list title no longer stays in the top bar after leaving the list

## 0.4.0

### Minor Changes

- feat: added internationalization (en/it)

## 0.3.2

### Patch Changes

- fix: sort in mobile device

## 0.3.1

### Patch Changes

- feat: add avatar support
- fix: UI and sharing

## 0.3.0

### Minor Changes

- feat: add task between section and section reorder
- feat: add shortcuts for PWA app
- feat: add confirmation for delete/archive list
- feat: add changelog
- fix: scroll on main page
- fix: hotkeys for edit title save and general hotkeys

## 0.2.1

### Patch Changes

- feat(auth): implemented refresh token and sessions
- feat(mail): enhance SMTP configuration
- fix: docker configuration

## v0.2.0

### Minor Changes

- changed invite handling

## v0.1.0

### Added

- Initial project scaffolding: Yarn monorepo with `apps/api` (Express + Drizzle)
  and `apps/app` (Next.js + Mantine)
- Lists, sections, and tasks with priorities and due dates
- Calendar view
- Shareable lists
- User authentication (register, login, password reset, beta invites)
- User preferences and appearance settings
- Keyboard shortcuts and command spotlight
- PWA support
- Docker Compose setup for self-hosting

# app

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

# ⚡ SprintPad

**Plan. Track. Finish.**

A mobile-first project management PWA for developers and makers who want a fast, offline-capable tool to organize projects, tasks, and notes — no account required.

---

## 📦 Version

`v1.0.1` — Bug fixes, archive system, notification bell

---

## ✨ Features

### Create Flow
- **Tasks** — Add tasks with a title, linked project, priority level (High / Medium / Low), due date, and optional notes
- **Projects** — Create projects with a name, description, color + emoji icon, and due date
- **Notes** — Write and save free-form notes or ideas

### Home Screen
- Personalized greeting based on time of day (Good morning / afternoon / evening)
- Stats row showing total Projects, Tasks, and Completed count
- Today's Tasks — surfaces tasks due today or overdue
- Recent Projects — last 3 projects with progress bars
- Recent Notes — last 3 notes

### Projects Screen
- Filter by: All / Active / Completed / Archived
- Project cards with icon, description, status pill, progress bar, task count, and due date
- Projects **automatically move to Completed** when all tasks are marked done
- Projects move back to Active if a task is restored

### Tasks Screen
- Filter by: All / To Do / In Progress / Done / **Archived**
- Tap any task card to cycle its status: `To Do → In Progress → Done → To Do`
- **Swipe left to archive** a task — removes it from active views and progress bar
- **Swipe left on archived task to restore** — brings it back to To Do
- Priority badges (High / Medium / Low)
- Overdue tasks show "Xd overdue" label

### Notes Screen
- All notes sorted by newest first

### Notification Bell
- Red dot appears when tasks are **due within 3 days or overdue**
- Tap bell to open notification panel showing all urgent tasks
- Red dot disappears after opening — resets the next day
- Overdue tasks shown in red, upcoming in yellow

### Profile Screen
- Edit your display name
- View your total projects, tasks, and notes count
- Clear all app data

---

## 🗄️ Data Storage

SprintPad stores all data locally using **IndexedDB** — no internet connection or account required. Data persists across sessions and app installs.

| Store      | Fields |
|------------|--------|
| `projects` | id, name, description, color, emoji, due_date, status, created_at |
| `tasks`    | id, title, project_id, priority, due_date, notes, status, created_at |
| `notes`    | id, title, content, created_at |

---

## 🚀 Deployment

SprintPad is a static PWA — no build step required.

```
index.html
style.css
app.js
manifest.json
sw.js
icons/
  icon-192.png
  icon-512.png
```

Deploy to **GitHub Pages**:
1. Push all files to your repo's `main` branch
2. Go to Settings → Pages → Source: `main / root`
3. Done — accessible at `https://yourusername.github.io/SprintPad/`

---

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| UI        | Vanilla HTML + CSS |
| Logic     | Vanilla JavaScript (ES6+) |
| Storage   | IndexedDB (via native browser API) |
| PWA       | Service Worker + Web App Manifest |
| Fonts     | Inter + Space Grotesk (Google Fonts) |
| Hosting   | GitHub Pages |

---

## 📋 Changelog

### v1.0.1
- ✅ Fixed: Project Completed tab now auto-reflects when all tasks are done
- ✅ Fixed: UTC timezone — dates now show correctly in local time
- ✨ New: Swipe left to archive tasks
- ✨ New: Swipe left on archived task to restore
- ✨ New: Archived tab in Tasks screen
- ✨ New: Notification bell with red dot for tasks due within 3 days or overdue
- ✨ New: Red dot persists until panel opened, resets next day
- 💅 Improved: Overall CSS spacing polish across all cards and screens
- 💅 Improved: Overdue label on past due date tasks

### v1.0.0
- Initial release
- Create flow: Tasks, Projects, Notes
- Home screen with stats, today's tasks, recent projects and notes
- Projects screen with All/Active/Completed/Archived filter
- Tasks screen with All/To Do/In Progress/Done filter
- Notes screen
- Profile screen with display name edit
- IndexedDB offline storage
- PWA manifest + service worker

---

## 🗺️ Roadmap

### v1.1.0
- [ ] Task detail view (edit, delete, full notes)
- [ ] Project detail view with task list
- [ ] Delete tasks and projects

### v1.2.0
- [ ] Kanban board view (To Do / In Progress / Done columns)
- [ ] Due date reminders (Push Notifications API)

### v2.0.0 *(Cloud)*
- [ ] Supabase backend (optional sign-in)
- [ ] Multi-device sync
- [ ] Team collaboration
- [ ] Activity feed via notification bell

---

## 📁 File Structure

```
SprintPad/
├── index.html      # App shell, screens, modals, bottom nav
├── style.css       # Dark theme, component styles, animations
├── app.js          # IndexedDB setup, create flow, render logic
├── manifest.json   # PWA manifest
├── sw.js           # Service worker for offline caching
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## 🎨 Design Tokens

| Token       | Value     | Usage |
|-------------|-----------|-------|
| `--bg`      | `#0B1120` | App background |
| `--bg-card` | `#111827` | Cards, nav |
| `--blue`    | `#2563E8` | Primary accent |
| `--purple`  | `#7C3AED` | Project icon |
| `--green`   | `#22C55E` | Done / success |
| `--amber`   | `#F59E0B` | Notes / medium priority |
| `--red`     | `#EF4444` | High priority / danger |

Fonts: **Space Grotesk** (headings) · **Inter** (body)

---

## 👤 Author

Built by **Jaymar Reperuga** ([@jmprojectsme](https://github.com/jmprojectsme))
Self-taught developer · Built entirely on a Xiaomi Redmi Note 14 📱

---

# ⚡ SprintPad

**Plan. Track. Finish.**

A mobile-first project management PWA for developers and makers who want a fast, offline-capable tool to organize projects, tasks, and notes — no account required.

---

## 📦 Version

`v1.0.0` — Initial release

---

## ✨ Features

### Create Flow
- **Tasks** — Add tasks with a title, linked project, priority level (High / Medium / Low), due date, and optional notes
- **Projects** — Create projects with a name, description, color + emoji icon, and due date
- **Notes** — Write and save free-form notes or ideas

### Home Screen
- Personalized greeting with your display name
- Stats row showing total Projects, Tasks, and Completed count
- Today's Tasks — surfaces tasks due today or overdue
- Recent Projects — last 3 projects with progress bars
- Recent Notes — last 3 notes

### Projects Screen
- Filter by: All / Active / Completed / Archived
- Project cards with icon, description, status pill, progress bar, task count, and due date

### Tasks Screen
- Filter by: All / To Do / In Progress / Done
- Tap any task card to cycle its status: `To Do → In Progress → Done → To Do`
- Priority badges (High / Medium / Low)

### Notes Screen
- All notes sorted by newest first

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

SprintPad is a static PWA — three files, no build step.

```
index.html
style.css
app.js
```

Deploy to **GitHub Pages**:
1. Push the three files to your repo's `main` branch
2. Go to Settings → Pages → Source: `main / root`
3. Done — accessible at `https://yourusername.github.io/SprintPad/`

---

## 🛠️ Tech Stack

| Layer     | Technology |
|-----------|------------|
| UI        | Vanilla HTML + CSS |
| Logic     | Vanilla JavaScript (ES6+) |
| Storage   | IndexedDB (via native browser API) |
| Fonts     | Inter + Space Grotesk (Google Fonts) |
| Hosting   | GitHub Pages |

---

## 🗺️ Roadmap

### v1.1.0
- [ ] Task detail view (edit, delete, notes expand)
- [ ] Project detail view with task list
- [ ] Swipe to delete cards

### v1.2.0
- [ ] Kanban board view (To Do / In Progress / Done columns)
- [ ] PWA manifest + service worker (installable, offline icon)

### v1.3.0
- [ ] Timeline / calendar view
- [ ] Due date reminders (Push Notifications API)

### v2.0.0 *(Cloud)*
- [ ] Supabase backend (optional sign-in)
- [ ] Multi-device sync
- [ ] Notification bell (team activity feed)

---

## 📁 File Structure

```
SprintPad/
├── index.html   # App shell, screens, modals, bottom nav
├── style.css    # Dark theme, component styles, animations
└── app.js       # IndexedDB setup, create flow, render logic
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

*SprintPad is part of the Clio app suite.*

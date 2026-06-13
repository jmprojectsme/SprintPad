// ================================
// SprintPad - app.js v1.0.0
// IndexedDB · Offline-first PWA
// ================================

// ================================
// DB SETUP
// ================================

const DB_NAME    = 'sprintpad'
const DB_VERSION = 1
let db = null

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = e.target.result

      // Projects
      if (!db.objectStoreNames.contains('projects')) {
        const ps = db.createObjectStore('projects', { keyPath: 'id' })
        ps.createIndex('status',     'status',     { unique: false })
        ps.createIndex('created_at', 'created_at', { unique: false })
      }

      // Tasks
      if (!db.objectStoreNames.contains('tasks')) {
        const ts = db.createObjectStore('tasks', { keyPath: 'id' })
        ts.createIndex('project_id', 'project_id', { unique: false })
        ts.createIndex('status',     'status',     { unique: false })
        ts.createIndex('priority',   'priority',   { unique: false })
        ts.createIndex('created_at', 'created_at', { unique: false })
      }

          // Notes
      if (!db.objectStoreNames.contains('notes')) {
        const ns = db.createObjectStore('notes', { keyPath: 'id' })
        ns.createIndex('created_at', 'created_at', { unique: false })
      }
    }

    req.onsuccess = (e) => { db = e.target.result; resolve(db) }
    req.onerror   = (e) => reject(e.target.error)
  })
}

function dbGetAll(store) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

function dbPut(store, item) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readwrite')
    const req = tx.objectStore(store).put(item)
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

function dbDelete(store, id) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readwrite')
    const req = tx.objectStore(store).delete(id)
    req.onsuccess = () => resolve()
    req.onerror   = () => reject(req.error)
  })
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// ================================
// SETTINGS / USER
// ================================

function getUserName() {
  return localStorage.getItem('sp_username') || 'You'
}

function saveUserName(name) {
  localStorage.setItem('sp_username', name.trim() || 'You')
}

// ================================
// TOAST
// ================================

function showToast(msg, type = '') {
  const t = document.getElementById('toast')
  t.textContent = msg
  t.className = 'toast show ' + type
  clearTimeout(window._toastTimer)
  window._toastTimer = setTimeout(() => t.className = 'toast', 2500)
}

// ================================
// NAVIGATION
// ================================

let currentTab = 'home'

function switchTab(tab) {
  currentTab = tab

  // Screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  const screen = document.getElementById('screen-' + tab)
  if (screen) screen.classList.add('active')

  // Nav items
  document.querySelectorAll('.nav-item[data-tab]').forEach(n => {
    n.classList.toggle('active', n.dataset.tab === tab)
  })

  // Topbar
  const greetingEl = document.getElementById('topbar-greeting')
  const titleEl    = document.getElementById('topbar-title')
  const notifBtn   = document.getElementById('notif-btn')

  if (tab === 'home') {
    greetingEl.classList.remove('hidden')
    titleEl.classList.add('hidden')
    notifBtn.style.display = 'flex'
  } else {
    greetingEl.classList.add('hidden')
    titleEl.classList.remove('hidden')
    titleEl.textContent = { projects: 'Projects', tasks: 'Tasks', notes: 'Notes', profile: 'Profile' }[tab] || tab
    notifBtn.style.display = tab === 'profile' ? 'none' : 'flex'
  }

  // Re-render active tab
  renderTab(tab)
}

async function renderTab(tab) {
  if (tab === 'home')     await renderHome()
  if (tab === 'projects') await renderProjects()
  if (tab === 'tasks')    await renderTasks()
  if (tab === 'notes')    await renderNotes()
  if (tab === 'profile')  renderProfile()
}

// ================================
// CREATE FLOW
// ================================

window.openCreate = function(type) {
  if (type) {
    openForm(type)
    return
  }
  document.getElementById('create-overlay').classList.remove('hidden')
  document.getElementById('create-sheet').classList.remove('hidden')
}

window.closeCreate = function() {
  document.getElementById('create-overlay').classList.add('hidden')
  document.getElementById('create-sheet').classList.add('hidden')
}

window.openForm = async function(type) {
  closeCreate()

  const modal   = document.getElementById('form-modal')
  const overlay = document.getElementById('form-overlay')
  const title   = document.getElementById('form-title')
  const body    = document.getElementById('form-body')

  const projects = await dbGetAll('projects')

  title.textContent = type === 'task' ? 'New Task' : type === 'project' ? 'New Project' : 'New Note'
  body.innerHTML    = getFormHTML(type, projects)

  modal.classList.remove('hidden')
  overlay.classList.remove('hidden')

  // Priority buttons
  if (type === 'task') {
    body.querySelectorAll('.priority-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
        document.getElementById('priority-hidden').value = btn.dataset.val
      })
    })
      }
    // Color dots
  if (type === 'project') {
    body.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', (e) => {
    e.stopPropagation()
    body.querySelectorAll('.color-dot').forEach(d => {
      d.classList.remove('selected')
      d.style.borderColor = 'transparent'
    })
    dot.classList.add('selected')
    dot.style.borderColor = 'white'
    document.getElementById('color-hidden').value = dot.dataset.color
  })
})
  }

  // Auto-focus first input
  setTimeout(() => {
    const first = body.querySelector('input, textarea')
    if (first) first.focus()
  }, 200)
}

window.closeForm = function() {
  document.getElementById('form-modal').classList.add('hidden')
  document.getElementById('form-overlay').classList.add('hidden')
}

function getFormHTML(type, projects = []) {
  if (type === 'task') return `
    <div class="field-group">
      <label class="field-label">Task name</label>
      <input type="text" id="f-title" class="field-input" placeholder="e.g. Design the login screen" maxlength="80" />
    </div>
    <div class="field-group">
      <label class="field-label">Project</label>
      <select id="f-project" class="field-select">
        <option value="">No project</option>
        ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
      </select>
    </div>
    <div class="field-group">
      <label class="field-label">Priority</label>
      <div class="priority-row">
        <button class="priority-btn" data-val="high">High</button>
        <button class="priority-btn" data-val="medium">Medium</button>
        <button class="priority-btn" data-val="low">Low</button>
      </div>
      <input type="hidden" id="priority-hidden" value="medium" />
    </div>
    <div class="field-group">
      <label class="field-label">Due date (optional)</label>
      <input type="date" id="f-due" class="field-input" />
    </div>
    <div class="field-group">
      <label class="field-label">Notes (optional)</label>
      <textarea id="f-notes" class="field-textarea" placeholder="Any details…"></textarea>
    </div>
    <button class="btn-primary full" onclick="submitTask()">Add Task</button>
  `

  if (type === 'project') {
    const colors = [
      { color: '#2563E8', emoji: '⚡' },
      { color: '#7C3AED', emoji: '💬' },
      { color: '#F59E0B', emoji: '📸' },
      { color: '#22C55E', emoji: '🌿' },
      { color: '#EF4444', emoji: '🔥' },
      { color: '#EC4899', emoji: '✨' },
    ]
    return `
      <div class="field-group">
        <label class="field-label">Project name</label>
        <input type="text" id="f-title" class="field-input" placeholder="e.g. SprintPad v1.0" maxlength="60" />
      </div>
      <div class="field-group">
        <label class="field-label">Description (optional)</label>
        <input type="text" id="f-desc" class="field-input" placeholder="What's this project about?" maxlength="120" />
      </div>
      <div class="field-group">
        <label class="field-label">Color & icon</label>
        <div class="color-row">
          ${colors.map((c, i) => `
            <div class="color-dot ${i === 0 ? 'selected' : ''}" 
                 data-color="${c.color}" data-emoji="${c.emoji}"
                 style="background:${c.color}20; border-color:${i === 0 ? 'white' : 'transparent'}">
              ${c.emoji}
            </div>`).join('')}
        </div>
        <input type="hidden" id="color-hidden" value="${colors[0].color}" />
      </div>
      <div class="field-group">
        <label class="field-label">Due date (optional)</label>
        <input type="date" id="f-due" class="field-input" />
      </div>
      <button class="btn-primary full" onclick="submitProject()">Create Project</button>
    `
  }

  if (type === 'note') return `
    <div class="field-group">
      <label class="field-label">Title</label>
      <input type="text" id="f-title" class="field-input" placeholder="Note title" maxlength="80" />
    </div>
    <div class="field-group">
      <label class="field-label">Content</label>
      <textarea id="f-content" class="field-textarea" style="min-height:200px" placeholder="Write your idea, decision, or plan…"></textarea>
    </div>
    <button class="btn-primary full" onclick="submitNote()">Save Note</button>
  `
  }

// ================================
// SUBMIT HANDLERS
// ================================

window.submitTask = async function() {
  const title = document.getElementById('f-title')?.value.trim()
  if (!title) { showToast('Task name is required', 'error'); return }

  const task = {
    id:         genId(),
    title,
    project_id: document.getElementById('f-project')?.value || '',
    priority:   document.getElementById('priority-hidden')?.value || 'medium',
    due_date:   document.getElementById('f-due')?.value || null,
    notes:      document.getElementById('f-notes')?.value.trim() || '',
    status:     'todo',
    created_at: new Date().toISOString()
  }

  await dbPut('tasks', task)
  closeForm()
  showToast('Task added ✅', 'success')
  await renderTab(currentTab)
  await updateStats()
}

window.submitProject = async function() {
  const title = document.getElementById('f-title')?.value.trim()
  if (!title) { showToast('Project name is required', 'error'); return }

  const colorDot = document.querySelector('.color-dot.selected')
  const project = {
    id:         genId(),
    name:       title,
    description:document.getElementById('f-desc')?.value.trim() || '',
    color:      document.getElementById('color-hidden')?.value || '#2563E8',
    emoji:      colorDot?.dataset.emoji || '⚡',
    due_date:   document.getElementById('f-due')?.value || null,
    status:     'active',
    created_at: new Date().toISOString()
  }

  await dbPut('projects', project)
  closeForm()
  showToast('Project created 🎉', 'success')
  await renderTab(currentTab)
  await updateStats()
}

window.submitNote = async function() {
  const title   = document.getElementById('f-title')?.value.trim()
  const content = document.getElementById('f-content')?.value.trim()
  if (!title)   { showToast('Title is required', 'error'); return }
  if (!content) { showToast('Content cannot be empty', 'error'); return }

  const note = {
    id:         genId(),
    title,
    content,
    created_at: new Date().toISOString()
  }

  await dbPut('notes', note)
  closeForm()
  showToast('Note saved 📝', 'success')
  await renderTab(currentTab)
  await updateStats()
}

// ================================
// TOGGLE TASK STATUS
// ================================

window.toggleTask = async function(id) {
  const tasks = await dbGetAll('tasks')
  const task  = tasks.find(t => t.id === id)
  if (!task) return

  const cycle = { todo: 'inprogress', inprogress: 'done', done: 'todo' }
  task.status  = cycle[task.status] || 'todo'
  await dbPut('tasks', task)
  await renderTab(currentTab)
  await updateStats()
}

// ================================
// RENDER: HOME
// ================================

async function renderHome() {
  // Greeting
  const name = getUserName()
  const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning 👋'
               : hour < 18 ? 'Good afternoon ☀️'
               : 'Good evening 🌙'
document.querySelector('.greeting-sub').textContent = greeting
  document.getElementById('greeting-name').textContent = name
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  document.getElementById('profile-avatar-display').textContent = initials

  const [tasks, projects, notes] = await Promise.all([
    dbGetAll('tasks'), dbGetAll('projects'), dbGetAll('notes')
  ])

  // Today's tasks — due today or overdue & not done
  const today    = new Date().toISOString().slice(0, 10)
  const todayTasks = tasks.filter(t =>
    t.status !== 'done' && (t.due_date === today || (t.due_date && t.due_date < today))
  ).slice(0, 5)

  const homeTasksList = document.getElementById('home-tasks-list')
  if (todayTasks.length) {
    homeTasksList.innerHTML = todayTasks.map(t => renderTaskCard(t, projects)).join('')
  } else {
    homeTasksList.innerHTML = `
      <div class="empty-state small">
        <div class="empty-icon">📋</div>
        <div class="empty-text">No tasks due today</div>
        <button class="empty-action" onclick="openCreate('task')">Add a task</button>
      </div>`
  }

  // Recent projects (last 3)
  const recentProjects = [...projects].sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0, 3)
  const homeProjList   = document.getElementById('home-projects-list')
  if (recentProjects.length) {
    homeProjList.innerHTML = recentProjects.map(p => renderProjectCard(p, tasks)).join('')
  } else {
    homeProjList.innerHTML = `
      <div class="empty-state small">
        <div class="empty-icon">🗂️</div>
        <div class="empty-text">No projects yet</div>
        <button class="empty-action" onclick="openCreate('project')">Start a project</button>
      </div>`
                 }

    // Recent notes (last 3)
  const recentNotes  = [...notes].sort((a,b) => b.created_at.localeCompare(a.created_at)).slice(0, 3)
  const homeNoteList = document.getElementById('home-notes-list')
  if (recentNotes.length) {
    homeNoteList.innerHTML = recentNotes.map(n => renderNoteCard(n)).join('')
  } else {
    homeNoteList.innerHTML = `
      <div class="empty-state small">
        <div class="empty-icon">📝</div>
        <div class="empty-text">No notes yet</div>
        <button class="empty-action" onclick="openCreate('note')">Write a note</button>
      </div>`
  }
}

// ================================
// RENDER: PROJECTS
// ================================

let projectFilter = 'all'

async function renderProjects() {
  const [projects, tasks] = await Promise.all([dbGetAll('projects'), dbGetAll('tasks')])

  const filtered = projectFilter === 'all'
    ? projects
    : projects.filter(p => p.status === projectFilter)

  const sorted = [...filtered].sort((a,b) => b.created_at.localeCompare(a.created_at))
  const list   = document.getElementById('projects-list')

  if (!sorted.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🗂️</div>
        <div class="empty-text">No ${projectFilter === 'all' ? '' : projectFilter} projects</div>
        <div class="empty-sub">Create your first project to start tracking work.</div>
        <button class="btn-primary" onclick="openCreate('project')">New Project</button>
      </div>`
    return
  }

  list.innerHTML = sorted.map(p => renderProjectCard(p, tasks)).join('')
}

// ================================
// RENDER: TASKS
// ================================

let taskFilter = 'all'

async function renderTasks() {
  const [tasks, projects] = await Promise.all([dbGetAll('tasks'), dbGetAll('projects')])

  const filtered = taskFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === taskFilter)

  const sorted = [...filtered].sort((a,b) => b.created_at.localeCompare(a.created_at))
  const list   = document.getElementById('tasks-list')

  if (!sorted.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <div class="empty-text">No ${taskFilter === 'all' ? '' : taskFilter} tasks</div>
        <div class="empty-sub">Break your projects into tasks you can act on.</div>
        <button class="btn-primary" onclick="openCreate('task')">New Task</button>
      </div>`
    return
  }

  list.innerHTML = sorted.map(t => renderTaskCard(t, projects)).join('')
}

// ================================
// RENDER: NOTES
// ================================

async function renderNotes() {
  const notes  = await dbGetAll('notes')
  const sorted = [...notes].sort((a,b) => b.created_at.localeCompare(a.created_at))
  const list   = document.getElementById('notes-list')

  if (!sorted.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">No notes yet</div>
        <div class="empty-sub">Capture ideas, decisions, and plans here.</div>
        <button class="btn-primary" onclick="openCreate('note')">New Note</button>
      </div>`
    return
  }

  list.innerHTML = sorted.map(n => renderNoteCard(n)).join('')
}

// ================================
// RENDER: PROFILE
// ================================

async function renderProfile() {
  const name     = getUserName()
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  document.getElementById('profile-avatar-display').textContent = initials
  document.getElementById('profile-name-display').textContent   = name

  const [tasks, projects, notes] = await Promise.all([
    dbGetAll('tasks'), dbGetAll('projects'), dbGetAll('notes')
  ])
  document.getElementById('ps-projects').textContent = projects.length
  document.getElementById('ps-tasks').textContent    = tasks.length
  document.getElementById('ps-notes').textContent    = notes.length
}

// ================================
// CARD RENDERERS
// ================================

function renderTaskCard(task, projects = []) {
  const project = projects.find(p => p.id === task.project_id)
  const isDone  = task.status === 'done'
  const meta    = [
    project ? project.name : null,
    task.due_date ? formatDate(task.due_date) : null
  ].filter(Boolean).join(' · ')

  return `
    <div class="task-card" onclick="toggleTask('${task.id}')">
      <div class="task-check ${isDone ? 'done' : ''}"></div>
      <div class="task-body">
        <div class="task-title ${isDone ? 'done' : ''}">${escHtml(task.title)}</div>
        ${meta ? `<div class="task-meta">${escHtml(meta)}</div>` : ''}
      </div>
      <span class="priority-badge ${task.priority}">${capitalize(task.priority)}</span>
    </div>`
}

function renderProjectCard(project, tasks = []) {
  const projectTasks = tasks.filter(t => t.project_id === project.id)
  const doneTasks    = projectTasks.filter(t => t.status === 'done').length
  const progress     = projectTasks.length ? Math.round((doneTasks / projectTasks.length) * 100) : 0

  return `
    <div class="project-card">
      <div class="project-card-top">
        <div class="project-icon" style="background:${project.color}20">
          ${project.emoji}
        </div>
        <div class="project-info">
          <div class="project-name">${escHtml(project.name)}</div>
          ${project.description ? `<div class="project-desc">${escHtml(project.description)}</div>` : ''}
        </div>
        <span class="project-status-pill ${project.status}">${capitalize(project.status)}</span>
      </div>
      <div class="project-progress-bar">
        <div class="project-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="project-card-footer">
        <div class="project-meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          ${projectTasks.length} Task${projectTasks.length !== 1 ? 's' : ''}
        </div>
        ${project.due_date ? `
        <div class="project-meta-item">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Due ${formatDate(project.due_date)}
        </div>` : `<div class="project-meta-item">${progress}%</div>`}
      </div>
    </div>`
      }

function renderNoteCard(note) {
  return `
    <div class="note-card">
      <div class="note-title">${escHtml(note.title)}</div>
      <div class="note-preview">${escHtml(note.content)}</div>
      <div class="note-date">${formatDate(note.created_at)}</div>
    </div>`
}

// ================================
// STATS
// ================================

async function updateStats() {
  const [tasks, projects] = await Promise.all([dbGetAll('tasks'), dbGetAll('projects')])
  document.getElementById('stat-projects').textContent = projects.length
  document.getElementById('stat-tasks').textContent    = tasks.length
  document.getElementById('stat-done').textContent     = tasks.filter(t => t.status === 'done').length
}

// ================================
// PROFILE ACTIONS
// ================================

window.openNameEdit = function() {
  document.getElementById('name-input').value = getUserName()
  document.getElementById('name-modal').classList.remove('hidden')
  document.getElementById('name-overlay').classList.remove('hidden')
  setTimeout(() => document.getElementById('name-input').focus(), 200)
}

window.closeNameEdit = function() {
  document.getElementById('name-modal').classList.add('hidden')
  document.getElementById('name-overlay').classList.add('hidden')
}

window.saveName = function() {
  const val = document.getElementById('name-input').value.trim()
  if (!val) { showToast('Name cannot be empty', 'error'); return }
  saveUserName(val)
  closeNameEdit()
  showToast('Name updated ✅', 'success')
  renderProfile()
  renderHome()
}

window.confirmClearData = function() {
  if (!confirm('Clear ALL data? Projects, tasks, and notes will be permanently deleted.')) return
  const req = indexedDB.deleteDatabase(DB_NAME)
  req.onsuccess = () => { showToast('Data cleared', ''); setTimeout(() => location.reload(), 800) }
}

// ================================
// FILTER BUTTONS
// ================================

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('project-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tab')
    if (!btn) return
    document.querySelectorAll('#project-filters .filter-tab').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    projectFilter = btn.dataset.filter
    renderProjects()
  })

  document.getElementById('task-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tab')
    if (!btn) return
    document.querySelectorAll('#task-filters .filter-tab').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    taskFilter = btn.dataset.filter
    renderTasks()
  })
})

// ================================
// UTILS
// ================================

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''))
  const now = new Date()
  const diff = Math.floor((d - now) / 86400000)
  if (diff === 0)  return 'Today'
  if (diff === 1)  return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

// ================================
// BOOT
// ================================

async function boot() {
  await initDB()

  // Splash out
  setTimeout(() => {
    const splash = document.getElementById('splash')
    splash.classList.add('fade-out')
    setTimeout(() => {
      splash.style.display = 'none'
      document.getElementById('app').classList.remove('hidden')
      switchTab('home')
      updateStats()
    }, 400)
  }, 1000)
}

boot()

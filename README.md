# DevDeck

> Modular Desktop Automation Platform for Developers, DevOps Engineers & Creators.

Inspired by Stream Deck — rebuilt for the command line generation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Tauri v2 (Rust + WebView) |
| Frontend | React 19 + TypeScript + Vite |
| State | Zustand + TanStack Query |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Animations | Framer Motion |
| Drag & Drop | dnd-kit |
| Terminal | xterm.js + node-pty |
| Audio | Howler.js + CPAL (Rust) |
| Database | SQLite (tauri-plugin-sql) |
| Shortcuts | tauri-plugin-global-shortcut |
| AI | Claude API (Anthropic) |
| Testing | Vitest + Playwright |

---

## Project Roadmap

### Phase 1 — Setup & Foundation (Weeks 1–3)
- [x] Project structure
- [ ] Node.js + Rust + Tauri CLI installation
- [ ] SQLite migrations
- [ ] CI/CD (GitHub Actions — Win/Linux/macOS)
- [ ] Logging (tracing Rust + console frontend)

### Phase 2 — Core UI Shell (Weeks 4–7)
- [ ] Dashboard with drag & drop grid (dnd-kit)
- [ ] Widget system
- [ ] Light/Dark theme + customisation
- [ ] Animated transitions (Framer Motion)
- [ ] Profile management (CRUD + export/import)
- [ ] Button/action system with icons and states

### Phase 3 — Developer Tools (Weeks 8–12)
- [ ] Embedded terminal (xterm.js + node-pty)
- [ ] Multi-tab terminal
- [ ] Git integration (pull/push/commit/branch + GitHub/GitLab)
- [ ] Docker integration (start/stop/restart/logs/compose)
- [ ] Global shortcuts + conflict detection

### Phase 4 — Automation System (Weeks 13–16)
- [ ] Script execution (PowerShell, Bash, CMD)
- [ ] Keyboard & mouse macros
- [ ] Multi-step workflows with conditions
- [ ] Scheduled automation
- [ ] Process manager (launch/kill/background)

### Phase 5 — Soundboard (Weeks 17–19)
- [ ] Audio playback (Howler.js)
- [ ] Instant triggering, loop, volume per clip
- [ ] Output device routing (CPAL Rust)
- [ ] Virtual microphone routing
- [ ] Global hotkeys for soundboard

### Phase 6 — Monitoring & Observability (Weeks 20–22)
- [ ] CPU / RAM / Disk / Network / GPU (sysinfo Rust)
- [ ] Temperature monitoring
- [ ] Process monitoring + resource alerts
- [ ] Docker metrics
- [ ] Grafana / Prometheus / CI/CD status integration

### Phase 7 — Communication (Weeks 23–25)
- [ ] Discord RPC (rich presence, mute/unmute, PTT)
- [ ] Clipboard snippets manager
- [ ] Notification center
- [ ] Quick message / status shortcuts

### Phase 8 — Plugin System (Weeks 26–31)
- [ ] Plugin loader + registry + lifecycle
- [ ] ACL sandbox + permissions
- [ ] TypeScript Plugin SDK (actions, widgets, events)
- [ ] Plugin marketplace UI (install/update/ratings)
- [ ] First-party plugins (git, docker, soundboard)

### Phase 9 — AI Features (Weeks 32–34)
- [ ] Claude API integration (Anthropic)
- [ ] Shell command generation
- [ ] Error & log explanation
- [ ] DevOps contextual assistant
- [ ] Workflow suggestions
- [ ] Optional Ollama local backend

### Phase 10 — Security, Polish & Release (Weeks 35–38)
- [ ] SQLite encryption (SQLCipher)
- [ ] Secrets vault
- [ ] Execution sandboxing
- [ ] Cross-platform testing (Win/Linux/macOS/Android)
- [ ] Performance profiling (< 3s startup, minimal RAM)
- [ ] User + Plugin SDK documentation
- [ ] GitHub Releases + auto-update

---

## Project Structure

```
DevDeck/
├── .github/workflows/        # CI/CD (build Win/Linux/macOS)
├── src/                      # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── layout/           # AppLayout, Sidebar, Topbar
│   │   ├── dashboard/        # Grid, widgets
│   │   ├── terminal/         # xterm.js integration
│   │   ├── soundboard/       # Audio player UI
│   │   ├── monitoring/       # CPU/RAM/GPU charts
│   │   ├── git/              # Git panel
│   │   ├── docker/           # Docker panel
│   │   ├── ai/               # AI chat
│   │   ├── plugins/          # Marketplace UI
│   │   ├── settings/         # Settings panels
│   │   ├── shortcuts/        # Shortcut recorder
│   │   └── ui/               # shadcn/ui base components
│   ├── pages/                # Route-level page components
│   ├── store/                # Zustand stores
│   │   ├── profileStore.ts   # Profiles, pages, buttons
│   │   ├── themeStore.ts     # Theme + accent color
│   │   └── uiStore.ts        # Active panel, sidebar state
│   ├── services/
│   │   ├── tauri/            # IPC wrappers (system, shell)
│   │   └── ai/               # Claude API client
│   ├── plugins/
│   │   ├── sdk/              # Plugin SDK TypeScript types
│   │   ├── loader/           # Dynamic plugin loading
│   │   └── registry/         # Action & widget registry
│   ├── types/                # Shared TypeScript interfaces
│   ├── utils/                # cn(), formatBytes(), generateId()
│   └── styles/globals.css    # Tailwind + CSS variables
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── commands/         # Tauri invoke handlers
│   │   │   ├── system.rs     # CPU, RAM, processes
│   │   │   ├── shell.rs      # PowerShell/Bash/CMD execution
│   │   │   ├── audio.rs      # CPAL device listing
│   │   │   └── automation.rs # Shortcut registration
│   │   ├── monitoring/       # SystemMonitor struct (sysinfo)
│   │   ├── database/
│   │   │   └── migrations/   # SQL migration files
│   │   ├── security/
│   │   │   ├── encryption.rs # AES-256-GCM secrets vault
│   │   │   └── permissions.rs # Plugin permission model
│   │   ├── plugins/
│   │   │   ├── registry.rs   # PluginManifest + status
│   │   │   └── loader.rs     # Load from filesystem
│   │   ├── lib.rs            # App setup, plugin registration
│   │   └── main.rs           # Entry point
│   ├── Cargo.toml
│   └── tauri.conf.json
├── plugins/                  # First-party DevDeck plugins
│   ├── devdeck-sdk/          # Shareable SDK package
│   ├── devdeck-git/
│   └── devdeck-docker/
├── tests/
│   ├── unit/                 # Vitest unit tests
│   └── e2e/                  # Playwright E2E tests
└── docs/                     # Architecture + API docs
```

---

## Prerequisites

Before running, install:

1. **Node.js 22+** — [nodejs.org](https://nodejs.org)
2. **Rust** — [rustup.rs](https://rustup.rs)
3. **Tauri CLI** — `cargo install tauri-cli --version "^2.0"`
4. **Windows build tools** (Windows only) — `npm install -g windows-build-tools`

## Getting Started

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## Functional Specifications

See [SPECS.md](docs/SPECS.md) for the full functional specifications.

---

## Author

**AIphahs** — Software Engineering Graduate · Full Stack Developer · DevOps Enthusiast · Gamer · Artist

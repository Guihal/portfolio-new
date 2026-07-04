---
repo: mamonov.net-front
owner: Guihal
source: github
scanned_at: "2026-05-22T19:29:00+03:00"
language: Vue
stars: 1
last_pushed: "2026-04-05T09:18:42Z"
commits_count: 2
tech_stack:
  - Nuxt 4
  - Vue 3
  - TypeScript
  - Pinia
  - SCSS
  - Tailwind CSS v4
  - Nuxt UI v4
  - pnpm
  - ESLint
  - Prettier
portfolio_worthy: true
screenshot_needed: false
priority: 8
---

# mamonov.net-front

**Cybersecurity Education Platform — Interactive OS Simulator**

A full-featured educational platform that teaches cybersecurity awareness through an interactive desktop OS simulation. Users navigate realistic scenarios (home Wi-Fi, office phishing, social engineering) inside a simulated operating system with draggable windows, a browser, email client, messenger, file explorer, and VPN client — all built as Vue components.

## What It Does

The platform delivers cybersecurity lessons as immersive simulations. Each lesson configures the OS environment declaratively: which programs are available, what emails/messages/sites are pre-loaded, and what user actions trigger success or failure. A game controller tracks user steps, enforces lesson flow, and provides feedback through a "Мамонтёнок" (little mammoth) mascot with emotional states.

## Key Technical Highlights

- **Custom Window Manager** built from scratch in Vue 3: drag & drop, 8-direction resize, fullscreen, collapse to taskbar, z-order focus management, bounds calculation with reactive + plain object dual layers
- **Declarative Lesson Config** (`LessonConfig`) fully describes OS state, program content (sites, emails, chats), and game event handlers via `provide/inject` to the `GameController`
- **Program Ecosystem**: Browser (with address bar, tabs, bookmarks, Vue-rendered "sites"), Mail (folders, attachments, messages), Messenger (chats, avatars, message history), Explorer (file tree), VPN (Wi-Fi security lessons)
- **Isolated OS Mode** (`useOsIsolated`) prevents URL conflicts with Nuxt router while maintaining the illusion that the OS controls navigation
- **Desktop Simulation**: Grid-placed shortcuts, taskbar with pinned apps and window indicators, hover previews via `html-to-image`
- **Architecture**: Lazy-loaded async components for programs, `useState` for global window registry, reactive bounds system for CSS variables

## Recent Commits

Only 2 commits in the repository — early-stage project with substantial initial codebase:

| Date | Message |
|------|---------|
| 2026-04-05 12:18 MSK | `Пуш` — initial push (likely full project upload) |
| 2026-04-05 11:55 MSK | `Dct` — pre-push commit |

## Why It Belongs in the Portfolio

1. **Unique concept**: A full OS simulator as a teaching tool is a rare and visually compelling portfolio piece
2. **Deep Vue 3 expertise**: Custom composables, reactive systems, provide/inject patterns, async component loading
3. **Complex UI engineering**: Window manager from scratch — demonstrates advanced DOM manipulation and state architecture
4. **Education + product crossover**: Real-world applicability for security training, corporate onboarding, or gamified learning
5. **Modern stack**: Nuxt 4, TypeScript, Tailwind v4, Pinia — current-generation tooling

## Portfolio Placement Suggestion

Category: **Product / Education**  
Highlight: Interactive OS simulator with cybersecurity curriculum  
Ideal showcase: Animated GIF/video of window dragging, lesson progression, and mascot reactions  
Missing: Live deployment URL — if one is created, immediately queue for screenshots

# LibreLMS — Frontend

Learning Management System frontend: courses, lessons, quizzes, progress tracking, blog and a 4-role permission system (Admin, Content Manager, Instructor, Student).

## Tech

- Next.js 16 (App Router, React Compiler)
- TypeScript
- Tailwind CSS v4
- Biome (tabs, 4-width indent)
- Bun as package manager

## Run locally

```bash
bun install
bun dev
```

Open http://localhost:3000.

The app currently runs against a **mock API** (`src/lib/api/mock/`) backed by localStorage — it mirrors the future Strapi backend routes 1:1 and enforces the same permission rules. To switch to a real backend, set:

```
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://your-strapi-url
```

## Demo accounts

| Role | Credentials |
|---|---|
| Admin | admin@librelms.dev / admin123 |
| Content Manager | manager@librelms.dev / manager123 |
| Instructor | instructor@librelms.dev / instructor123 |
| Student | student@librelms.dev / student123 |

## Features

- **Auth** — login/register, JWT stored client-side, role-aware navigation
- **Courses** — public browse + search; detail page with lesson list; enroll flow
- **Lessons** — sequential viewer (text or embedded video), mark complete, per-course progress % that persists
- **Quizzes** — MCQ editor for staff, sanitized quiz-taking for students, server-side auto-grading, stored results with history
- **Roles** — Admin (stats dashboard, user role management, full oversight), Content Manager (all courses + blog), Instructor (own courses only), Student (enroll, learn, take quizzes)
- **Blog** — draft/publish workflow; drafts hidden from public; staff-only management

## Scripts

```bash
bun dev       # dev server
bun run build # production build
bun run lint  # biome check
bun run format # biome format
```

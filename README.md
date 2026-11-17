# CampusConnect — Student Management Portal

A responsive multi-page frontend built with **Next.js 15** and **React 19** for the CS3503 Full Stack Development-II assessment.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Pages

| Route | Page |
| --- | --- |
| `/` | Landing page |
| `/login` | Login |
| `/dashboard` | Student dashboard — courses, pending/completed assignments, attendance, recent activity, upcoming deadlines |
| `/students` | Student listing with search and department filter |
| `/students/[id]` | Student profile — info, skills, enrolled courses, attendance, assignment status |
| `/courses` | Course cards with faculty, credits and progress |
| `/courses/[id]` | Course details — syllabus, assignments, classmates |
| `/assignments` | Assignment management with status filters and submission |
| `/profile` | Student profile |
| `/settings` | Account, notifications, appearance and security settings |

## Highlights

- Sidebar dashboard layout with top bar (search, notifications, profile menu, logout)
- Fully responsive — slide-out menu on mobile, tables collapse into cards
- Assignment submission modal; submissions update the dashboard and sidebar badge instantly
- Swappable accent colour (Settings → Appearance)
- Uses static dummy data from `data/data.js`

## Backend — Campus Service Request & Issue Management API

The [`backend/`](backend) folder contains a separate **Node.js + Express + MongoDB REST API** (JWT auth, role-based access, status workflow, search & filters, aggregation dashboard). See [backend/README.md](backend/README.md) for setup, endpoints and demo accounts.

```bash
cd backend && npm install && npm run dev   # http://localhost:5000
npm test                                   # 34 end-to-end tests
```

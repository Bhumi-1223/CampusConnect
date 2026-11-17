# Campus Service Request & Issue Management System — Backend API

A secure REST API where **students report campus problems** (broken PCs, Wi-Fi, hostel maintenance, electrical faults…) and **admins review, prioritise, assign and resolve them** through a strict status workflow.

**Stack:** Node.js · Express · MongoDB + Mongoose · JWT · bcrypt (bcryptjs) · express-validator · Helmet · rate limiting

---

## Quick start

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:5000
```

No database setup is needed. If `MONGO_URI` is empty, the server starts a real MongoDB on this machine (via `mongodb-memory-server`), stores its data in `backend/.data`, and **seeds demo data automatically** the first time. To use your own MongoDB or Atlas, copy `.env.example` to `.env` and set `MONGO_URI`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start with auto-restart on file changes |
| `npm start` | Start normally |
| `npm run seed` | Wipe the database and reload the demo data |
| `npm test` | Run the 34 end-to-end API tests |

### Demo accounts (local testing only)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@campus.edu | Admin@123 |
| Staff | ravi@campus.edu | Staff@123 |
| Staff | meena@campus.edu | Staff@123 |
| Student | aarav@campus.edu | Student@123 |
| Student | priya@campus.edu / rohan@campus.edu / sneha@campus.edu | Student@123 |

---

## Project structure

```
backend/
├── src/
│   ├── server.js            # starts DB + HTTP server, seeds demo data if empty
│   ├── app.js               # Express app: security middleware, routes, error handling
│   ├── config/db.js         # MongoDB connection (MONGO_URI or built-in MongoDB)
│   ├── models/              # Mongoose schemas: User, ServiceRequest
│   ├── middleware/          # auth (JWT + role check), validation, error handler
│   ├── controllers/         # business logic for auth, requests, admin dashboard
│   ├── routes/              # URL → middleware → controller wiring
│   └── utils/               # workflow rules, constants, ApiError helper
├── scripts/                 # seed data
├── tests/api.test.js        # end-to-end tests (node:test + supertest)
└── postman_collection.json  # ready-to-import Postman / Thunder Client collection
```

## Roles

| Role | Can do |
| --- | --- |
| **Student** | Register, login, create requests, see **only their own** requests and the admin's response, edit/delete **only while Pending** |
| **Staff** | Login, see requests **assigned to them** |
| **Admin** | See all requests with search & filters, view any request, change status & priority, assign to staff, add a response, delete, view dashboard statistics |

Public registration always creates a **student** — the `role` field cannot be set by the client.

## Endpoints

All `/api/requests` and `/api/admin` routes need `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register (student) — returns token |
| POST | `/api/auth/login` | Public | Login — returns token |
| GET | `/api/auth/me` | Logged in | Current user |
| POST | `/api/requests` | Student | Create a request |
| GET | `/api/requests` | Student / Staff / Admin | List requests (own / assigned / all) |
| GET | `/api/requests/:id` | Owner / Assigned staff / Admin | Get one request |
| PUT | `/api/requests/:id` | Owner (Pending only) | Update title, description, category, location |
| DELETE | `/api/requests/:id` | Owner (Pending only) / Admin | Delete a request |
| PUT | `/api/requests/:id/status` | Admin | Change status, set priority, add response |
| PUT | `/api/requests/:id/assign` | Admin | Assign to a staff member |
| GET | `/api/admin/dashboard` | Admin | Statistics (MongoDB aggregation) |
| GET | `/api/admin/staff` | Admin | Users that requests can be assigned to |
| GET | `/api/meta` | Public | Categories, priorities, statuses and workflow |
| GET | `/api/health` | Public | Health check |

### Search, filter, sort and paginate — `GET /api/requests`

| Query | Example |
| --- | --- |
| `status` | `?status=In Progress` |
| `priority` | `?priority=High` |
| `category` | `?category=Internet` |
| `search` | `?search=wifi` — case-insensitive match on title, description, location |
| `assignedTo` | `?assignedTo=<userId>` (admin) |
| `sort` | `newest` (default), `oldest`, `updated`, `priority` |
| `page`, `limit` | `?page=2&limit=5` |

## Status workflow

```
Pending → Under Review → Assigned → In Progress → Resolved → Closed
   └──────────┴──→ Rejected   (only from Pending or Under Review)
```

Any other jump is refused with **400**, e.g. `Invalid status change: Pending → Closed. Allowed next: Under Review, Rejected`. Every change is stored in `statusHistory` with who made it and when. Extra rules: moving to *Assigned* requires an assignee, and *Rejected* requires an `adminResponse` explaining why.

## Error responses

| Code | When |
| --- | --- |
| 400 | Validation failed, invalid id, invalid status jump, editing a non-Pending request |
| 401 | No token, invalid or expired token, wrong login |
| 403 | Wrong role, or not the owner |
| 404 | Request / user / route not found |
| 409 | Email already registered |
| 429 | Too many login attempts |

All errors share one shape: `{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }`.

## Database design

**User** — `name`, `email` (unique), `password` (bcrypt hash, never returned), `role` (student / staff / admin), `department`, `createdAt`, `updatedAt`

**ServiceRequest** — `title`, `description`, `category`, `priority`, `status`, `createdBy` → **ref User**, `assignedTo` → **ref User**, `adminResponse`, `location`, `statusHistory[]` (from, to, changedBy → ref User, note, at), `createdAt`, `updatedAt`

Indexes: unique email; `{status, priority, category}` for admin filters; `{createdBy, createdAt}` for "my requests"; a text index on title + description.

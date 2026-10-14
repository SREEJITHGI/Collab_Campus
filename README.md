# CollabCampus — The Smart Campus Collaboration Platform

CollabCampus is a centralized full-stack university collaboration ecosystem designed to connect students, faculty, administrators, and placement coordinators. The platform streamlines academic project management, peer notes sharing, verified internship discovery, campus events, peer-to-peer marketplace & lost-and-found, and facilities service requests.

---

## 🚀 Key Modules & Capabilities

| Module | Features & Capabilities | Route |
| :--- | :--- | :--- |
| **Authentication & RBAC** | JWT authentication, bcrypt passwords, Zod validation, role-based access for Student, Faculty, Admin, and skill chips profile manager. | `/login`, `/register`, `/profile` |
| **Project Collaboration** | Team roster recruitment by skills, task delegation, and interactive 3-column Kanban board (`To Do`, `In Progress`, `Completed`) with real-time progress metering. | `/projects`, `/projects/:id` |
| **Notes Hub** | Academic repository filtered by department and semester with secure uploads and real-time download tracking. | `/notes` |
| **Internship Discovery** | Career opportunities board with saved bookmarks and 5-stage student pipeline tracking (`Interested`, `Applied`, `Interview`, `Selected`, `Rejected`). | `/internships` |
| **Events & Workshops** | University seminars, hackathons, and guest lectures with interactive 1-click RSVP and live attendance seat limits. | `/events` |
| **Marketplace & Lost-Found** | Peer-to-peer textbook and gadget trading, free giveaways, and misplaced item recovery with direct seller contact. | `/marketplace` |
| **Facilities Service Desk** | Campus IT/hostel maintenance ticketing with priority tags, multi-step status workflow, comment logs, and audit histories. | `/tickets` |
| **Notifications Center** | Activity alerts for project squad invites, service ticket status updates, and campus announcements. | `/notifications` |
| **Role Dashboards** | Dedicated portals for Students (my projects & applications), Faculty (supervised squads & ticket triage), and Admins (platform-wide metrics & tickets). | `/dashboard`, `/faculty`, `/admin` |

---

## 🛠️ Architecture & Tech Stack

### Frontend (`/client`)
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS with custom emerald design system (`#059669`), responsive glassmorphism, and modern cards
- **Routing**: React Router v7 with protected route guards
- **HTTP Client**: Axios with centralized request/response interceptors & token auto-injection
- **Icons**: Lucide React

### Backend (`/server`)
- **Runtime**: Node.js (v24+) & Express.js
- **Architecture**: MVC pattern (`controllers/`, `services/`, `repositories/`, `middleware/`, `routes/`, `validators/`)
- **Security**: Helmet, CORS, Express-Rate-Limit, bcryptjs password hashing, JWT authentication
- **Validation**: Zod schema validation with standardized error mapping
- **Testing**: Node.js native test runner (`node:test`) + Supertest (28 automated integration tests)

### Database
- **Engine**: PostgreSQL relational database with 18 normalized tables and optimized indexes.
- **Driver**: Standard `pg.Pool` for native PostgreSQL when `DATABASE_URL` is set, with an embedded zero-setup fallback (`pg-mem`) for instantaneous local development.
- **Tables (18)**:
  `users`, `student_profiles`, `faculty_profiles`, `projects`, `project_members`, `tasks`, `notes`, `internships`, `saved_opportunities`, `applications`, `events`, `event_registrations`, `announcements`, `marketplace_listings`, `service_tickets`, `ticket_comments`, `ticket_status_history`, `notifications`

---

## 🔑 Pre-Seeded Demo Credentials

The platform comes with ready-to-test demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `Password123!` |
| **Faculty** | `faculty@campus.edu` | `Password123!` |
| **Administrator** | `admin@campus.edu` | `AdminPassword123!` |

*(One-click demo login buttons are also available on the Login page for convenience!)*

---

## 🏁 Quickstart Guide

### 1. Prerequisites
- Node.js (v18 or higher; tested on Node v24)
- npm (v9+)

### 2. Installation
Install dependencies in both client and server directories:

```bash
# In the project root:
npm --prefix server install
npm --prefix client install
```

### 3. Run Database Migrations & Seeds
Populate all 18 tables with demo accounts, projects, notes, and campus data:

```bash
npm --prefix server run seed
```

### 4. Running the Development Servers

#### Terminal 1: Backend Server (Port 5000)
```bash
cd server
npm run dev
# or: npm start
```
- API Base: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

#### Terminal 2: Frontend Application (Port 5173)
```bash
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

Run the automated integration test suite across all 4 suites:

```bash
cd server
npm test
```

### Test Suite Summary (28/28 Passing):
- **Health Suite** (`tests/health.test.js`): 2 tests verifying server health and 404 responses.
- **Authentication Suite** (`tests/auth.test.js`): 8 tests verifying user registration, duplicate prevention, password hashing, JWT issue, profile fetching, and user directory search.
- **Project Collaboration Suite** (`tests/projects.test.js`): 8 tests verifying project creation, team member addition, Kanban task status transitions, and RBAC authorization.
- **Services & Modules Suite** (`tests/modules.test.js`): 10 tests verifying notes upload & download count tracking, internship publishing & application pipeline progression, service ticket submission, status audit log, and comment threads.

---

## 📄 Production Build Verification

```bash
cd client
npm run build
```
Generates the optimized static production bundle in `client/dist/`.

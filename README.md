<div align="center">

# 🎓 CollabCampus
### *The Smart Campus Collaboration & Operations Platform*

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-28%2F28%20Passing-059669?style=for-the-badge&logo=checkmarx&logoColor=white)](https://github.com/SREEJITHGI/Collab_Campus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**CollabCampus** is an enterprise-grade academic collaboration ecosystem engineered to unify students, faculty, administrative staff, and placement coordinators into a single, cohesive digital university campus.

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Demo Accounts](#-demo-accounts) • [Getting Started](#-getting-started) • [API Documentation](#-api-endpoints) • [Database Design](#-database-schema)

---

</div>

## 📌 Executive Summary

Modern university campuses often suffer from fragmented communication: academic projects are coordinated over scattered chat groups, study resources are buried in ad-hoc drives, internship postings go unnoticed, and facility maintenance complaints disappear into bureaucratic backlogs.

**CollabCampus** addresses these pain points with a unified platform providing:
1. **Interactive Team Formation & Kanban**: Skill-matched peer recruitment and drag-and-drop task pipelines.
2. **Peer-to-Peer Notes Knowledge Base**: Department and semester-filtered lecture notes repository with automated download analytics.
3. **Internship Application Pipeline**: Career opportunities with student application status lifecycles (`Interested` ➔ `Applied` ➔ `Interview` ➔ `Selected`).
4. **Campus Events & Instant RSVP**: University workshops and hackathons with real-time capacity and attendance counters.
5. **Student Marketplace & Lost-and-Found**: Sustainable circular campus economy for textbooks, equipment, and misplaced items.
6. **Campus Facility Helpdesk**: Service ticketing with status audit logs and comment feeds.
7. **Role-Tailored Dashboards**: Specialized views for Students, Faculty, and University Administrators.

---

## ⚡ Key Features

```
                                COLLABCAMPUS PLATFORM
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                                                                             │
  │   🎓 STUDENTS                  👨‍🏫 FACULTY                   🛡️ ADMINS         │
  │   • Project Kanban Boards      • Supervised Squads          • Platform Analytics│
  │   • Peer Notes Sharing         • Notes Verification         • Staff Ticket Ops  │
  │   • Job Application Funnel     • Campus Event Hosting       • User Management   │
  │   • Event RSVP & Badging       • Department Service Desk    • Global Auditing   │
  │   • Buy/Sell Marketplace       • Broadcast Announcements    • Database Status   │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘
```

### 1. 🗂️ Academic Project Collaboration & Kanban
* Form project squads with role-based member permissions (`Leader`, `Member`).
* Skill-matched recruitment: filter registered students by programming languages and frameworks.
* Real-time 3-column Kanban workflow (`To Do`, `In Progress`, `Completed`).
* Dynamic project completion progress meter calculated automatically based on task states.

### 2. 📚 Academic Notes Hub
* Categorized by University Department (`Computer Science`, `IT`, `ECE`, `Mechanical`, `Civil`, `Business Studies`) and Academic Semester (`1` through `8`).
* Secure file uploads with Multer storage and automatic MIME-type verification.
* Download counters and metadata tracking.

### 3. 💼 Internship Portal & Application Tracker
* Verified internship listings with compensation types (`Paid`, `Unpaid`), stipends, eligibility criteria, and application deadlines.
* Personal bookmarking system ("Saved Opportunities").
* 5-stage interactive application funnel:
  $$\text{Interested} \longrightarrow \text{Applied} \longrightarrow \text{Interview} \longrightarrow \text{Selected} \lor \text{Rejected}$$

### 4. 🎟️ Campus Events & Workshops
* Interactive event feed for technical hackathons, guest lectures, and cultural fests.
* 1-click RSVP toggling with live attendance counters and capacity thresholds.
* Prevent overbooking with automatic "Fully Booked" locks.

### 5. 🛍️ Peer Marketplace & Lost-and-Found
* Circular campus marketplace for textbooks, lab calculators, drawing boards, and electronic gadgets.
* Dedicated **Lost & Found** category with direct finder-to-owner contact cards.
* Filter by price (`Free / Claimable`, specific dollar limits) or category.

### 6. 🛠️ Facilities & IT Service Desk
* Report campus infrastructural faults (Wi-Fi dropouts, lab hardware, hostel electrical maintenance).
* Ticket prioritization: `Low`, `Medium`, `High`, `Urgent`.
* Full chronological status timeline and audit history (`Open` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`).
* Integrated comment thread for direct student-to-technician dialogue.

### 7. 🔔 Notifications & Activity Center
* Unread badges and activity stream for project invites, task assignments, ticket status shifts, and university alerts.

---

## 🏛️ System Architecture

```
                       ┌────────────────────────────────┐
                       │          Vite + React          │
                       │    Tailwind CSS Emerald UI     │
                       └───────────────┬────────────────┘
                                       │ Axios HTTP Requests
                                       │ (Bearer JWT Auth)
                                       ▼
                       ┌────────────────────────────────┐
                       │       Express.js REST API      │
                       │   Security: Helmet / RateLimit │
                       │    Zod Request Schema Parsing  │
                       └───────────────┬────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────────┐
│     PostgreSQL Relational     │             │     Embedded In-Memory Fallback   │
│   (Production / Native DB)    │             │       (Zero-Setup pg-mem DB)      │
│     18 Normalized Tables      │             │     Auto-migrated & Seed-ready    │
└───────────────────────────────┘             └───────────────────────────────────┘
```

---

## 🔑 Demo Accounts

Use these pre-configured credentials to evaluate role-specific dashboards:

| Persona | Role | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Rivera** | `student` | `student@campus.edu` | `Password123!` | Create projects, upload notes, apply for jobs, file tickets, RSVP events |
| **Dr. Sarah Jenkins** | `faculty` | `faculty@campus.edu` | `Password123!` | Supervise student squads, publish course notes, host campus events |
| **Marcus Vance** | `admin` | `admin@campus.edu` | `AdminPassword123!` | Full campus control, ticket triage, system metrics & analytics |

> 💡 *Quick Tip: The Sign In page features one-click demo login buttons to instantly autofill and sign in.*

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher (fully verified on Node v24)
* **npm**: v9.0.0 or higher
* *(Optional)* **PostgreSQL**: Not required for local testing — CollabCampus contains an automated embedded relational database engine.

### 1. Clone the Repository
```bash
git clone https://github.com/SREEJITHGI/Collab_Campus.git
cd Collab_Campus
```

### 2. Install Dependencies
```bash
# Install both backend and frontend dependencies
npm --prefix server install
npm --prefix client install
```

### 3. Seed Database & Migration
Initialize all 18 relational tables, indexes, and demo datasets:
```bash
npm --prefix server run seed
```

### 4. Start Development Servers

Open two terminal windows:

#### Terminal 1 — Backend REST API (Port 5000)
```bash
cd server
npm run dev
```
*Health Check: `http://localhost:5000/api/health`*

#### Terminal 2 — Frontend Single Page App (Port 5173)
```bash
cd client
npm run dev
```
*Application URL: `http://localhost:5173`*

---

## 🧪 Testing & Quality Assurance

CollabCampus includes 28 automated integration tests using the native Node.js test runner and Supertest:

```bash
cd server
npm test
```

### Test Suite Results (100% Pass Rate):
```text
✔ Authentication & Authorization Suite (Module A)
  ✔ POST /api/auth/register - register student user with profile
  ✔ POST /api/auth/register - reject duplicate email addresses
  ✔ POST /api/auth/register - reject invalid payload schema with 400
  ✔ POST /api/auth/login - fail on invalid credentials
  ✔ POST /api/auth/login - succeed with valid credentials and sign JWT
  ✔ GET /api/auth/me - reject unauthenticated requests
  ✔ GET /api/auth/me - return full authenticated profile
  ✔ GET /api/users - search directory and filter by role

✔ CollabCampus Backend API Health Test
  ✔ GET /api/health - return operational DB and server status
  ✔ GET /api/nonexistent - return 404 handler with JSON error

✔ Project Collaboration & Tasks Suite (Module B)
  ✔ POST /api/projects - create project and assign owner as leader
  ✔ GET /api/projects - retrieve projects with search and filter
  ✔ POST /api/projects/:id/members - recruit member into squad
  ✔ POST /api/projects/:id/tasks - create project task
  ✔ PUT /api/tasks/:id - transition task across Kanban stages
  ✔ PUT /api/projects/:id - block unauthorized updates (403 Forbidden)
  ✔ GET /api/projects/:id - calculate dynamic progress meter
  ✔ DELETE /api/tasks/:id - remove task

✔ Campus Services, Notes & Internships Suite (Modules C, D, F)
  ✔ POST /api/notes - upload course notes metadata
  ✔ GET /api/notes - filter notes by department and semester
  ✔ GET /api/notes/:id/download - increment download counter
  ✔ POST /api/internships - publish internship opportunity
  ✔ POST /api/internships/:id/save - toggle saved opportunity bookmark
  ✔ POST /api/internships/applications - update 5-stage application pipeline
  ✔ GET /api/internships/applications - retrieve student application history
  ✔ POST /api/tickets - submit campus service ticket
  ✔ PUT /api/tickets/:id/status - transition status & write audit history
  ✔ POST /api/tickets/:id/comments - post comment on service request

ℹ tests 28 | pass 28 | fail 0 | suites 4
```

---

## 🔌 API Endpoints

| Area | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | Public | System uptime & database connection check |
| **Auth** | `POST` | `/api/auth/register` | Public | User registration with academic profile |
| **Auth** | `POST` | `/api/auth/login` | Public | Credentials authentication & JWT issuance |
| **Auth** | `GET` | `/api/auth/me` | Bearer | Current user session & profile data |
| **Directory** | `GET` | `/api/users` | Bearer | Search students/faculty by role and skills |
| **Projects** | `GET` | `/api/projects` | Public | Discover ongoing campus projects |
| **Projects** | `POST` | `/api/projects` | Bearer | Create a new project squad |
| **Projects** | `GET` | `/api/projects/:id` | Public | Fetch project details, squad, and Kanban tasks |
| **Projects** | `POST` | `/api/projects/:id/members` | Squad Leader | Recruit a teammate |
| **Tasks** | `POST` | `/api/projects/:id/tasks` | Squad Member | Create task in Kanban column |
| **Tasks** | `PUT` | `/api/tasks/:id` | Squad Member | Move task (`to_do` ➔ `in_progress` ➔ `completed`) |
| **Notes** | `GET` | `/api/notes` | Public | Filter notes by department and semester |
| **Notes** | `POST` | `/api/notes` | Bearer | Upload notes file and metadata |
| **Notes** | `GET` | `/api/notes/:id/download` | Public | Download file & increment analytics counter |
| **Jobs** | `GET` | `/api/internships` | Public | Browse verified campus internships |
| **Jobs** | `POST` | `/api/internships/:id/save`| Student | Bookmark opportunity |
| **Jobs** | `POST` | `/api/internships/applications`| Student | Update student pipeline stage |
| **Events** | `GET` | `/api/events` | Public | Upcoming workshops, hackathons, and seminars |
| **Events** | `POST` | `/api/events/:id/rsvp` | Bearer | Toggle event RSVP seat reservation |
| **Market** | `GET` | `/api/marketplace` | Public | Browse textbook listings & Lost and Found |
| **Market** | `POST` | `/api/marketplace` | Bearer | Post item for sale or report lost item |
| **Tickets** | `GET` | `/api/tickets` | Bearer | Fetch service tickets by role context |
| **Tickets** | `POST` | `/api/tickets` | Bearer | Submit facility/IT service request |
| **Tickets** | `PUT` | `/api/tickets/:id/status` | Staff/Admin | Update status & record audit log entry |
| **Tickets** | `POST` | `/api/tickets/:id/comments` | Bearer | Post discussion comment on ticket |
| **Alerts** | `GET` | `/api/notifications` | Bearer | Fetch activity notification alerts |
| **Analytics**| `GET` | `/api/analytics` | Public | Platform-wide operational metric counters |

---

## 🗄️ Database Schema

The database consists of **18 normalized tables** connected with foreign keys and cascade rules:

```text
users ───────────┬───< student_profiles
                 ├───< faculty_profiles
                 ├───< projects ───────────────┬───< project_members
                 │                             └───< tasks
                 ├───< notes
                 ├───< internships ────────────┬───< saved_opportunities
                 │                             └───< applications
                 ├───< events ─────────────────────< event_registrations
                 ├───< announcements
                 ├───< marketplace_listings
                 ├───< service_tickets ────────┬───< ticket_comments
                 │                             └───< ticket_status_history
                 └───< notifications
```

---

## 💻 Tech Stack Summary

* **Frontend**: React 18, Vite, React Router 7, Tailwind CSS, Lucide React, Axios
* **Backend**: Node.js, Express.js (MVC Pattern), Zod, Helmet, Express-Rate-Limit, bcryptjs, JSON Web Tokens (JWT), Multer
* **Database**: PostgreSQL (with embedded `pg-mem` local engine)
* **Testing**: Node.js Test Runner (`node:test`), Supertest

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for academic or commercial purposes.

---

<div align="center">

Made with ❤️ for higher education collaboration.

**[⭐ Star this repository on GitHub](https://github.com/SREEJITHGI/Collab_Campus)**

</div>

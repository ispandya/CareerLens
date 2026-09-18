# CareerLens

A career intelligence platform for the internship search - not just an application tracker.

CareerLens helps university students go from "spray and pray" applications to a data-informed job search: it matches resumes against real job postings, tracks the full application and interview pipeline, and surfaces AI-generated feedback and interview prep, all backed by a fully tested, production-deployed full-stack application.

**Live app:** https://careerlens-ivory.vercel.app

---

## The problem

Students applying to internships and new-grad roles typically face:

- Dozens or hundreds of applications tracked in a messy spreadsheet, if at all
- No visibility into which skills are actually missing for a given role
- No structured way to prepare for interviews once they land one
- No sense of what is and is not working in their search

CareerLens addresses all of the above with a single, coherent product rather than a collection of disconnected tools.

---

## Features

### Application tracking
- Full CRUD on applications: company, role, status, location, salary, notes, job URL
- Nine-stage pipeline (Saved -> Applied -> Online Assessment -> Phone Screen -> Interview -> Final Interview -> Offer / Rejected / Withdrawn)
- Multiple interview rounds per application, each with its own notes and scheduled date

### Job intelligence
- Live job search via the Adzuna API, scoped to the Canadian market
- Automatic resume-to-job skill matching with a transparent match score (not a black box)
- Personalized job recommendations generated directly from a user's own resume skills, no manual search required

### AI-powered features (Anthropic Claude)
- Resume feedback: real critique on writing quality, structure, and impact, not just keyword matching
- Interview preparation: technical topics and realistic behavioral/technical questions generated per job posting
- AI-enhanced skill extraction that supplements keyword matching with LLM-based analysis

### Analytics and insight
- Personal dashboard: response rate, interview conversion, full pipeline breakdown
- Company-level insights: application count, interview count, and outcomes per company
- Smart notifications for stale applications and upcoming interviews

### Platform
- JWT authentication with role-based access control (student / admin)
- Admin panel with platform-wide usage statistics and user management
- PDF resume upload with automatic text extraction

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, Passport, RBAC guards |
| AI | Anthropic Claude API |
| External data | Adzuna Job Search API |
| Testing | Vitest |
| CI/CD | GitHub Actions |
| Infra (local) | Docker Compose (Postgres, Redis) |
| Infra (production) | Railway (API + Postgres), Vercel (frontend) |
| Monorepo tooling | pnpm workspaces, Turborepo |

---

## Architecture

CareerLens is a pnpm/Turborepo monorepo with a clean separation between frontend, backend, and shared data layer:

The backend is organized into feature modules (auth, applications, interviews, resume, ai, analytics, admin, notifications, jobs, companies), each with its own service, controller, and DTOs, following NestJS conventions. Every module that touches user data is scoped by authenticated user ID, with ownership checks enforced at the service layer.

---

## API overview

All endpoints are prefixed and grouped by module:

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET|POST|PATCH|DELETE /applications`
- `POST|GET /applications/:id/interviews`, `PATCH|DELETE /interviews/:id`
- `POST /resume`, `POST /resume/upload-pdf`, `POST /resume/analyze`
- `POST /ai/resume-feedback`, `POST /ai/interview-prep`
- `GET /analytics/dashboard`
- `GET /jobs/search`, `GET /jobs/recommendations`
- `GET /companies`
- `GET /notifications`
- `GET /admin/users`, `GET /admin/stats` (admin role required)

---

## Getting started locally

### Prerequisites
- Node.js 20+, pnpm, Docker

### Setup

```bash
git clone https://github.com/ispandya/CareerLens.git
cd career-lens
pnpm install
```

Create `.env` files in `apps/api` and `packages/database` (see `.env.example` in each), including:
- `DATABASE_URL`
- `JWT_SECRET`
- `ANTHROPIC_API_KEY`
- `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`

Start the database:

```bash
docker compose -f infrastructure/docker-compose.yml up -d
pnpm --filter database exec prisma migrate dev
```

Run the app:

```bash
pnpm --filter api start:dev
pnpm --filter web dev
```

---

## Testing and CI

Every push runs a GitHub Actions pipeline that installs dependencies, generates the Prisma client, and runs lint, test, and build across every package in the monorepo. No code reaches `main` without passing all three.

---

## Deployment

- **Backend:** Deployed on Railway, connected to a managed PostgreSQL instance
- **Frontend:** Deployed on Vercel, built from the `apps/web` workspace
- CORS is explicitly scoped to the production frontend origin

---

## Roadmap

- Company intelligence enriched with external data, not just self-reported application history
- A dedicated recommendation engine beyond keyword-based skill matching
- Browser extension for one-click job capture from external job boards

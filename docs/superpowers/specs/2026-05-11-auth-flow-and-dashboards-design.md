# Auth Flow & Role-Based Dashboards — Design

**Date:** 2026-05-11
**Status:** Approved (pending spec review)

## Goal

Complete the end-to-end flow for both user roles already supported in the schema (`student`, `company`): signup → login → role-aware dashboard. Students can browse jobs, apply with one click, and track application status. Companies can post jobs and review/update applicant statuses.

Auth backend (`convex/auth.ts`: `signUp`, `signIn`, `me`) and the `Auth.tsx` page already exist. This spec adds the job/application domain and the post-login experience.

## Scope (locked decisions)

| Decision | Choice |
|---|---|
| Core entity | Jobs / internships |
| Profile model | Application-driven only (no browseable profiles) |
| Job fields | Minimal (title, description, location, type, status) |
| Apply flow | One-click apply (no cover letter, no CV) |
| Company controls | View applicants + update status |
| Post-login route | Single `/dashboard` route, role-dispatched |
| Job discovery | Public `/jobs` listing + "recommended" strip in student dashboard |

Out of scope: file uploads, messaging, browseable profiles, salary fields, skill tags, deadlines, email notifications, password reset.

## 1. Data Model

Add two tables to `convex/schema.ts`:

```ts
jobs: defineTable({
  companyId: v.id("users"),
  title: v.string(),
  description: v.string(),
  location: v.string(),
  type: v.union(v.literal("internship"), v.literal("full-time"), v.literal("part-time")),
  status: v.union(v.literal("open"), v.literal("closed")),
  createdAt: v.number(),
}).index("by_company", ["companyId"])
  .index("by_status", ["status"]),

applications: defineTable({
  jobId: v.id("jobs"),
  studentId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("reviewed"),
    v.literal("accepted"),
    v.literal("rejected"),
  ),
  appliedAt: v.number(),
}).index("by_student", ["studentId"])
  .index("by_job", ["jobId"])
  .index("by_student_and_job", ["studentId", "jobId"]),
```

`by_student_and_job` is used to enforce the "one application per student per job" rule.

## 2. Backend (Convex)

All auth'd functions resolve the caller via the session token (same pattern as `convex/auth.ts`).

### `convex/jobs.ts`

| Function | Kind | Auth | Behavior |
|---|---|---|---|
| `list` | query | public | Returns `status === "open"` jobs, newest first. Includes company name (joined from `users`). |
| `get` | query | public | Single job + company name. |
| `listByCompany` | query | company | Returns all jobs for the calling company (open + closed) with applicant counts. |
| `create` | mutation | company | Inserts job with `status: "open"`, `companyId: caller._id`, `createdAt: Date.now()`. |
| `setStatus` | mutation | company | Toggles `open`/`closed`. Throws if caller is not the job owner. |

### `convex/applications.ts`

| Function | Kind | Auth | Behavior |
|---|---|---|---|
| `apply` | mutation | student | Throws if job not found, job not open, or duplicate (lookup via `by_student_and_job`). Inserts with `status: "pending"`. |
| `listByStudent` | query | student | Returns caller's applications joined with job title, company name, status, appliedAt. |
| `listByJob` | query | company | Validates caller owns the job. Returns applicants with name, email, university, status, appliedAt. |
| `setStatus` | mutation | company | Validates caller owns the job referenced by the application. Updates status. |

Errors are thrown with user-facing Arabic messages (matching existing `Auth.tsx` pattern that strips `[Convex]` prefix).

## 3. Routing & Auth Guard

New routes in `App.tsx`:

| Route | Component | Access |
|---|---|---|
| `/jobs` | `JobsList` | public |
| `/jobs/:id` | `JobDetail` | public (Apply button gated to logged-in students) |
| `/dashboard` | `<RequireAuth><DashboardRouter/></RequireAuth>` | authenticated |

`<RequireAuth>`: reads `api.auth.me`; while loading shows a spinner; if null, redirects to `/login`.

`<DashboardRouter>`: reads `me.role`; renders `<StudentDashboard/>` or `<CompanyDashboard/>`.

**Change to `Auth.tsx`:** replace `navigate("/")` with `navigate("/dashboard")` after successful signup/login.

**Change to `Navbar.tsx`:** when `me` is non-null, show **لوحة التحكم** (Dashboard) + **خروج** (Logout) instead of signup/login CTAs. Logout calls `signOut` mutation (add to `convex/auth.ts`) and clears the local token.

## 4. UI

All pages are Arabic/RTL and reuse existing Tailwind tokens (`brand`, `surface`, `border-light`, `text-primary`, `text-secondary`, `btn-primary`) and the rounded-card aesthetic from `Auth.tsx`.

### `src/pages/Jobs.tsx` (public list)

- Page header + filter chips (all / internship / full-time / part-time).
- Grid of job cards: title, company, location, type badge, "عرض التفاصيل" link.

### `src/pages/JobDetail.tsx` (public detail)

- Full job description, company name, location, type.
- Apply CTA logic:
  - Not logged in → "سجّل دخولك للتقديم" → `/login?role=student`
  - Logged in as company → CTA hidden
  - Logged in as student, not yet applied → "قدّم الآن" button calling `apply`
  - Already applied → disabled state showing current status badge

### `src/pages/dashboard/StudentDashboard.tsx`

- Greeting with `me.name`.
- "وظائف مقترحة" strip: latest 6 open jobs from `jobs.list`, link to `/jobs`.
- "طلباتي" table: job title, company, applied date, status badge.

### `src/pages/dashboard/CompanyDashboard.tsx`

- Header with `me.companyName` + "نشر وظيفة" button (opens inline form: title, description, location, type select).
- "وظائفي" list: title, type, status pill, applicant count, actions: close/reopen, "عرض المتقدمين".
- Applicants view (modal or inline expand): list of applicants with name, email, university, status dropdown.

A small `StatusBadge` component (`src/components/StatusBadge.tsx`) renders the four application statuses with consistent colors.

## 5. Error Handling

- All Convex functions throw `Error` with Arabic messages for user-facing failures (job closed, duplicate application, unauthorized).
- React pages display errors using the same red-banner pattern as `Auth.tsx`.
- Unauthorized access (e.g. company trying to call `apply`) is treated as a programming error and surfaces the raw message — UI prevents reaching these paths.

## 6. Testing (manual smoke)

1. Sign up as company → land on `/dashboard` → post a job.
2. Sign up as student in another browser → see job in `/jobs` and on dashboard strip → apply.
3. Company refreshes → sees applicant → marks "reviewed" → "accepted".
4. Student refreshes → sees updated status.
5. Re-apply attempt → blocked with Arabic error.
6. Close job → no longer in public list; apply attempt → blocked.
7. Logout → Navbar reverts; `/dashboard` redirects to `/login`.

## 7. Files Touched

**New:**
- `convex/jobs.ts`
- `convex/applications.ts`
- `src/pages/Jobs.tsx`
- `src/pages/JobDetail.tsx`
- `src/pages/dashboard/StudentDashboard.tsx`
- `src/pages/dashboard/CompanyDashboard.tsx`
- `src/components/RequireAuth.tsx`
- `src/components/StatusBadge.tsx`

**Modified:**
- `convex/schema.ts` (add `jobs`, `applications`)
- `convex/auth.ts` (add `signOut` mutation)
- `src/App.tsx` (new routes)
- `src/pages/Auth.tsx` (redirect to `/dashboard`)
- `src/components/Navbar.tsx` (logged-in state)

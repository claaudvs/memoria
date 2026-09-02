# memoria

Personal task tracker. Goal: keep task number, project, status, and release/consolidate branches at hand without hunting for them in another system.

**Current scope**: single user (you). Designed so it can grow to multi-user later without reworking the data model.

---

## Suggested stack & current best practices

None of this was explicitly decided in the planning conversations — treat it as a reasonable, current (2025–2026) default, not a requirement. The only things that *are* settled are the data model and routes further down.

- **Framework**: Next.js (App Router) + TypeScript. Use **Server Actions** for create/update/delete instead of separate REST API routes — it keeps the "CRUD via modal" pattern simple: the modal submits straight to a server action, no client fetch layer required.
- **ORM**: **Prisma + PostgreSQL**. Postgres from day one means no migration path to plan for when multi-user support lands — the same database just gets a `Users` table and an `assigned_user_id` foreign key added to it, no swap in provider or query layer. For local dev, run Postgres via Docker (`docker compose up`) or point `DATABASE_URL` at a free hosted instance (Neon, Supabase, Railway all work well for a solo project and make it trivial to add teammates to the same database later).
- **Validation**: **Zod** schemas for every form and server action input, shared between client and server so validation logic isn't duplicated.
- **UI primitives**: **shadcn/ui** (unstyled, accessible components you own in-repo) as the base, restyled with the soft-UI tokens below. Pairs naturally with Tailwind and is the current default for a custom design system like this one, instead of pulling in a themed component library.
- **Icons**: **Lucide** (the set shadcn/ui ships with) — outline style matches the soft-UI direction already prototyped.
- **Linting/formatting**: **Biome** instead of separate ESLint + Prettier — one faster tool, one config file.
- **Testing** (once there's real behavior to break): **Vitest** for units, **Playwright** for the CRUD flows. Don't set this up before there's anything worth testing.
- **Client-side data fetching** (only where Server Components aren't enough — e.g. an optimistic status toggle): **TanStack Query**. Don't add it just to have it; Server Components + Server Actions cover most of this app's needs.

---

## Suggested folder structure

```
app/
  page.tsx                    → "/" = active tasks (see "home preference" note below)
  projects/
    page.tsx                  → /projects — list
    [id]/
      page.tsx                → /projects/:id — detail with tabs: Releases | Consolidates | Sprints | Tasks
  settings/
    page.tsx
    tags/page.tsx
  auth/
    login/page.tsx            → not part of the main nav

components/
  tasks/
    TaskCard.tsx
    TaskModal.tsx              → create/edit is a modal, NEVER a separate route
  projects/
  ui/                          → shared primitives (chip, pill, modal base)

lib/
  db.ts                        → Prisma client

prisma/
  schema.prisma                 → schema + migrations
```

At this size, a flat top-level `components/` folder is fine. If the app grows past a handful of routes, consider colocating each route's components and server actions inside its own segment (`app/projects/[id]/_components/`, `app/projects/[id]/actions.ts`) — the current App Router convention — rather than migrating everything into `components/` by default.

---

## Data model

Every table includes by default: `id` (PK), `created_at`, `updated_at`, `deleted_at` (soft delete). Don't repeat these fields per table when implementing — put them in a shared base/mixin.

| Table | Own fields | Notes |
|---|---|---|
| `Projects` | `name`, `description` | |
| `Sprints` | `project_id` (FK), `name`, `description`, `start_date`, `end_date` | unique on `project_id` + `name` |
| `Releases` | `project_id` (FK), `name`, `description`, `status`, `branch_name` | unique on `project_id` + `branch_name` |
| `Consolidates` | `project_id` (FK), `name`, `description`, `status`, `branch_name` | unique on `project_id` + `branch_name` |
| `Tags` | `name` | unique |
| `Tasks` | `project_id` (FK), `title`, `number`, `description`, `status`, `priority`, `due_date`, `pinned` | |
| `TaskReleases` | `task_id` (FK), `release_id` (FK) | history, append-only — see rule below |
| `TaskConsolidates` | `task_id` (FK), `consolidate_id` (FK) | history, append-only |
| `TaskSprints` | `task_id` (FK), `sprint_id` (FK) | history, append-only |
| `TaskTags` | `task_id` (FK), `tag_id` (FK) | many-to-many join |
| `TaskLinks` | `task_id` (FK), `url`, `label` | a task can have several links |
| `Todos` | `task_id` (FK), `title`, `description`, `status` | grouped checklist |
| `TodoItems` | `todo_id` (FK), `title`, `completed`, `order` | |
| `Notes` | `task_id` (FK, nullable), `project_id` (FK, nullable), `comment` | exactly one of the two FKs must be set |

**Not implemented yet**: a `Users` table. Add it, together with `assigned_user_id` on `Tasks`, once the project goes multi-user. If login is ever added, store `password_hash` — never a plaintext password.

### Business rules

- **"Active" in the history tables is not a flag** — it's the row with the most recent `created_at` for that task. Don't maintain a manually-synced "is current" column.
- `Releases` and `Consolidates` are catalogs **per project**: the same `branch_name` can repeat across different projects, but not within the same project.
- `Notes` covers comments on either a task or a project — never both FKs empty, never both set.

---

## Routes & navigation conventions

- **CRUD happens via modal/drawer, not dedicated routes.** Creating or editing a task shouldn't navigate the person away from the list they're on.
- **Filters use query params**, not new routes: `/?status=active&project=2`, not `/tasks/active`.
- **Project-scoped catalogs are nested**: `/projects/:id/releases`, not a flat `/releases` — the URL mirrors the `project_id` in the data model.
- `/` is the active-tasks list today. Planned for later (not yet implemented): a "home preference" setting under `/settings` that decides what `/` shows — for now it can live as a single loose config row; once `Users` exists, it becomes a field on that table.
- `/auth/login` is not part of the main nav — it only appears when there's no session.

---

## Visual direction

Style settled after iterating on a few directions (glass, Material 3, model-card style): **soft-UI dashboard**, with the SugarCRM "Customer Journeys" screen as the concrete reference. White cards floating over a light gray background with soft, diffused shadows (no hard borders), generously rounded corners, an almost monochrome palette that reserves color for status/priority.

**Overall layout (from the reference):**
- App chrome in light gray (roughly `#F0F1F5`); content lives in white cards that float above it — never edge-to-edge flat white.
- Narrow vertical icon-only sidebar, with a light/dark toggle at the bottom.
- Top nav items as plain text, with the active item shown as a **solid black pill** with white text — not an underline or accent color. This is the app-wide pattern for "active/selected," including status pills if the same treatment is wanted there.
- Large, bold section titles above each content block.

**Reusable components:**
- Icon buttons as small white rounded squares with a soft shadow (already used in `TaskCard`: open link, view log) — keep this pattern for any new secondary action (share, add, export).
- Circular avatars with a small color badge overlapping the bottom-right corner, for status or counts — relevant once `assigned_user_id` exists; not applicable without a `Users` table yet.
- "Step" or "column" cards connected by soft curved lines (like the "Case Allocation → Issue Identification → Technical Resolution" flow in the reference) — a pattern to reuse if a task's history (`TaskReleases`/`TaskSprints`) is ever visualized as a timeline. Not needed for the MVP.
- Donut charts with saturated colors (blue, red) on a neutral background for simple metrics — a candidate for a future summary view in `/settings` or a dashboard. Not needed for the MVP.

**States & data density:**
- Status as a tonal color badge, never plain text: Active = blue, Block = red, Finished = green, Published prod = amber.
- **The task card stays light by default**: only title, number, project, status, and priority are visible. Release and consolidate show as small chips (tooltip = full branch name, click = copy to clipboard), not the full string always on display.
- Avoid overloading the card — it was already trimmed once for showing too much at once; keep that discipline when adding new fields.

---

## Not building yet

- Multi-user support (`Users` table, auth)
- `/` home-page preference switcher
- Timeline visualization of task history
- Dashboard summary / donut-chart metrics
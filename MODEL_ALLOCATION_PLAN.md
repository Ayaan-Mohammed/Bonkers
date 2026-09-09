# Model Allocation Plan — Antigravity Quota Management
### Context: Gemini 47% weekly / 100% 5-hr left · Claude+GPT 27% weekly / 100% 5-hr left · Overages OFF · Both quotas must last the full 2-day build (weekly resets *after* the Sept 10 deadline)

**Rule of thumb used below:**
- **Gemini** → mechanical, pattern-following, boilerplate-heavy, low-ambiguity tasks (scaffolding, CRUD models, config, seed scripts, string extraction, styling).
- **Claude/GPT** → tasks needing careful reasoning, correctness under ambiguity, security/authorization logic, or anything that's hard to fix later if subtly wrong.
- Batch adjacent Gemini tasks into one prompt where possible to reduce round-trips. Keep Claude/GPT tasks isolated (one task per prompt) so you can review each output carefully — quota is too tight to redo these.

---

## Person 1 — Frontend (`PERSON1_FRONTEND_TASKS.md`)

| # | Task | Model | Why |
|---|---|---|---|
| 1 | Scaffold Vite+React+TS project | **Gemini** | Pure boilerplate/config, no judgment calls |
| 2 | Extract design tokens from `Frontend/` | **Gemini** | Mechanical extraction task |
| 3 | API client + TypeScript types + mocks | **Claude/GPT** | Needs to correctly mirror the full DB schema/enum contract exactly — mistakes here silently break every later page |
| 4 | App shell, routing, layout | **Gemini** | Standard router/layout wiring |
| 5 | Search page (Quick + Hierarchical) | **Gemini** | Fairly standard form + query pattern |
| 6 | Parcel Overview + GIS map | **Claude/GPT** | Map layer logic + variance-badge conditional logic is easy to get subtly wrong |
| 7 | Certified Dossier + History | **Gemini** | Mostly layout/print CSS assembly |
| 8 | Intelligence (Trust Score UI) | **Claude/GPT** | Must correctly render whatever dynamic `factors` keys the backend returns — don't let it hardcode/guess field names |
| 9 | Consent Portal | **Claude/GPT** | This is your core differentiator feature and involves role-based view logic — get it right the first time |
| 10 | Officer Dashboard + Grievances | **Gemini** | Standard table + filter + status-action pattern |
| 11 | Developer Sandbox | **Gemini** | Small, low-risk page |
| 12 | i18n + polish pass | **Gemini** | Mechanical string extraction + responsive CSS |
| 13 | Wire to real backend + deploy | **Claude/GPT** | Final integration point — a mistake here breaks the live demo; review carefully, use a careful model |

**Batching suggestion (Person 1, Gemini tasks):** run `1+2` together, then `4+5` together, then `7+10+11` together, then `12` alone at the end. That's 4 Gemini prompts instead of 8.
**Claude/GPT tasks stay separate:** `3`, `6`, `8`, `9`, `13` = 5 isolated prompts.

---

## Person 2 — Backend & Database (`PERSON2_BACKEND_TASKS.md`)

| # | Task | Model | Why |
|---|---|---|---|
| 1 | Scaffold FastAPI + Docker + Postgres/PostGIS | **Gemini** | Config/boilerplate, well-trodden pattern |
| 2 | Models — admin hierarchy + base layer (geom/PostGIS) | **Claude/GPT** | Spatial types + GIST indexing + SRID correctness — easy to silently misconfigure |
| 3 | Models — essential + additional layers | **Gemini** | Standard SQLAlchemy models once the pattern from Task 2 is set |
| 4 | Models — platform/DPI layer (User/Consent/AuditTrail) | **Claude/GPT** | Hash-chain field design + enum correctness underpins security features later |
| 5 | Seed script (synthetic data incl. deliberate variance cases) | **Gemini** | Data generation logic, but see note below |
| 6 | Auth endpoints (JWT, RBAC deps) | **Claude/GPT** | Security-critical — auth bugs are the worst kind to discover during a live demo |
| 7 | Parcel + essential-layer read endpoints + zoning-check | **Gemini** | Mostly CRUD + a documented PostGIS query pattern |
| 8 | Dispute-Risk / Trust Score service | **Claude/GPT** | Core differentiator; formula + explainability must be correct and defensible when judges ask "why this score?" |
| 9 | Hash-chained audit trail | **Claude/GPT** | Cryptographic chaining logic — a subtle bug (wrong hash input order, wrong prev-hash lookup) breaks the entire tamper-evidence story |
| 10 | Consent layer + `require_consent` authorization dependency | **Claude/GPT** | This is an access-control gate on legally sensitive data — highest-stakes correctness task in the whole project |
| 11 | Alerts + Grievances + mock change-detection | **Gemini** | Standard CRUD + a clearly-labeled mock comparison function |
| 12 | Developer sandbox (API keys, rate limiting) | **Gemini** | Small, self-contained, low ambiguity |
| 13 | Export OpenAPI spec + deploy | **Gemini** | Mostly config/export, low judgment risk once app is stable |

**Batching suggestion (Person 2, Gemini tasks):** run `1` alone (it gates everything else), then `3+7` together once `2` is done, then `5` alone (data quality worth a dedicated review), then `11+12+13` together near the end.
**Claude/GPT tasks stay separate:** `2`, `4`, `6`, `8`, `9`, `10` = 6 isolated prompts — this is your heaviest concentration of scarce-quota tasks, all backend, because that's where the correctness stakes are.

---

## Rough Quota Budget (both people combined)

| Model | Tasks assigned | Share of total tasks |
|---|---|---|
| **Gemini** (47% weekly) | 1,2,4,5,7,10,11,12 (frontend) + 1,3,5,7,11,12,13 (backend) = **15 tasks**, batchable into ~9 prompts | ~58% of tasks, but cheaper/lower-risk ones |
| **Claude/GPT** (27% weekly) | 3,6,8,9,13 (frontend) + 2,4,6,8,9,10 (backend) = **11 tasks**, mostly kept isolated | ~42% of tasks, but the highest-value ones |

- **Mentally divide 27% ÷ 11 tasks ≈ 2.4% quota "budget" per Claude/GPT task.** Write precise prompts up front to avoid iterating live.
- **If Claude/GPT quota drops below ~10% before Day 2 backend work starts**, fall back to Gemini for Tasks 4 and 11 (frontend) first.
- **Watch the 5-hour rolling limit** — switch model families if capped mid-session.

---

## Protocol for Claude/GPT-Tagged Tasks

Prefix to add to top of sessions for Claude/GPT-tagged tasks:
```
Before writing code, state your full plan and any assumptions in a short list and
wait for my confirmation. I have limited quota on this model today — I'd rather
confirm the plan once than pay for a wrong first attempt.
```

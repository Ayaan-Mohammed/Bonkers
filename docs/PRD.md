# PRD — Land Stack Prototype (SIH PS #26014)
### "NLIP — National Land Intelligence Platform" — State-Level Integrated GIS Digital Public Infrastructure for Land Governance

**Prepared for:** Coding agent (Antigravity) + Team execution
**Hackathon deadline:** 10 September 2026 (build window ≈ 2 days from this doc)
**Repo:** `Ayaan-Mohammed/Bonkers` — existing folders: `Frontend/` (static HTML demo, deployed at bonkers-livid.vercel.app), `backend/` (unknown/likely minimal)

---

## 0. Ground rule for the coding agent (read first)

> **DO NOT modify, delete, rename, or rewrite any existing file inside `Frontend/`, `backend/`, `.gitignore`, or `README.md`.**
> These are the team's working demo and must keep functioning as-is for fallback/demo purposes.
> All new work goes into **new, additive folders**: `frontend-v2/`, `backend-v2/`, `docs/`, and a root `.env.example`.
> If a root-level file (e.g. `package.json` at repo root) must exist for tooling, **create it new only if it does not already exist**; never overwrite an existing one — append/merge instead.
> Before writing any code, the agent must run a read-only inventory (`ls -R Frontend backend`) and report what already exists, so nothing is duplicated blindly.

---

## 1. Problem Statement Recap

DoLR (Ministry of Rural Development) wants a **scalable, state-configurable prototype of "Land Stack"** — a GIS-based Digital Public Infrastructure that unifies cadastral maps, Record of Rights (RoR), registration data, master plans, building permissions, encumbrances, property tax, and utility data around a parcel identified by **ULPIN**. It must support both rural and urban contexts, interoperate across departments via open APIs, and expose citizen-facing services. Participants must also produce a **Standard Technical Document** (API/interoperability standards, schemas, architecture, GIS standards, security, UI/UX, deployment).

---

## 2. Research: Does this already exist? (do this before building)

**Short answer: yes, at the concept and pilot level — but no open, replicable, state-configurable technical reference implementation exists yet. That gap is the opportunity.**

| Initiative | What it is | Status | Relevance |
|---|---|---|---|
| **Land Stack (DoLR)** | The exact national initiative this PS is modeled on. GIS platform integrating land, ownership, registration, building data across departments. | Launched as a **live pilot on 31 Dec 2025** in Chandigarh & Tamil Nadu, under DILRMP, explicitly inspired by Singapore/UK/Finland land registries. 6-month pilot → phased national rollout (1 city + 1 village per state, then nationwide). | This is not hypothetical — it is a real, currently-running government platform. Our prototype should position itself as **"the replicable state-onboarding kit"** that lets any new state stand up its own Land Stack node fast — that is literally the stated hackathon ask ("scalable prototype... common interoperable State-level framework"). |
| **Chandigarh Landstack** | Live implementation of the above in Chandigarh, single-window parcel access. | Operational (per Wikipedia/Tribune reporting) | Reference for expected UX/feature parity: parcel search, ownership, deed, encumbrance, litigation status. |
| **ULPIN / Bhu-Aadhaar** | 14-digit geo-coded unique parcel ID, "single source of truth" identifier. | Live in ~26-29 states/UTs | We must use ULPIN as the primary key exactly as the PS instructs — not invent our own ID scheme. |
| **NGDRS** | National Generic Document Registration System — e-registration of deeds. | Live, configurable per-state | Our "registrations" module should mirror NGDRS's data shape (deed type, SRO, consideration value) so it's a plausible integration target, not a reinvention. |
| **Bhu-Naksha** | Cadastral map digitization & GIS boundary service. | Live | Source-of-truth pattern for our `parcels.geom` layer. |
| **SVAMITVA** | Drone survey + property card issuance for rural inhabited (abadi) land. | Live, ~ several lakh villages | Confirms our "rural context" layer needs drone/GIS provenance metadata on parcels, not just urban cadastre. |
| **Glossary of Revenue Terms (GoRT)** | Just released alongside Land Stack (31 Dec 2025) — harmonizes Khasra/Dag/Pula/etc. across languages. | Live reference dataset | **Directly usable**: build a terminology-mapping layer so our platform ingests state-specific field names (Khasra, Khatauni, 7/12, Patta, Gata) and normalizes them to canonical schema fields — this operationalizes something the government only published as a document. |
| **SIH26018 – "Intelligent Land Record Digitization & Validation System"** | Adjacent 2026 SIH problem statement, focused on OCR + validation of scanned paper records. | Separate track | Not a duplicate of our PS — but a natural upstream input. We should design our `source_document_ref` fields so such an OCR service could plug in later, but we do NOT need to build OCR ourselves. |
| **State portals** (Bhulekh-UP, Dharani-TS, Mahabhulekh-MH, Bhoomi-KA, AnyRoR-GJ, TN e-Services) | Existing siloed state systems, exactly the fragmentation problem named in the PS. | Live, disconnected | These are the systems Land Stack is meant to federate — our "Data Sources" module already visualizes this idea; we should make the *interoperability layer* (adapters/connectors pattern) the actual engineering artifact, not just a static list. |

**Conclusion for the team:** No public team has shipped an open-source, end-to-end, state-configurable Land Stack reference implementation with a working consent layer, AI-driven anomaly detection, and a documented interoperability standard. That's the wedge. Judges will already know about the real Land Stack pilot (it's recent, high-profile national news) — so a submission that (a) demonstrates clear awareness of it and (b) goes *beyond* a static mock into real GIS + real AI/ML analytics + a genuine open API layer will stand out far more than another dashboard mockup.

---

## 3. Current State of the Repo (assessed from the live deploy `bonkers-livid.vercel.app`)

The existing `Frontend/` is a **polished, fully static, hardcoded-demo** multi-page site ("NLIP") with:
- Landing page (`index.html`) — hero, "36 states" stat, dark futuristic theme, ◈ diamond mark.
- `search.html` — Quick ULPIN search + Hierarchical (State→District→Tehsil→Village) search, 9 hardcoded "indexed demo parcels", 6 numbered modules: Parcel Overview, GIS Cadastral Map, Certified Parcel Dossier, Land Intelligence (5-pillar audit + 7-point score), Land History, Data Sources, plus an Admin Action modal (grievance/EC request) that fakes an acknowledgement number.
- Everything is **client-side hardcoded** — no live backend calls observed; searching anything not in the demo list returns "Parcel Record Not Found."

**Implication:** the visual design and IA are already strong — reuse them as design tokens/wireframe reference. What's missing (and what we build now) is: a **real backend + database + GIS queries + at least one genuinely working AI/ML feature + a consent-based API layer**, wired into either an enhanced version of these pages or a new app that visually matches them.

---

## 4. What We Add That's Genuinely New (pick 2–3 for the 2-day MVP, rest = roadmap)

Rank by (impact ÷ build effort) for a 2-day hackathon:

| # | Feature | Why it's novel here | Effort | MVP? |
|---|---|---|---|---|
| 1 | **Consent-based Data Exchange layer** (DEPA/Account-Aggregator pattern) — a bank/citizen requests time-boxed, purpose-bound access to a parcel dossier; owner approves/denies; every access is logged. | Turns "Digital Public Infrastructure" from a buzzword into an actual DPI pattern (identity + consent + data exchange — the same 3-layer model cited by Gates Foundation/IMF for DPI). No current Land Stack demo does this. | Medium | **Yes — build this** |
| 2 | **AI Dispute-Risk / Trust Score** replacing the current mock "7-point score" with a real rules+ML score computed from actual variance between recorded area vs GIS area, encumbrance density, mutation frequency, and pending litigation flags — fully explainable (shows *why* the score is what it is). | Judges can see real computation, not a static number. Directly answers PS's "AI/ML analytics" and "decision-support dashboards" ask. | Low–Medium | **Yes — build this** |
| 3 | **Satellite/GIS Change-Detection alerts** — compare two time-stamped parcel boundary/land-use snapshots (can be simulated with two seeded GeoJSON states if live satellite APIs are out of reach in 2 days) to flag unauthorized construction / zoning mismatch, and push it into an officer dashboard as an alert. | Directly matches "satellite imagery-based change detection" from the PS Expected Solution. | Medium | **Yes if time allows, else stub with clear mock-data disclosure** |
| 4 | Open Developer Sandbox (issue API keys, scoped, rate-limited) for banks/fintechs. | Matches "open APIs" ask, cheap to build (just an API-key table + middleware). | Low | Nice-to-have |
| 5 | Tamper-evident hash-chained audit trail on every record mutation. | Matches "secure, tamper-resistant" language used in real Land Stack coverage. | Low | Nice-to-have |
| 6 | Multilingual terminology normalization using GoRT-style mapping (Khasra/Dag/Pula/Khatauni synonyms → canonical field). | Directly operationalizes a real government artifact (GoRT) released the same week as Land Stack. | Low | Nice-to-have |
| 7 | Zoning/Master-Plan compliance auto-check on Building Permission applications (point/polygon-in-polygon GIS query). | Matches "Master Plan, Building Permission" essential layer explicitly named in PS. | Medium | Stretch |
| 8 | Digital twin 3D built-form view. | Cool but expensive; skip for 2-day build. | High | Roadmap only |
| 9 | Offline-first PWA / SMS-USSD fallback for rural citizens. | Matches "both rural and urban contexts." | Medium | Roadmap only |

**Decision for this hackathon:** Build **#1, #2, #5** as core MVP (they're cheap, demo-able, and map directly to PS language), attempt **#3 and #6** if time remains after Day 1, and **document #4, #7, #8, #9 in the Standard Technical Document as "Phase 2 roadmap"** — the PS explicitly rewards architecture/roadmap thinking in that document even if not built.

---

## 5. User Roles

| Role | Access |
|---|---|
| **Citizen** | Search parcel (public fields only), view own dossier, grant/revoke consent, raise grievance |
| **Revenue Officer (Patwari/Tehsildar)** | Approve mutations, view full RoR, resolve alerts |
| **Registration Officer (Sub-Registrar)** | Create/view registration & encumbrance records |
| **Planning/ULB Officer** | Zoning, building permission approval, tax records |
| **Bank/Financial Institution** | Consent-scoped read access to encumbrance + ownership for loan due diligence |
| **Developer (API consumer)** | Sandbox API key, rate-limited read access to public parcel fields |
| **Admin** | User/role management, audit trail, system config |

---

## 6. System Architecture (text diagram)

```
┌────────────────────────────┐        ┌──────────────────────────────┐
│  frontend-v2 (React/Vite)  │  REST  │   backend-v2 (FastAPI)        │
│  citizen + officer portals │◄──────►│   /api/v1/*                   │
└────────────────────────────┘  JSON  │   auth, parcels, ror, regs,   │
                                       │   mutations, consents, alerts,│
                                       │   intelligence, dev-portal    │
                                       └──────────┬─────────────────────┘
                                                  │ SQLAlchemy + PostGIS
                                       ┌──────────▼─────────────────────┐
                                       │ PostgreSQL 16 + PostGIS 3       │
                                       │ (parcels.geom, zones.geom,      │
                                       │  utility_infra.geom)            │
                                       └──────────┬─────────────────────┘
                                                  │
                                       ┌──────────▼─────────────────────┐
                                       │ services/ (ML + geo + audit)    │
                                       │  - risk_scoring_service         │
                                       │  - change_detection_service     │
                                       │  - hash_chain_service           │
                                       │  - consent_service              │
                                       └──────────────────────────────────┘
```

---

## 7. Tech Stack

### Frontend (`frontend-v2/`) — Person 1
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS, design tokens extracted from existing `Frontend/` (dark theme, cyan/blue accents, ◈ mark) so the new app is visually continuous with the existing demo
- **Mapping/GIS:** MapLibre GL JS (open-source, no API key needed) or Leaflet + `leaflet.markercluster`; render `geom` as GeoJSON layers
- **Charts:** Recharts (for trust-score breakdown, mutation history timeline)
- **State:** Zustand (lightweight) or React Context — avoid Redux for a 2-day build
- **Data fetching:** TanStack Query (React Query) for caching + loading/error states
- **Forms/validation:** React Hook Form + Zod
- **i18n:** `react-i18next` with `en.json` / `hi.json`, seeded from GoRT term mappings
- **Auth:** JWT stored in memory + httpOnly refresh cookie (backend-issued)
- **Testing:** Vitest + React Testing Library (smoke tests only, given time budget)
- **Deploy:** Vercel (same platform as existing `Frontend/`), separate project or subpath

### Backend (`backend-v2/`) — Person 2
- **Framework:** Python **FastAPI** (async, auto OpenAPI docs at `/docs` — directly usable as part of the Standard Technical Document's API standards section)
- **ORM:** SQLAlchemy 2.0 + Alembic migrations
- **Database:** **PostgreSQL 16 + PostGIS 3** (mandatory for `geom` columns, spatial joins for zoning compliance and area calc)
- **Auth:** `python-jose` (JWT) + `passlib[bcrypt]`
- **Validation:** Pydantic v2 schemas
- **Caching (optional):** Redis, only if time allows (rate limiting for dev-portal API keys)
- **AI/ML:** scikit-learn for the dispute-risk score (a small logistic-regression/rules-hybrid model trained on seeded synthetic data is enough — must be explainable, not a black box, for a 2-day judge-facing demo)
- **Geo libs:** `geoalchemy2`, `shapely`, `geojson-pydantic`
- **Testing:** Pytest
- **Docs:** FastAPI auto-generates OpenAPI 3.1 spec → export to `docs/api-spec.yaml`
- **Containerization:** `docker-compose.yml` with `postgres/postgis` official image + backend service (makes local setup reproducible for both teammates and judges)
- **Deploy:** Render / Railway / Fly.io (free tier, Postgres+PostGIS supported) — do NOT use Vercel serverless for the DB-backed API (cold start + no persistent Postgres); Vercel is fine for the frontend only.

> **If `backend/` (existing folder) already contains a working Node.js/Express service:** do not discard it. In that case Person 2 should keep `backend/` running as-is, and build `backend-v2/` as a **Python microservice limited to `/geo/*`, `/intelligence/*` (ML) and `/alerts/*` endpoints only**, while the Node backend continues owning simple CRUD (parcels list, users, auth) if that's faster to extend safely. Decide this in the first 30 minutes based on what `ls -R backend` reveals — record the decision in `docs/PRD.md` addendum, do not silently improvise.

---

## 8. Database Schema (PostgreSQL + PostGIS)

```sql
-- Administrative hierarchy
states(id PK, name, code UNIQUE)
districts(id PK, state_id FK, name, lgd_code)
talukas(id PK, district_id FK, name)              -- tehsil/mandal
villages(id PK, taluka_id FK, name, lgd_code)

-- BASE LAYER
parcels(
  id PK,
  ulpin CHAR(14) UNIQUE NOT NULL,          -- Bhu-Aadhaar, canonical key
  village_id FK,
  survey_number VARCHAR,
  khasra_number VARCHAR,
  gata_number VARCHAR,
  patta_number VARCHAR,
  area_recorded_sqm NUMERIC,
  area_gis_sqm NUMERIC,                    -- computed via ST_Area(geom)
  land_use_type VARCHAR,                   -- agricultural/residential/commercial/mixed
  geom GEOMETRY(Polygon, 4326) NOT NULL,
  source VARCHAR,                          -- 'cadastral_survey' | 'svamitva_drone' | 'seed'
  created_at, updated_at
)
CREATE INDEX parcels_geom_gix ON parcels USING GIST(geom);

-- ESSENTIAL LAYERS
owners(id PK, full_name, aadhaar_hash, mobile_hash, father_or_spouse_name, address)

record_of_rights(
  id PK, parcel_id FK, owner_id FK,
  ownership_type ENUM('sole','joint','tenant','institutional'),
  share_percentage NUMERIC,
  tenure_type VARCHAR,
  khatauni_number VARCHAR,
  source_document_ref VARCHAR,             -- future OCR-service hook
  valid_from DATE, valid_to DATE, status ENUM('active','historical','disputed')
)

registrations(
  id PK, parcel_id FK,
  deed_type VARCHAR, deed_number VARCHAR,
  registration_date DATE, sub_registrar_office VARCHAR,
  consideration_amount NUMERIC, ngdrs_ref_id VARCHAR,
  document_hash VARCHAR                    -- SHA-256 of registered doc, tamper check
)

encumbrances(
  id PK, parcel_id FK,
  type ENUM('mortgage','lien','court_case','lease'),
  holder_name VARCHAR, amount NUMERIC,
  start_date DATE, end_date DATE, status ENUM('active','closed')
)

mutations(
  id PK, parcel_id FK,
  mutation_type VARCHAR, previous_owner_id FK, new_owner_id FK,
  applied_date DATE, approved_date DATE,
  status ENUM('pending','approved','rejected'),
  approving_officer_id FK, remarks TEXT
)

master_plan_zones(
  id PK, state_id FK,
  geom GEOMETRY(Polygon, 4326) NOT NULL,
  zone_type VARCHAR,                       -- residential/commercial/industrial/green
  permissible_far NUMERIC, permissible_use VARCHAR
)
CREATE INDEX zones_geom_gix ON master_plan_zones USING GIST(geom);

building_permissions(
  id PK, parcel_id FK,
  application_number VARCHAR, approved_use VARCHAR,
  built_up_area_sqm NUMERIC, floors_approved INT,
  sanction_date DATE, status ENUM('applied','approved','rejected','deviation_flagged'),
  plan_document_ref VARCHAR
)

-- ADDITIONAL / USE-CASE LAYERS
property_tax_records(id PK, parcel_id FK, assessment_year INT, assessed_value NUMERIC, tax_amount NUMERIC, paid_status ENUM('paid','due','overdue'), ulb_id VARCHAR)
utility_infrastructure(id PK, geom GEOMETRY(Point/LineString,4326), type ENUM('water','sewer','power','road'), parcel_id FK NULL, status VARCHAR)

-- PLATFORM / DPI LAYER (our differentiators)
users(id PK, name, email UNIQUE, mobile, password_hash, role ENUM('citizen','revenue_officer','registration_officer','planning_officer','bank_official','developer','admin'), state_id FK, created_at)

consents(
  id PK, requester_user_id FK, parcel_id FK,
  purpose VARCHAR,                         -- e.g. 'loan_due_diligence'
  scope JSONB,                             -- e.g. ["ror","encumbrance"]
  status ENUM('pending','approved','revoked','expired'),
  granted_by_owner_id FK, valid_until TIMESTAMP, created_at
)

audit_trail(
  id PK, entity_type VARCHAR, entity_id UUID,
  action VARCHAR, actor_user_id FK,
  prev_hash CHAR(64), curr_hash CHAR(64),  -- SHA-256 hash chain
  payload_diff JSONB, created_at
)

change_detection_alerts(
  id PK, parcel_id FK,
  alert_type ENUM('unauthorized_construction','landuse_mismatch','boundary_variance'),
  detected_date DATE, confidence_score NUMERIC,
  snapshot_before_ref VARCHAR, snapshot_after_ref VARCHAR,
  status ENUM('open','under_review','resolved'), resolved_by FK
)

dispute_risk_scores(id PK, parcel_id FK, score NUMERIC(5,2), factors JSONB, computed_at, model_version VARCHAR)

grievances(id PK, parcel_id FK, applicant_user_id FK, category VARCHAR, description TEXT, status ENUM('open','in_progress','resolved'), sla_due_date DATE, assigned_officer_id FK, created_at)

api_clients(id PK, org_name VARCHAR, api_key_hash VARCHAR, scopes JSONB, rate_limit_per_min INT, status ENUM('active','revoked'))
```

**Seed data target:** ~150–300 synthetic parcels across 3–4 states (mirror the existing demo's TS/UP/MH/KA/TN/BR examples so the new app can drop-in replace the old hardcoded list with real DB-backed results), with realistic RoR/registration/encumbrance/mutation history so the Trust Score and History timeline have something meaningful to show.

---

## 9. API Design (REST, `/api/v1`)

```
POST   /auth/register              /auth/login              /auth/refresh
GET    /parcels?state=&district=&village=&query=      (search, supports ULPIN/survey/khasra/patta)
GET    /parcels/{ulpin}                                (full parcel object incl. geom)
GET    /parcels/{ulpin}/ror
GET    /parcels/{ulpin}/registrations
GET    /parcels/{ulpin}/encumbrances
GET    /parcels/{ulpin}/mutations
GET    /parcels/{ulpin}/building-permissions
GET    /parcels/{ulpin}/tax
GET    /parcels/{ulpin}/history                        (unified chronology across above)
GET    /parcels/{ulpin}/intelligence                    -> trust score + factor breakdown
GET    /parcels/{ulpin}/alerts
POST   /parcels/{ulpin}/zoning-check                    (geo intersect vs master_plan_zones)

POST   /consents                     (citizen/bank requests access)
PATCH  /consents/{id}                (owner approves/revokes)
GET    /consents/mine

GET    /alerts?state=&status=        (officer dashboard feed)
PATCH  /alerts/{id}                  (mark under_review/resolved)

POST   /grievances
GET    /grievances/mine | /grievances?officer=
PATCH  /grievances/{id}

GET    /audit/{entity_type}/{entity_id}   (hash-chain trail, verify tamper-evidence)

POST   /dev/api-keys                 (developer sandbox self-serve, admin-approved)
GET    /dev/usage

GET    /zones?state=                 (GeoJSON of master plan zones, for map layer)
GET    /utility?bbox=                (GeoJSON, bbox-filtered)
```

All endpoints return `application/json`; spatial fields return GeoJSON per RFC 7946. Full spec auto-published at `backend-v2` `/docs` (Swagger UI) and exported to `docs/api-spec.yaml` for the Standard Technical Document.

---

## 10. Complete New Folder Structure

```
Bonkers/
├── README.md                     # existing — DO NOT TOUCH
├── .gitignore                    # existing — DO NOT TOUCH
├── Frontend/                     # existing static demo — DO NOT TOUCH
│   └── ... (unchanged)
├── backend/                      # existing — inspect only, extend per §7 note if reused
│   └── ... (unchanged unless team decides to extend, documented separately)
│
├── frontend-v2/                  # NEW — Person 1 owns
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles/
│       │   └── tokens.css              # colors/fonts extracted from Frontend/
│       ├── assets/
│       ├── lib/
│       │   ├── api.ts                  # typed fetch client
│       │   └── auth.ts
│       ├── store/
│       │   └── useSessionStore.ts
│       ├── types/
│       │   └── index.ts
│       ├── i18n/
│       │   ├── en.json
│       │   └── hi.json
│       ├── components/
│       │   ├── layout/ (Navbar, Footer, Shell)
│       │   ├── map/ (MapView, ParcelLayer, ZoneLayer, LayerToggle)
│       │   ├── search/ (QuickSearch, HierarchicalSearch)
│       │   ├── dossier/ (DossierCard, PrintExport)
│       │   ├── intelligence/ (TrustScoreGauge, FactorBreakdown, AlertFeed)
│       │   ├── consent/ (ConsentRequestForm, ConsentList)
│       │   └── common/ (Button, Modal, Table, Loader, EmptyState)
│       └── pages/
│           ├── Home.tsx
│           ├── Search.tsx
│           ├── ParcelOverview.tsx
│           ├── GISView.tsx
│           ├── Dossier.tsx
│           ├── Intelligence.tsx
│           ├── History.tsx
│           ├── DataSources.tsx
│           ├── ConsentPortal.tsx
│           ├── OfficerDashboard.tsx
│           └── DeveloperSandbox.tsx
│   └── tests/
│
├── backend-v2/                   # NEW — Person 2 owns
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── logging.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── geo.py          # states/districts/talukas/villages/parcels/zones/utility
│   │   │   ├── rights.py       # owners/ror/registrations/encumbrances/mutations
│   │   │   ├── planning.py     # building_permissions/property_tax
│   │   │   ├── platform.py     # users/consents/audit_trail/api_clients
│   │   │   └── intelligence.py # alerts/dispute_risk_scores/grievances
│   │   ├── schemas/            # pydantic mirrors of the above
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── parcels.py
│   │   │       ├── ror.py
│   │   │       ├── registrations.py
│   │   │       ├── mutations.py
│   │   │       ├── building_permissions.py
│   │   │       ├── zoning.py
│   │   │       ├── consents.py
│   │   │       ├── alerts.py
│   │   │       ├── intelligence.py
│   │   │       ├── grievances.py
│   │   │       └── developer.py
│   │   ├── services/
│   │   │   ├── geo_service.py
│   │   │   ├── change_detection_service.py
│   │   │   ├── risk_scoring_service.py
│   │   │   ├── hash_chain_service.py
│   │   │   └── consent_service.py
│   │   └── ml/
│   │       ├── dispute_risk/ (train.py, model.pkl, features.py)
│   │       └── change_detection/ (mock_compare.py)
│   ├── scripts/
│   │   ├── seed_data.py
│   │   └── generate_synthetic_parcels.py
│   └── tests/
│
├── docs/                         # NEW — shared
│   ├── PRD.md                            # this file
│   ├── PERSON1_FRONTEND_TASKS.md
│   ├── PERSON2_BACKEND_TASKS.md
│   ├── standard-technical-document.md    # PS-required deliverable, fill during/after build
│   └── api-spec.yaml                     # exported OpenAPI 3.1
│
└── .env.example                  # NEW at root, points to both sub-apps
```

---

## 11. Non-Functional Requirements (keep light for 2-day build, but state them)

- **Security:** hash Aadhaar/mobile (never store raw), JWT auth, role-based access control on every endpoint, parameterized queries only (SQLAlchemy handles this), rate limiting on public search endpoint.
- **Interoperability:** all geospatial responses in GeoJSON (OGC-aligned); ULPIN as canonical join key everywhere; document the schema mapping approach for state-specific terms (GoRT-style) in the Standard Technical Document.
- **Accessibility/i18n:** English + Hindi minimum, keyboard-navigable forms.
- **Performance:** spatial GIST indexes on all `geom` columns; paginate search results.
- **Auditability:** every write to `record_of_rights`, `registrations`, `mutations`, `encumbrances` appends to `audit_trail` with hash chaining.

---

## 12. Standard Technical Document (separate PS deliverable)

The PS requires a document covering: API standards, interoperability standards, data schemas, system architecture, GIS standards, security frameworks, UI/UX guidelines, color schema, deployment/scalability. Use `docs/standard-technical-document.md` as the template — populate it from this PRD (§7–§11) plus the exported `api-spec.yaml`, plus screenshots once the UI exists. Do this on Day 2 evening, not last-minute.

---

## 13. 2-Day Build Plan

**Day 1 (today):**
- Hr 0–1: Both — inventory existing repo, agree Node-vs-Python backend decision (§7 note), finalize this PRD's scope cuts.
- Hr 1–4: Person 2 — Postgres+PostGIS via docker-compose, models, migrations, seed script (aim: parcels + ror + registrations + encumbrances + mutations seeded and queryable).
- Hr 1–4: Person 1 — scaffold `frontend-v2`, port design tokens from `Frontend/`, build Search + ParcelOverview + GISView against a mocked API client.
- Hr 4–8: Person 2 — auth, parcel/ror/registration/mutation/alert endpoints live; wire real DB.
- Hr 4–8: Person 1 — swap mock client for real API, get Search → ParcelOverview → GISView → Dossier flow fully live end-to-end.
- Evening: Integration checkpoint — full flow works on both machines.

**Day 2:**
- Morning: Person 2 — dispute-risk scoring service + intelligence endpoint + hash-chained audit trail.
- Morning: Person 1 — Intelligence page (Trust Score gauge + factor breakdown), Consent Portal UI, Officer Dashboard alert feed.
- Afternoon: Person 2 — consents endpoints, seed one change-detection alert (real or clearly-labeled simulated), developer sandbox API-key issuance.
- Afternoon: Person 1 — polish, responsive pass, empty/error states, i18n strings, print/export dossier.
- Evening: Both — deploy (frontend→Vercel, backend→Render/Railway), write `docs/standard-technical-document.md`, rehearse demo script, freeze code.

---

## 14. Definition of Done (MVP)

- [x] Real search returns real DB parcels (not hardcoded list) across ≥3 states (UP, TS, MH, KA)
- [x] Parcel Overview, GIS map (PostGIS-backed), Dossier, History all backend-driven
- [x] Trust/Dispute-Risk score computed server-side, explainable in UI
- [x] Consent request → owner approval → scoped access flow works end-to-end for at least one role pair (citizen owner ↔ bank official)
- [x] Audit trail visibly shows tamper-evident hash chain for at least one mutation
- [x] Officer dashboard shows at least one live alert
- [x] OpenAPI docs reachable at backend `/docs` (and exported to docs/openapi.json, docs/api-spec.yaml)
- [x] `docs/standard-technical-document.md` complete
- [x] Existing `Frontend/` and `backend/` consolidated, intact, deployable, and verified


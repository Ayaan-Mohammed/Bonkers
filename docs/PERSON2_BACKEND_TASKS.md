# Person 2 — Backend & Database Tasks & Execution Checklist
> **Quota Strategy Notice**: Refer to [MODEL_ALLOCATION_PLAN.md](file:///g:/frame/docs/MODEL_ALLOCATION_PLAN.md). Follow the strict model allocation per task to preserve quota for the 2-day build.

---

### Standard Prompt Prefix for Claude/GPT Tasks (Tasks 2, 4, 6, 8, 9, 10)
```text
Before writing code, state your full plan and any assumptions in a short list and
wait for my confirmation. I have limited quota on this model today — I'd rather
confirm the plan once than pay for a wrong first attempt.
```

---

## Tasks Overview & Status

| # | Task | Assigned Model | Batch Group | Status | Key Deliverables / Acceptance Criteria |
|---|------|----------------|-------------|--------|----------------------------------------|
| **1** | Scaffold FastAPI + Docker + Postgres/PostGIS | **Gemini** | **Batch 1 (1 alone)** | ✅ Complete | `docker-compose.yml` (PostGIS 15/16), Dockerfile, poetry/pip dependencies, DB connection pool & healthcheck |
| **2** | Models — admin hierarchy + base layer (geom/PostGIS) | **Claude/GPT** | Isolated | ✅ Complete | Spatial models with SRID 4326, SP-GIST/GIST indexes, GeoJSON serializers |
| **3** | Models — essential + additional layers | **Gemini** | **Batch 2 (3+7)** | ✅ Complete | SQLAlchemy models for Encumbrances, Mortgages, Court cases, Mutation history following base pattern |
| **4** | Models — platform/DPI layer (User/Consent/AuditTrail) | **Claude/GPT** | Isolated | ✅ Complete | Cryptographic hash-chain fields (`prev_hash`, `block_hash`), consent grant models, role enums |
| **5** | Seed script (synthetic data incl. deliberate variance cases) | **Gemini** | **Dedicated review** | ✅ Complete | Deterministic demo records with clean parcels + realistic mismatch cases (area dispute, duplicate ownership claim) |
| **6** | Auth endpoints (JWT, RBAC deps) | **Claude/GPT** | Isolated | ✅ Complete | Secure token issue, FastAPI `Security` dependencies for Citizen, Bank Officer, Revenue Officer roles |
| **7** | Parcel + essential-layer read endpoints + zoning check | **Gemini** | **Batch 2 (3+7)** | ✅ Complete | Read queries by ULPIN / Geo-coordinates, boundary overlap checks with zoning polygons |
| **8** | Dispute-Risk / Trust Score service | **Claude/GPT** | **Differentiator** | ✅ Complete | Weighted explainable risk calculation (0-100), breakdown of factors (litigation, tax arrears, mutation speed) |
| **9** | Hash-chained audit trail | **Claude/GPT** | **Core Feature** | ✅ Complete | Tamper-evident ledger service; SHA-256 block chain verification endpoint `/audit/verify` |
| **10** | Consent layer + `require_consent` dependency | **Claude/GPT** | **High Stakes** | ✅ Complete | FastAPI dependency checking active, non-expired consent token for sensitive dossier extraction |
| **11** | Alerts + Grievances + mock change-detection | **Gemini** | **Batch 4 (11+12+13)**| ✅ Complete | CRUD for citizen grievances, simulated NDVI/satellite boundary shift alerts |
| **12** | Developer sandbox (API keys, rate limiting) | **Gemini** | **Batch 4 (11+12+13)**| ✅ Complete | API key generation & validation middleware, sliding window rate limits |
| **13** | Export OpenAPI spec + deploy | **Gemini** | **Batch 4 (11+12+13)**| ✅ Complete | Clean `openapi.json`, CORS configuration for frontend, deployment script / container run instructions |

---

## Detailed Task Prompts & Specifications
### Owns: `backend/` and API services. Reference doc: `docs/PRD.md`.

## 0. Ground rules (paste this once at the start of your Antigravity session)

```
You are working inside the repo Bonkers. Read docs/PRD.md fully before doing anything,
especially section 7 (tech stack decision note) and section 8 (database schema).

Hard rules:
1. Never modify, delete, or rename any file inside Frontend/ or backend/ — those may
   be an existing working demo owned by a teammate.
2. First, run a read-only `ls -R backend` and open any entry file you find (package.json,
   requirements.txt, main.py, index.js, etc.) to determine what stack (if any) already
   exists there. Report back a one-paragraph summary of what you found before doing
   anything else.
3. Decision rule based on what you find:
   - If backend/ is empty or trivial (placeholder only): build the full stack fresh in
     a new backend-v2/ folder per docs/PRD.md section 7, and leave backend/ untouched.
   - If backend/ already has a real, working Node/Express (or other) service with
     endpoints in active use by Frontend/: do NOT replace it. Instead build backend-v2/
     as a focused Python/FastAPI microservice that ONLY owns the geospatial (PostGIS),
     dispute-risk scoring, change-detection, and audit hash-chain endpoints
     (/geo/*, /intelligence/*, /alerts/*), and clearly document in
     docs/PRD.md (append, do not rewrite) which service owns which routes.
   Confirm this decision with me in plain language before proceeding.
4. Only create/edit files inside backend-v2/ (and append-only to a root .env.example).
5. After each task, actually run the service/tests and report pass/fail before moving on.
```

---

## 1. Task: Scaffold FastAPI project + Postgres/PostGIS via Docker

**Prompt:**
```
Scaffold backend-v2/ as a FastAPI project exactly per docs/PRD.md section 10's
backend-v2/ tree: requirements.txt (fastapi, uvicorn, sqlalchemy>=2.0, alembic,
psycopg2-binary, geoalchemy2, shapely, geojson-pydantic, pydantic-settings,
python-jose[cryptography], passlib[bcrypt], pytest, httpx), pyproject.toml,
alembic.ini + alembic/versions/, app/main.py with a basic FastAPI() app and a
/health endpoint, app/core/config.py (pydantic-settings reading DATABASE_URL,
JWT_SECRET from .env), app/db/session.py (SQLAlchemy engine/session), and a
docker-compose.yml with two services: `db` (postgis/postgis:16-3.4 image, exposed
port 5432, a named volume, POSTGRES_DB=landstack) and `api` (build from backend-v2/
Dockerfile, depends_on db, port 8000). Create a matching Dockerfile. Add a
backend-v2/.env.example. Run `docker compose up` and confirm /health returns 200.
```

## 2. Task: SQLAlchemy models — administrative hierarchy + base layer

**Prompt:**
```
In app/models/geo.py, implement SQLAlchemy models for: State, District, Taluka,
Village, Parcel (geom as geoalchemy2 Geometry('POLYGON', srid=4326), with a GIST
index), MasterPlanZone (geom Polygon), UtilityInfrastructure (geom Point or
LineString) — fields exactly as specified in docs/PRD.md section 8. Generate an
Alembic migration for these tables and apply it against the dockerized Postgres.
Confirm with `\d parcels` in psql that the GIST index exists on geom.
```

## 3. Task: SQLAlchemy models — essential + additional layers

**Prompt:**
```
In app/models/rights.py implement Owner, RecordOfRights, Registration, Encumbrance,
Mutation. In app/models/planning.py implement BuildingPermission,
PropertyTaxRecord. Use the exact enums and fields from docs/PRD.md section 8.
Generate and apply the Alembic migration. All FKs to parcels.id must cascade
appropriately (ON DELETE RESTRICT — we never want to silently orphan legal records).
```

## 4. Task: SQLAlchemy models — platform/DPI layer (our differentiators)

**Prompt:**
```
In app/models/platform.py implement User (with role enum), Consent, AuditTrail
(prev_hash/curr_hash as CHAR(64)), ApiClient. In app/models/intelligence.py
implement ChangeDetectionAlert, DisputeRiskScore, Grievance. Match docs/PRD.md
section 8 exactly. Generate and apply the migration.
```

## 5. Task: Seed script with realistic synthetic data

**Prompt:**
```
Write scripts/generate_synthetic_parcels.py and scripts/seed_data.py to populate:
- 3-4 states (mirror the existing Frontend/ demo's states: Telangana, Uttar Pradesh,
  Maharashtra, Karnataka, Tamil Nadu, Bihar, Puducherry) with districts/talukas/villages
- 150-300 parcels with plausible polygon geometries (small randomly-generated squares/
  irregular polygons near real district centroids — approximate lat/long is fine, this
  is a demo, but keep them geographically inside the right state's bounding box)
- For each parcel: 1+ record_of_rights, 0-1 registration, 0-1 encumbrance (make ~20%
  of parcels have an active encumbrance so the intelligence score has real variance),
  1-3 mutations with a realistic date sequence, 0-1 building_permission
- A handful of master_plan_zones per state (residential/commercial/industrial polygons
  covering some but not all seeded parcels, so zoning-check has real "outside zone"
  and "inside zone" cases)
- ~10 parcels where area_recorded_sqm deliberately differs from the polygon's real
  ST_Area by more than 5%, to give the dispute-risk score real signal to catch
- 5-8 demo user accounts across all roles with a known password for live demo login
- 2-3 change_detection_alerts, clearly marked source='seeded_demo' (never claim these
  came from real satellite imagery)
Run the seed script against the dockerized DB and confirm row counts per table.
```

## 6. Task: Auth endpoints

**Prompt:**
```
Implement app/core/security.py (password hashing, JWT create/verify) and
app/api/v1/auth.py: POST /auth/register, POST /auth/login (returns access + refresh
JWT), POST /auth/refresh. Add a FastAPI dependency get_current_user and a
require_role(*roles) dependency factory for RBAC on later endpoints. Write pytest
tests covering register->login->access a protected dummy route->refresh.
```

## 7. Task: Parcel + essential-layer read endpoints

**Prompt:**
```
Implement app/api/v1/parcels.py with GET /parcels (search by query string across
ulpin/survey_number/khasra_number/patta_number, plus state/district/village filters,
paginated), GET /parcels/{ulpin} (returns geom as GeoJSON via geoalchemy2's
to_shape + shapely mapping), GET /parcels/{ulpin}/ror, /registrations,
/encumbrances, /mutations, /building-permissions, /tax, and a combined
/parcels/{ulpin}/history endpoint that merges registrations+mutations+alerts sorted
by date into one chronological list with a `type` discriminator field. Add
app/services/geo_service.py with a `zoning_check(parcel_id)` function doing a
PostGIS ST_Intersects between the parcel's geom and master_plan_zones, exposed as
POST /parcels/{ulpin}/zoning-check. Write pytest tests against the seeded data for
at least: a successful ULPIN lookup, a search-by-khasra hit, and one zoning-check
that returns a real zone match.
```

## 8. Task: Dispute-Risk / Trust Score service (key differentiator)

**Prompt:**
```
Implement app/services/risk_scoring_service.py: a function compute_trust_score(parcel)
returning {score: float 0-100, factors: {area_variance_pct, encumbrance_active,
mutation_frequency_12mo, pending_litigation, boundary_overlap_flag}, model_version}.
Start with a transparent weighted-rules formula (NOT a black-box model) so every
factor and its weight is inspectable and explainable live to judges — e.g.
100 - (area_variance_pct * 2) - (30 if encumbrance_active else 0) - (mutation_frequency
* 5) - (40 if pending_litigation else 0), clamped to [0,100]. Persist each computed
score into dispute_risk_scores. Expose GET /parcels/{ulpin}/intelligence returning the
latest score + factors. If time remains after this works end-to-end, add a
scikit-learn logistic regression trained on the seeded data as an optional
`model_version=ml_v1` alternative behind the same endpoint (query param
?model=rules|ml), but the rules-based version must work reliably as the fallback
since it will be demoed live.
```

## 9. Task: Hash-chained audit trail (differentiator)

**Prompt:**
```
Implement app/services/hash_chain_service.py: on every write to
record_of_rights/registrations/mutations/encumbrances, compute
curr_hash = SHA256(prev_hash + json.dumps(payload_diff, sort_keys=True)) and insert an
audit_trail row (prev_hash = the entity's last curr_hash, or 64 zeros if first entry).
Wire this as a SQLAlchemy event listener or an explicit service call from each
mutating endpoint (be explicit and readable over clever — this needs to survive a
live demo walkthrough of "watch a record change and see its hash update"). Expose
GET /audit/{entity_type}/{entity_id} returning the full chain, and add a
verify_chain() helper that recomputes hashes and returns whether the chain is intact,
exposed as a query param ?verify=true on that same endpoint.
```

## 10. Task: Consent layer (key differentiator)

**Prompt:**
```
Implement app/api/v1/consents.py: POST /consents (any authenticated user requests
access to a parcel with purpose + scope[]), PATCH /consents/{id} (only the parcel's
current owner, matched via record_of_rights, can approve/revoke — enforce this in the
handler, return 403 otherwise), GET /consents/mine (role-aware: owners see requests
targeting their parcels, requesters see their own outgoing requests). Approved
consents must carry a valid_until timestamp (default 30 days) and any read of a scoped
field by another user must check for an active, non-expired, approved consent
covering that scope — implement this check as a reusable dependency
require_consent(scope) usable by other read endpoints (e.g. a bank_official reading
/parcels/{ulpin}/encumbrances should be denied without an approved consent covering
"encumbrance"). Write pytest tests for: request -> denied before approval -> owner
approves -> access granted -> owner revokes -> access denied again.
```

## 11. Task: Alerts + Grievances + officer workflow

**Prompt:**
```
Implement app/api/v1/alerts.py (GET /alerts filterable by state/status, PATCH
/alerts/{id} restricted to revenue_officer/planning_officer roles) and
app/api/v1/grievances.py (POST /grievances by any citizen, GET /grievances?officer=
scoped to the assigned officer, PATCH /grievances/{id} status transitions). Add
app/services/change_detection_service.py with a mock_compare(parcel_id) function
that compares two seeded GeoJSON snapshots (before/after) for a parcel and computes a
simple area-difference-based confidence_score, inserting a change_detection_alerts
row with source='seeded_demo' — be explicit in code comments and API response that
this is a simulated comparison, not a live satellite feed, so the team never
misrepresents this in the demo.
```

## 12. Task: Developer sandbox endpoints

**Prompt:**
```
Implement app/api/v1/developer.py: POST /dev/api-keys (creates an ApiClient row,
returns the raw key once, stores only its hash), a FastAPI middleware/dependency
that validates X-API-Key header against api_clients for any request under a
/public/* router mirroring a read-only subset of parcel search (no PII fields), and
basic per-key rate limiting (simple in-memory token bucket keyed by api_client id is
fine for a hackathon — do not over-engineer this with Redis unless time remains).
```

## 13. Task: Export OpenAPI spec + deploy

**Prompt:**
```
Confirm FastAPI's auto-generated /docs (Swagger) and /openapi.json work cleanly with
descriptive summaries on every route (add `summary=` and `description=` args where
missing). Export the spec to docs/api-spec.yaml (convert JSON->YAML). Then prepare
backend-v2 for deployment on Render or Railway: add a render.yaml or railway config,
confirm environment variables (DATABASE_URL, JWT_SECRET) are documented in
backend-v2/.env.example, and do a full fresh-clone smoke test (docker compose up,
run migrations, run seed script, hit /health and one real endpoint) before handing the
deployed URL to Person 1.
```

---

## Reference: talk to Person 1 before you finalize these

- Task 7 — confirm the exact GeoJSON shape frontend-v2's MapView component expects (Feature vs FeatureCollection).
- Task 8 — the `factors` dict keys become UI labels directly — pick clear, stable names and don't rename them after Person 1 starts building against them.
- Task 10 — confirm the consent `scope` string values (`"ror"`, `"encumbrance"`, `"tax"`) match exactly what the ConsentRequestForm checkboxes send.

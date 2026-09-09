# Person 2 — Backend & Database Tasks & Execution Checklist
> **Quota Strategy Notice**: Refer to [MODEL_ALLOCATION_PLAN.md](file:///g:/frame/MODEL_ALLOCATION_PLAN.md). Follow the strict model allocation per task to preserve quota for the 2-day build.

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
| **2** | Models — admin hierarchy + base layer (geom/PostGIS) | **Claude/GPT** | Isolated | Pending | Spatial models with SRID 4326, SP-GIST/GIST indexes, GeoJSON serializers |
| **3** | Models — essential + additional layers | **Gemini** | **Batch 2 (3+7)** | Pending | SQLAlchemy models for Encumbrances, Mortgages, Court cases, Mutation history following base pattern |
| **4** | Models — platform/DPI layer (User/Consent/AuditTrail) | **Claude/GPT** | Isolated | Pending | Cryptographic hash-chain fields (`prev_hash`, `block_hash`), consent grant models, role enums |
| **5** | Seed script (synthetic data incl. deliberate variance cases) | **Gemini** | **Dedicated review** | Pending | Deterministic demo records with clean parcels + realistic mismatch cases (area dispute, duplicate ownership claim) |
| **6** | Auth endpoints (JWT, RBAC deps) | **Claude/GPT** | Isolated | Pending | Secure token issue, FastAPI `Security` dependencies for Citizen, Bank Officer, Revenue Officer roles |
| **7** | Parcel + essential-layer read endpoints + zoning check | **Gemini** | **Batch 2 (3+7)** | Pending | Read queries by ULPIN / Geo-coordinates, boundary overlap checks with zoning polygons |
| **8** | Dispute-Risk / Trust Score service | **Claude/GPT** | **Differentiator** | Pending | Weighted explainable risk calculation (0-100), breakdown of factors (litigation, tax arrears, mutation speed) |
| **9** | Hash-chained audit trail | **Claude/GPT** | **Core Feature** | Pending | Tamper-evident ledger service; SHA-256 block chain verification endpoint `/audit/verify` |
| **10** | Consent layer + `require_consent` dependency | **Claude/GPT** | **High Stakes** | Pending | FastAPI dependency checking active, non-expired consent token for sensitive dossier extraction |
| **11** | Alerts + Grievances + mock change-detection | **Gemini** | **Batch 4 (11+12+13)**| Pending | CRUD for citizen grievances, simulated NDVI/satellite boundary shift alerts |
| **12** | Developer sandbox (API keys, rate limiting) | **Gemini** | **Batch 4 (11+12+13)**| Pending | API key generation & validation middleware, sliding window rate limits |
| **13** | Export OpenAPI spec + deploy | **Gemini** | **Batch 4 (11+12+13)**| Pending | Clean `openapi.json`, CORS configuration for frontend, deployment script / container run instructions |

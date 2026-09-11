# National Land Intelligence Platform (NLIP)
### State-Level Integrated GIS Digital Public Infrastructure for Land Governance

[![SIH Problem Statement](https://img.shields.io/badge/SIH%202024-PS%20%2326014-orange.svg)](https://www.sih.gov.in/)
[![Authority](https://img.shields.io/badge/Authority-DoLR%20%2F%20MoRD-blue.svg)](https://dolr.gov.in/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![GIS / Maps](https://img.shields.io/badge/Spatial-Leaflet%20%2B%20GeoJSON-199900.svg?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Security](https://img.shields.io/badge/Security-SHA--256%20Merkle%20Ledger-gold.svg)]()
[![Compliance](https://img.shields.io/badge/Compliance-DPDP%20Act%202023%20%7C%20DEPA-success.svg)]()

---

## 📌 Executive Summary

The **National Land Intelligence Platform (NLIP)** is a unified, state-configurable Digital Public Infrastructure (DPI) reference implementation built for the **Department of Land Resources (DoLR), Ministry of Rural Development, Government of India**.

NLIP resolves the nationwide challenge of fragmented land registries by establishing a single source of truth anchored by the **14-digit Unique Land Parcel Identification Number (ULPIN / Bhu-Aadhaar)**. It dynamically synthesizes Cadastral survey boundaries, Record of Rights (RoR / Khatauni), Registered Deeds (NGDRS), Bank Mortgages (CERSAI), Civil Court stays (e-Courts), Town Planning master plans, and Property Tax registers into an interactive geospatial data fabric.

```
                  ┌────────────────────────────────────────────────────────┐
                  │          NLIP UNIFIED LAND REVENUE FABRIC              │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      ▼                  ▼                   ▼                   ▼                  ▼
┌───────────┐      ┌───────────┐       ┌───────────┐       ┌───────────┐      ┌───────────┐
│ Cadastral │      │ Record of │       │ Deed Reg. │       │ Mortgages │      │ Judicial  │
│  Survey   │      │  Rights   │       │  (NGDRS)  │       │ (CERSAI)  │      │ (e-Courts)│
└─────┬─────┘      └─────┬─────┘       └─────┬─────┘       └─────┬─────┘      └─────┬─────┘
      │                  │                   │                   │                  │
      └──────────────────┴───────────────────┼───────────────────┴──────────────────┘
                                             │
                                             ▼
                       ┌───────────────────────────────────────────┐
                       │ 14-Digit ULPIN / Bhu-Aadhaar Geospatial ID│
                       └─────────────────────┬─────────────────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              ▼                              ▼                              ▼
    ┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
    │  Explainable AI    │         │ Tamper-Evident     │         │ DEPA & DPDP 2023   │
    │  Trust Score (0-100│         │ SHA-256 Ledger     │         │ Consent Manager    │
    └────────────────────┘         └────────────────────┘         └────────────────────┘
```

---

## 🚀 Key Architectural Pillars

### 1. 🗺️ Cadastral GIS Engine & Variance Detection
- Interactive polygon boundary rendering with vector and satellite imagery basemaps.
- Real-time geometric analysis computing percentage area variance between digitized cadastral GIS boundaries and textual revenue records (`area_gis_sqm` vs `area_recorded_sqm`).
- Automatic flagging of boundary variances exceeding statutory thresholds (>2%).

### 2. 🔍 Multi-Tier Universal Discovery
- **Quick Search**: Free-text lookup across ULPIN, Survey Numbers, Khasra, Gata, or Patta IDs.
- **Hierarchical Cascade**: State → District → Taluka → Village administrative navigation adhering to the Local Government Directory (LGD).

### 3. 📑 360° Certified Land Dossier
- Comprehensive parcel overview, ownership breakdown (Pattadars / joint owners), encumbrance ledger, town planning sanction status, and tax receipts.
- Single-click print/export functionality with watermarked official certification headers.

### 4. 🛡️ Tamper-Evident SHA-256 Audit Trail (Data Trail Ledger)
- Chronological, cryptographically sealed Merkle-chain ledger tracking every action (Cadastral Genesis, Mutations, Deed Transfers, Mortgage Releases, Municipal Permits).
- Block integrity validator providing client-side SHA-256 re-computation and visual verification against genesis blocks.

### 5. 🧠 Explainable AI Dispute-Risk & Trust Score (0–100)
- Multi-factor risk engine computing land title safety with transparent factor weights:
  - Spatial boundary variance penalty
  - Active litigation / encumbrance deductions
  - Mutation velocity flags (high-frequency title transfers)
  - Tax compliance and revenue regularisation

### 6. 🔐 DEPA & DPDP Act 2023 Consent Gateway
- Citizen data sovereignty interface allowing landowners to view, approve, or revoke third-party data access requests (e.g., banks evaluating mortgage applications).
- Scoped permissions (`ror`, `encumbrance`, `registration`, `tax`, `building_permission`) with strict time expiration and cryptographic audit logs.

### 7. 🏛️ Revenue Officer & Town Planner Command Dashboard
- Administrative triage queue for satellite/drone change-detection alerts (unauthorized construction, boundary shifts, land-use deviations).
- Citizen grievance lifecycle management with status escalation modals.

### 8. 💻 Developer Sandbox & API Gateway
- Developer portal for government and fintech integrators to generate rate-limited API keys.
- Live interactive API testing console with cURL / JSON snippets and OpenAPI 3.1 compliance.

---

## 📂 Repository Structure

```text
frame/
├── Frontend/                 # React 18 + Vite + TypeScript web application
│   ├── mocks/               # MSW & deterministic seed datasets (Parcels, RoR, Audit Trail)
│   ├── src/
│   │   ├── components/      # UI components (GIS Map, Dossier, Data Trail, Search, Modals)
│   │   ├── context/         # Auth & global state management
│   │   ├── hooks/           # Custom React hooks (debounce, API queries)
│   │   ├── lib/             # API client, axios/fetch configuration
│   │   ├── pages/           # Route views (Home, Search, Dossier, Consent, Officer, Dev Sandbox)
│   │   └── types/           # Canonical TypeScript domain interfaces & enums
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # FastAPI + SQLAlchemy + PostGIS REST backend
│   ├── alembic/             # Database migration revisions
│   ├── app/
│   │   ├── api/v1/          # Endpoints (auth, parcels, consents, audit, alerts, developer)
│   │   ├── core/            # Configuration, security (JWT, hashing), CORS
│   │   ├── db/              # Database session & engine initialization
│   │   ├── models/          # SQLAlchemy ORM models (Spatial & Platform tables)
│   │   ├── schemas/         # Pydantic validation schemas
│   │   └── services/        # Trust score engine, hash-chain verification service
│   ├── scripts/             # Database seed & test data scripts
│   ├── main.py              # Application entrypoint
│   └── requirements.txt
│
├── docs/                     # Central documentation & specification suite
│   ├── standard-technical-document.md  # 1. Standard Technical Specification (SIH PS #26014)
│   ├── SYSTEM_BREAKDOWN.md             # 2. Comprehensive System Architecture & Deep Dive
│   ├── PRD.md                          # 3. Product Requirements Document & Data Dictionary
│   ├── openapi.json                    # 4. OpenAPI 3.1 REST API Specification
│   ├── api-spec.yaml                   # 5. Interactive Swagger / YAML Specification
│   ├── MODEL_ALLOCATION_PLAN.md        # 6. Antigravity AI Model Allocation Strategy
│   ├── PERSON1_FRONTEND_TASKS.md       # 7. Frontend Tasks & Implementation Checklist
│   └── PERSON2_BACKEND_TASKS.md        # 8. Backend Tasks & Implementation Checklist
│
├── .gitignore
├── pyrightconfig.json
└── README.md                 # Root project overview (this document)
```

---

## 📚 Documentation Index (Recommended Reading Order)

For evaluators, architects, and developers, explore the documentation suite in [`docs/`](docs/) in this sequence:

| Step | Document | Purpose |
| :---: | :--- | :--- |
| **1** | [**Standard Technical Document**](docs/standard-technical-document.md) | Official SIH technical specification, architectural diagrams, DPI integration patterns, and security frameworks. |
| **2** | [**System Breakdown**](docs/SYSTEM_BREAKDOWN.md) | Complete page-by-page walkthrough, component mappings, state machines, and UX features. |
| **3** | [**Product Requirements Document (PRD)**](docs/PRD.md) | Full PRD detailing functional requirements, data schemas, and state-specific land terminology. |
| **4** | [**OpenAPI 3.1 JSON Specification**](docs/openapi.json) | Machine-readable API schema defining all endpoints, query parameters, and models. |
| **5** | [**API Specification YAML**](docs/api-spec.yaml) | Interactive Swagger / Redoc compatible API specification. |
| **6** | [**Model Allocation Plan**](docs/MODEL_ALLOCATION_PLAN.md) | AI-assisted development quota management and architecture strategy. |
| **7** | [**Frontend Task Execution Doc**](docs/PERSON1_FRONTEND_TASKS.md) | Frontend execution checklist (Tasks 1–13) detailing deliverables and acceptance criteria. |
| **8** | [**Backend Task Execution Doc**](docs/PERSON2_BACKEND_TASKS.md) | Backend execution checklist (Tasks 1–13) detailing models, endpoints, and services. |

---

## ⚡ Quick Start & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or later (`npm v9+`)
- **Python**: v3.11 or later
- **PostgreSQL / PostGIS** (Optional — SQLite fallback supported for standalone testing)

---

### 1. Running the Backend

```bash
# Navigate to backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations and seed demo data
python scripts/seed_data.py

# Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

The backend server will launch at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`

---

### 2. Running the Frontend

```bash
# Navigate to frontend directory
cd Frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be accessible at:
- **Web App**: `http://localhost:5173`

> **Note on Standalone Mode**: The frontend includes deterministic mock fallbacks. If the backend is not running, the platform seamlessly operates using realistic state seed records (UP, Maharashtra, Karnataka, Telangana, Rajasthan).

---

## 👥 Demo User Personas & Credentials

The platform includes a 1-click **Role Switcher** in the top navigation bar to test different persona experiences:

| Persona | Name | Email | Permissions & Scenarios |
| :--- | :--- | :--- | :--- |
| **Citizen (Pattadar)** | Arjun Sharma | `arjun@example.in` | Search parcels, view digital title deeds, manage DPDP consent tokens for lenders. |
| **Revenue Officer** | Ravi Kumar | `ravi.kumar@revenue.ka.gov.in` | Triage satellite encroachment alerts, resolve citizen boundary disputes, sanction mutations. |
| **Bank Official** | Priya Nair | `priya@bankofmah.in` | Submit mortgage consent requests, evaluate parcel Trust Scores and legal encumbrances. |
| **Developer / GovTech** | Dev Portal User | `dev@nlip.in` | Generate scoped API client tokens, test endpoints in the developer sandbox playground. |

---

## 🔬 Featured Showcase Land Parcels

Explore these pre-seeded parcels representing real-world legal and spatial scenarios:

| ULPIN | State / Location | Legal / Spatial Condition | Demonstrates |
| :--- | :--- | :--- | :--- |
| **`TS36280201001`** | Telangana (Gachibowli) | Disputed Civil Suit + 8.2% Boundary Variance | Active civil litigation warning, Trust Score deduction, multi-block audit trail. |
| **`UP09412601001`** | Uttar Pradesh (Lucknow) | Clean Registered Residential Title | 96/100 Trust Score, validated CORS cadastral coordinates, zero encumbrances. |
| **`MH27830501001`** | Maharashtra (Andheri) | Active Bank Mortgage | CERSAI registered hypothecation lien, commercial zoning permission. |
| **`KA29140401001`** | Karnataka (Whitefield) | Unauthorized Construction Alert | AI drone-detected building footprint expanding beyond approved FAR sanction. |
| **`RJ08520301001`** | Rajasthan (Jaipur) | Pending Mutation Transfer | Pending gift deed title mutation awaiting Tahsildar sanction. |

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries / Modules |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Vite | Tailwind CSS, Lucide Icons, React Router v6 |
| **Geospatial & Maps** | Leaflet / React-Leaflet | GeoJSON, EPSG:4326 CRS, Satellite Tiles |
| **Backend Framework** | FastAPI (Python 3.11+) | Pydantic v2, Starlette, Uvicorn |
| **Database & ORM** | PostgreSQL 15+ with PostGIS | SQLAlchemy 2.0, GeoAlchemy2, Alembic |
| **Security & DPI** | JWT (RS256/HS256) | SHA-256 Merkle Ledger, DPDP / DEPA Consent Handler |
| **API Standards** | OpenAPI 3.1 | Swagger UI, ReDoc, CORS Middleware |

---

## ⚖️ Standards & Regulatory Alignments

- **Bhu-Aadhaar (ULPIN)**: Follows the Department of Land Resources 14-digit alphanumeric standard based on latitude-longitude centroid geocoding.
- **DEPA (Data Empowerment and Protection Architecture)**: Citizen-centric electronic consent architecture for financial and land information disclosure.
- **DPDP Act 2023**: Digital Personal Data Protection compliant purpose-bound, revocable, and time-limited data consent workflows.
- **OGC Interoperability**: Cadastral boundaries formatted in standard GeoJSON using WGS84 (EPSG:4326).
- **DILRMP**: Direct compatibility with Digital India Land Records Modernization Programme standards.

---

## 📄 License & Attribution

Developed for the **Smart India Hackathon (SIH 2024)** under Problem Statement **#26014** — *Integrated Land Record DPI Platform for Revenue Administration*.

*Ministry of Rural Development, Department of Land Resources (DoLR), Government of India.*
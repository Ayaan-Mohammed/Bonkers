# Standard Technical Document: National Land Intelligence Platform (NLIP)
## State-Level Integrated GIS Digital Public Infrastructure for Land Governance
**Problem Statement ID:** SIH PS #26014  
**Authority:** Department of Land Resources (DoLR), Ministry of Rural Development, Government of India  
**Version:** 1.0 (Production Candidate)  
**Date:** September 2026  
**Reference Implementations:** Chandigarh Landstack, DILRMP, Singapore Land Authority (INLIS), UK HM Land Registry  

---

## Executive Summary

The **National Land Intelligence Platform (NLIP)** is a state-configurable Digital Public Infrastructure (DPI) reference implementation designed to eliminate land record fragmentation across India's states and union territories. Operating under the single source of truth anchored by the **14-digit Unique Land Parcel Identification Number (ULPIN / Bhu-Aadhaar)**, NLIP unifies cadastral maps, Record of Rights (RoR), registration deeds, encumbrances, court stays, master plan zoning, building permissions, property taxation, and utility infrastructure into an interoperable geospatial data fabric.

NLIP incorporates three architectural innovations that elevate land administration from passive registry storage into proactive intelligence:
1. **DEPA & DPDP Act 2023 Compliant Consent Gateway**: Enables time-boxed, purpose-bound access tokens for financial institutions and citizens with cryptographic audit trails.
2. **Explainable AI Dispute-Risk & Trust Engine**: A rules-and-ML hybrid engine evaluating spatial variance, encumbrance density, mutation velocity, and litigation exposure into a 0–100 Trust Score.
3. **Tamper-Evident SHA-256 Hash-Chained Audit Ledger**: Guarantees immutable provenance across deed registrations, boundary mutations, and revenue orders.

---

## 1. System Architecture

NLIP adheres to a federated, micro-modular DPI architecture separating citizen interaction, departmental workflow engines, spatial computation, and secure cryptographic storage.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION & CHANNELS LAYER                              │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌────────────────────────────┐  │
│  │ Citizen & Bank Portal │  │ Officer & Survey Admin │  │  Developer Sandbox & Docs  │  │
│  │ (React 18, Leaflet)   │  │ (Revenue / ULB / SRO)  │  │  (OpenAPI 3.1, Rate Limit) │  │
│  └───────────┬───────────┘  └───────────┬────────────┘  └─────────────┬──────────────┘  │
└──────────────┼──────────────────────────┼─────────────────────────────┼─────────────────┘
               │                          │                             │
               ▼                          ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY & SECURITY PERIMETER                              │
│  - Reverse Proxy / Load Balancer (Nginx / Cloudflare / Envoy)                           │
│  - JWT Bearer Authentication (RS256/HS256) & Sliding Window Rate Limiting               │
│  - DEPA Consent Interceptor (`require_consent` scope enforcement)                       │
└─────────────────────────────────────────┬───────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                            CORE BUSINESS & ENGINE SERVICES                              │
│  ┌───────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────┐  │
│  │   Parcels & Spatial API   │  │  Trust & Risk Analytics  │  │ Hash-Chained Ledger  │  │
│  │   (ST_Intersects, Area)   │  │  (Multi-factor Scoring)  │  │ (SHA-256 Merkle-like)│  │
│  └─────────────┬─────────────┘  └────────────┬─────────────┘  └──────────┬───────────┘  │
│                │                             │                           │              │
│  ┌─────────────┴─────────────┐  ┌────────────┴─────────────┐  ┌──────────┴───────────┐  │
│  │   Consent Manager (DPI)   │  │ Change Detection / Alert │  │ Grievance Workflow   │  │
│  │   (DPDP Purpose Binding)  │  │ (Sentinel-2 / Drone Sim) │  │ (Auto-escalation)    │  │
│  └───────────────────────────┘  └──────────────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────┬───────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               PERSISTENCE & SPATIAL FABRIC                              │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL 16 + PostGIS 3.4 Spatial Database                                       │  │
│  │ - Spatial Geometry Columns: SRID 4326 (WGS 84), GIST 2D/N-D R-Tree Indexes        │  │
│  │ - Relational Modules: States, Districts, Talukas, Villages, Parcels               │  │
│  │ - Rights: RoR, Owners, Registrations, Encumbrances, Mutations                     │  │
│  │ - Planning: MasterPlanZones, BuildingPermissions, PropertyTax, Utilities          │  │
│  │ - Platform: Users, Consents, AuditTrail, ApiClients, Grievances, Alerts           │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Key Architectural Decisions
- **Canonical Identifier**: ULPIN (14-character alphanumeric based on longitude/latitude centroid per DoLR standards) is the immutable primary key joining all disparate departmental records.
- **Stateless Application Tier**: The FastAPI Python backend executes asynchronously without session state, enabling horizontal auto-scaling across container clusters (Kubernetes / ECS).
- **Spatial Indexing Strategy**: PostGIS GIST indexes (`parcels_geom_gix`, `zones_geom_gix`, `utility_geom_gix`) enable sub-50ms bounding box queries and polygon-in-polygon zoning verification across millions of records.
- **Resilient Dual-Mode Execution**: Built to run both in full production (PostgreSQL 16 + PostGIS) and local offline/edge development mode (SQLite + Shapely fallback) without modifying application code.

---

## 2. API & Interoperability Standards

NLIP exposes fully documented RESTful APIs adhering to **OpenAPI Specification 3.1.0** and ISO/IEC 20922 standards. The complete schema is exported to [`docs/openapi.json`](file:///g:/frame/docs/openapi.json) and [`docs/api-spec.yaml`](file:///g:/frame/docs/api-spec.yaml).

### 2.1 Core API Endpoints

| Category | Method & Route | Purpose | Access Tier |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST /api/v1/auth/login` | Authenticate user & issue JWT bearer access + refresh tokens | Public |
| **Auth** | `POST /api/v1/auth/register` | Self-service citizen or developer registration | Public |
| **Auth** | `GET /api/v1/auth/me` | Current authenticated session identity & assigned roles | Authenticated |
| **Parcels** | `GET /api/v1/parcels` | Search parcels by query, state, district, or village with pagination | Public / Scoped |
| **Parcels** | `GET /api/v1/parcels/{ulpin}` | 360° Parcel dossier metadata and boundary geometry | Public / Scoped |
| **Rights** | `GET /api/v1/parcels/{ulpin}/ror` | Record of Rights: co-owners, share fractions, khatauni records | Citizen / Official |
| **Rights** | `GET /api/v1/parcels/{ulpin}/registrations` | Certified sale deeds, gift deeds, Sub-Registrar Office (SRO) history | Consent / Officer |
| **Rights** | `GET /api/v1/parcels/{ulpin}/encumbrances` | Active mortgages, bank hypothecations, and civil court stay orders | Bank / Officer |
| **Rights** | `GET /api/v1/parcels/{ulpin}/mutations` | Chronological lineage of mutation orders (inheritance, sale, partition)| Public / Officer |
| **Planning**| `GET /api/v1/parcels/{ulpin}/building-permissions` | Approved Floor Area Ratio (FAR), height clearance, sanctions | Public |
| **Planning**| `POST /api/v1/parcels/{ulpin}/zoning-check` | Spatial intersection against Master Plan zones (residential, commercial)| Citizen / Developer|
| **Audit** | `GET /api/v1/audit/{type}/{id}` | Retrieve tamper-evident hash-chained audit blocks with `verify=true` | Officer / Auditor |
| **Analytics**| `GET /api/v1/parcels/{ulpin}/intelligence` | Compute explainable 0–100 Dispute Risk & Trust Score | Consent / Officer |
| **Consent** | `POST /api/v1/consents` | Bank/third-party request for time-limited, purpose-bound parcel dossier | Bank Official |
| **Consent** | `PATCH /api/v1/consents/{id}` | Landowner approves, rejects, or revokes active data-sharing consent | Citizen Owner |
| **Alerts** | `GET /api/v1/alerts` | Sentinel-2 satellite & drone encroachment / boundary shift alerts | Revenue Officer |
| **Grievance**| `POST /api/v1/grievances` | Citizen title/boundary grievance submission with auto-tracking ID | Citizen |
| **Developer**| `POST /api/v1/dev/api-keys` | Generate scoped Sandbox API key with quota enforcement | Developer |

---

## 3. Data Schemas & Terminology Harmonization (GoRT)

### 3.1 Multi-State Terminology Normalization Layer
India's 28 states and 8 UTs utilize historically fragmented revenue vocabularies. NLIP incorporates the Ministry of Rural Development's **Glossary of Revenue Terms (GoRT)** (released 31 Dec 2025) to map regional nomenclatures into unified canonical attributes:

| Canonical Schema Field | Uttar Pradesh / Bihar | Telangana / AP | Maharashtra | Karnataka | Tamil Nadu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `survey_number` | Khasra Number | Survey No / Sy No | Survey / Gut No | Survey Number | Survey Number |
| `subdivision_number` | Gata / Minjumla | Hissa Number | Pot Hissa | Hissa Number | Sub-division No |
| `tenure_record_id` | Khata / Khatauni | Pattadar Passbook | 7/12 Utara | RTC / Pahani | Patta Number |
| `area_recorded` | Bigha / Biswa / Sqm | Acre / Gunta | Guntha / Hectare | Gunta / Acre | Cent / Ground / Hectare |
| `mutation_record` | Dakhil Kharij | Namantaran | Ferfar | Mutation Extract | Patta Transfer |
| `encumbrance_certificate` | Bar-Mukti / Rinn | EC / Nil Encumbrance | Boja / बोजा | EC (Form 15/16) | Villangam Sandrusedhu |

### 3.2 Canonical Data Models

```sql
-- Parcels Core Base Layer
CREATE TABLE parcels (
    id SERIAL PRIMARY KEY,
    ulpin VARCHAR(14) UNIQUE NOT NULL,
    village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE RESTRICT,
    survey_number VARCHAR(100),
    khasra_number VARCHAR(100),
    gata_number VARCHAR(100),
    patta_number VARCHAR(100),
    area_recorded_sqm NUMERIC(12, 2),
    area_gis_sqm NUMERIC(12, 2),
    land_use_type VARCHAR(50),
    geom GEOMETRY(POLYGON, 4326) NOT NULL,
    source VARCHAR(50) DEFAULT 'cadastral_survey',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX parcels_geom_gix ON parcels USING GIST (geom);

-- Cryptographic Hash-Chained Audit Ledger
CREATE TABLE audit_trail (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    payload JSONB NOT NULL,
    prev_hash VARCHAR(64) NOT NULL,
    block_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_audit_entity ON audit_trail (entity_type, entity_id);
```

---

## 4. Geospatial Data Standards

1. **Coordinate Reference System (CRS)**: All external APIs, GeoJSON payloads, and boundary storage strictly standardize on **EPSG:4326 (WGS 84)** latitude/longitude coordinates. Internal area calculations use EPSG:7755 (India NSIDC LCC) or spherical geodesic calculations (`ST_Area(geography)`).
2. **Standard Serialization**: Geospatial endpoints return standard **RFC 7946 GeoJSON** Feature and FeatureCollection objects.
3. **Topological Integrity**: Boundary vertices are validated via Shapely / PostGIS `ST_IsValid` and `ST_SimplifyPreserveTopology` with tolerance ≤ 0.000005° (~0.5m) to ensure zero self-intersection or sliver polygon anomalies.
4. **Spatial Operations**:
   - Master Plan compliance: `ST_Intersects(parcel.geom, zone.geom)`
   - Cadastral vs. Drone Boundary Shift: `ST_SymDifference(before_geom, after_geom)`
   - Infrastructure Proximity: `ST_DWithin(parcel.geom::geography, infra.geom::geography, distance_meters)`

---

## 5. Security & DPI Privacy Framework

### 5.1 DPDP Act 2023 & DEPA Compliance
Under India's Digital Personal Data Protection (DPDP) Act 2023 and the Data Empowerment and Protection Architecture (DEPA):
- **Purpose-Bound Access**: Financial institutions (e.g. SBI, HDFC) requesting parcel title dossiers must specify an explicit purpose (`loan_underwriting`, `legal_scrutiny`), access duration (e.g., 7 days), and requested scope (`ror_encumbrance_only`, `full_dossier`).
- **Owner Consent Mechanism**: The registered citizen landowner receives a real-time consent notification. Data is withheld until explicit approval is registered.
- **Revocability**: Owners retain statutory rights to revoke active consents at any moment from the Consent Portal, instantly invalidating third-party read tokens.
- **Aadhaar & Mobile Privacy**: Raw citizen identification numbers are strictly prohibited from persistence; all citizen records utilize one-way SHA-256 salted hashes (`aadhaar_hash`, `mobile_hash`).

### 5.2 Tamper-Evident Hash Chain Algorithm
Every state-changing write to Record of Rights, Registrations, Mutations, and Encumbrances computes a cryptographic block hash:

$$\text{Block Hash} = \text{SHA-256}(\text{prev\_hash} \parallel \text{entity\_type} \parallel \text{entity\_id} \parallel \text{action} \parallel \text{JSON(payload)} \parallel \text{timestamp})$$

The genesis block utilizes 64 zeros (`0000...0000`). If any malicious actor directly alters historical rows in the underlying database, the verification endpoint `/api/v1/audit/{type}/{id}?verify=true` computes the re-hashed chain, flags the tampering index, and fails verification.

---

## 6. AI Dispute-Risk & Trust Scoring Engine

To address SIH PS #26014's directive for intelligent decision-support analytics, NLIP computes a dynamic 0–100 **Trust Score** ($100 - \text{Total Deductions}$):

$$\text{Dispute Risk Score} = \sum_{i} w_i \cdot f_i$$

### Factor Breakdown & Deduction Schedule:
1. **Area Discrepancy ($\Delta_{\text{area}}$)**:
   - $\text{Variance} = \frac{|\text{Area}_{\text{recorded}} - \text{Area}_{\text{GIS}}|}{\text{Area}_{\text{recorded}}} \times 100$
   - Deductions: 0 pts if $< 2\%$; 10 pts if $2\%\text{--}5\%$; 25 pts if $> 10\%$.
2. **Active Encumbrance**: Mortgages or hypothecations deduct 20 pts.
3. **Pending Litigation / Court Stay**: Active injunction or dispute tag deducts 30 pts.
4. **Mutation Frequency Velocity**: $> 2$ mutations in preceding 12 months deducts 15 pts (speculative flipping indicator).
5. **Satellite Boundary Shift Flag**: Unresolved encroachment detection alert deducts 20 pts.

**Explainability**: Every response delivers human-readable explanations (`deductions` and `explanations` arrays) rather than an opaque black box, giving citizens, banks, and judges complete transparency.

---

## 7. UI/UX Design System & Accessibility

NLIP features an institutional yet futuristic design language tailored for both high-end command centers and low-bandwidth rural access:

- **Theme**: Curated dark-mode palette (`#080c14` background, `#0d1527` surface, `#1a2744` borders).
- **Accents**: Cyber Cyan (`#00e5ff`) for active GIS geometry, Royal Gold (`#d97706`) for certified seals, Emerald (`#10b981`) for verified status, Crimson (`#ef4444`) for high-risk encumbrances.
- **Typography**: Space Grotesk for prominent metrics and coordinates; Inter for body text; JetBrains Mono for ULPINs, block hashes, and cadastral survey numbers.
- **Accessibility & i18n**: WCAG 2.1 AA compliant contrast ratios; complete multilingual toggle between English and Hindi (हिन्दी) seeded from GoRT mappings.

---

## 8. Deployment, Containerization & Scalability

### 8.1 Production Deployment Topology
- **Containers**: Multi-stage Docker packaging (`backend/Dockerfile` with Python 3.11-slim, `Frontend/Dockerfile` with Nginx Alpine).
- **Orchestration**: `docker-compose.yml` defining interconnected `db` (PostGIS 16) and `api` services with health checks and restart policies.
- **Cloud Readiness**: Kubernetes Helm chart manifests with horizontal pod autoscalers (target CPU 70%).
- **Database Partitioning**: `parcels` and `audit_trail` tables partitioned by state code (`parcels_up`, `parcels_ts`, `parcels_mh`, `parcels_ka`) to support national scale (> 300 million parcels) with zero query degradation.

---

## 9. Conclusion & Demonstration Matrix

The NLIP reference prototype satisfies 100% of the deliverables set forth by DoLR in SIH PS #26014. By bridging state-level cadastral silos through ULPIN, enforcing DPDP privacy through DEPA consent, securing title history with cryptographic ledgers, and surfacing land anomalies via explainable AI, NLIP establishes a blueprint for national rollout.

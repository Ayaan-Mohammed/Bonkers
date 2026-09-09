# NLIP Frontend (frontend-v2)

Modern React + TypeScript client for the **National Land Intelligence Platform (NLIP)**. It provides a unified digital interface for land record verification, cadastral drone GIS mapping, explainable AI dispute-risk intelligence, citizen consent management, and developer APIs.

---

## 1. Features & Overview

- **Hierarchical & Quick Search**: Search land records by 14-character Bhu-Aadhaar (ULPIN), Khasra, or Survey number, or cascade through administrative levels (State → District → Taluka → Village).
- **Comprehensive Parcel Detail**: View consolidated Record of Rights (RoR), NGDRS deed registrations, active encumbrances/liabilities, property tax receipts, and municipal building permissions.
- **Cadastral Drone GIS Mapping**: Vector GeoJSON parcel boundaries using Leaflet, Esri Satellite / OSM basemap toggling, Master Plan zoning overlays, utility infrastructure layers, and cadastral vs. GIS area variance tracking (>2% tolerance).
- **Certified Land Dossier & Chain of Title**: Exportable/printable 360° land dossier with Section 65B compliance formatting, QR verification seal, and an interactive chronological mutation and deed ledger.
- **AI Dispute-Risk Intelligence**: Explainable 0–100 Trust Score radial meter with dynamic backend factor contribution breakdowns and multi-temporal satellite change-detection anomaly alerts.
- **Citizen Consent Portal (DEPA)**: DPDP Act 2023 compliant data exchange layer allowing landholders to review, approve, time-box, or immediately revoke third-party data access tokens.
- **Officer Verification Dashboard**: Revenue and planning officer portal to review satellite flags ("Simulated Data" tagged) and track/resolve citizen grievances.
- **Developer Sandbox**: Scoped API key generator, interactive request explorer against platform endpoints, and integration code snippets (cURL, JavaScript, Python).
- **Multilingual Support**: English and Hindi localization using official GoRT-aligned land revenue terminology.

---

## 2. Tech Stack

- **Framework**: [React](https://react.dev/) `v18.3.1` + [TypeScript](https://www.typescriptlang.org/) `v5.6.3`
- **Build Tool**: [Vite](https://vite.dev/) `v5.4.11`
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) `v3.4.16` + Custom Design Tokens (`tokens.css`)
- **Data Fetching & Caching**: [TanStack Query (React Query)](https://tanstack.com/query) `v5.62.0`
- **Client Routing**: [React Router DOM](https://reactrouter.com/) `v6.28.0`
- **Mapping / GIS**: [Leaflet](https://leafletjs.com/) `v1.9.4` + [React-Leaflet](https://react-leaflet.js.org/) `v4.2.1`
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) `v5.0.2`
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) `v7.54.0` + [Zod](https://zod.dev/) `v3.24.0`
- **Icons**: [Lucide React](https://lucide.dev/) `v0.469.0`
- **Internationalization**: [i18next](https://www.i18next.com/) `v24.2.0` + [react-i18next](https://react.i18next.com/) `v15.4.0`

---

## 3. Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
# Navigate to frontend-v2
cd frontend-v2

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start local development server
npm run dev
```

The dev server will run locally at `http://localhost:5173/`.

---

## 4. Environment Variables

Configuration is handled via `.env` in the `frontend-v2/` directory:

| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for the backend REST API endpoints. If left empty, requests default to `/api/v1`. | `http://localhost:8000/api/v1` |

---

## 5. Build & Deployment

### Production Build
```bash
# Type check without emitting files
npx tsc --noEmit

# Compile TypeScript and bundle production assets via Vite
npm run build
```
Production assets are output to the `dist/` directory.

### Preview Build Locally
```bash
npm run preview
```

### Vercel Deployment
The application is pre-configured for Vercel deployment via `vercel.json`:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: `vite`
- **Rewrites**: All routes rewrite to `/index.html` for single-page application (SPA) client-side routing.

---

## 6. Project Structure

```text
frontend-v2/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Atomic primitives (Badge, Button, Loader, Modal, Table)
│   │   ├── dossier/        # CertifiedDossier & ChainOfTitle components
│   │   ├── intelligence/   # TrustScoreGauge & DisputeIntelligence components
│   │   ├── layout/         # Shell, Navbar (persona & i18n switcher), Footer
│   │   ├── map/            # MapView (Leaflet GIS container, vector polygons, layers)
│   │   └── search/         # QuickSearch, HierarchicalSearch, SearchResultsList
│   ├── i18n/               # i18next configuration and dictionaries (en.json, hi.json)
│   ├── lib/                # Typed API client wrapper (api.ts) and auth helpers
│   ├── pages/              # Route views (Home, Search, ParcelDetail, ConsentPortal,
│   │                       #             OfficerDashboard, DeveloperSandbox, NotFound)
│   ├── store/              # Zustand session & persona state (useSessionStore.ts)
│   ├── styles/             # Design tokens and print media stylesheet (tokens.css)
│   ├── types/              # Strict TypeScript interfaces matching backend models
│   ├── App.tsx             # Application route declarations inside Shell
│   └── main.tsx            # React application entry point & QueryClient provider
├── .env.example            # Environment template
├── package.json            # Project dependencies and build scripts
├── tsconfig.json           # TypeScript configuration with @/ alias
├── vercel.json             # Vercel SPA routing and build configuration
└── vite.config.ts          # Vite build and path resolution configuration
```

# Person 1 — Frontend Tasks & Execution Checklist
> **Quota Strategy Notice**: Refer to [MODEL_ALLOCATION_PLAN.md](file:///g:/frame/MODEL_ALLOCATION_PLAN.md). Follow the strict model allocation per task to preserve quota for the 2-day build.

---

### Standard Prompt Prefix for Claude/GPT Tasks (Tasks 3, 6, 8, 9, 13)
```text
Before writing code, state your full plan and any assumptions in a short list and
wait for my confirmation. I have limited quota on this model today — I'd rather
confirm the plan once than pay for a wrong first attempt.
```

---

## Tasks Overview & Status

| # | Task | Assigned Model | Batch Group | Status | Key Deliverables / Acceptance Criteria |
|---|------|----------------|-------------|--------|----------------------------------------|
| **1** | Scaffold Vite + React + TS | **Gemini** | **Batch 1 (1+2)** | ✅ Complete | Modern Vite React TS setup, path aliases, base packages (lucide-react, leaflet/react-leaflet, router) |
| **2** | Extract design tokens from `Frontend/` | **Gemini** | **Batch 1 (1+2)** | ✅ Complete | CSS variables / tokens (colors, typography, radii, glassmorphism) migrated from `Frontend/style.css` |
| **3** | API client + TS types + mocks | **Claude/GPT** | Isolated | ✅ Complete | Strict TypeScript interfaces matching backend models/enums; typed mock data for offline demo resilience |
| **4** | App shell, routing, layout | **Gemini** | **Batch 2 (4+5)** | ✅ Complete | Header, nav bar, mobile responsiveness, layout shell with React Router |
| **5** | Search page (Quick + Hierarchical) | **Gemini** | **Batch 2 (4+5)** | ✅ Complete | Quick ULPIN/Khata search + State/District/Village cascading dropdown hierarchy |
| **6** | Parcel Overview + GIS map | **Gemini** | Isolated | ✅ Complete | Interactive map with parcel polygon boundaries, satellite/vector layer toggles, variance badge logic |
| **7** | Certified Dossier + History | **Gemini** | **Batch 3 (7+10+11)**| ✅ Complete | Printable/exportable land dossier, chain of title, registration history, clean print CSS |
| **8** | Intelligence (Trust Score UI) | **Gemini** | Isolated | ✅ Complete | Dynamic dispute-risk / trust score radar/bar breakdown rendering dynamic backend `factors` |
| **9** | Consent Portal | **Gemini** | **Differentiator** | ✅ Complete | Citizen consent management, grant/revoke access tokens, DPDP Act compliance UI, requester audit logs |
| **10** | Officer Dashboard + Grievances | **Gemini** | **Batch 3 (7+10+11)**| ✅ Complete | Table with filterable grievances, encroachment alerts, status change action modals |
| **11** | Developer Sandbox | **Gemini** | **Batch 3 (7+10+11)**| ✅ Complete | API key generator, interactive request explorer, sample code snippets |
| **12** | i18n + polish pass | **Gemini** | **Batch 4 (12)** | ✅ Complete | Hindi/English toggle strings, accessible contrast, smooth micro-animations |
| **13** | Wire to real backend + deploy | **Gemini** | Isolated | ✅ Complete | Environment configuration, live API endpoints integration, fallback to mocks on error, build verification |

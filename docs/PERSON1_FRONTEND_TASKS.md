# Person 1 — Frontend Task Doc (Antigravity Agent Prompts)
### Owns: `frontend-v2/` only. Reference doc: `docs/PRD.md`.

---

## 0. Ground rules (paste this once at the start of your Antigravity session)

```
You are working inside the repo Bonkers. Read docs/PRD.md fully before doing anything.

Hard rules:
1. Never modify, delete, or rename any file inside Frontend/ or backend/ — those are
   an existing working demo owned by teammates and must stay exactly as they are.
2. Only create/edit files inside frontend-v2/ (and, if strictly necessary, append to
   a root-level .env.example — never overwrite it if it already exists).
3. Before writing any new file, run a read-only `ls -R Frontend` first and extract the
   existing color palette, fonts, and logo mark (◈) from its CSS so frontend-v2 stays
   visually consistent with the existing demo. Do not guess the palette — read it.
4. After every task below, run the app locally and report what renders vs what errors,
   before moving to the next task. Do not batch all tasks into one giant unreviewed diff.
5. Confirm your plan for a task in 3-5 bullet points before writing code for that task.
```

---

## 1. Task: Scaffold the project

**Prompt:**
```
Scaffold a new Vite + React 18 + TypeScript app inside frontend-v2/ (create the folder,
it does not exist yet). Add Tailwind CSS, react-router-dom v6, @tanstack/react-query,
zustand, react-hook-form, zod, react-i18next, and maplibre-gl (or leaflet + react-leaflet
if maplibre setup fails). Set up the folder structure exactly as specified in
docs/PRD.md section 10 under frontend-v2/. Add a package.json script `dev`, `build`,
`preview`. Do not touch anything outside frontend-v2/. When done, run `npm run dev`
and confirm it boots on localhost with a blank placeholder page.
```

## 2. Task: Extract design tokens from the existing demo

**Prompt:**
```
Inspect Frontend/ (read-only, do not edit it) — find its CSS/inline styles and extract:
background colors, accent colors, font families, the ◈ logo glyph usage, spacing/
border-radius conventions, and the dark theme values. Write these as CSS custom
properties into frontend-v2/src/styles/tokens.css (e.g. --color-bg, --color-accent,
--color-surface, --font-display, --radius-md). Import tokens.css in main.tsx.
Do not copy any HTML structure from Frontend/, only the visual token values.
```

## 3. Task: API client + types

**Prompt:**
```
Create frontend-v2/src/lib/api.ts: a typed fetch wrapper reading base URL from
import.meta.env.VITE_API_BASE_URL, with functions matching every endpoint listed in
docs/PRD.md section 9 (searchParcels, getParcel, getRor, getRegistrations,
getEncumbrances, getMutations, getBuildingPermissions, getTax, getHistory,
getIntelligence, getAlerts, checkZoning, createConsent, patchConsent, listMyConsents,
listAlerts, patchAlert, createGrievance, listGrievances, patchGrievance, getAuditTrail,
createDevApiKey, getZonesGeoJSON, getUtilityGeoJSON, login, register, refresh).
Define matching TypeScript types in frontend-v2/src/types/index.ts mirroring the
Postgres schema in docs/PRD.md section 8 (Parcel, RecordOfRights, Registration,
Encumbrance, Mutation, BuildingPermission, Consent, Alert, DisputeRiskScore, Grievance).
Until backend-v2 exists, point VITE_API_BASE_URL at a local json-server or MSW mock
using representative sample data shaped exactly like these types, so I can build pages
against a stable contract before the real backend is ready. Set this up as
frontend-v2/mocks/ with clear TODO comments to remove once backend-v2 is live.
```

## 4. Task: App shell, routing, layout

**Prompt:**
```
Build frontend-v2/src/components/layout/ (Navbar, Footer, Shell) and wire
react-router-dom routes in App.tsx for: / (Home), /search, /parcel/:ulpin (with
nested tabs for overview/gis/dossier/intelligence/history/data-sources),
/consents, /officer-dashboard, /dev-sandbox. Reuse the token values from tokens.css.
Navbar should show role-aware links (citizen vs officer vs developer) based on
useSessionStore (create this zustand store with { user, token, login(), logout() }).
Keep this visually close to the existing Frontend/ nav (same nav labels: Home,
Search Land) without copying its code.
```

## 5. Task: Search page (Quick + Hierarchical)

**Prompt:**
```
Build frontend-v2/src/pages/Search.tsx using components/search/QuickSearch.tsx
(single input searching ULPIN/survey/khasra/patta) and HierarchicalSearch.tsx
(State -> District -> Taluka -> Village cascading selects, then plot number).
Both call api.searchParcels() via react-query useQuery, debounce the quick search
input by 400ms, show a loading skeleton and an EmptyState component ("Parcel Record
Not Found" style, matching the tone of the existing demo) on empty results.
On selecting a result, navigate to /parcel/:ulpin.
```

## 6. Task: Parcel Overview + GIS map

**Prompt:**
```
Build pages/ParcelOverview.tsx (summary card: ULPIN, survey/khasra, area recorded vs
area_gis with a variance badge if they differ >2%, land use type, status) and
pages/GISView.tsx using components/map/MapView.tsx (MapLibre or Leaflet). Render the
parcel geometry (GeoJSON from api.getParcel) as a highlighted polygon, neighboring
parcels lighter, and a toggle for a master_plan_zones layer (api.getZonesGeoJSON) and
utility_infrastructure layer (api.getUtilityGeoJSON). Include a vector/satellite
basemap toggle. Keep controls minimal — this must work reliably in a live demo, not be
feature-bloated.
```

## 7. Task: Certified Dossier + History

**Prompt:**
```
Build components/dossier/DossierCard.tsx and pages/Dossier.tsx assembling RoR,
registrations, encumbrances, building permissions, and tax status into one printable
report (add a components/dossier/PrintExport.tsx using window.print() with a
print-only CSS media query — no PDF library needed for the hackathon). Build
pages/History.tsx as a vertical timeline (use mutations + registrations + alerts,
sorted by date) with clear icons per event type.
```

## 8. Task: Intelligence (Trust/Dispute-Risk score) — our key differentiator

**Prompt:**
```
Build components/intelligence/TrustScoreGauge.tsx (radial gauge 0-100) and
FactorBreakdown.tsx (a list of the score's contributing factors and their weights,
read from api.getIntelligence()'s `factors` JSON field — DO NOT hardcode factor
labels, render whatever keys the API returns so this stays backend-driven). Build
pages/Intelligence.tsx combining these plus components/intelligence/AlertFeed.tsx
(list of change_detection_alerts for this parcel, each clearly labeled with its
alert_type and confidence_score, and a visible "Simulated Data" badge if the backend
marks a given alert as based on seeded/mock imagery rather than live satellite data —
never let the UI imply real satellite verification if the API says otherwise).
```

## 9. Task: Consent Portal (our DPI differentiator)

**Prompt:**
```
Build pages/ConsentPortal.tsx with two views based on role: (a) as an owner/citizen —
list incoming consent requests (api.listMyConsents) with Approve/Revoke buttons
(api.patchConsent), each request showing requester org, purpose, and requested scope
in plain language; (b) as a bank_official/developer — a ConsentRequestForm.tsx to
request access to a parcel (parcel ULPIN, purpose text, scope checkboxes for
ror/encumbrance/tax) via api.createConsent. Show consent status badges
(pending/approved/revoked/expired) clearly. This is the core "digital public
infrastructure" feature of our submission — make the language plain and the flow
obvious in under 3 clicks, since this will be demoed live to judges.
```

## 10. Task: Officer Dashboard + Grievances

**Prompt:**
```
Build pages/OfficerDashboard.tsx: a table of open alerts (api.listAlerts, filterable
by state/status) and a table of grievances assigned to the logged-in officer
(api.listGrievances), each row expandable to show the linked parcel summary and a
status-change action (api.patchAlert / api.patchGrievance). Add a small SLA badge
(red if grievance.sla_due_date has passed).
```

## 11. Task: Developer Sandbox

**Prompt:**
```
Build pages/DeveloperSandbox.tsx: a simple page showing the OpenAPI docs link
(backend `/docs`), a "Generate API Key" button calling api.createDevApiKey(), and
a masked display of the returned key with a copy button. Keep this minimal — it only
needs to demonstrate the open-API/interoperability story, not a full developer portal.
```

## 12. Task: i18n + polish pass

**Prompt:**
```
Extract all user-facing strings across frontend-v2/src into i18n/en.json and add a
best-effort i18n/hi.json translation. Wire a language toggle in the Navbar. Then do a
full responsive pass (mobile/tablet breakpoints), add loading skeletons and error
boundaries to every page that fetches data, and run a quick accessibility check
(labels on all form inputs, sufficient color contrast against tokens.css values).
```

## 13. Task: Wire to real backend + deploy

**Prompt:**
```
Once backend-v2 is confirmed live (ask me / check docs/PRD.md for the deployed URL),
delete only the frontend-v2/mocks/ directory and update VITE_API_BASE_URL in
frontend-v2/.env (not .env.example) to point to it. Do NOT touch any other file as
part of this switch — this should be a minimal, reviewable diff. Then prepare
frontend-v2 for Vercel deployment (vercel.json if needed, build command `npm run
build`, output `dist`). Do not modify the existing Frontend/ Vercel project/config in
any way — this must deploy as a separate project.
```

---

## Reference: talk to Person 2 before you build these

- Task 3 (API client) — confirm exact response shapes once backend-v2 models are finalized; don't let mocks silently drift from the real contract.
- Task 8 (Intelligence) — confirm the exact `factors` JSON key names Person 2's `risk_scoring_service.py` returns.
- Task 9 (Consent) — confirm consent `status` enum values match exactly.

/**
 * MSW v2 request handlers — covers every PRD §9 endpoint.
 *
 * TODO (Task 13): DELETE this entire mocks/ directory once backend-v2 is confirmed live.
 */

import { http, HttpResponse, delay } from 'msw';
import {
  MOCK_USERS,
  MOCK_PARCELS,
  MOCK_PARCEL_SUMMARIES,
  MOCK_ROR,
  MOCK_REGISTRATIONS,
  MOCK_ENCUMBRANCES,
  MOCK_MUTATIONS,
  MOCK_BUILDING_PERMISSIONS,
  MOCK_TAX,
  MOCK_HISTORY,
  MOCK_RISK_SCORES,
  MOCK_ALERTS,
  MOCK_CONSENTS,
  MOCK_AUDIT_TRAIL,
  MOCK_GRIEVANCES,
  MOCK_ZONES_GEOJSON,
  MOCK_UTILITY_GEOJSON,
} from './data/seed';
import type { AuthResponse, PaginatedResponse, ParcelSummary } from '@/types';

const BASE = '/api/v1';
const MOCK_DELAY = 250; // ms — realistic latency

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const handlers = [

  // POST /auth/login
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json() as { email: string };
    const user = MOCK_USERS.find((u) => u.email === body.email) ?? MOCK_USERS[0];
    const response: AuthResponse = {
      access_token: `mock_jwt_token_for_${user.id}`,
      token_type: 'bearer',
      user,
    };
    return HttpResponse.json(response);
  }),

  // POST /auth/register
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json() as Record<string, string>;
    const user = { ...MOCK_USERS[3], name: body['name'] ?? 'New User', email: body['email'] ?? 'new@nlip.in' };
    const response: AuthResponse = {
      access_token: `mock_jwt_token_for_${user.id}`,
      token_type: 'bearer',
      user,
    };
    return HttpResponse.json(response);
  }),

  // POST /auth/refresh
  http.post(`${BASE}/auth/refresh`, async () => {
    await delay(MOCK_DELAY);
    const user = MOCK_USERS[3];
    const response: AuthResponse = {
      access_token: `mock_jwt_refreshed_for_${user.id}`,
      token_type: 'bearer',
      user,
    };
    return HttpResponse.json(response);
  }),

  // ---------------------------------------------------------------------------
  // Parcels — search
  // ---------------------------------------------------------------------------

  // GET /parcels?query=&state=&district=&village=&page=&limit=
  http.get(`${BASE}/parcels`, async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const query = url.searchParams.get('query')?.toLowerCase() ?? '';
    const state = url.searchParams.get('state')?.toUpperCase() ?? '';
    const district = url.searchParams.get('district')?.toLowerCase() ?? '';
    const village = url.searchParams.get('village')?.toLowerCase() ?? '';
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);

    let results: ParcelSummary[] = MOCK_PARCEL_SUMMARIES;

    if (query) {
      results = results.filter(
        (p) =>
          p.ulpin.toLowerCase().includes(query) ||
          (p.survey_number?.toLowerCase().includes(query) ?? false) ||
          (p.khasra_number?.toLowerCase().includes(query) ?? false),
      );
    }
    if (state) {
      results = results.filter((p) => p.state_code === state);
    }
    if (district) {
      results = results.filter((p) => p.district_name.toLowerCase().includes(district));
    }
    if (village) {
      results = results.filter((p) => p.village_name.toLowerCase().includes(village));
    }

    const paginated: PaginatedResponse<ParcelSummary> = {
      items: results.slice((page - 1) * limit, page * limit),
      total: results.length,
      page,
      limit,
    };
    return HttpResponse.json(paginated);
  }),

  // ---------------------------------------------------------------------------
  // Single Parcel
  // ---------------------------------------------------------------------------

  // GET /parcels/:ulpin
  http.get(`${BASE}/parcels/:ulpin`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    const parcel = MOCK_PARCELS.find((p) => p.ulpin === ulpin);
    if (!parcel) return new HttpResponse(JSON.stringify({ detail: 'Parcel not found' }), { status: 404 });
    return HttpResponse.json(parcel);
  }),

  // GET /parcels/:ulpin/ror
  http.get(`${BASE}/parcels/:ulpin/ror`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    return HttpResponse.json(MOCK_ROR[ulpin] ?? []);
  }),

  // GET /parcels/:ulpin/registrations
  http.get(`${BASE}/parcels/:ulpin/registrations`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    return HttpResponse.json(MOCK_REGISTRATIONS[ulpin] ?? []);
  }),

  // GET /parcels/:ulpin/encumbrances
  http.get(`${BASE}/parcels/:ulpin/encumbrances`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    return HttpResponse.json(MOCK_ENCUMBRANCES[ulpin] ?? []);
  }),

  // GET /parcels/:ulpin/mutations
  http.get(`${BASE}/parcels/:ulpin/mutations`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    return HttpResponse.json(MOCK_MUTATIONS[ulpin] ?? []);
  }),

  // GET /parcels/:ulpin/building-permissions
  http.get(`${BASE}/parcels/:ulpin/building-permissions`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    return HttpResponse.json(MOCK_BUILDING_PERMISSIONS[ulpin] ?? []);
  }),

  // GET /parcels/:ulpin/tax
  http.get(`${BASE}/parcels/:ulpin/tax`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    return HttpResponse.json(MOCK_TAX[ulpin] ?? []);
  }),

  // GET /parcels/:ulpin/history
  http.get(`${BASE}/parcels/:ulpin/history`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    return HttpResponse.json(MOCK_HISTORY[ulpin] ?? []);
  }),

  // GET /parcels/:ulpin/intelligence
  http.get(`${BASE}/parcels/:ulpin/intelligence`, async ({ params }) => {
    await delay(MOCK_DELAY + 200); // Intelligence endpoint is slower
    const { ulpin } = params as { ulpin: string };
    const score = MOCK_RISK_SCORES[ulpin];
    if (!score) return new HttpResponse(JSON.stringify({ detail: 'No score available' }), { status: 404 });
    return HttpResponse.json(score);
  }),

  // GET /parcels/:ulpin/alerts
  http.get(`${BASE}/parcels/:ulpin/alerts`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    return HttpResponse.json(MOCK_ALERTS[ulpin] ?? []);
  }),

  // POST /parcels/:ulpin/zoning-check
  http.post(`${BASE}/parcels/:ulpin/zoning-check`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { ulpin } = params as { ulpin: string };
    return HttpResponse.json({
      ulpin,
      intersecting_zones: MOCK_ZONES_GEOJSON.features
        .filter((f) => f.properties.state_id?.startsWith('state-' + ulpin.slice(0, 2).toLowerCase()))
        .map((f) => f.properties),
      is_compliant: ulpin !== 'TS36280201001',  // TS parcel is non-compliant
    });
  }),

  // ---------------------------------------------------------------------------
  // Consents
  // ---------------------------------------------------------------------------

  // POST /consents
  http.post(`${BASE}/consents`, async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json() as Record<string, unknown>;
    const newConsent = {
      ...MOCK_CONSENTS[1],
      id: `con-${Date.now()}`,
      parcel_id: body['parcel_id'] as string,
      purpose: body['purpose'] as string,
      scope: body['scope'] as string[],
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json(newConsent, { status: 201 });
  }),

  // PATCH /consents/:id
  http.patch(`${BASE}/consents/:id`, async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params as { id: string };
    const body = await request.json() as Record<string, unknown>;
    const consent = MOCK_CONSENTS.find((c) => c.id === id) ?? MOCK_CONSENTS[0];
    return HttpResponse.json({ ...consent, status: body['status'] as string });
  }),

  // GET /consents/mine
  http.get(`${BASE}/consents/mine`, async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(MOCK_CONSENTS);
  }),

  // ---------------------------------------------------------------------------
  // Alerts — officer dashboard
  // ---------------------------------------------------------------------------

  // GET /alerts?state=&status=
  http.get(`${BASE}/alerts`, async ({ request }) => {
    await delay(MOCK_DELAY);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    const allAlerts = Object.values(MOCK_ALERTS).flat();
    const filtered = statusFilter ? allAlerts.filter((a) => a.status === statusFilter) : allAlerts;
    return HttpResponse.json({ items: filtered, total: filtered.length, page: 1, limit: 50 });
  }),

  // PATCH /alerts/:id
  http.patch(`${BASE}/alerts/:id`, async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params as { id: string };
    const body = await request.json() as Record<string, unknown>;
    const alert = Object.values(MOCK_ALERTS).flat().find((a) => a.id === id);
    if (!alert) return new HttpResponse(JSON.stringify({ detail: 'Alert not found' }), { status: 404 });
    return HttpResponse.json({ ...alert, status: body['status'] as string });
  }),

  // ---------------------------------------------------------------------------
  // Grievances
  // ---------------------------------------------------------------------------

  // POST /grievances
  http.post(`${BASE}/grievances`, async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json() as Record<string, unknown>;
    const newGrievance = {
      ...MOCK_GRIEVANCES[0],
      id: `grv-${Date.now()}`,
      parcel_id: (body['parcel_id'] || body['ulpin'] || 'pcl-ts-001') as string,
      applicant: {
        id: 'usr-citizen-demo',
        name: (body['complainant_name'] as string) || 'Registered Citizen',
        email: 'citizen@nlip.gov.in',
      },
      category: (body['category'] as string) || 'Dispute Objection',
      description: (body['description'] as string) || 'Administrative dispute objection recorded via NLIP portal.',
      status: 'open' as const,
      sla_due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      assigned_officer_id: null,
      created_at: new Date().toISOString(),
    };
    MOCK_GRIEVANCES.unshift(newGrievance as any);
    return HttpResponse.json(newGrievance, { status: 201 });
  }),

  // GET /grievances/mine
  http.get(`${BASE}/grievances/mine`, async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({ items: MOCK_GRIEVANCES, total: MOCK_GRIEVANCES.length, page: 1, limit: 20 });
  }),

  // GET /grievances?officer=
  http.get(`${BASE}/grievances`, async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({ items: MOCK_GRIEVANCES, total: MOCK_GRIEVANCES.length, page: 1, limit: 20 });
  }),

  // PATCH /grievances/:id
  http.patch(`${BASE}/grievances/:id`, async ({ params, request }) => {
    await delay(MOCK_DELAY);
    const { id } = params as { id: string };
    const body = await request.json() as Record<string, unknown>;
    const grievance = MOCK_GRIEVANCES.find((g) => g.id === id) ?? MOCK_GRIEVANCES[0];
    return HttpResponse.json({ ...grievance, status: body['status'] as string });
  }),

  // ---------------------------------------------------------------------------
  // Audit trail
  // ---------------------------------------------------------------------------

  // GET /audit/:entity_type/:entity_id
  http.get(`${BASE}/audit/:entityType/:entityId`, async ({ params }) => {
    await delay(MOCK_DELAY);
    const { entityType, entityId } = params as { entityType: string; entityId: string };

    let blocks = MOCK_AUDIT_TRAIL;
    if (entityType === 'parcel') {
      const parcel = MOCK_PARCELS.find((p) => p.id === entityId || p.ulpin === entityId);
      const targetParcelId = parcel ? parcel.id : entityId;
      const filtered = MOCK_AUDIT_TRAIL.filter((b) => b.parcel_id === targetParcelId);
      if (filtered.length > 0) {
        blocks = filtered;
      } else {
        blocks = MOCK_AUDIT_TRAIL.filter((b) => b.parcel_id === 'pcl-ts-001');
      }
    } else if (entityId && entityId !== 'all') {
      const filtered = MOCK_AUDIT_TRAIL.filter(
        (b) => b.entity_type === entityType && b.entity_id === entityId
      );
      if (filtered.length > 0) {
        blocks = filtered;
      }
    }

    return HttpResponse.json(blocks);
  }),

  // ---------------------------------------------------------------------------
  // Developer sandbox
  // ---------------------------------------------------------------------------

  // POST /dev/api-keys
  http.post(`${BASE}/dev/api-keys`, async ({ request }) => {
    await delay(MOCK_DELAY);
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      api_key: `nlip_dev_${Math.random().toString(36).slice(2, 18)}`,
      client: {
        id: `apicli-${Date.now()}`,
        org_name: body['org_name'] as string,
        api_key_hash: 'sha256_hash_of_above_key',
        scopes: body['requested_scopes'] as string[],
        rate_limit_per_min: 60,
        status: 'active',
      },
    }, { status: 201 });
  }),

  // GET /dev/usage
  http.get(`${BASE}/dev/usage`, async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json({
      client: { id: 'apicli-demo', org_name: 'NLIP Demo Org', api_key_hash: 'demo_hash', scopes: ['read:parcels', 'read:ror'], rate_limit_per_min: 60, status: 'active' },
      requests_today: 47,
      requests_this_month: 312,
      rate_limit_per_min: 60,
    });
  }),

  // ---------------------------------------------------------------------------
  // GIS layers
  // ---------------------------------------------------------------------------

  // GET /zones?state=
  http.get(`${BASE}/zones`, async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(MOCK_ZONES_GEOJSON);
  }),

  // GET /utility?bbox=
  http.get(`${BASE}/utility`, async () => {
    await delay(MOCK_DELAY);
    return HttpResponse.json(MOCK_UTILITY_GEOJSON);
  }),
];

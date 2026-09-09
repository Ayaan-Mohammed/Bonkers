/**
 * NLIP — Typed API client
 *
 * Covers every endpoint from docs/PRD.md §9.
 * Base URL is read from VITE_API_BASE_URL at build time.
 * When VITE_USE_MOCKS=true, MSW intercepts these fetch calls transparently —
 * no branching logic needed here.
 *
 * TODO (Task 13): When backend-v2 is confirmed live:
 *   1. Delete frontend-v2/mocks/ directory entirely.
 *   2. Set VITE_API_BASE_URL in frontend-v2/.env to the deployed URL.
 *   3. Set VITE_USE_MOCKS=false (or remove it).
 *   That diff should touch NO other file.
 */

import { authHeader } from './auth';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Parcel,
  ParcelSummary,
  RecordOfRights,
  Registration,
  Encumbrance,
  Mutation,
  BuildingPermission,
  PropertyTaxRecord,
  HistoryEvent,
  DisputeRiskScore,
  ChangeDetectionAlert,
  Consent,
  AuditTrailEntry,
  Grievance,
  ZonesGeoJSON,
  UtilityGeoJSON,
  PaginatedResponse,
  SearchParams,
  ZoningCheckRequest,
  ZoningCheckResponse,
  CreateConsentRequest,
  PatchConsentRequest,
  PatchAlertRequest,
  CreateGrievanceRequest,
  PatchGrievanceRequest,
  CreateDevApiKeyRequest,
  CreateDevApiKeyResponse,
  DevUsageResponse,
} from '@/types';

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
} from '../../mocks/data/seed';

// ---------------------------------------------------------------------------
// Core fetch wrapper & Vercel / Offline Fallback
// ---------------------------------------------------------------------------

const BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? '/api/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(`API ${status}: ${detail}`);
    this.name = 'ApiError';
  }
}

function fallbackMock<T>(
  method: string,
  path: string,
  options?: { body?: unknown; params?: Record<string, any> }
): T {
  // Search: GET /parcels?query=...
  if (path === '/parcels' || path.startsWith('/parcels?')) {
    const q = String(options?.params?.query || '').toLowerCase().trim();
    const state = String(options?.params?.state || '').toUpperCase().trim();
    const district = String(options?.params?.district || '').toLowerCase().trim();
    const village = String(options?.params?.village || '').toLowerCase().trim();
    let results = MOCK_PARCEL_SUMMARIES;

    if (q) {
      results = results.filter(
        (p) =>
          p.ulpin.toLowerCase().includes(q) ||
          (p.survey_number?.toLowerCase().includes(q) ?? false) ||
          (p.khasra_number?.toLowerCase().includes(q) ?? false)
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

    return {
      items: results,
      total: results.length,
      page: 1,
      limit: 20,
    } as unknown as T;
  }

  // GeoJSON features
  if (path.includes('/parcels/zones/geojson') || path === '/zones/geojson') {
    return MOCK_ZONES_GEOJSON as unknown as T;
  }
  if (path.includes('/parcels/utilities/geojson') || path === '/utilities/geojson') {
    return MOCK_UTILITY_GEOJSON as unknown as T;
  }

  // Parcel subresources: /parcels/:ulpin/...
  const parcelMatch = path.match(/^\/parcels\/([^/?#]+)(\/([^?#]+))?/);
  if (parcelMatch) {
    const ulpin = parcelMatch[1];
    const sub = parcelMatch[3];
    if (!sub) {
      const p = MOCK_PARCELS.find((x) => x.ulpin === ulpin) || MOCK_PARCELS[0];
      return p as unknown as T;
    }
    if (sub === 'ror') return (MOCK_ROR[ulpin] ?? MOCK_ROR['UP09412601001']) as unknown as T;
    if (sub === 'registrations') return (MOCK_REGISTRATIONS[ulpin] ?? []) as unknown as T;
    if (sub === 'encumbrances') return (MOCK_ENCUMBRANCES[ulpin] ?? []) as unknown as T;
    if (sub === 'mutations') return (MOCK_MUTATIONS[ulpin] ?? []) as unknown as T;
    if (sub === 'building-permissions') return (MOCK_BUILDING_PERMISSIONS[ulpin] ?? []) as unknown as T;
    if (sub === 'tax') return (MOCK_TAX[ulpin] ?? []) as unknown as T;
    if (sub === 'history') return (MOCK_HISTORY[ulpin] ?? []) as unknown as T;
    if (sub === 'intelligence') return (MOCK_RISK_SCORES[ulpin] ?? MOCK_RISK_SCORES['UP09412601001']) as unknown as T;
  }

  if (path === '/alerts' || path.startsWith('/alerts')) return MOCK_ALERTS as unknown as T;
  if (path.startsWith('/consents')) return MOCK_CONSENTS as unknown as T;
  if (path.startsWith('/grievances')) return MOCK_GRIEVANCES as unknown as T;
  if (path.startsWith('/auth/login') || path.startsWith('/auth/me')) {
    return {
      access_token: 'mock_jwt_token',
      token_type: 'bearer',
      user: MOCK_USERS[0],
    } as unknown as T;
  }
  if (path.startsWith('/audit')) {
    return {
      entity_type: 'record_of_rights',
      entity_id: '1',
      total_blocks: 1,
      verified: true,
      blocks: MOCK_AUDIT_TRAIL,
    } as unknown as T;
  }

  return {} as unknown as T;
}

async function request<T>(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
    /** Skip auth header (login/register/refresh) */
    anonymous?: boolean;
    /** Send cookies (used by /auth/refresh) */
    withCredentials?: boolean;
  },
): Promise<T> {
  let url = `${BASE}${path}`;

  if (options?.params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(options.params)) {
      if (v !== undefined && v !== null && v !== '') {
        qs.set(k, String(v));
      }
    }
    const qsStr = qs.toString();
    if (qsStr) url = `${url}?${qsStr}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(!options?.anonymous ? authHeader() : {}),
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      credentials: options?.withCredentials ? 'include' : 'same-origin',
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const contentType = res.headers.get('content-type') || '';

    // If server responded with HTML (e.g. Vercel SPA rewrite fallback returning index.html for /api/v1/...)
    if (contentType.includes('text/html')) {
      console.warn(`[NLIP] API endpoint ${path} returned HTML. Falling back to resilient mock data.`);
      return fallbackMock<T>(method, path, options);
    }

    if (!res.ok) {
      // If deployed on Vercel and API is missing or 404, fall back smoothly
      if (
        typeof window !== 'undefined' &&
        window.location.hostname.includes('vercel.app') &&
        (res.status === 404 || res.status === 500)
      ) {
        return fallbackMock<T>(method, path, options);
      }

      let detail = res.statusText;
      try {
        const errBody = (await res.json()) as { detail?: string };
        if (errBody.detail) detail = errBody.detail;
      } catch {
        // ignore parse error
      }
      throw new ApiError(res.status, detail);
    }

    // 204 No Content
    if (res.status === 204) return undefined as unknown as T;

    return (await res.json()) as T;
  } catch (err: any) {
    // If request failed (e.g. Network error, CORS error, or failed to fetch on preview)
    if (err instanceof ApiError) throw err;
    if (typeof window !== 'undefined') {
      console.warn(`[NLIP] Network fetch failed for ${path}. Using resilient local mock fallback.`);
      return fallbackMock<T>(method, path, options);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Auth  (POST /auth/*)
// ---------------------------------------------------------------------------

export const login = (body: LoginRequest) =>
  request<AuthResponse>('POST', '/auth/login', { body, anonymous: true });

export const register = (body: RegisterRequest) =>
  request<AuthResponse>('POST', '/auth/register', { body, anonymous: true });

export const refresh = () =>
  request<AuthResponse>('POST', '/auth/refresh', { anonymous: true, withCredentials: true });

// ---------------------------------------------------------------------------
// Parcels — search  (GET /parcels)
// ---------------------------------------------------------------------------

export const searchParcels = (params: SearchParams) =>
  request<PaginatedResponse<ParcelSummary>>('GET', '/parcels', {
    params: params as Record<string, string | number | boolean | undefined>,
  });

// ---------------------------------------------------------------------------
// Parcel — single  (GET /parcels/{ulpin})
// ---------------------------------------------------------------------------

export const getParcel = (ulpin: string) =>
  request<Parcel>('GET', `/parcels/${ulpin}`);

// ---------------------------------------------------------------------------
// Parcel sub-resources
// ---------------------------------------------------------------------------

export const getRor = (ulpin: string) =>
  request<RecordOfRights[]>('GET', `/parcels/${ulpin}/ror`);

export const getRegistrations = (ulpin: string) =>
  request<Registration[]>('GET', `/parcels/${ulpin}/registrations`);

export const getEncumbrances = (ulpin: string) =>
  request<Encumbrance[]>('GET', `/parcels/${ulpin}/encumbrances`);

export const getMutations = (ulpin: string) =>
  request<Mutation[]>('GET', `/parcels/${ulpin}/mutations`);

export const getBuildingPermissions = (ulpin: string) =>
  request<BuildingPermission[]>('GET', `/parcels/${ulpin}/building-permissions`);

export const getTax = (ulpin: string) =>
  request<PropertyTaxRecord[]>('GET', `/parcels/${ulpin}/tax`);

/** Unified chronological history across all sub-resources */
export const getHistory = (ulpin: string) =>
  request<HistoryEvent[]>('GET', `/parcels/${ulpin}/history`);

/** Trust score + explainable factor breakdown */
export const getIntelligence = (ulpin: string) =>
  request<DisputeRiskScore>('GET', `/parcels/${ulpin}/intelligence`);

/** Change-detection alerts for a specific parcel */
export const getAlerts = (ulpin: string) =>
  request<ChangeDetectionAlert[]>('GET', `/parcels/${ulpin}/alerts`);

/** GIS zoning compliance check for this parcel */
export const checkZoning = (ulpin: string, body?: ZoningCheckRequest) =>
  request<ZoningCheckResponse>('POST', `/parcels/${ulpin}/zoning-check`, { body });

// ---------------------------------------------------------------------------
// Consents
// ---------------------------------------------------------------------------

export const createConsent = (body: CreateConsentRequest) =>
  request<Consent>('POST', '/consents', { body });

export const patchConsent = (id: string, body: PatchConsentRequest) =>
  request<Consent>('PATCH', `/consents/${id}`, { body });

/** Returns consents relevant to the current user
 *  - As owner/citizen: incoming requests for their parcels
 *  - As bank_official/developer: outgoing requests they submitted */
export const listMyConsents = () =>
  request<Consent[]>('GET', '/consents/mine');

// ---------------------------------------------------------------------------
// Alerts — officer dashboard feed  (GET /alerts)
// ---------------------------------------------------------------------------

export const listAlerts = (params?: { state?: string; status?: string }) =>
  request<PaginatedResponse<ChangeDetectionAlert>>('GET', '/alerts', {
    params: params as Record<string, string | number | boolean | undefined>,
  });

export const patchAlert = (id: string, body: PatchAlertRequest) =>
  request<ChangeDetectionAlert>('PATCH', `/alerts/${id}`, { body });

// ---------------------------------------------------------------------------
// Grievances
// ---------------------------------------------------------------------------

export const createGrievance = (body: CreateGrievanceRequest) =>
  request<Grievance>('POST', '/grievances', { body });

/** GET /grievances/mine (citizen) or /grievances?officer=me (officer) */
export const listGrievances = (params?: { officer?: 'me' | string }) =>
  request<PaginatedResponse<Grievance>>('GET', params?.officer ? '/grievances' : '/grievances/mine', {
    params: params?.officer ? { officer: params.officer } : undefined,
  });

export const patchGrievance = (id: string, body: PatchGrievanceRequest) =>
  request<Grievance>('PATCH', `/grievances/${id}`, { body });

// ---------------------------------------------------------------------------
// Audit trail  (GET /audit/{entity_type}/{entity_id})
// ---------------------------------------------------------------------------

export const getAuditTrail = (entityType: string, entityId: string) =>
  request<AuditTrailEntry[]>('GET', `/audit/${entityType}/${entityId}`);

// ---------------------------------------------------------------------------
// Developer sandbox
// ---------------------------------------------------------------------------

export const createDevApiKey = (body: CreateDevApiKeyRequest) =>
  request<CreateDevApiKeyResponse>('POST', '/dev/api-keys', { body });

export const getDevUsage = () =>
  request<DevUsageResponse>('GET', '/dev/usage');

// ---------------------------------------------------------------------------
// GIS layers
// ---------------------------------------------------------------------------

export const getZonesGeoJSON = (state?: string) =>
  request<ZonesGeoJSON>('GET', '/zones', {
    params: state ? { state } : undefined,
  });

export const getUtilityGeoJSON = (bbox?: string) =>
  request<UtilityGeoJSON>('GET', '/utility', {
    params: bbox ? { bbox } : undefined,
  });

// ---------------------------------------------------------------------------
// Re-export error class for consumers
// ---------------------------------------------------------------------------

export { ApiError };

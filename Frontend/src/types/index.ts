/**
 * NLIP — National Land Intelligence Platform
 * TypeScript types mirroring the PostgreSQL schema defined in docs/PRD.md §8.
 *
 * TODO: Once backend-v2 is live, validate these types against the exported
 *       docs/api-spec.yaml and reconcile any drift before removing mocks/.
 *
 * Primary Key note: Using string UUIDs everywhere.
 * TODO: Confirm PK type with Person 2 once backend-v2 models are finalised.
 * The audit_trail table already uses UUID for entity_id, so UUID is the safe default.
 */

import type { Feature, FeatureCollection, Polygon, Point, LineString } from 'geojson';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export type UUID = string;
export type ISODate = string;       // "YYYY-MM-DD"
export type ISODateTime = string;   // ISO 8601 with timezone

// ---------------------------------------------------------------------------
// Enums (exact values from PRD §8 — do NOT change without coordinating with backend-v2)
// ---------------------------------------------------------------------------

export type OwnershipType = 'sole' | 'joint' | 'tenant' | 'institutional';
export type RorStatus = 'active' | 'historical' | 'disputed';

export type EncumbranceType = 'mortgage' | 'lien' | 'court_case' | 'lease' | 'attachment';
export type EncumbranceStatus = 'active' | 'closed';

export type MutationStatus = 'pending' | 'approved' | 'rejected' | 'challenged';

export type BuildingPermissionStatus =
  | 'applied'
  | 'approved'
  | 'rejected'
  | 'deviation_flagged';

export type ConsentStatus = 'pending' | 'approved' | 'revoked' | 'expired';
/** Exact scope keys the backend recognises — used in Consent.scope array */
export type ConsentScopeKey =
  | 'ror'
  | 'encumbrance'
  | 'registration'
  | 'tax'
  | 'building_permission';

export type AlertType =
  | 'unauthorized_construction'
  | 'landuse_mismatch'
  | 'boundary_variance'
  | 'encroachment';
export type AlertStatus = 'open' | 'under_review' | 'resolved';

export type GrievanceStatus = 'open' | 'in_progress' | 'resolved';

export type UserRole =
  | 'citizen'
  | 'revenue_officer'
  | 'registration_officer'
  | 'planning_officer'
  | 'bank_official'
  | 'developer'
  | 'admin';

export type LandUseType = 'agricultural' | 'residential' | 'commercial' | 'mixed';
export type TaxPaidStatus = 'paid' | 'due' | 'overdue';
export type ParcelSource = 'cadastral_survey' | 'svamitva_drone' | 'seed';
export type ApiClientStatus = 'active' | 'revoked';

// ---------------------------------------------------------------------------
// Administrative hierarchy
// ---------------------------------------------------------------------------

export interface State {
  id: UUID;
  name: string;
  code: string;
}

export interface District {
  id: UUID;
  state_id: UUID;
  name: string;
  lgd_code: string;
}

export interface Taluka {
  id: UUID;
  district_id: UUID;
  name: string;
}

export interface Village {
  id: UUID;
  taluka_id: UUID;
  name: string;
  lgd_code: string;
}

// ---------------------------------------------------------------------------
// BASE LAYER — Parcel
// ---------------------------------------------------------------------------

export interface Parcel {
  id: UUID;
  ulpin: string;              // 14-char Bhu-Aadhaar canonical key
  village_id: UUID;
  survey_number: string | null;
  khasra_number: string | null;
  gata_number: string | null;
  patta_number: string | null;
  area_recorded_sqm: number | null;
  area_gis_sqm: number | null;   // computed via ST_Area(geom)
  land_use_type: LandUseType;
  geom: Feature<Polygon>;        // GeoJSON polygon, RFC 7946
  source: ParcelSource;
  created_at: ISODateTime;
  updated_at: ISODateTime;

  // Denormalised fields the backend may include in the summary response
  village_name?: string;
  district_name?: string;
  state_name?: string;
  state_code?: string;
}

/** Lightweight parcel returned in search results (no geometry) */
export interface ParcelSummary {
  id: UUID;
  ulpin: string;
  survey_number: string | null;
  khasra_number: string | null;
  area_recorded_sqm: number | null;
  land_use_type: LandUseType;
  village_name: string;
  district_name: string;
  state_code: string;
}

// ---------------------------------------------------------------------------
// ESSENTIAL LAYERS
// ---------------------------------------------------------------------------

export interface Owner {
  id: UUID;
  full_name: string;
  /** Hashed — never store/display raw Aadhaar */
  aadhaar_hash: string;
  mobile_hash: string;
  father_or_spouse_name: string | null;
  address: string | null;
}

export interface RecordOfRights {
  id: UUID;
  parcel_id: UUID;
  owner_id: UUID;
  owner?: Owner;                 // backend may embed this
  ownership_type: OwnershipType;
  share_percentage: number | null;
  tenure_type: string | null;
  khatauni_number: string | null;
  source_document_ref: string | null;  // future OCR-service hook
  valid_from: ISODate | null;
  valid_to: ISODate | null;
  status: RorStatus;
}

export interface Registration {
  id: UUID;
  parcel_id: UUID;
  deed_type: string;
  deed_number: string;
  registration_date: ISODate;
  sub_registrar_office: string | null;
  consideration_amount: number | null;
  ngdrs_ref_id: string | null;
  document_hash: string | null;  // SHA-256 tamper check
}

export interface Encumbrance {
  id: UUID;
  parcel_id: UUID;
  type: EncumbranceType;
  holder_name: string;
  amount: number | null;
  start_date: ISODate | null;
  end_date: ISODate | null;
  status: EncumbranceStatus;
}

export interface Mutation {
  id: UUID;
  parcel_id: UUID;
  mutation_type: string;
  previous_owner_id: UUID | null;
  new_owner_id: UUID | null;
  previous_owner?: Pick<Owner, 'id' | 'full_name'>;
  new_owner?: Pick<Owner, 'id' | 'full_name'>;
  applied_date: ISODate | null;
  approved_date: ISODate | null;
  status: MutationStatus;
  approving_officer_id: UUID | null;
  remarks: string | null;
}

export interface BuildingPermission {
  id: UUID;
  parcel_id: UUID;
  application_number: string;
  approved_use: string | null;
  built_up_area_sqm: number | null;
  floors_approved: number | null;
  sanction_date: ISODate | null;
  status: BuildingPermissionStatus;
  plan_document_ref: string | null;
}

export interface PropertyTaxRecord {
  id: UUID;
  parcel_id: UUID;
  assessment_year: number;
  assessed_value: number | null;
  tax_amount: number | null;
  paid_status: TaxPaidStatus;
  ulb_id: string | null;
}

// ---------------------------------------------------------------------------
// PLATFORM / DPI LAYER — our differentiators
// ---------------------------------------------------------------------------

export interface User {
  id: UUID;
  name: string;
  email: string;
  mobile: string | null;
  role: UserRole;
  state_id: UUID | null;
  created_at: ISODateTime;
}

export interface Consent {
  id: UUID;
  requester_user_id: UUID;
  requester?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  parcel_id: UUID;
  purpose: string;
  scope: ConsentScopeKey[];
  status: ConsentStatus;
  granted_by_owner_id: UUID | null;
  valid_until: ISODateTime | null;
  created_at: ISODateTime;
}

export interface AuditTrailEntry {
  id: UUID;
  entity_type: string;
  entity_id: UUID;
  action: string;
  actor_user_id: UUID;
  actor?: Pick<User, 'id' | 'name' | 'role'>;
  prev_hash: string | null;  // SHA-256
  curr_hash: string;         // SHA-256
  payload_diff: Record<string, unknown> | null;
  created_at: ISODateTime;
  parcel_id?: string;
  block_number?: number;
  source_system?: string;
  remarks?: string;
}

export interface ChangeDetectionAlert {
  id: UUID;
  parcel_id: UUID;
  alert_type: AlertType;
  detected_date: ISODate;
  confidence_score: number;         // 0–1
  snapshot_before_ref: string | null;
  snapshot_after_ref: string | null;
  status: AlertStatus;
  resolved_by: UUID | null;
  /**
   * If true, this alert was generated from seeded/simulated imagery,
   * NOT from a live satellite observation. The UI MUST display a
   * "Simulated Data" badge when this is true — never imply real satellite
   * verification if the backend marks this flag.
   */
  is_simulated: boolean;
}

export interface DisputeRiskScore {
  id: UUID;
  parcel_id: UUID;
  /** 0–100 composite risk score */
  score: number;
  /**
   * Dynamic factor breakdown from the backend's risk_scoring_service.py.
   * Keys are whatever the model returns — DO NOT hardcode factor names here.
   * Each value is a numeric contribution (0–1 range or a signed delta).
   * Example: { "litigation_active": 0.35, "tax_arrears": 0.2, "mutation_speed": 0.1 }
   */
  factors: Record<string, number>;
  computed_at: ISODateTime;
  model_version: string;
}

export interface Grievance {
  id: UUID;
  parcel_id: UUID;
  applicant_user_id: UUID;
  applicant?: Pick<User, 'id' | 'name' | 'email'>;
  category: string;
  description: string;
  status: GrievanceStatus;
  sla_due_date: ISODate | null;
  assigned_officer_id: UUID | null;
  created_at: ISODateTime;
}

export interface ApiClient {
  id: UUID;
  org_name: string;
  api_key_hash: string;
  scopes: string[];
  rate_limit_per_min: number;
  status: ApiClientStatus;
}

// ---------------------------------------------------------------------------
// GIS / GeoJSON layers
// ---------------------------------------------------------------------------

export type ZoneFeatureProperties = {
  id?: UUID;
  state_id?: UUID;
  zone_type: 'residential' | 'commercial' | 'industrial' | 'green' | string;
  permissible_far: number | null;
  permissible_use: string | null;
};

export type UtilityFeatureProperties = {
  id: UUID;
  type: 'water' | 'sewer' | 'power' | 'road';
  parcel_id: UUID | null;
  status: string;
};

export type ZonesGeoJSON = FeatureCollection<Polygon, ZoneFeatureProperties>;
export type UtilityGeoJSON = FeatureCollection<Point | LineString, UtilityFeatureProperties>;

// ---------------------------------------------------------------------------
// API request / response shapes
// ---------------------------------------------------------------------------

export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  mobile?: string;
  password: string;
  role: UserRole;
  state_id?: UUID;
}

export interface SearchParams {
  query?: string;       // free-text: ULPIN / survey / khasra / patta
  state?: string;       // state code e.g. "UP"
  district?: string;
  village?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ZoningCheckRequest {
  /** GeoJSON point to check against master_plan_zones */
  point?: [number, number]; // [lng, lat]
}

export interface ZoningCheckResponse {
  ulpin: string;
  intersecting_zones: ZoneFeatureProperties[];
  is_compliant: boolean;
}

/** Unified history entry — the backend assembles these from registrations + mutations + alerts */
export interface HistoryEvent {
  id: UUID;
  event_type: 'registration' | 'mutation' | 'alert' | 'encumbrance' | 'building_permission';
  event_date: ISODate;
  title: string;
  description: string;
  /** Raw source object for drill-down */
  source_data: Registration | Mutation | ChangeDetectionAlert | Encumbrance | BuildingPermission;
}

export interface CreateConsentRequest {
  parcel_id: UUID;
  purpose: string;
  scope: ConsentScopeKey[];
}

export interface PatchConsentRequest {
  status: Extract<ConsentStatus, 'approved' | 'revoked'>;
}

export interface PatchAlertRequest {
  status: Extract<AlertStatus, 'under_review' | 'resolved'>;
}

export interface CreateGrievanceRequest {
  ulpin?: string;
  parcel_id: UUID;
  category: string;
  description: string;
  complainant_name?: string;
  contact_phone?: string;
}

export interface PatchGrievanceRequest {
  status: GrievanceStatus;
  assigned_officer_id?: UUID;
  remarks?: string;
}

export interface CreateDevApiKeyRequest {
  org_name: string;
  requested_scopes: string[];
}

export interface CreateDevApiKeyResponse {
  /** Plain-text key — only returned once, never again */
  api_key: string;
  client: ApiClient;
}

export interface DevUsageResponse {
  client: ApiClient;
  requests_today: number;
  requests_this_month: number;
  rate_limit_per_min: number;
}

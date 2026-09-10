/**
 * TODO (Task 13): DELETE this entire mocks/ directory once backend-v2 is confirmed live.
 * Replace VITE_API_BASE_URL in .env with the real deployed URL and set VITE_USE_MOCKS=false.
 *
 * Seed data for 5 representative parcels across UP, MH, KA, TN, TS.
 * Shapes exactly mirror the TypeScript types in src/types/index.ts.
 * Geometries are small polygons around real district centroids so the map renders sensibly.
 */

import type {
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
  User,
  ZonesGeoJSON,
  UtilityGeoJSON,
} from '@/types';

// ---------------------------------------------------------------------------
// Shared users
// ---------------------------------------------------------------------------

export const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Arjun Sharma',
    email: 'arjun@example.in',
    mobile: '9811000001',
    role: 'citizen',
    state_id: 'state-up',
    created_at: '2026-01-10T09:00:00+05:30',
  },
  {
    id: 'usr-002',
    name: 'Priya Nair',
    email: 'priya@bankofmah.in',
    mobile: '9422000002',
    role: 'bank_official',
    state_id: 'state-mh',
    created_at: '2026-02-15T09:00:00+05:30',
  },
  {
    id: 'usr-003',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@revenue.ka.gov.in',
    mobile: '9980000003',
    role: 'revenue_officer',
    state_id: 'state-ka',
    created_at: '2026-03-01T09:00:00+05:30',
  },
  {
    id: 'usr-004',
    name: 'Demo Citizen',
    email: 'demo@nlip.in',
    mobile: '9000000000',
    role: 'citizen',
    state_id: null,
    created_at: '2026-09-01T00:00:00+05:30',
  },
  {
    id: 'usr-005',
    name: 'Dev Portal User',
    email: 'dev@nlip.in',
    mobile: null,
    role: 'developer',
    state_id: null,
    created_at: '2026-09-05T00:00:00+05:30',
  },
];

// ---------------------------------------------------------------------------
// Parcels  (5 representative parcels, 1 per state)
// ---------------------------------------------------------------------------

export const MOCK_PARCELS: Parcel[] = [
  {
    id: 'pcl-up-001',
    ulpin: 'UP09412601001',
    village_id: 'vill-up-001',
    survey_number: '412/601',
    khasra_number: 'K-2234',
    gata_number: null,
    patta_number: null,
    area_recorded_sqm: 842,
    area_gis_sqm: 838.4,     // ~0.4% variance — below 2% threshold
    land_use_type: 'residential',
    geom: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [80.94769, 26.84735],
          [80.94792, 26.84733],
          [80.94805, 26.84745],
          [80.94790, 26.84758],
          [80.94767, 26.84755],
          [80.94761, 26.84745],
          [80.94769, 26.84735],
        ]],
      },
      properties: { ulpin: 'UP09412601001' },
    },
    source: 'cadastral_survey',
    created_at: '2025-06-01T00:00:00+05:30',
    updated_at: '2026-07-15T10:00:00+05:30',
    village_name: 'Chinhat',
    district_name: 'Lucknow',
    state_name: 'Uttar Pradesh',
    state_code: 'UP',
  },
  {
    id: 'pcl-mh-001',
    ulpin: 'MH27830501001',
    village_id: 'vill-mh-001',
    survey_number: '83/05',
    khasra_number: null,
    gata_number: '7/12-0501',
    patta_number: null,
    area_recorded_sqm: 510,
    area_gis_sqm: 545,        // ~6.9% variance — EXCEEDS 2% threshold, badge shown
    land_use_type: 'residential',
    geom: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72.87622, 19.07537],
          [72.87640, 19.07536],
          [72.87642, 19.07554],
          [72.87634, 19.07560],
          [72.87620, 19.07556],
          [72.87617, 19.07546],
          [72.87622, 19.07537],
        ]],
      },
      properties: { ulpin: 'MH27830501001' },
    },
    source: 'svamitva_drone',
    created_at: '2025-09-01T00:00:00+05:30',
    updated_at: '2026-08-20T08:30:00+05:30',
    village_name: 'Andheri (W)',
    district_name: 'Mumbai',
    state_name: 'Maharashtra',
    state_code: 'MH',
  },
  {
    id: 'pcl-ka-001',
    ulpin: 'KA29150301001',
    village_id: 'vill-ka-001',
    survey_number: '15/03',
    khasra_number: null,
    gata_number: null,
    patta_number: 'PTA-9921-A',
    area_recorded_sqm: 1200,
    area_gis_sqm: 1198,
    land_use_type: 'commercial',
    geom: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.59603, 12.97224],
          [77.59631, 12.97222],
          [77.59634, 12.97248],
          [77.59623, 12.97258],
          [77.59605, 12.97255],
          [77.59599, 12.97239],
          [77.59603, 12.97224],
        ]],
      },
      properties: { ulpin: 'KA29150301001' },
    },
    source: 'cadastral_survey',
    created_at: '2025-03-15T00:00:00+05:30',
    updated_at: '2026-05-10T12:00:00+05:30',
    village_name: 'Koramangala',
    district_name: 'Bengaluru Urban',
    state_name: 'Karnataka',
    state_code: 'KA',
  },
  {
    id: 'pcl-tn-001',
    ulpin: 'TN33620801001',
    village_id: 'vill-tn-001',
    survey_number: '62/08',
    khasra_number: null,
    gata_number: null,
    patta_number: 'PATTA-TN-4412',
    area_recorded_sqm: 650,
    area_gis_sqm: 649.2,
    land_use_type: 'residential',
    geom: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [80.27212, 13.08412],
          [80.27233, 13.08410],
          [80.27236, 13.08429],
          [80.27227, 13.08436],
          [80.27213, 13.08433],
          [80.27210, 13.08422],
          [80.27212, 13.08412],
        ]],
      },
      properties: { ulpin: 'TN33620801001' },
    },
    source: 'svamitva_drone',
    created_at: '2025-11-01T00:00:00+05:30',
    updated_at: '2026-09-01T06:00:00+05:30',
    village_name: 'T. Nagar',
    district_name: 'Chennai',
    state_name: 'Tamil Nadu',
    state_code: 'TN',
  },
  {
    id: 'pcl-ts-001',
    ulpin: 'TS36280201001',
    village_id: 'vill-ts-001',
    survey_number: '28/02',
    khasra_number: null,
    gata_number: null,
    patta_number: null,
    area_recorded_sqm: 920,
    area_gis_sqm: 995,        // ~8.2% variance — HIGH, badge shown, also disputed
    land_use_type: 'mixed',
    geom: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [78.48685, 17.38538],
          [78.48742, 17.38536],
          [78.48748, 17.38575],
          [78.48735, 17.38605],
          [78.48695, 17.38602],
          [78.48678, 17.38570],
          [78.48685, 17.38538],
        ]],
      },
      properties: { ulpin: 'TS36280201001' },
    },

    source: 'cadastral_survey',
    created_at: '2024-12-01T00:00:00+05:30',
    updated_at: '2026-09-08T14:00:00+05:30',
    village_name: 'Gachibowli',
    district_name: 'Hyderabad',
    state_name: 'Telangana',
    state_code: 'TS',
  },
  {
    id: 'pcl-pb-001',
    ulpin: 'PB03140701001',
    village_id: 'vill-pb-001',
    survey_number: '14/07',
    khasra_number: 'K-8871',
    gata_number: null,
    patta_number: null,
    area_recorded_sqm: 4047,    // ~1 acre
    area_gis_sqm: 4035,         // ~0.3% variance — clean
    land_use_type: 'agricultural',
    geom: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.83242, 31.58281],
          [74.83283, 31.58276],
          [74.83297, 31.58314],
          [74.83270, 31.58349],
          [74.83237, 31.58341],
          [74.83221, 31.58308],
          [74.83242, 31.58281],
        ]],
      },
      properties: { ulpin: 'PB03140701001' },
    },
    source: 'cadastral_survey',
    created_at: '2023-04-01T00:00:00+05:30',
    updated_at: '2026-06-10T08:00:00+05:30',
    village_name: 'Lopoke',
    district_name: 'Amritsar',
    state_name: 'Punjab',
    state_code: 'PB',
  },
  {
    id: 'pcl-mp-001',
    ulpin: 'MP23090401001',
    village_id: 'vill-mp-001',
    survey_number: '09/04',
    khasra_number: 'K-3392',
    gata_number: null,
    patta_number: null,
    area_recorded_sqm: 6070,    // ~1.5 acres
    area_gis_sqm: 7280,         // ~20% variance — MASSIVE discrepancy, fraud indicator
    land_use_type: 'agricultural',
    geom: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.3560, 23.2120],
          [77.3580, 23.2118],
          [77.3590, 23.2140],
          [77.3578, 23.2160],
          [77.3558, 23.2155],
          [77.3548, 23.2135],
          [77.3560, 23.2120],
        ]],
      },
      properties: { ulpin: 'MP23090401001' },
    },
    source: 'svamitva_drone',
    created_at: '2024-01-15T00:00:00+05:30',
    updated_at: '2026-09-01T12:00:00+05:30',
    village_name: 'Ratibad',
    district_name: 'Bhopal',
    state_name: 'Madhya Pradesh',
    state_code: 'MP',
  },
];

export const MOCK_PARCEL_SUMMARIES: ParcelSummary[] = MOCK_PARCELS.map((p) => ({
  id: p.id,
  ulpin: p.ulpin,
  survey_number: p.survey_number,
  khasra_number: p.khasra_number,
  area_recorded_sqm: p.area_recorded_sqm,
  land_use_type: p.land_use_type,
  village_name: p.village_name ?? '',
  district_name: p.district_name ?? '',
  state_code: p.state_code ?? '',
}));

// ---------------------------------------------------------------------------
// Record of Rights
// ---------------------------------------------------------------------------

export const MOCK_ROR: Record<string, RecordOfRights[]> = {
  UP09412601001: [{
    id: 'ror-up-001',
    parcel_id: 'pcl-up-001',
    owner_id: 'usr-001',
    owner: { id: 'usr-001', full_name: 'Arjun Sharma', aadhaar_hash: 'sha256_aadhaar_arjun', mobile_hash: 'sha256_mob_arjun', father_or_spouse_name: 'Ram Prasad Sharma', address: 'Village Chinhat, Lucknow, UP' },
    ownership_type: 'sole',
    share_percentage: 100,
    tenure_type: 'bhumidhari',
    khatauni_number: 'KH-2024-009123',
    source_document_ref: null,
    valid_from: '2018-04-01',
    valid_to: null,
    status: 'active',
  }],
  MH27830501001: [{
    id: 'ror-mh-001',
    parcel_id: 'pcl-mh-001',
    owner_id: 'own-mh-001',
    owner: { id: 'own-mh-001', full_name: 'Sneha Desai', aadhaar_hash: 'sha256_aadhaar_sneha', mobile_hash: 'sha256_mob_sneha', father_or_spouse_name: 'Anil Desai', address: 'Plot 83, Andheri West, Mumbai' },
    ownership_type: 'sole',
    share_percentage: 100,
    tenure_type: 'freehold',
    khatauni_number: null,
    source_document_ref: 'NGDRS-REG-2021-MH2711',
    valid_from: '2021-07-14',
    valid_to: null,
    status: 'active',
  }],
  KA29150301001: [
    {
      id: 'ror-ka-001',
      parcel_id: 'pcl-ka-001',
      owner_id: 'own-ka-001',
      owner: { id: 'own-ka-001', full_name: 'Krishnaswamy Rao', aadhaar_hash: 'sha256_aadhaar_kr', mobile_hash: 'sha256_mob_kr', father_or_spouse_name: 'Venkateswara Rao', address: '5th Block, Koramangala, Bangalore' },
      ownership_type: 'joint',
      share_percentage: 60,
      tenure_type: 'freehold',
      khatauni_number: null,
      source_document_ref: null,
      valid_from: '2015-01-01',
      valid_to: null,
      status: 'active',
    },
    {
      id: 'ror-ka-002',
      parcel_id: 'pcl-ka-001',
      owner_id: 'own-ka-002',
      owner: { id: 'own-ka-002', full_name: 'Lalitha Rao', aadhaar_hash: 'sha256_aadhaar_lr', mobile_hash: 'sha256_mob_lr', father_or_spouse_name: 'Krishnaswamy Rao', address: '5th Block, Koramangala, Bangalore' },
      ownership_type: 'joint',
      share_percentage: 40,
      tenure_type: 'freehold',
      khatauni_number: null,
      source_document_ref: null,
      valid_from: '2015-01-01',
      valid_to: null,
      status: 'active',
    },
  ],
  TN33620801001: [{
    id: 'ror-tn-001',
    parcel_id: 'pcl-tn-001',
    owner_id: 'own-tn-001',
    owner: { id: 'own-tn-001', full_name: 'Karthikeyan Murugan', aadhaar_hash: 'sha256_aadhaar_km', mobile_hash: 'sha256_mob_km', father_or_spouse_name: 'Murugan Pillai', address: '12 Pondy Bazaar, T. Nagar, Chennai' },
    ownership_type: 'sole',
    share_percentage: 100,
    tenure_type: 'patta',
    khatauni_number: null,
    source_document_ref: 'TN-PATTA-4412-2019',
    valid_from: '2019-11-15',
    valid_to: null,
    status: 'active',
  }],
  TS36280201001: [
    {
      id: 'ror-ts-001',
      parcel_id: 'pcl-ts-001',
      owner_id: 'own-ts-001',
      owner: { id: 'own-ts-001', full_name: 'Suresh Reddy', aadhaar_hash: 'sha256_aadhaar_sr', mobile_hash: 'sha256_mob_sr', father_or_spouse_name: 'Narayana Reddy', address: 'Gachibowli Village, Hyderabad, TS' },
      ownership_type: 'sole',
      share_percentage: 100,
      tenure_type: 'ryotwari',
      khatauni_number: null,
      source_document_ref: null,
      valid_from: '2010-01-01',
      valid_to: '2023-08-01',
      status: 'historical',
    },
    {
      id: 'ror-ts-002',
      parcel_id: 'pcl-ts-001',
      owner_id: 'own-ts-002',
      owner: { id: 'own-ts-002', full_name: 'Ramesh Reddy', aadhaar_hash: 'sha256_aadhaar_rr', mobile_hash: 'sha256_mob_rr', father_or_spouse_name: 'Suresh Reddy', address: 'Plot 28, Gachibowli, Hyderabad' },
      ownership_type: 'sole',
      share_percentage: 100,
      tenure_type: 'ryotwari',
      khatauni_number: null,
      source_document_ref: null,
      valid_from: '2023-08-01',
      valid_to: null,
      status: 'disputed',    // <-- deliberate variance case for Trust Score demo
    },
  ],
  PB03140701001: [{
    id: 'ror-pb-001',
    parcel_id: 'pcl-pb-001',
    owner_id: 'own-pb-001',
    owner: { id: 'own-pb-001', full_name: 'Gurpreet Singh', aadhaar_hash: 'sha256_aadhaar_gurpreet', mobile_hash: 'sha256_mob_gurpreet', father_or_spouse_name: 'Harpal Singh', address: 'Village Lopoke, Amritsar, Punjab' },
    ownership_type: 'sole',
    share_percentage: 100,
    tenure_type: 'bhumidhari',
    khatauni_number: 'KH-2023-PB4491',
    source_document_ref: null,
    valid_from: '2010-06-15',
    valid_to: null,
    status: 'active',
  }],
  MP23090401001: [
    {
      id: 'ror-mp-001',
      parcel_id: 'pcl-mp-001',
      owner_id: 'own-mp-001',
      owner: { id: 'own-mp-001', full_name: 'Vikram Patel', aadhaar_hash: 'sha256_aadhaar_vikram', mobile_hash: 'sha256_mob_vikram', father_or_spouse_name: 'Mohan Patel', address: 'Village Ratibad, Bhopal, MP' },
      ownership_type: 'sole',
      share_percentage: 100,
      tenure_type: 'bhumidhari',
      khatauni_number: 'KH-2024-MP7831',
      source_document_ref: 'FORGED-SD-MP-2024-0091',
      valid_from: '2024-03-01',
      valid_to: null,
      status: 'disputed',    // <-- forged document, ownership challenged
    },
    {
      id: 'ror-mp-002',
      parcel_id: 'pcl-mp-001',
      owner_id: 'own-mp-002',
      owner: { id: 'own-mp-002', full_name: 'Rajkumar Yadav', aadhaar_hash: 'sha256_aadhaar_rajkumar', mobile_hash: 'sha256_mob_rajkumar', father_or_spouse_name: 'Late Bansilal Yadav', address: 'Village Ratibad, Bhopal, MP' },
      ownership_type: 'sole',
      share_percentage: 100,
      tenure_type: 'bhumidhari',
      khatauni_number: 'KH-2019-MP3201',
      source_document_ref: null,
      valid_from: '2008-01-01',
      valid_to: '2024-03-01',
      status: 'disputed',    // <-- original owner claims forgery
    },
  ],
};

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

export const MOCK_REGISTRATIONS: Record<string, Registration[]> = {
  MH27830501001: [{
    id: 'reg-mh-001',
    parcel_id: 'pcl-mh-001',
    deed_type: 'Sale Deed',
    deed_number: 'MH-SD-2021-114423',
    registration_date: '2021-07-14',
    sub_registrar_office: 'SRO Andheri, Mumbai',
    consideration_amount: 8500000,
    ngdrs_ref_id: 'NGDRS-2021-MH2711',
    document_hash: 'a3f9d2c1b8e7a4560123456789abcdef0123456789abcdef0123456789abcdef',
  }],
  TS36280201001: [{
    id: 'reg-ts-001',
    parcel_id: 'pcl-ts-001',
    deed_type: 'Gift Deed',
    deed_number: 'TS-GD-2023-99341',
    registration_date: '2023-08-01',
    sub_registrar_office: 'SRO Gachibowli, Hyderabad',
    consideration_amount: 0,
    ngdrs_ref_id: null,
    document_hash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
  }],
  KA29150301001: [{
    id: 'reg-ka-001',
    parcel_id: 'pcl-ka-001',
    deed_type: 'Sale Deed',
    deed_number: 'KA-SD-2015-008812',
    registration_date: '2015-01-12',
    sub_registrar_office: 'SRO Koramangala, Bangalore',
    consideration_amount: 12000000,
    ngdrs_ref_id: null,
    document_hash: 'c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
  }],
  UP09412601001: [],
  TN33620801001: [],
  PB03140701001: [],
  MP23090401001: [{
    id: 'reg-mp-001',
    parcel_id: 'pcl-mp-001',
    deed_type: 'Sale Deed',
    deed_number: 'MP-SD-2024-00914',
    registration_date: '2024-03-01',
    sub_registrar_office: 'SRO Huzur, Bhopal',
    consideration_amount: 1800000,
    ngdrs_ref_id: null,
    document_hash: 'f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0',
  }],
};

// ---------------------------------------------------------------------------
// Encumbrances
// ---------------------------------------------------------------------------

export const MOCK_ENCUMBRANCES: Record<string, Encumbrance[]> = {
  MH27830501001: [{
    id: 'enc-mh-001',
    parcel_id: 'pcl-mh-001',
    type: 'mortgage',
    holder_name: 'Bank of Maharashtra, Andheri Branch',
    amount: 6000000,
    start_date: '2021-07-15',
    end_date: '2031-07-14',
    status: 'active',
  }],
  TS36280201001: [{
    id: 'enc-ts-001',
    parcel_id: 'pcl-ts-001',
    type: 'court_case',
    holder_name: 'Civil Court, Cyberabad District',
    amount: null,
    start_date: '2024-02-20',
    end_date: null,
    status: 'active',     // <-- deliberate variance: active litigation, high risk
  }],
  KA29150301001: [],
  UP09412601001: [],
  TN33620801001: [],
  PB03140701001: [],
  MP23090401001: [
    {
      id: 'enc-mp-001',
      parcel_id: 'pcl-mp-001',
      type: 'court_case',
      holder_name: 'District Court, Bhopal — Case No. 2024/CR/1182',
      amount: null,
      start_date: '2024-06-10',
      end_date: null,
      status: 'active',     // <-- active fraud litigation
    },
    {
      id: 'enc-mp-002',
      parcel_id: 'pcl-mp-001',
      type: 'attachment',
      holder_name: 'Sub-Divisional Magistrate, Huzur, Bhopal',
      amount: null,
      start_date: '2024-08-15',
      end_date: null,
      status: 'active',     // <-- govt attachment order on suspected fraud
    },
  ],
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const MOCK_MUTATIONS: Record<string, Mutation[]> = {
  TS36280201001: [{
    id: 'mut-ts-001',
    parcel_id: 'pcl-ts-001',
    mutation_type: 'gift_deed_transfer',
    previous_owner_id: 'own-ts-001',
    new_owner_id: 'own-ts-002',
    previous_owner: { id: 'own-ts-001', full_name: 'Suresh Reddy' },
    new_owner: { id: 'own-ts-002', full_name: 'Ramesh Reddy' },
    applied_date: '2023-07-15',
    approved_date: '2023-08-01',
    status: 'approved',
    approving_officer_id: 'usr-003',
    remarks: 'Gift deed between father and son. Mutation approved post registration.',
  }],
  KA29150301001: [{
    id: 'mut-ka-001',
    parcel_id: 'pcl-ka-001',
    mutation_type: 'purchase_transfer',
    previous_owner_id: 'own-ka-prev',
    new_owner_id: 'own-ka-001',
    previous_owner: { id: 'own-ka-prev', full_name: 'Gopal Nair' },
    new_owner: { id: 'own-ka-001', full_name: 'Krishnaswamy Rao' },
    applied_date: '2015-01-20',
    approved_date: '2015-02-14',
    status: 'approved',
    approving_officer_id: null,
    remarks: null,
  }],
  MH27830501001: [],
  UP09412601001: [],
  TN33620801001: [],
  PB03140701001: [],
  MP23090401001: [{
    id: 'mut-mp-001',
    parcel_id: 'pcl-mp-001',
    mutation_type: 'purchase_transfer',
    previous_owner_id: 'own-mp-002',
    new_owner_id: 'own-mp-001',
    previous_owner: { id: 'own-mp-002', full_name: 'Rajkumar Yadav' },
    new_owner: { id: 'own-mp-001', full_name: 'Vikram Patel' },
    applied_date: '2024-03-05',
    approved_date: '2024-03-15',
    status: 'challenged',    // <-- mutation challenged as fraudulent
    approving_officer_id: null,
    remarks: 'Mutation approved based on sale deed. Original owner alleges forged signatures and impersonation.',
  }],
};

// ---------------------------------------------------------------------------
// Building Permissions
// ---------------------------------------------------------------------------

export const MOCK_BUILDING_PERMISSIONS: Record<string, BuildingPermission[]> = {
  MH27830501001: [{
    id: 'bp-mh-001',
    parcel_id: 'pcl-mh-001',
    application_number: 'MCGM-BP-2022-00441',
    approved_use: 'Residential',
    built_up_area_sqm: 480,
    floors_approved: 4,
    sanction_date: '2022-03-10',
    status: 'approved',
    plan_document_ref: null,
  }],
  TS36280201001: [{
    id: 'bp-ts-001',
    parcel_id: 'pcl-ts-001',
    application_number: 'GHMC-BP-2025-01822',
    approved_use: 'Residential',
    built_up_area_sqm: 220,
    floors_approved: 2,
    sanction_date: null,
    status: 'deviation_flagged',  // <-- flags for high-risk TS parcel
    plan_document_ref: null,
  }],
  KA29150301001: [],
  UP09412601001: [],
  TN33620801001: [],
  PB03140701001: [],
  MP23090401001: [],
};

// ---------------------------------------------------------------------------
// Tax records
// ---------------------------------------------------------------------------

export const MOCK_TAX: Record<string, PropertyTaxRecord[]> = {
  MH27830501001: [{
    id: 'tax-mh-001',
    parcel_id: 'pcl-mh-001',
    assessment_year: 2026,
    assessed_value: 8200000,
    tax_amount: 24600,
    paid_status: 'paid',
    ulb_id: 'ULB-MCGM',
  }],
  TS36280201001: [{
    id: 'tax-ts-001',
    parcel_id: 'pcl-ts-001',
    assessment_year: 2026,
    assessed_value: 7500000,
    tax_amount: 22500,
    paid_status: 'overdue',    // <-- contributes to high risk score
    ulb_id: 'ULB-GHMC',
  }],
  KA29150301001: [{
    id: 'tax-ka-001',
    parcel_id: 'pcl-ka-001',
    assessment_year: 2026,
    assessed_value: 12500000,
    tax_amount: 37500,
    paid_status: 'paid',
    ulb_id: 'ULB-BBMP',
  }],
  UP09412601001: [{
    id: 'tax-up-001',
    parcel_id: 'pcl-up-001',
    assessment_year: 2026,
    assessed_value: 420000,
    tax_amount: 1260,
    paid_status: 'due',
    ulb_id: null,
  }],
  TN33620801001: [{
    id: 'tax-tn-001',
    parcel_id: 'pcl-tn-001',
    assessment_year: 2026,
    assessed_value: 5800000,
    tax_amount: 17400,
    paid_status: 'paid',
    ulb_id: 'ULB-GCC',
  }],
  PB03140701001: [{
    id: 'tax-pb-001',
    parcel_id: 'pcl-pb-001',
    assessment_year: 2026,
    assessed_value: 2800000,
    tax_amount: 2800,
    paid_status: 'paid',
    ulb_id: null,
  }],
  MP23090401001: [{
    id: 'tax-mp-001',
    parcel_id: 'pcl-mp-001',
    assessment_year: 2026,
    assessed_value: 4200000,
    tax_amount: 12600,
    paid_status: 'overdue',    // <-- 3 years overdue, fraud indicator
    ulb_id: null,
  }],
};

// ---------------------------------------------------------------------------
// Change Detection Alerts
// ---------------------------------------------------------------------------

export const MOCK_ALERTS: Record<string, ChangeDetectionAlert[]> = {
  TS36280201001: [
    {
      id: 'alt-ts-001',
      parcel_id: 'pcl-ts-001',
      alert_type: 'boundary_variance',
      detected_date: '2026-07-12',
      confidence_score: 0.87,
      snapshot_before_ref: 'gs://nlip-snapshots/ts-28-02-before-2026-06.tif',
      snapshot_after_ref: 'gs://nlip-snapshots/ts-28-02-after-2026-07.tif',
      status: 'open',
      resolved_by: null,
      is_simulated: true,   // <-- seeded/mock imagery, UI must show "Simulated Data" badge
    },
    {
      id: 'alt-ts-002',
      parcel_id: 'pcl-ts-001',
      alert_type: 'unauthorized_construction',
      detected_date: '2026-08-20',
      confidence_score: 0.91,
      snapshot_before_ref: null,
      snapshot_after_ref: null,
      status: 'under_review',
      resolved_by: null,
      is_simulated: true,
    },
  ],
  MH27830501001: [{
    id: 'alt-mh-001',
    parcel_id: 'pcl-mh-001',
    alert_type: 'landuse_mismatch',
    detected_date: '2026-05-03',
    confidence_score: 0.73,
    snapshot_before_ref: null,
    snapshot_after_ref: null,
    status: 'resolved',
    resolved_by: 'usr-003',
    is_simulated: true,
  }],
  UP09412601001: [],
  KA29150301001: [],
  TN33620801001: [],
  PB03140701001: [],
  MP23090401001: [
    {
      id: 'alt-mp-001',
      parcel_id: 'pcl-mp-001',
      alert_type: 'boundary_variance',
      detected_date: '2026-08-05',
      confidence_score: 0.95,
      snapshot_before_ref: 'gs://nlip-snapshots/mp-09-04-before-2026-07.tif',
      snapshot_after_ref: 'gs://nlip-snapshots/mp-09-04-after-2026-08.tif',
      status: 'open',
      resolved_by: null,
      is_simulated: true,
    },
    {
      id: 'alt-mp-002',
      parcel_id: 'pcl-mp-001',
      alert_type: 'unauthorized_construction',
      detected_date: '2026-08-22',
      confidence_score: 0.88,
      snapshot_before_ref: null,
      snapshot_after_ref: null,
      status: 'open',
      resolved_by: null,
      is_simulated: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// Dispute Risk Scores
// NOTE: `factors` keys are exactly what risk_scoring_service.py returns.
// DO NOT change key names here without coordinating with Person 2 / backend-v2.
// ---------------------------------------------------------------------------

export const MOCK_RISK_SCORES: Record<string, DisputeRiskScore> = {
  TS36280201001: {
    id: 'drs-ts-001',
    parcel_id: 'pcl-ts-001',
    score: 81.4,
    factors: {
      litigation_active: 0.35,
      tax_arrears: 0.20,
      ownership_disputed: 0.15,
      area_variance_gis: 0.08,
      building_deviation: 0.035,
      mutation_pending: 0.00,
    },
    computed_at: '2026-09-09T06:00:00+05:30',
    model_version: 'v0.1-seed',
  },
  MH27830501001: {
    id: 'drs-mh-001',
    parcel_id: 'pcl-mh-001',
    score: 34.2,
    factors: {
      litigation_active: 0.00,
      tax_arrears: 0.00,
      ownership_disputed: 0.00,
      area_variance_gis: 0.12,
      building_deviation: 0.00,
      mortgage_active: 0.20,
    },
    computed_at: '2026-09-09T06:00:00+05:30',
    model_version: 'v0.1-seed',
  },
  UP09412601001: {
    id: 'drs-up-001',
    parcel_id: 'pcl-up-001',
    score: 18.5,
    factors: {
      litigation_active: 0.00,
      tax_arrears: 0.05,
      ownership_disputed: 0.00,
      area_variance_gis: 0.01,
      building_deviation: 0.00,
    },
    computed_at: '2026-09-09T06:00:00+05:30',
    model_version: 'v0.1-seed',
  },
  KA29150301001: {
    id: 'drs-ka-001',
    parcel_id: 'pcl-ka-001',
    score: 22.0,
    factors: {
      litigation_active: 0.00,
      tax_arrears: 0.00,
      ownership_disputed: 0.00,
      area_variance_gis: 0.00,
      building_deviation: 0.00,
      joint_ownership_complexity: 0.10,
    },
    computed_at: '2026-09-09T06:00:00+05:30',
    model_version: 'v0.1-seed',
  },
  TN33620801001: {
    id: 'drs-tn-001',
    parcel_id: 'pcl-tn-001',
    score: 12.0,
    factors: {
      litigation_active: 0.00,
      tax_arrears: 0.00,
      ownership_disputed: 0.00,
      area_variance_gis: 0.00,
      building_deviation: 0.00,
    },
    computed_at: '2026-09-09T06:00:00+05:30',
    model_version: 'v0.1-seed',
  },
  PB03140701001: {
    id: 'drs-pb-001',
    parcel_id: 'pcl-pb-001',
    score: 8.5,
    factors: {
      litigation_active: 0.00,
      tax_arrears: 0.00,
      ownership_disputed: 0.00,
      area_variance_gis: 0.005,
      building_deviation: 0.00,
    },
    computed_at: '2026-09-09T06:00:00+05:30',
    model_version: 'v0.1-seed',
  },
  MP23090401001: {
    id: 'drs-mp-001',
    parcel_id: 'pcl-mp-001',
    score: 94.2,      // <-- CRITICAL risk — fraud case
    factors: {
      litigation_active: 0.40,
      tax_arrears: 0.15,
      ownership_disputed: 0.30,
      area_variance_gis: 0.20,
      building_deviation: 0.00,
      forged_document_flag: 0.25,
    },
    computed_at: '2026-09-09T06:00:00+05:30',
    model_version: 'v0.1-seed',
  },
};

// ---------------------------------------------------------------------------
// History (unified timeline assembled by backend from sub-resources)
// ---------------------------------------------------------------------------

export const MOCK_HISTORY: Record<string, HistoryEvent[]> = {
  TS36280201001: [
    {
      id: 'hev-ts-001',
      event_type: 'registration',
      event_date: '2023-08-01',
      title: 'Gift Deed Registered',
      description: 'Parcel transferred via gift deed from Suresh Reddy to Ramesh Reddy at SRO Gachibowli.',
      source_data: MOCK_REGISTRATIONS['TS36280201001'][0],
    },
    {
      id: 'hev-ts-002',
      event_type: 'mutation',
      event_date: '2023-08-01',
      title: 'Mutation Approved',
      description: 'Ownership mutation approved. RoR updated to Ramesh Reddy.',
      source_data: MOCK_MUTATIONS['TS36280201001'][0],
    },
    {
      id: 'hev-ts-003',
      event_type: 'alert',
      event_date: '2026-07-12',
      title: 'Boundary Variance Detected',
      description: 'GIS boundary variance of ~8.2% detected via satellite comparison (simulated).',
      source_data: MOCK_ALERTS['TS36280201001'][0],
    },
  ],
  MH27830501001: [
    {
      id: 'hev-mh-001',
      event_type: 'registration',
      event_date: '2021-07-14',
      title: 'Sale Deed Registered',
      description: 'Property purchased by Sneha Desai. Registered at SRO Andheri, Mumbai.',
      source_data: MOCK_REGISTRATIONS['MH27830501001'][0],
    },
    {
      id: 'hev-mh-002',
      event_type: 'encumbrance',
      event_date: '2021-07-15',
      title: 'Mortgage Created',
      description: 'Home loan mortgage of ₹60,00,000 registered with Bank of Maharashtra.',
      source_data: MOCK_ENCUMBRANCES['MH27830501001'][0],
    },
  ],
  UP09412601001: [],
  KA29150301001: [],
  TN33620801001: [],
  PB03140701001: [],
  MP23090401001: [
    {
      id: 'hev-mp-001',
      event_type: 'registration',
      event_date: '2024-03-01',
      title: 'Sale Deed Registered (Suspected Forged)',
      description: 'Sale deed MP-SD-2024-00914 registered at SRO Huzur, Bhopal. Original owner Rajkumar Yadav alleges forged signatures and impersonation.',
      source_data: MOCK_REGISTRATIONS['MP23090401001'][0],
    },
    {
      id: 'hev-mp-002',
      event_type: 'mutation',
      event_date: '2024-03-15',
      title: 'Mutation Challenged',
      description: 'Ownership mutation to Vikram Patel challenged by original owner. FIR filed under Sections 420, 467, 468 IPC.',
      source_data: MOCK_MUTATIONS['MP23090401001'][0],
    },
    {
      id: 'hev-mp-003',
      event_type: 'encumbrance',
      event_date: '2024-06-10',
      title: 'Court Case Filed',
      description: 'District Court Bhopal — Case 2024/CR/1182. Stay order issued on property transfer pending investigation.',
      source_data: MOCK_ENCUMBRANCES['MP23090401001'][0],
    },
    {
      id: 'hev-mp-004',
      event_type: 'alert',
      event_date: '2026-08-05',
      title: 'Massive Boundary Variance (20%)',
      description: 'GIS drone survey reveals 20% area excess (7,280 sqm vs 6,070 sqm recorded). Suspected encroachment on adjacent government land.',
      source_data: MOCK_ALERTS['MP23090401001'][0],
    },
  ],
};

// ---------------------------------------------------------------------------
// Consents
// ---------------------------------------------------------------------------

export const MOCK_CONSENTS: Consent[] = [
  {
    id: 'con-001',
    requester_user_id: 'usr-002',
    requester: { id: 'usr-002', name: 'Priya Nair', email: 'priya@bankofmah.in', role: 'bank_official' },
    parcel_id: 'pcl-mh-001',
    purpose: 'Loan due diligence for home loan application MH-HL-2026-00441',
    scope: ['ror', 'encumbrance', 'registration'],
    status: 'approved',
    granted_by_owner_id: 'own-mh-001',
    valid_until: '2026-12-31T23:59:59+05:30',
    created_at: '2026-08-01T10:00:00+05:30',
  },
  {
    id: 'con-002',
    requester_user_id: 'usr-005',
    requester: { id: 'usr-005', name: 'Dev Portal User', email: 'dev@nlip.in', role: 'developer' },
    parcel_id: 'pcl-ts-001',
    purpose: 'Research — land dispute pattern analysis',
    scope: ['ror', 'encumbrance'],
    status: 'pending',
    granted_by_owner_id: null,
    valid_until: null,
    created_at: '2026-09-05T14:30:00+05:30',
  },
];

// ---------------------------------------------------------------------------
// Audit trail entries
// ---------------------------------------------------------------------------

export const MOCK_AUDIT_TRAIL: AuditTrailEntry[] = [
  {
    id: 'aud-001',
    entity_type: 'record_of_rights',
    entity_id: 'ror-ts-002',
    action: 'CREATE',
    actor_user_id: 'usr-003',
    actor: { id: 'usr-003', name: 'Ravi Kumar', role: 'revenue_officer' },
    prev_hash: null,
    curr_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    payload_diff: { ownership_type: [null, 'sole'], status: [null, 'disputed'] },
    created_at: '2023-08-01T08:42:00+05:30',
  },
  {
    id: 'aud-002',
    entity_type: 'record_of_rights',
    entity_id: 'ror-ts-002',
    action: 'UPDATE',
    actor_user_id: 'usr-003',
    actor: { id: 'usr-003', name: 'Ravi Kumar', role: 'revenue_officer' },
    prev_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    curr_hash: 'ba7816bf8f01cfea414140de5dae2ec73b00361bbef0469348d9aed083682f2d',
    payload_diff: { status: ['active', 'disputed'] },
    created_at: '2026-02-14T11:05:00+05:30',
  },
];

// ---------------------------------------------------------------------------
// Grievances
// ---------------------------------------------------------------------------

export const MOCK_GRIEVANCES: Grievance[] = [
  {
    id: 'grv-001',
    parcel_id: 'pcl-ts-001',
    applicant_user_id: 'own-ts-002',
    applicant: { id: 'own-ts-002', name: 'Ramesh Reddy', email: 'ramesh.reddy@example.in' },
    category: 'Boundary Dispute',
    description: 'Neighbouring parcel has encroached approximately 75 sqm on my land, confirmed by GIS survey.',
    status: 'in_progress',
    sla_due_date: '2026-09-20',
    assigned_officer_id: 'usr-003',
    created_at: '2026-08-15T09:00:00+05:30',
  },
];

// ---------------------------------------------------------------------------
// GIS layers (zones + utility)
// ---------------------------------------------------------------------------

export const MOCK_ZONES_GEOJSON: ZonesGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [80.940, 26.840], [80.960, 26.840],
          [80.960, 26.860], [80.940, 26.860],
          [80.940, 26.840],
        ]],
      },
      properties: {
        id: 'zone-up-001',
        state_id: 'state-up',
        zone_type: 'agricultural',
        permissible_far: null,
        permissible_use: 'Farming, allied activities only',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72.870, 19.070], [72.885, 19.070],
          [72.885, 19.082], [72.870, 19.082],
          [72.870, 19.070],
        ]],
      },
      properties: {
        id: 'zone-mh-001',
        state_id: 'state-mh',
        zone_type: 'residential',
        permissible_far: 2.5,
        permissible_use: 'Residential multi-storey',
      },
    },
  ],
};

export const MOCK_UTILITY_GEOJSON: UtilityGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [80.94769, 26.84735] },
      properties: { id: 'util-up-001', type: 'water', parcel_id: 'pcl-up-001', status: 'operational' },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[72.87610, 19.07530], [72.87622, 19.07537]],
      },
      properties: { id: 'util-mh-001', type: 'sewer', parcel_id: null, status: 'operational' },
    },
  ],
};

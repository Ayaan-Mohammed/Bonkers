"""
NLIP Cadastral Seed Generator (Task 5)
Populates synthetic demo records with realistic administrative hierarchy,
land parcels, legal rights, deliberate discrepancy cases, and demo users.
"""
import os
import sys

# Ensure backend root is on python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import hashlib
import json
import random
from datetime import date, datetime, timedelta, timezone
from geoalchemy2.elements import WKTElement
from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models.geo import District, MasterPlanZone, Parcel, State, Taluka, Village
from app.models.rights import Encumbrance, Mutation, Owner, RecordOfRights, Registration
from app.models.planning import BuildingPermission, PropertyTaxRecord
from app.models.platform import ApiClient, AuditTrail, Consent, User
from app.models.intelligence import ChangeDetectionAlert, DisputeRiskScore, Grievance
from app.services.hash_chain_service import compute_block_hash, GENESIS_HASH


def run_seed():
    db = SessionLocal()
    print("[*] Creating database schema tables if not exist...")
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    existing_states = db.scalar(select(State).limit(1))
    if existing_states:
        print("[!] Database already contains data. Skipping re-seed.")
        db.close()
        return

    print("[*] Seeding Administrative Hierarchy (4 States)...")
    states_data = [
        {"name": "Uttar Pradesh", "code": "UP", "lat": 26.8467, "lon": 80.9462, "districts": ["Varanasi", "Lucknow", "Gorakhpur", "Prayagraj"]},
        {"name": "Telangana", "code": "TS", "lat": 17.3850, "lon": 78.4867, "districts": ["Hyderabad", "Rangareddy", "Medchal", "Warangal"]},
        {"name": "Maharashtra", "code": "MH", "lat": 18.5204, "lon": 73.8567, "districts": ["Pune", "Nagpur", "Thane", "Nashik"]},
        {"name": "Karnataka", "code": "KA", "lat": 12.9716, "lon": 77.5946, "districts": ["Bengaluru Urban", "Mysuru", "Dharwad", "Belagavi"]},
    ]

    all_villages = []
    state_models = []

    for s_idx, s in enumerate(states_data, start=1):
        state = State(id=s_idx, name=s["name"], code=s["code"])
        db.add(state)
        db.flush()
        state_models.append(state)

        for d_idx, d_name in enumerate(s["districts"], start=1):
            district = District(name=d_name, state_id=state.id, lgd_code=f"{state.code}{d_idx:03d}")
            db.add(district)
            db.flush()

            for t_idx in range(1, 3):
                taluka = Taluka(name=f"{d_name} Tehsil-{t_idx}", district_id=district.id)
                db.add(taluka)
                db.flush()

                for v_idx in range(1, 4):
                    village = Village(name=f"{d_name} Gram-{v_idx}", taluka_id=taluka.id, lgd_code=f"VIL-{state.code}-{d_idx}-{t_idx}-{v_idx}")
                    db.add(village)
                    db.flush()
                    all_villages.append((village, s["lat"], s["lon"]))

    print(f"[*] Created {len(states_data)} states and {len(all_villages)} villages.")

    print("[*] Seeding Master Plan Zones...")
    for state in state_models:
        s_info = next(st for st in states_data if st["code"] == state.code)
        c_lat, c_lon = s_info["lat"], s_info["lon"]
        # Create 2 zones per state (Residential & Commercial)
        z1_wkt = f"POLYGON(({c_lon-0.05} {c_lat-0.05}, {c_lon+0.05} {c_lat-0.05}, {c_lon+0.05} {c_lat+0.05}, {c_lon-0.05} {c_lat+0.05}, {c_lon-0.05} {c_lat-0.05}))"
        z1 = MasterPlanZone(
            state_id=state.id,
            geom=WKTElement(z1_wkt, srid=4326),
            zone_type="residential",
            permissible_far=2.5,
            permissible_use="High-Density Residential & Mixed Retail",
        )
        db.add(z1)

        z2_wkt = f"POLYGON(({c_lon+0.06} {c_lat+0.06}, {c_lon+0.15} {c_lat+0.06}, {c_lon+0.15} {c_lat+0.15}, {c_lon+0.06} {c_lat+0.15}, {c_lon+0.06} {c_lat+0.06}))"
        z2 = MasterPlanZone(
            state_id=state.id,
            geom=WKTElement(z2_wkt, srid=4326),
            zone_type="industrial",
            permissible_far=1.8,
            permissible_use="Light Industrial, Logistics & Warehousing",
        )
        db.add(z2)

    db.flush()

    print("[*] Seeding Demo User Accounts across Roles...")
    demo_password_hash = get_password_hash("Password123!")
    demo_users = [
        {"name": "Aman Sheikh", "email": "aman.citizen@nlip.gov.in", "role": "citizen", "mobile": "+919876500001"},
        {"name": "Vikramaditya Rao", "email": "vikram.officer@nlip.gov.in", "role": "revenue_officer", "mobile": "+919876500002"},
        {"name": "Pooja Deshmukh", "email": "pooja.reg@nlip.gov.in", "role": "registration_officer", "mobile": "+919876500003"},
        {"name": "Ananya Sen", "email": "ananya.planning@nlip.gov.in", "role": "planning_officer", "mobile": "+919876500004"},
        {"name": "Suresh Nair", "email": "suresh.bank@sbi.co.in", "role": "bank_official", "mobile": "+919876500005"},
        {"name": "Dev Sandbox User", "email": "developer@infra.io", "role": "developer", "mobile": "+919876500006"},
        {"name": "System Administrator", "email": "admin@nlip.gov.in", "role": "admin", "mobile": "+919876500007"},
    ]
    user_models = []
    for u in demo_users:
        user = User(
            name=u["name"],
            email=u["email"],
            password_hash=demo_password_hash,
            role=u["role"],
            mobile=u["mobile"],
            state_id=1,
            created_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.flush()
        user_models.append(user)

    print(f"[*] Created {len(user_models)} demo user accounts.")

    print("[*] Seeding 150+ Parcels with Rights, Deliberate Variance & Audit Logs...")
    first_names = ["Rajesh", "Prakash", "Amit", "Sunita", "Lakshmi", "Venkatesh", "Deepak", "Shalini", "Manoj", "Kavita"]
    last_names = ["Sharma", "Patel", "Reddy", "Verma", "Kulkarni", "Singh", "Yadav", "Gowda", "Deshpande", "Chatterjee"]

    showcase_configs = [
        {"ulpin": "UP09412601001", "state_code": "UP", "rec_area": 842.0, "gis_area": 845.37, "land_use": "agricultural", "has_mortgage": False, "has_court": False, "tax_paid": "paid", "joint": False},
        {"ulpin": "MH27830501001", "state_code": "MH", "rec_area": 1250.0, "gis_area": 1336.25, "land_use": "residential", "has_mortgage": True, "has_court": False, "tax_paid": "paid", "joint": False},
        {"ulpin": "KA29150301001", "state_code": "KA", "rec_area": 2100.0, "gis_area": 2118.9, "land_use": "commercial", "has_mortgage": False, "has_court": False, "tax_paid": "paid", "joint": True},
        {"ulpin": "TS36280201001", "state_code": "TS", "rec_area": 1800.0, "gis_area": 2016.0, "land_use": "residential", "has_mortgage": True, "has_court": True, "tax_paid": "due", "joint": False},
    ]

    total_parcels = 160
    for p_num in range(1, total_parcels + 1):
        if p_num <= 4:
            cfg = showcase_configs[p_num - 1]
            state_code = cfg["state_code"]
            matching_villages = [v for v in all_villages if v[0].taluka.district.state.code == state_code]
            village, base_lat, base_lon = matching_villages[0]
            ulpin = cfg["ulpin"]
            recorded_area = cfg["rec_area"]
            gis_area = cfg["gis_area"]
            land_use = cfg["land_use"]
            is_variance_case = (cfg["has_court"] or cfg["has_mortgage"] or abs(gis_area - recorded_area)/recorded_area > 0.05)
        else:
            village, base_lat, base_lon = random.choice(all_villages)
            state_code = village.taluka.district.state.code
            ulpin = f"{state_code}{random.randint(1000, 9999)}{random.randint(10000000, 99999999)}"
            recorded_area = round(random.uniform(450.0, 4200.0), 2)
            is_variance_case = (p_num % 10 == 0)
            gis_area = round(recorded_area * random.uniform(1.12, 1.25), 2) if is_variance_case else round(recorded_area * random.uniform(0.985, 1.015), 2)
            land_use = random.choice(["agricultural", "residential", "commercial", "mixed"])

        # Centroid offset
        offset_x = (random.random() - 0.5) * 0.08
        offset_y = (random.random() - 0.5) * 0.08
        c_x = base_lon + offset_x
        c_y = base_lat + offset_y

        size = random.uniform(0.0008, 0.0025)
        polygon_wkt = f"POLYGON(({c_x} {c_y}, {c_x+size} {c_y}, {c_x+size} {c_y+size}, {c_x} {c_y+size}, {c_x} {c_y}))"

        parcel = Parcel(
            ulpin=ulpin,
            village_id=village.id,
            survey_number=f"SN-{random.randint(101, 899)}/{random.randint(1, 4)}",
            khasra_number=f"KH-{random.randint(1001, 9999)}",
            gata_number=f"GT-{random.randint(10, 99)}",
            patta_number=f"PT-{random.randint(10000, 99999)}",
            area_recorded_sqm=recorded_area,
            area_gis_sqm=gis_area,
            land_use_type=land_use,
            geom=WKTElement(polygon_wkt, srid=4326),
            source="cadastral_survey",
        )
        db.add(parcel)
        db.flush()

        # Seed Owner
        owner_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        owner = Owner(
            full_name=owner_name,
            aadhaar_hash=hashlib.sha256(f"AADHAAR-{p_num}".encode()).hexdigest(),
            mobile_hash=hashlib.sha256(f"MOBILE-{p_num}".encode()).hexdigest(),
            father_or_spouse_name=f"Late {random.choice(first_names)} {random.choice(last_names)}",
            address=f"Village {village.name}, Taluka {village.taluka.name}, {village.taluka.district.name}",
        )
        db.add(owner)
        db.flush()

        # Record of Rights (RoR)
        share_pct = 50.00 if (p_num <= 4 and cfg.get("joint")) else 100.00
        ownership_type = "joint" if (p_num <= 4 and cfg.get("joint")) else ("disputed" if is_variance_case else "sole")
        ror = RecordOfRights(
            parcel_id=parcel.id,
            owner_id=owner.id,
            ownership_type=ownership_type,
            share_percentage=share_pct,
            tenure_type="Freehold Bhoomidhari",
            khatauni_number=f"KT-{random.randint(100, 999)}",
            source_document_ref=f"REV-DOC-{p_num:04d}",
            valid_from=date.today() - timedelta(days=random.randint(300, 3650)),
            status="active" if not is_variance_case else "disputed",
        )
        db.add(ror)
        db.flush()

        # If joint ownership showcase, add second co-owner
        if p_num <= 4 and cfg.get("joint"):
            owner2 = Owner(
                full_name="Kiran Kulkarni",
                aadhaar_hash=hashlib.sha256(f"AADHAAR-{p_num}-2".encode()).hexdigest(),
                mobile_hash=hashlib.sha256(f"MOBILE-{p_num}-2".encode()).hexdigest(),
                father_or_spouse_name=f"Late Ramesh Kulkarni",
                address=f"Village {village.name}, Taluka {village.taluka.name}, {village.taluka.district.name}",
            )
            db.add(owner2)
            db.flush()
            ror2 = RecordOfRights(
                parcel_id=parcel.id,
                owner_id=owner2.id,
                ownership_type="joint",
                share_percentage=50.00,
                tenure_type="Freehold Bhoomidhari",
                khatauni_number=ror.khatauni_number,
                source_document_ref=f"REV-DOC-{p_num:04d}-2",
                valid_from=ror.valid_from,
                status="active",
            )
            db.add(ror2)

        # Cryptographic Audit Log for RoR Creation
        payload_ror = {"action": "INITIAL_ROR_CREATION", "ulpin": parcel.ulpin, "owner": owner.full_name}
        h1 = compute_block_hash(GENESIS_HASH, payload_ror)
        audit_ror = AuditTrail(
            entity_type="record_of_rights",
            entity_id=str(ror.id),
            action="CREATE",
            actor_user_id=2,  # revenue officer
            prev_hash=GENESIS_HASH,
            curr_hash=h1,
            payload_diff=payload_ror,
            created_at=datetime.now(timezone.utc),
        )
        db.add(audit_ror)

        # Registrations (Deeds)
        reg_date = date.today() - timedelta(days=random.randint(200, 1800))
        deed_num = f"DEED-{state_code}-{reg_date.year}-{p_num:04d}"
        doc_hash = hashlib.sha256(f"{deed_num}:{owner.full_name}".encode()).hexdigest()
        reg = Registration(
            parcel_id=parcel.id,
            deed_type="Sale Deed" if p_num % 3 != 0 else "Gift Deed",
            deed_number=deed_num,
            registration_date=reg_date,
            sub_registrar_office=f"{village.taluka.district.name} SRO-1",
            consideration_amount=round(random.uniform(1500000.0, 8500000.0), 2),
            ngdrs_ref_id=f"NGDRS-{p_num:06d}",
            document_hash=doc_hash,
        )
        db.add(reg)
        db.flush()

        # Active Encumbrances
        has_mortgage = cfg.get("has_mortgage") if p_num <= 4 else (p_num % 5 == 0)
        has_court = cfg.get("has_court") if p_num <= 4 else (is_variance_case and p_num % 10 == 0)
        if has_mortgage:
            enc_m = Encumbrance(
                parcel_id=parcel.id,
                type="mortgage",
                holder_name="State Bank of India",
                amount=round(random.uniform(2500000.0, 6000000.0), 2),
                start_date=date.today() - timedelta(days=random.randint(50, 400)),
                status="active",
            )
            db.add(enc_m)
        if has_court:
            enc_c = Encumbrance(
                parcel_id=parcel.id,
                type="court_case",
                holder_name="Civil Court Sub-Division (Injunction Order)",
                amount=None,
                start_date=date.today() - timedelta(days=random.randint(100, 500)),
                status="active",
            )
            db.add(enc_c)

        # Mutations
        mut = Mutation(
            parcel_id=parcel.id,
            mutation_type="Registered Sale Transfer",
            previous_owner_id=None,
            new_owner_id=owner.id,
            applied_date=reg_date + timedelta(days=15),
            approved_date=reg_date + timedelta(days=45),
            status="approved",
            approving_officer_id=2,
            remarks="Mutation sanctioned after verification of registered sale deed.",
        )
        db.add(mut)
        db.flush()

        # Cryptographic Audit Log for Deed Registration (Block 2 chained)
        payload_reg = {
            "action": "DEED_REGISTRATION",
            "deed_number": deed_num,
            "deed_type": reg.deed_type,
            "sub_registrar": reg.sub_registrar_office,
            "amount": reg.consideration_amount,
        }
        h2 = compute_block_hash(h1, payload_reg)
        audit_reg = AuditTrail(
            entity_type="registration",
            entity_id=str(reg.id),
            action="REGISTER",
            actor_user_id=2,
            prev_hash=h1,
            curr_hash=h2,
            payload_diff=payload_reg,
            created_at=datetime.now(timezone.utc),
        )
        db.add(audit_reg)

        # Cryptographic Audit Log for Mutation Sanction (Block 3 chained)
        payload_mut = {
            "action": "MUTATION_SANCTION",
            "mutation_type": mut.mutation_type,
            "new_owner": owner.full_name,
            "status": "approved",
            "ulpin": parcel.ulpin,
        }
        h3 = compute_block_hash(h2, payload_mut)
        audit_mut = AuditTrail(
            entity_type="mutation",
            entity_id=str(mut.id),
            action="SANCTION",
            actor_user_id=2,
            prev_hash=h2,
            curr_hash=h3,
            payload_diff=payload_mut,
            created_at=datetime.now(timezone.utc),
        )
        db.add(audit_mut)

        # Cryptographic Parcel Ledger Seal (Block 4 chained)
        payload_parcel = {
            "action": "PARCEL_LEDGER_SEAL",
            "ulpin": parcel.ulpin,
            "state_code": state_code,
            "verified_blocks": 3,
            "tamper_detected": False,
        }
        h4 = compute_block_hash(h3, payload_parcel)
        audit_pcl = AuditTrail(
            entity_type="parcel",
            entity_id=str(parcel.id),
            action="VERIFY",
            actor_user_id=1,
            prev_hash=h3,
            curr_hash=h4,
            payload_diff=payload_parcel,
            created_at=datetime.now(timezone.utc),
        )
        db.add(audit_pcl)

        # Building Permission (~30% of parcels)
        if p_num % 3 == 0:
            bp = BuildingPermission(
                parcel_id=parcel.id,
                application_number=f"BP-{village.taluka.district.name[:3].upper()}-{2024}-{p_num:03d}",
                approved_use="Residential",
                built_up_area_sqm=round(recorded_area * 0.45, 2),
                floors_approved=2,
                sanction_date=date.today() - timedelta(days=random.randint(60, 500)),
                status="approved",
            )
            db.add(bp)

        # Property Tax Record
        tax = PropertyTaxRecord(
            parcel_id=parcel.id,
            assessment_year=2024,
            assessed_value=round(recorded_area * 1850.0, 2),
            tax_amount=round(recorded_area * 8.5, 2),
            paid_status="paid" if p_num % 4 != 0 else "due",
            ulb_id=f"ULB-{village.taluka.district.name[:4].upper()}",
        )
        db.add(tax)

    print("[*] Seeding 3 Simulated Satellite Change-Detection Alerts...")
    first_parcels = db.scalars(select(Parcel).limit(3)).all()
    for fp in first_parcels:
        c_alert = ChangeDetectionAlert(
            parcel_id=fp.id,
            alert_type="boundary_shift",
            confidence_score=0.885,
            before_geom=fp.geom,
            after_geom=fp.geom,
            source="simulated_sentinel2_ndvi",
            status="unresolved",
            created_at=datetime.now(timezone.utc),
        )
        db.add(c_alert)

    # Commit all seeded data
    db.commit()
    print("[+] Successfully seeded all cadastral records!")
    db.close()


if __name__ == "__main__":
    run_seed()

import asyncio
import logging
from sqlalchemy import select
from app.db.postgres import AsyncSessionLocal, init_db
from app.models import City, Speciality, Hospital, Doctor, DoctorHospitalAffiliation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed-db")

CITIES_SEED = [
    {"id": "pune", "name": "Pune", "state_id": "maharashtra", "state_name": "Maharashtra", "is_active": True, "hospital_count": 2},
    {"id": "mumbai", "name": "Mumbai", "state_id": "maharashtra", "state_name": "Maharashtra", "is_active": True, "hospital_count": 1},
    {"id": "nagpur", "name": "Nagpur", "state_id": "maharashtra", "state_name": "Maharashtra", "is_active": False, "hospital_count": 0},
    {"id": "nashik", "name": "Nashik", "state_id": "maharashtra", "state_name": "Maharashtra", "is_active": False, "hospital_count": 0},
    {"id": "bengaluru", "name": "Bengaluru", "state_id": "karnataka", "state_name": "Karnataka", "is_active": False, "hospital_count": 0},
    {"id": "new-delhi", "name": "New Delhi", "state_id": "delhi-ncr", "state_name": "Delhi NCR", "is_active": False, "hospital_count": 0},
]

SPECIALITIES_SEED = [
    {"id": "cardiology", "name": "Cardiology", "description": "Heart care, coronary interventions, arrhythmias, and hypertension management.", "icon_name": "HeartPulse"},
    {"id": "general-medicine", "name": "General Medicine", "description": "Adult internal medicine, metabolic health, infections, and chronic illness care.", "icon_name": "Stethoscope"},
    {"id": "neurology", "name": "Neurology", "description": "Brain, spine, stroke management, headache, and peripheral nerve disorders.", "icon_name": "Brain"},
    {"id": "orthopaedics", "name": "Orthopaedics", "description": "Bone fractures, joint replacements, sports injuries, and spine conditions.", "icon_name": "Bone"},
    {"id": "oncology", "name": "Oncology", "description": "Medical, surgical, and radiation care for neoplastic and haematological conditions.", "icon_name": "Activity"},
    {"id": "pediatrics", "name": "Pediatrics", "description": "Infant, child, and adolescent healthcare, immunizations, and developmental care.", "icon_name": "Baby"},
    {"id": "emergency-medicine", "name": "Emergency & Trauma", "description": "24x7 acute resuscitation, trauma stabilization, and critical care dispatch.", "icon_name": "ShieldAlert"},
]

HOSPITALS_SEED = [
    {
        "id": "hosp-sahyadri-deccan",
        "slug": "sahyadri-hospital-pune",
        "name": "Sahyadri Super Speciality Hospital",
        "state": "Maharashtra",
        "city": "Pune",
        "area": "Deccan Gymkhana",
        "address": "Plot No. 30-C, Erandwane, Karve Road, Deccan Gymkhana, Pune, Maharashtra 411004",
        "pincode": "411004",
        "facility_type": "Super-Speciality Tertiary Care",
        "facility_type_badge": "Super Speciality Tertiary",
        "images": [
            {
                "url": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80",
                "alt": "Exterior facade of modern multispeciality hospital building in Pune",
                "caption": "Main entrance and outpatient reception wing",
            }
        ],
        "overview": "Sahyadri Super Speciality Hospital (Deccan Gymkhana) is a prominent tertiary care hospital in Pune. It houses comprehensive departments spanning cardiology, neurosciences, organ transplantation, oncology, and emergency trauma care with round-the-clock emergency and pathology facilities.",
        "services": [
            "24x7 Emergency & Trauma Care",
            "Interventional Cardiology & Cath Lab",
            "Comprehensive Neurosciences Unit",
            "Medical & Surgical Oncology",
            "Nephrology & Renal Transplant Unit",
            "Advanced Intensive Care (ICU & CCU)",
            "Diagnostic Imaging (MRI, CT, Ultrasound)",
            "24x7 NABL Accredited Pathology Lab",
            "In-House 24x7 Pharmacy",
        ],
        "departments": [
            {"name": "Cardiology", "slug": "cardiology", "description": "Interventional cardiology and cath lab"},
            {"name": "Neurology", "slug": "neurology", "description": "Brain, spine, and stroke unit"},
            {"name": "Orthopaedics", "slug": "orthopaedics", "description": "Joint replacement and trauma"},
            {"name": "General Surgery", "slug": "general-surgery", "description": "Laparoscopic surgery"},
            {"name": "General Medicine", "slug": "general-medicine", "description": "Internal medicine and diabetes"},
        ],
        "facilities": [
            "Over 200 Inpatient Beds",
            "Level III Intensive Care Units",
            "Dedicated Cardiac Emergency Bay",
            "Dedicated Ambulance Service",
            "Cashless TPA Insurance Desk",
        ],
        "bed_count": 202,
        "emergency_available_24x7": True,
        "website": "https://sahyadrihospitals.com",
        "phone": "+91 20 6721 5000",
        "whatsapp": "912067215000",
        "maps_url": "https://maps.google.com/?q=Sahyadri+Super+Speciality+Hospital+Deccan+Pune",
        "verification_status": "independently-checked",
        "last_checked": "2026-03-28",
        "sources": [
            {"label": "Official Hospital Website", "url": "https://sahyadrihospitals.com", "type": "official-registry", "dateChecked": "2026-03-28"}
        ],
    },
    {
        "id": "hosp-sassoon-general",
        "slug": "sassoon-general-hospital-pune",
        "name": "Sassoon General Hospital & B.J. Govt. Medical College",
        "state": "Maharashtra",
        "city": "Pune",
        "area": "Station Road",
        "address": "Station Road, Agarkar Nagar, Near Pune Railway Station, Pune, Maharashtra 411001",
        "pincode": "411001",
        "facility_type": "Government Teaching Hospital",
        "facility_type_badge": "Govt. Teaching & Tertiary Care",
        "images": [
            {
                "url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Historical stone clock tower of Sassoon General Hospital Pune",
                "caption": "Historic stone clock-tower building",
            }
        ],
        "overview": "Sassoon General Hospital is a historic government tertiary care hospital affiliated with B.J. Government Medical College in Pune delivering comprehensive medical care and subsidized treatments.",
        "services": [
            "24x7 Government Casualty & Emergency",
            "General Outpatient Departments (OPD)",
            "Trauma & Orthopaedic Emergency Surgery",
            "General Medicine & Infectious Disease Care",
            "Pediatric Multi-Disciplinary Care",
            "Free & Subsidised Medicine Dispensation",
        ],
        "departments": [
            {"name": "General Medicine", "slug": "general-medicine", "description": "Internal medicine and tropical diseases"},
            {"name": "Cardiology", "slug": "cardiology", "description": "Government cardiology OPD"},
            {"name": "Orthopaedics", "slug": "orthopaedics", "description": "Government trauma care"},
            {"name": "Pediatrics", "slug": "pediatrics", "description": "NICU and child healthcare"},
        ],
        "facilities": [
            "1,200+ Subsidised and Free Care Beds",
            "Dedicated Central Casualty Unit",
            "Regional Blood Transfusion Center",
            "Jan Aushadhi Generic Pharmacy",
        ],
        "bed_count": 1296,
        "emergency_available_24x7": True,
        "website": "https://www.bjmcpune.org",
        "phone": "+91 20 2612 8000",
        "whatsapp": "912026128000",
        "maps_url": "https://maps.google.com/?q=Sassoon+General+Hospital+Pune",
        "verification_status": "provider-confirmed",
        "last_checked": "2026-03-25",
        "sources": [
            {"label": "B.J. Govt Medical College Portal", "url": "https://www.bjmcpune.org", "type": "official-registry", "dateChecked": "2026-03-25"}
        ],
    },
    {
        "id": "hosp-kem-mumbai",
        "slug": "kem-hospital-mumbai",
        "name": "King Edward Memorial (KEM) Hospital",
        "state": "Maharashtra",
        "city": "Mumbai",
        "area": "Parel",
        "address": "Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012",
        "pincode": "400012",
        "facility_type": "Government Teaching Hospital",
        "facility_type_badge": "Govt. Teaching & Tertiary Care",
        "images": [
            {
                "url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
                "alt": "Main heritage hospital building of KEM Hospital Mumbai",
                "caption": "Main administrative block in Parel",
            }
        ],
        "overview": "King Edward Memorial Hospital and Seth Gordhandas Sunderdas Medical College is one of the premier government teaching and tertiary care hospitals in Mumbai.",
        "services": [
            "24x7 Government Casualty & Trauma Care",
            "Comprehensive Cardiology & Cath Lab",
            "General Outpatient Departments (OPD)",
            "Advanced Surgical Oncology & Neurosciences",
            "Subsidised & Free Patient Care",
        ],
        "departments": [
            {"name": "Cardiology", "slug": "cardiology", "description": "Clinical cardiology and cath lab"},
            {"name": "General Medicine", "slug": "general-medicine", "description": "Internal medicine and metabolic disorders"},
        ],
        "facilities": [
            "1,800+ Inpatient Beds",
            "Level III Intensive Care Facilities",
            "24x7 Casualty Resuscitation Wing",
        ],
        "bed_count": 1800,
        "emergency_available_24x7": True,
        "website": "https://www.kem.edu",
        "phone": "+91 22 2410 7000",
        "whatsapp": "912224107000",
        "maps_url": "https://maps.google.com/?q=KEM+Hospital+Parel+Mumbai",
        "verification_status": "independently-checked",
        "last_checked": "2026-03-26",
        "sources": [
            {"label": "MCGM Health Portal", "url": "https://portal.mcgm.gov.in", "type": "official-registry", "dateChecked": "2026-03-26"}
        ],
    },
]

DOCTORS_SEED = [
    {
        "id": "doc-placeholder-cardio-01",
        "slug": "dr-placeholder-cardio-one",
        "name": "Dr. Placeholder Name One",
        "title": "Senior Consultant Interventional Cardiologist",
        "department": "Cardiology",
        "department_slug": "cardiology",
        "speciality": "Cardiology",
        "speciality_slug": "cardiology",
        "sub_speciality": "Interventional Cardiology & Coronary Angioplasty",
        "qualifications": "MBBS, MD (General Medicine), DM (Cardiology), FACC",
        "experience_years": 16,
        "languages": ["English", "Hindi", "Marathi"],
        "photo": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
        "summary": "Practising interventional cardiologist focusing on adult coronary artery interventions, radial angiographies, and preventative cardiac care in Pune.",
        "areas_of_practice": ["Coronary Angiography", "Radial Artery Interventions", "Hypertension & Lipid Management"],
        "city": "Pune",
        "state": "Maharashtra",
        "area": "Deccan Gymkhana",
        "location": "Deccan Gymkhana, Pune",
        "phone": "+91 20 6721 5000",
        "whatsapp": "912067215000",
        "verification_status": "independently-checked",
        "last_checked": "2026-03-27",
        "sources": [{"label": "Sahyadri Consultant Directory", "url": "https://sahyadrihospitals.com/doctors", "type": "official-registry", "dateChecked": "2026-03-27"}],
    },
    {
        "id": "doc-placeholder-physician-02",
        "slug": "dr-placeholder-physician-two",
        "name": "Dr. Placeholder Name Two",
        "title": "Professor & Senior Consultant Physician",
        "department": "General Medicine",
        "department_slug": "general-medicine",
        "speciality": "General Medicine",
        "speciality_slug": "general-medicine",
        "sub_speciality": "Internal Medicine, Infectious Diseases & Diabetology",
        "qualifications": "MBBS, MD (Internal Medicine), FACP",
        "experience_years": 21,
        "languages": ["English", "Hindi", "Marathi"],
        "photo": "https://images.unsplash.com/photo-1594824813583-3652873130d2?auto=format&fit=crop&w=600&q=80",
        "summary": "Senior consultant physician and academic mentor at Sassoon General Hospital managing complex infectious diseases and metabolic disorders in Pune.",
        "areas_of_practice": ["Infectious & Tropical Diseases", "Type 1 & Type 2 Diabetes", "Metabolic Syndrome"],
        "city": "Pune",
        "state": "Maharashtra",
        "area": "Station Road",
        "location": "Station Road, Pune",
        "phone": "+91 20 2612 8000",
        "whatsapp": "912026128000",
        "verification_status": "provider-confirmed",
        "last_checked": "2026-03-24",
        "sources": [{"label": "B.J. Govt Medical College Register", "url": "https://www.bjmcpune.org", "type": "official-registry", "dateChecked": "2026-03-24"}],
    },
    {
        "id": "doc-placeholder-neuro-03",
        "slug": "dr-placeholder-neuro-three",
        "name": "Dr. Placeholder Name Three",
        "title": "Consultant Neurologist & Stroke Specialist",
        "department": "Neurology",
        "department_slug": "neurology",
        "speciality": "Neurology",
        "speciality_slug": "neurology",
        "sub_speciality": "Stroke Care & Movement Disorders",
        "qualifications": "MBBS, MD (General Medicine), DM (Neurology)",
        "experience_years": 14,
        "languages": ["English", "Hindi", "Marathi"],
        "photo": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
        "summary": "Consultant neurologist specializing in acute stroke interventions, Parkinson's disease, and headache disorders in Pune.",
        "areas_of_practice": ["Acute Stroke", "Epilepsy Management", "Movement Disorders"],
        "city": "Pune",
        "state": "Maharashtra",
        "area": "Kothrud",
        "location": "Kothrud, Pune",
        "phone": "+91 20 6721 5100",
        "whatsapp": "912067215100",
        "verification_status": "independently-checked",
        "last_checked": "2026-03-25",
        "sources": [{"label": "Neurological Society Register", "url": "https://neurosocietyindia.org", "type": "statutory-license", "dateChecked": "2026-03-25"}],
    },
    {
        "id": "doc-placeholder-ortho-04",
        "slug": "dr-placeholder-ortho-four",
        "name": "Dr. Placeholder Name Four",
        "title": "Senior Consultant Orthopaedic & Joint Surgeon",
        "department": "Orthopaedics",
        "department_slug": "orthopaedics",
        "speciality": "Orthopaedics",
        "speciality_slug": "orthopaedics",
        "sub_speciality": "Primary & Revision Joint Arthroplasty",
        "qualifications": "MBBS, MS (Orthopaedics), MCh (Ortho)",
        "experience_years": 18,
        "languages": ["English", "Hindi", "Marathi"],
        "photo": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
        "summary": "Senior orthopaedic surgeon focusing on joint reconstruction, total knee and hip replacement in Pune.",
        "areas_of_practice": ["Total Knee Arthroplasty", "Total Hip Arthroplasty", "Arthroscopy"],
        "city": "Pune",
        "state": "Maharashtra",
        "area": "Baner",
        "location": "Baner, Pune",
        "phone": "+91 20 6721 5200",
        "whatsapp": "912067215200",
        "verification_status": "provider-confirmed",
        "last_checked": "2026-03-20",
        "sources": [{"label": "Indian Orthopaedic Association", "url": "https://ioaindia.org", "type": "official-registry", "dateChecked": "2026-03-20"}],
    },
    {
        "id": "doc-placeholder-paed-05",
        "slug": "dr-placeholder-paed-five",
        "name": "Dr. Placeholder Name Five",
        "title": "Consultant Paediatrician & Child Health Specialist",
        "department": "Pediatrics",
        "department_slug": "pediatrics",
        "speciality": "Pediatrics",
        "speciality_slug": "pediatrics",
        "sub_speciality": "Developmental Paediatrics & Child Nutrition",
        "qualifications": "MBBS, MD (Paediatrics), DNB (Paediatrics)",
        "experience_years": 12,
        "languages": ["English", "Hindi", "Marathi"],
        "photo": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
        "summary": "Dedicated paediatrician providing comprehensive child healthcare, routine immunizations, and developmental guidance in Pune.",
        "areas_of_practice": ["Childhood Immunization", "Infant Growth Milestones", "Paediatric Asthma"],
        "city": "Pune",
        "state": "Maharashtra",
        "area": "Shivajinagar",
        "location": "Shivajinagar, Pune",
        "phone": "+91 20 2612 8100",
        "whatsapp": "912026128100",
        "verification_status": "independently-checked",
        "last_checked": "2026-03-22",
        "sources": [{"label": "Indian Academy of Pediatrics", "url": "https://iapindia.org", "type": "official-registry", "dateChecked": "2026-03-22"}],
    },
    {
        "id": "doc-placeholder-mumbai-cardio-06",
        "slug": "dr-placeholder-mumbai-cardio",
        "name": "Dr. Placeholder Mumbai Cardiologist",
        "title": "Consultant Cardiologist & Heart Failure Specialist",
        "department": "Cardiology",
        "department_slug": "cardiology",
        "speciality": "Cardiology",
        "speciality_slug": "cardiology",
        "sub_speciality": "Clinical Cardiology, Echocardiography & Heart Failure",
        "qualifications": "MBBS, MD (General Medicine), DM (Cardiology)",
        "experience_years": 15,
        "languages": ["English", "Hindi", "Marathi"],
        "photo": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80",
        "summary": "Senior consultant cardiologist consulting at KEM Hospital Parel, Mumbai. Specializes in heart failure protocols and adult echocardiography.",
        "areas_of_practice": ["Heart Failure Clinics", "Stress Echocardiography", "Hypertension Management"],
        "city": "Mumbai",
        "state": "Maharashtra",
        "area": "Parel",
        "location": "Parel, Mumbai",
        "phone": "+91 22 2410 7000",
        "whatsapp": "912224107000",
        "verification_status": "independently-checked",
        "last_checked": "2026-03-26",
        "sources": [{"label": "CSI Mumbai Chapter", "url": "https://csi.org.in", "type": "official-registry", "dateChecked": "2026-03-26"}],
    },
]

AFFILIATIONS_SEED = [
    {
        "doctor_id": "doc-placeholder-cardio-01",
        "hospital_id": "hosp-sahyadri-deccan",
        "days": "Monday, Wednesday, Friday",
        "timings": "10:00 AM – 01:30 PM (OPD)",
        "note": "Please reconfirm consultation timings with the hospital reception before visiting.",
    },
    {
        "doctor_id": "doc-placeholder-physician-02",
        "hospital_id": "hosp-sassoon-general",
        "days": "Tuesday, Thursday, Saturday",
        "timings": "09:00 AM – 01:00 PM (OPD Unit 3)",
        "note": "Government OPD registration slip required on arrival.",
    },
    {
        "doctor_id": "doc-placeholder-neuro-03",
        "hospital_id": "hosp-sahyadri-deccan",
        "days": "Monday, Thursday",
        "timings": "02:00 PM – 05:00 PM (OPD)",
        "note": "Consultation by prior appointment.",
    },
    {
        "doctor_id": "doc-placeholder-ortho-04",
        "hospital_id": "hosp-sahyadri-deccan",
        "days": "Tuesday, Friday",
        "timings": "11:00 AM – 03:00 PM (OPD)",
        "note": "Prior slot reservation advised.",
    },
    {
        "doctor_id": "doc-placeholder-paed-05",
        "hospital_id": "hosp-sassoon-general",
        "days": "Monday to Friday",
        "timings": "09:30 AM – 01:30 PM (OPD)",
        "note": "General paediatric walk-in clinic.",
    },
    {
        "doctor_id": "doc-placeholder-mumbai-cardio-06",
        "hospital_id": "hosp-kem-mumbai",
        "days": "Monday, Wednesday, Friday",
        "timings": "10:00 AM – 02:00 PM (OPD)",
        "note": "Government OPD registration required.",
    },
]

async def seed_database():
    """Seed initial directory data into PostgreSQL if not already present."""
    await init_db()

    async with AsyncSessionLocal() as session:
        # 1. Seed Cities
        for item in CITIES_SEED:
            existing = await session.get(City, item["id"])
            if not existing:
                session.add(City(**item))
        await session.commit()
        logger.info("Seeded cities.")

        # 2. Seed Specialities
        for item in SPECIALITIES_SEED:
            existing = await session.get(Speciality, item["id"])
            if not existing:
                session.add(Speciality(**item))
        await session.commit()
        logger.info("Seeded specialities.")

        # 3. Seed Hospitals
        for item in HOSPITALS_SEED:
            existing = await session.get(Hospital, item["id"])
            if not existing:
                session.add(Hospital(**item))
        await session.commit()
        logger.info("Seeded hospitals.")

        # 4. Seed Doctors
        for item in DOCTORS_SEED:
            existing = await session.get(Doctor, item["id"])
            if not existing:
                session.add(Doctor(**item))
        await session.commit()
        logger.info("Seeded doctors.")

        # 5. Seed Doctor-Hospital Affiliations
        for item in AFFILIATIONS_SEED:
            stmt = select(DoctorHospitalAffiliation).where(
                DoctorHospitalAffiliation.doctor_id == item["doctor_id"],
                DoctorHospitalAffiliation.hospital_id == item["hospital_id"],
            )
            result = await session.execute(stmt)
            if not result.scalar_one_or_none():
                session.add(DoctorHospitalAffiliation(**item))
        await session.commit()
        logger.info("Seeded doctor-hospital affiliations.")

    logger.info("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_database())

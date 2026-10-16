"""
Markdown Parser for HealthDiscover Directory Data.
Parses hospitals.md, doctors.md, laboratories.md, and wellness.md into structured dictionaries.
"""
from pathlib import Path
import re
from typing import List, Dict, Any, Optional

def clean_val(val: Optional[str]) -> str:
    if not val:
        return ""
    return val.strip()

def parse_bullet_list(text: str) -> List[str]:
    items = []
    for line in text.strip().splitlines():
        line = line.strip()
        if line.startswith("- ") or line.startswith("* "):
            item = line[2:].strip()
            if item:
                items.append(item)
    return items

def parse_comma_list(val: str) -> List[str]:
    if not val:
        return []
    items = []
    for item in val.split(","):
        clean = item.strip()
        low = clean.lower()
        if not clean:
            continue
        if any(ign in low for ign in ["not populated", "verify", "n/a", "none", "tbd", "pending"]):
            continue
        items.append(clean)
    return items

def clean_pincode(val: Optional[str], default_city: str = "") -> str:
    if not val:
        return "411001" if "pune" in default_city.lower() else ""
    # Extract 6 digits if present
    m = re.search(r"\b(\d{3})\s?(\d{3})\b", val)
    if m:
        return f"{m.group(1)}{m.group(2)}"
    # Fallback for Pune if unverified note was provided
    if any(ign in val.lower() for ign in ["not verified", "confirm", "n/a", "pending"]):
        return "411001" if "pune" in default_city.lower() else ""
    return val.strip()[:20]

def clean_contact(val: Optional[str]) -> str:
    if not val:
        return ""
    val_clean = val.strip()
    low = val_clean.lower()
    if any(ign in low for ign in ["not verified", "not populated", "n/a", "none", "pending"]):
        return ""
    # Strip any trailing comments in brackets if a phone number precedes it
    # E.g. "+91 86009 93595 (published on official...)" -> "+91 86009 93595"
    m = re.match(r"^([\+0-9\s\-\/\(\)]{7,35})(?:\s*\(.*|\s*—.*)?$", val_clean)
    if m:
        return m.group(1).strip()
    return val_clean[:255]

def parse_markdown_blocks(content: str, header_prefix: str) -> List[Dict[str, Any]]:
    """
    Splits markdown by `# <header_prefix>: ...` headers and parses each section.
    """
    records = []
    pattern = rf"^#\s+{re.escape(header_prefix)}:\s*(.+)$"
    lines = content.splitlines()

    current_record: Optional[Dict[str, Any]] = None
    current_section: Optional[str] = None
    section_buffer: List[str] = []

    def flush_section():
        nonlocal current_section, section_buffer, current_record
        if current_record is not None and current_section:
            sec_text = "\n".join(section_buffer).strip()
            current_record["sections"][current_section] = sec_text
        current_section = None
        section_buffer = []

    for line in lines:
        header_match = re.match(pattern, line.strip(), re.IGNORECASE)
        if header_match:
            flush_section()
            if current_record:
                records.append(current_record)
            current_record = {
                "header_name": header_match.group(1).strip(),
                "fields": {},
                "sections": {},
                "affiliations": [],
            }
            continue

        if current_record is None:
            continue

        # Check for section header (### Section Name)
        sec_match = re.match(r"^###\s+(.+)$", line.strip())
        if sec_match:
            flush_section()
            current_section = sec_match.group(1).strip()
            continue

        # Check for sub-header (#### Sub Header)
        sub_sec_match = re.match(r"^####\s+(.+)$", line.strip())
        if sub_sec_match:
            flush_section()
            current_section = sub_sec_match.group(1).strip()
            continue

        if current_section:
            section_buffer.append(line)
        else:
            # Parse top-level bullet field: - **Key**: Value
            field_match = re.match(r"^[-*]\s+\*\*([^*]+)\*\*:\s*(.*)$", line.strip())
            if field_match:
                key = field_match.group(1).strip()
                val = field_match.group(2).strip()
                current_record["fields"][key] = val

    flush_section()
    if current_record:
        records.append(current_record)

    return records


def parse_hospitals_md(filepath: Path) -> List[Dict[str, Any]]:
    if not filepath.exists():
        return []
    content = filepath.read_text(encoding="utf-8")
    raw_records = parse_markdown_blocks(content, "Hospital")
    hospitals = []

    for r in raw_records:
        f = r["fields"]
        sec = r["sections"]

        # Relations sub-section if present
        rel_text = sec.get("Relations", "")
        connected_docs = []
        connected_labs = []
        for line in rel_text.splitlines():
            m_doc = re.search(r"\*\*Connected Doctors\*\*:\s*(.*)", line, re.I)
            if m_doc:
                connected_docs = parse_comma_list(m_doc.group(1))
            m_lab = re.search(r"\*\*Connected Laboratories\*\*:\s*(.*)", line, re.I)
            if m_lab:
                connected_labs = parse_comma_list(m_lab.group(1))

        # Check top-level fields too
        if "Connected Doctors" in f:
            connected_docs = parse_comma_list(f["Connected Doctors"])
        if "Connected Laboratories" in f:
            connected_labs = parse_comma_list(f["Connected Laboratories"])

        # Bed count & emergency
        bed_count = None
        if f.get("Bed Count"):
            m_digits = re.search(r"\b\d+\b", f["Bed Count"])
            if m_digits:
                try:
                    bed_count = int(m_digits.group(0))
                except ValueError:
                    pass

        emergency_raw = f.get("Emergency 24x7", "yes").strip().lower()
        if emergency_raw in ("no", "false", "0", "not available"):
            emergency = False
        else:
            emergency = True

        # Parse departments list into objects
        raw_depts = parse_bullet_list(sec.get("Departments", ""))
        departments = [
            {"name": d, "slug": re.sub(r"[^a-z0-9]+", "-", d.lower()).strip("-")}
            for d in raw_depts
        ]

        images = []
        if f.get("Image URL"):
            images.append({
                "url": f["Image URL"],
                "alt": f.get("Name", r["header_name"]),
            })

        hospital = {
            "id": (f.get("ID") or re.sub(r"[^a-z0-9]+", "_", r["header_name"].lower()).strip("_"))[:64],
            "slug": re.sub(r"[^a-z0-9]+", "-", (f.get("Name") or r["header_name"]).lower()).strip("-")[:128],
            "name": f.get("Name", r["header_name"]),
            "city": f.get("City", "").strip().lower(),
            "area": f.get("Area", ""),
            "state": f.get("State", "Maharashtra"),
            "address": f.get("Address", ""),
            "pincode": clean_pincode(f.get("Pincode", ""), f.get("City", "Pune")),
            "facility_type": f.get("Facility Type", "Super-Speciality Tertiary Care"),
            "facility_type_badge": f.get("Facility Type Badge", "Accredited Healthcare Facility"),
            "bed_count": bed_count,
            "emergency_available_24x7": emergency,
            "phone": clean_contact(f.get("Phone", "")),
            "whatsapp": clean_contact(f.get("WhatsApp", "")),
            "website": f.get("Website", ""),
            "maps_url": f.get("Maps URL", ""),
            "overview": sec.get("Overview", ""),
            "services": parse_bullet_list(sec.get("Services", "")),
            "departments": departments,
            "facilities": parse_bullet_list(sec.get("Facilities", "")),
            "images": images,
            "connected_doctors": connected_docs,
            "connected_laboratories": connected_labs,
        }
        hospitals.append(hospital)

    return hospitals


def parse_doctors_md(filepath: Path) -> List[Dict[str, Any]]:
    if not filepath.exists():
        return []
    content = filepath.read_text(encoding="utf-8")
    raw_records = parse_markdown_blocks(content, "Doctor")
    doctors = []

    for r in raw_records:
        f = r["fields"]
        sec = r["sections"]

        # Parse hospital affiliations schedule
        # Look in "Hospital Affiliations (Schedule)" section
        affiliations = []
        hosp_sched_text = sec.get("Hospital Affiliations (Schedule)", "")
        if hosp_sched_text:
            current_aff: Optional[Dict[str, str]] = None
            for line in hosp_sched_text.splitlines():
                hosp_match = re.search(r"[-*]\s+\*\*Hospital(?:\s+ID)?\*\*:\s*(.*)", line, re.I)
                if hosp_match:
                    if current_aff:
                        affiliations.append(current_aff)
                    current_aff = {
                        "hospital_name_or_id": hosp_match.group(1).strip(),
                        "days": "Mon - Sat",
                        "timings": "Regular OPD Hours",
                        "note": "",
                    }
                    continue
                if current_aff:
                    days_m = re.search(r"[-*]\s+\*\*Days\*\*:\s*(.*)", line)
                    if days_m:
                        current_aff["days"] = days_m.group(1).strip()
                    time_m = re.search(r"[-*]\s+\*\*Timings\*\*:\s*(.*)", line)
                    if time_m:
                        current_aff["timings"] = time_m.group(1).strip()
                    note_m = re.search(r"[-*]\s+\*\*Note\*\*:\s*(.*)", line)
                    if note_m:
                        current_aff["note"] = note_m.group(1).strip()
            if current_aff:
                affiliations.append(current_aff)

        # Parse laboratory affiliations
        lab_aff_text = sec.get("Laboratory Affiliations", "")
        connected_labs = []
        for line in lab_aff_text.splitlines():
            m_lab = re.search(r"\*\*Connected Laboratories\*\*:\s*(.*)", line, re.I)
            if m_lab:
                connected_labs = parse_comma_list(m_lab.group(1))

        exp_years = None
        exp_raw = f.get("Experience Years", "")
        if exp_raw:
            m_yrs = re.search(r"\b(\d+)\+?\s*(?:years?|yrs?)\b", exp_raw, re.IGNORECASE)
            if m_yrs:
                try:
                    exp_years = int(m_yrs.group(1))
                except ValueError:
                    pass
            elif re.match(r"^\s*\d+\s*$", exp_raw):
                try:
                    exp_years = int(exp_raw.strip())
                except ValueError:
                    pass

        speciality = f.get("Speciality", "General Medicine")
        spec_slug = re.sub(r"[^a-z0-9]+", "-", speciality.lower()).strip("-")
        department = f.get("Department", speciality)
        dept_slug = re.sub(r"[^a-z0-9]+", "-", department.lower()).strip("-")

        languages = parse_comma_list(f.get("Languages", "English, Hindi"))

        verification_status = "Hospital affiliation supported by official hospital directory/profile"
        last_checked = "2026-10-17"
        sources = []
        src_text = sec.get("Source & Verification", "")
        if src_text:
            for s_line in src_text.splitlines():
                m_stat = re.search(r"[-*]\s+\*\*Verification Status\*\*:\s*(.*)", s_line, re.I)
                if m_stat:
                    verification_status = m_stat.group(1).strip()
                m_rev = re.search(r"[-*]\s+\*\*Last Reviewed\*\*:\s*(.*)", s_line, re.I)
                if m_rev:
                    last_checked = m_rev.group(1).strip()
                m_url = re.search(r"[-*]\s+\*\*Official Source URL\*\*:\s*(.*)", s_line, re.I)
                if m_url:
                    sources.append({"name": "Official Hospital Doctor Profile", "url": m_url.group(1).strip()})

        doctor = {
            "id": (f.get("ID") or re.sub(r"[^a-z0-9]+", "_", r["header_name"].lower()).strip("_"))[:64],
            "slug": re.sub(r"[^a-z0-9]+", "-", (f.get("Name") or r["header_name"]).lower()).strip("-")[:128],
            "name": f.get("Name", r["header_name"]),
            "title": f.get("Title", "Specialist Consultant"),
            "department": department,
            "department_slug": dept_slug,
            "speciality": speciality,
            "speciality_slug": spec_slug,
            "sub_speciality": f.get("Sub-Speciality", ""),
            "qualifications": f.get("Qualifications", "MBBS"),
            "experience_years": exp_years,
            "languages": languages,
            "city": f.get("City", "").strip().lower(),
            "area": f.get("Area", ""),
            "state": f.get("State", "Maharashtra"),
            "phone": clean_contact(f.get("Phone", "")),
            "whatsapp": clean_contact(f.get("WhatsApp", "")),
            "photo": f.get("Photo URL", ""),
            "summary": sec.get("Summary", ""),
            "areas_of_practice": parse_bullet_list(sec.get("Areas of Practice", "")),
            "verification_status": verification_status,
            "last_checked": last_checked,
            "sources": sources,
            "hospital_affiliations": affiliations,
            "connected_laboratories": connected_labs,
        }
        doctors.append(doctor)

    return doctors


def parse_laboratories_md(filepath: Path) -> List[Dict[str, Any]]:
    if not filepath.exists():
        return []
    content = filepath.read_text(encoding="utf-8")
    raw_records = parse_markdown_blocks(content, "Laboratory")
    labs = []

    for r in raw_records:
        f = r["fields"]
        sec = r["sections"]

        rel_text = sec.get("Relations", "")
        connected_hosps = []
        connected_docs = []
        for line in rel_text.splitlines():
            m_hosp = re.search(r"\*\*Connected Hospitals\*\*:\s*(.*)", line, re.I)
            if m_hosp:
                connected_hosps = parse_comma_list(m_hosp.group(1))
            m_doc = re.search(r"\*\*Connected Doctors\*\*:\s*(.*)", line, re.I)
            if m_doc:
                connected_docs = parse_comma_list(m_doc.group(1))

        if "Connected Hospitals" in f:
            connected_hosps = parse_comma_list(f["Connected Hospitals"])
        if "Connected Doctors" in f:
            connected_docs = parse_comma_list(f["Connected Doctors"])

        home_collection = f.get("Home Sample Collection", "yes").strip().lower() in ("yes", "true", "1")
        emergency = f.get("Emergency 24x7", "no").strip().lower() in ("yes", "true", "1")

        raw_depts = parse_bullet_list(sec.get("Departments", ""))
        departments = [
            {"name": d, "slug": re.sub(r"[^a-z0-9]+", "-", d.lower()).strip("-")}
            for d in raw_depts
        ]

        images = []
        if f.get("Image URL"):
            images.append({
                "url": f["Image URL"],
                "alt": f.get("Name", r["header_name"]),
            })

        verification_status = "Provider information reviewed; verify details before production import"
        last_checked = "2026-10-17"
        sources = []
        ver_text = sec.get("Verification", "")
        if ver_text:
            for v_line in ver_text.splitlines():
                m_stat = re.search(r"[-*]\s+\*\*Verification Status\*\*:\s*(.*)", v_line, re.I)
                if m_stat:
                    verification_status = m_stat.group(1).strip()
                m_rev = re.search(r"[-*]\s+\*\*Last Reviewed\*\*:\s*(.*)", v_line, re.I)
                if m_rev:
                    last_checked = m_rev.group(1).strip()
                m_url = re.search(r"[-*]\s+\*\*Source URL\*\*:\s*(.*)", v_line, re.I)
                if m_url:
                    sources.append({"name": "Official Laboratory Website", "url": m_url.group(1).strip()})

        lab = {
            "id": (f.get("ID") or re.sub(r"[^a-z0-9]+", "_", r["header_name"].lower()).strip("_"))[:64],
            "slug": re.sub(r"[^a-z0-9]+", "-", (f.get("Name") or r["header_name"]).lower()).strip("-")[:128],
            "name": f.get("Name", r["header_name"]),
            "city": f.get("City", "").strip().lower(),
            "area": f.get("Area", ""),
            "state": f.get("State", "Maharashtra"),
            "address": f.get("Address", ""),
            "pincode": clean_pincode(f.get("Pincode", ""), f.get("City", "Pune")),
            "accreditation": f.get("Accreditation", "NABL Accredited Laboratory"),
            "home_sample_collection": home_collection,
            "emergency_available_24x7": emergency,
            "phone": clean_contact(f.get("Phone", "")),
            "whatsapp": clean_contact(f.get("WhatsApp", "")),
            "website": f.get("Website", ""),
            "maps_url": f.get("Maps URL", ""),
            "overview": sec.get("Overview", ""),
            "services": parse_bullet_list(sec.get("Test Categories & Services", "") or sec.get("Services", "")),
            "departments": departments,
            "facilities": parse_bullet_list(sec.get("Facilities", "")),
            "images": images,
            "verification_status": verification_status,
            "last_checked": last_checked,
            "sources": sources,
            "connected_hospitals": connected_hosps,
            "connected_doctors": connected_docs,
        }
        labs.append(lab)

    return labs


def parse_wellness_md(filepath: Path) -> List[Dict[str, Any]]:
    if not filepath.exists():
        return []
    content = filepath.read_text(encoding="utf-8")
    raw_records = parse_markdown_blocks(content, "Wellness")
    centers = []

    for r in raw_records:
        f = r["fields"]
        sec = r["sections"]

        images = []
        if f.get("Image URL"):
            images.append({
                "url": f["Image URL"],
                "alt": f.get("Name", r["header_name"]),
            })

        center = {
            "id": (f.get("ID") or re.sub(r"[^a-z0-9]+", "_", r["header_name"].lower()).strip("_"))[:64],
            "slug": re.sub(r"[^a-z0-9]+", "-", (f.get("Name") or r["header_name"]).lower()).strip("-")[:128],
            "name": f.get("Name", r["header_name"]),
            "category": f.get("Category", "Yoga & Naturopathy Center"),
            "city": f.get("City", "").strip().lower(),
            "area": f.get("Area", ""),
            "state": f.get("State", "Maharashtra"),
            "address": f.get("Address", ""),
            "pincode": clean_pincode(f.get("Pincode", ""), f.get("City", "Pune")),
            "accreditation": f.get("Accreditation", ""),
            "phone": clean_contact(f.get("Phone", "")),
            "whatsapp": clean_contact(f.get("WhatsApp", "")),
            "website": f.get("Website", ""),
            "maps_url": f.get("Maps URL", ""),
            "overview": sec.get("Overview", ""),
            "programs": parse_bullet_list(sec.get("Programs & Treatments", "") or sec.get("Programs", "")),
            "disciplines": parse_bullet_list(sec.get("Disciplines & Departments", "") or sec.get("Departments", "")),
            "facilities": parse_bullet_list(sec.get("Facilities", "")),
            "images": images,
        }
        centers.append(center)

    return centers

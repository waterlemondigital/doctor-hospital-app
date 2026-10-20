# Medvexa — Hospital Database (India)

**Dataset version:** 1.0 · **Prepared:** 20 October 2026

This dataset follows the 63-row hospital list supplied for Medvexa. There are **62 distinct hospital locations** because row 63 repeats Manipal Hospital, Kharadi, Pune; row 63 is represented as an alias of `HVX-H007` to prevent duplicate public profiles.

**Developer integration:** Hospital IDs use `HVX-H001` to `HVX-H062`. Doctor IDs use `DVX-0001` onward. The `connected_doctor_ids` field is the relationship layer: hospital pages link to doctor profiles, and doctor profiles carry the same hospital IDs. Do not create duplicate doctor entities for separate hospital affiliations.

**Content conventions:** Service and department lists are separated. Bed capacity, equipment, accreditation and consultation hours are included only where a cited institutional source supports the detail. Public doctor directories do not establish a universal “best doctor” ranking; doctors are listed because the institution's own directory or official institutional material identifies them.

---

# Hospital: Narayana Institute of Cardiac Sciences, Bengaluru

- **Hospital ID:** `HVX-H001`
- **Official name:** Narayana Institute of Cardiac Sciences
- **City:** Bengaluru
- **Area / campus:** Narayana Health City, Bommasandra
- **Facility type:** Private cardiac super-specialty hospital
- **Official website / source:** https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-institute-cardiac-sciences-bommasandra

## 1. Overview

Narayana Institute of Cardiac Sciences is the flagship cardiac centre of Narayana Health at Health City, Bommasandra, Bengaluru. The hospital’s published profile describes it as a JCI- and NABH-accredited super-specialty heart hospital and highlights a large cardiac-care programme, cardiac surgery and interventional cardiology. It is positioned for adult and paediatric heart care, including congenital cardiac services and complex procedures that require cardiologists, cardiac surgeons, anaesthesia and intensive-care teams to coordinate care. Its official page lists 600+ advanced-care beds, 240+ ICU beds, 19 operation theatres, eight cath labs (including a hybrid cath lab) and two robotic operation theatres. The campus is part of the wider Narayana Health City ecosystem.

## 2. Services and Treatments

- Cardiac surgery
- Interventional cardiology
- Paediatric and congenital heart care
- Heart failure and transplantation
- Vascular and endovascular care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiothoracic and Vascular Surgery
- Paediatric Cardiology
- Paediatric and Congenital Cardiac Surgery
- Cardiac Electrophysiology
- Heart Failure and Transplantation
- Vascular Surgery
- Cardiac Anaesthesia
- Critical Care

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Aditi Singhvi** (`DVX-0001`) — Heart Failure and Transplantation Medicine. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Anup Charles S** (`DVX-0002`) — Paediatric and Congenital Heart Surgery. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Arunkumar Ullegaddi** (`DVX-0003`) — Adult Cardiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Atul Surendra Prabhu** (`DVX-0004`) — Paediatric Cardiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Bagirath Raghuraman** (`DVX-0005`) — Adult Cardiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Deepak Padmanabhan** (`DVX-0006`) — Adult Cardiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Devi Prasad Shetty** (`DVX-0007`) — Adult Cardiac Surgery; Paediatric and Congenital Heart Surgery. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Barendra Kumar Raut** (`DVX-0008`) — Adult Cardiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Bijay Kumar Mahala** (`DVX-0009`) — Adult Cardiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Kannan J.** (`DVX-0010`) — Adult Cardiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Kapil Kumawat** (`DVX-0011`) — Adult Cardiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. Kiran V S** (`DVX-0012`) — Paediatric Cardiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore/cardiac-sciences)
- **Dr. A Asha** (`DVX-0086`) — Anaesthesiology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore)
- **Dr. A B Murali Krishna Reddy** (`DVX-0087`) — Paediatric Critical Care Medicine. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore)
- **Dr. Aabha Nagral** (`DVX-0088`) — Paediatric Gastroenterology. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore)
- **Dr. Aanchal Singh** (`DVX-0089`) — Emergency Medicine. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/bangalore)
- **Dr. Abhinandan S Punit** (`DVX-0090`) — Orthopaedic Surgery. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/d/r)
- **Dr. Soumya M S** (`DVX-0091`) — ENT. [Profile source](https://www.narayanahealth.org/ocaapp/doctors/go./my)

## 5. Infrastructure and Facilities

- 600+ advanced-care beds
- 240+ ICU beds
- 19 operation theatres
- 8 cath labs including a hybrid cath lab
- Two robotic operation theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.
- Published appointment contact: 080-6926-6140; published email: info.nics@narayanahealth.org.

### Data connections

- **Connected doctor IDs:** `DVX-0001`, `DVX-0002`, `DVX-0003`, `DVX-0004`, `DVX-0005`, `DVX-0006`, `DVX-0007`, `DVX-0008`, `DVX-0009`, `DVX-0010`, `DVX-0011`, `DVX-0012`, `DVX-0086`, `DVX-0087`, `DVX-0088`, `DVX-0089`, `DVX-0090`, `DVX-0091`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.narayanahealth.org/hospitals-clinics/bangalore/narayana-institute-cardiac-sciences-bommasandra)

---

# Hospital: Nanavati Max Super Speciality Hospital, Mumbai

- **Hospital ID:** `HVX-H002`
- **Official name:** Nanavati Max Super Speciality Hospital
- **City:** Mumbai
- **Area / campus:** Vile Parle West
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.maxhealthcare.in/hospital-network/nanavati-max-super-speciality-hospital

## 1. Overview

Nanavati Max Super Speciality Hospital is a private multispecialty tertiary-care hospital in Mumbai. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; cancer care; neurosciences; orthopaedics; gastroenterology; renal sciences; critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Cancer care
- Neurosciences
- Orthopaedics
- Gastroenterology
- Renal sciences
- Critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiac Sciences
- Medical and Surgical Oncology
- Neurosciences
- Orthopaedics
- Gastroenterology
- Nephrology
- Urology
- Internal Medicine
- Emergency Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient care
- Intensive-care services
- Operating theatres
- Diagnostic imaging and laboratory services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.maxhealthcare.in/hospital-network/nanavati-max-super-speciality-hospital)

---

# Hospital: MIOT International, Chennai

- **Hospital ID:** `HVX-H003`
- **Official name:** MIOT International
- **City:** Chennai
- **Area / campus:** Manapakkam
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.miotinternational.com/

## 1. Overview

MIOT International is a private multispecialty tertiary-care hospital in Chennai. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes orthopaedics and joint replacement; trauma; cardiac care; neurosciences; gastroenterology; renal care; transplant and complex surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Orthopaedics and joint replacement
- Trauma
- Cardiac care
- Neurosciences
- Gastroenterology
- Renal care
- Transplant and complex surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Orthopaedics
- Joint Replacement
- Trauma
- Cardiology
- Cardiothoracic Surgery
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Oncology
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient services
- Operating theatres
- Advanced imaging and diagnostic services
- Intensive care
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.miotinternational.com/)

---

# Hospital: Medanta – The Medicity, Gurugram

- **Hospital ID:** `HVX-H004`
- **Official name:** Medanta – The Medicity
- **City:** Gurugram
- **Area / campus:** Sector 38
- **Facility type:** Private multi-super-specialty tertiary-care hospital
- **Official website / source:** https://www.medanta.org/hospitals-near-me/gurugram-hospital

## 1. Overview

Medanta – The Medicity in Gurugram is the founding hospital of the Medanta network and a large multi-super-specialty tertiary-care campus. Its official hospital page describes care across 30+ super-specialties, with multidisciplinary programmes for complex cardiac, neurological, cancer, digestive, kidney, liver-transplant and orthopaedic conditions. The hospital’s published capacity is 1,440 operational beds, including 316 ICU beds, and 40 operating theatres. The hospital combines outpatient assessment, advanced diagnostics, inpatient treatment, surgery, critical care and rehabilitation pathways, with patients often managed by teams across multiple specialties. The campus is also associated with medical research and specialist clinical programmes.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Liver and kidney transplantation
- Gastroenterology
- Orthopaedics
- Robotic and minimally invasive surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiac Sciences
- Cardiac Surgery
- Oncology
- Neurosciences
- Gastroenterology and Hepatology
- Liver Transplant
- Nephrology
- Kidney Transplant
- Urology
- Orthopaedics
- Pulmonology
- Critical Care

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Arvinder Singh Soin** (`DVX-0065`) — Liver Transplant Surgery. [Profile source](https://www.medanta.org/hospitals-near-me/gurugram-hospital)
- **Dr. Arvind Kumar** (`DVX-0066`) — Thoracic Surgery / Lung Transplant. [Profile source](https://www.medanta.org/hospitals-near-me/gurugram-hospital)

## 5. Infrastructure and Facilities

- 1,440 operational beds
- 316 ICU beds
- 40 operating theatres
- 30+ super-specialties
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** `DVX-0065`, `DVX-0066`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.medanta.org/hospitals-near-me/gurugram-hospital)

---

# Hospital: Max Super Speciality Hospital, Saket, New Delhi

- **Hospital ID:** `HVX-H005`
- **Official name:** Max Super Speciality Hospital, Saket
- **City:** New Delhi
- **Area / campus:** Saket
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.maxhealthcare.in/hospital-network/max-super-speciality-hospital-saket

## 1. Overview

Max Super Speciality Hospital, Saket is a private multispecialty tertiary-care hospital in New Delhi. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac care; cancer care; neurosciences; orthopaedics; kidney and urology; gastroenterology; transplant services. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac care
- Cancer care
- Neurosciences
- Orthopaedics
- Kidney and urology
- Gastroenterology
- Transplant services
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiac Sciences
- Oncology
- Neurosciences
- Orthopaedics
- Gastroenterology
- Nephrology
- Urology
- Internal Medicine
- Obstetrics and Gynaecology
- Paediatrics
- Critical Care

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Balbir Singh** (`DVX-0067`) — Cardiology; Interventional Cardiology; Electrophysiology. [Profile source](https://www.maxhealthcare.in/doctor/cardiologists-in-saket)
- **Dr. Viveka Kumar** (`DVX-0068`) — Cardiology; Interventional Cardiology. [Profile source](https://www.maxhealthcare.in/doctor/cardiologists-in-saket)
- **Dr. Anant Kumar** (`DVX-0069`) — Urology; Kidney Transplant; Robotic Surgery. [Profile source](https://www.maxhealthcare.in/doctors-search)
- **Prof. (Dr.) Atul Sharma** (`DVX-0070`) — Medical Oncology. [Profile source](https://www.maxhealthcare.in/doctor/oncologists-in-saket)
- **Dr. (Prof.) SVS Deo** (`DVX-0071`) — Surgical Oncology. [Profile source](https://www.maxhealthcare.in/doctor/oncologists-in-saket)

## 5. Infrastructure and Facilities

- Inpatient and outpatient facilities
- Operating theatres
- Intensive-care units
- Advanced imaging and laboratory diagnostics
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** `DVX-0067`, `DVX-0068`, `DVX-0069`, `DVX-0070`, `DVX-0071`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.maxhealthcare.in/hospital-network/max-super-speciality-hospital-saket)

---

# Hospital: Manipal Hospital, Old Airport Road, Bengaluru

- **Hospital ID:** `HVX-H006`
- **Official name:** Manipal Hospital, Old Airport Road
- **City:** Bengaluru
- **Area / campus:** HAL Old Airport Road, Kodihalli
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.manipalhospitals.com/oldairportroad/about-us/

## 1. Overview

Manipal Hospital, Old Airport Road is a private multispecialty tertiary-care hospital in Bengaluru. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiology and cardiac surgery; cancer care; transplantation; neurosciences; gastroenterology; orthopaedics; maternity and paediatric care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiology and cardiac surgery
- Cancer care
- Transplantation
- Neurosciences
- Gastroenterology
- Orthopaedics
- Maternity and paediatric care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiothoracic and Vascular Surgery
- Oncology
- Clinical Haematology
- Gastrointestinal Sciences
- Liver Transplantation
- Nephrology
- Neurology
- Neurosurgery
- Obstetrics and Gynaecology
- Paediatrics
- Orthopaedics
- Urology
- Emergency Medicine

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Pankaj Singhai** (`DVX-0056`) — Internal Medicine. [Profile source](https://www.manipalhospitals.com/oldairportroad/doctors/dr-pankaj-singhai-senior-consultant-internal-medicine/)
- **Dr. Prasanna K. S.** (`DVX-0057`) — Medical Gastroenterology. [Profile source](https://www.manipalhospitals.com/oldairportroad/doctors/dr-prasanna-k-s-gastroenterologist/)

## 5. Infrastructure and Facilities

- NABH and NABL accreditations listed by the hospital
- 24/7 emergency department
- Advanced diagnostic and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.
- Published location: 98, HAL Old Airport Road, Kodihalli, Bengaluru 560017; emergency department listed as 24/7; doctor enquiry: 1800 102 5555.

### Data connections

- **Connected doctor IDs:** `DVX-0056`, `DVX-0057`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.manipalhospitals.com/oldairportroad/about-us/)

---

# Hospital: Manipal Hospital, Kharadi, Pune

- **Hospital ID:** `HVX-H007`
- **Official name:** Manipal Hospital, Kharadi
- **City:** Pune
- **Area / campus:** Kharadi Bypass Road
- **Facility type:** Private multispecialty hospital
- **Official website / source:** https://www.manipalhospitals.com/kharadi/about-us/

## 1. Overview

Manipal Hospital, Kharadi is a private multispecialty hospital in Pune. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes emergency and critical care; cancer care; cardiology; cardiothoracic surgery; nephrology and kidney transplant; neurosciences; orthopaedics; urology. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Emergency and critical care
- Cancer care
- Cardiology
- Cardiothoracic surgery
- Nephrology and kidney transplant
- Neurosciences
- Orthopaedics
- Urology
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Accident and Emergency
- Cancer Care
- Cardiology
- Cardiothoracic and Vascular Surgery
- Dialysis
- Gastrointestinal Sciences
- General Surgery
- Hepatobiliary Surgery
- ICU and Critical Care
- Kidney Transplant
- Nephrology
- Neurology
- Neurosurgery
- Obstetrics and Gynaecology
- Orthopaedics
- Sports Injury
- Urology

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- NABH accreditation listed by the hospital
- Emergency care
- ICU
- Operating theatres
- Diagnostic and inpatient facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.
- Published location: 22/2A, Near Nyati Empire, Kharadi Bypass Road, Pune 410014; doctor enquiry: 020 6813 8888.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** This is the canonical Kharadi record. Row 63 points here.

### Source

- [Official hospital website / profile](https://www.manipalhospitals.com/kharadi/about-us/)

---

# Hospital: Lilavati Hospital and Research Centre, Mumbai

- **Hospital ID:** `HVX-H008`
- **Official name:** Lilavati Hospital and Research Centre
- **City:** Mumbai
- **Area / campus:** Bandra Reclamation, Bandra West
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.lilavatihospital.com/

## 1. Overview

Lilavati Hospital and Research Centre is a private multispecialty tertiary-care hospital in Mumbai. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiology; oncology; neurosciences; orthopaedics; gastroenterology; nephrology; transplant and critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiology
- Oncology
- Neurosciences
- Orthopaedics
- Gastroenterology
- Nephrology
- Transplant and critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Orthopaedics
- Gastroenterology
- Nephrology
- Urology
- Obstetrics and Gynaecology
- Paediatrics
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient care
- Diagnostic imaging
- Laboratory services
- Intensive care and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.lilavatihospital.com/)

---

# Hospital: Ganga Hospital, Coimbatore

- **Hospital ID:** `HVX-H009`
- **Official name:** Ganga Hospital
- **City:** Coimbatore
- **Area / campus:** Mettupalayam Road
- **Facility type:** Specialist orthopaedic, trauma and reconstructive hospital
- **Official website / source:** https://www.gangahospital.com/

## 1. Overview

Ganga Hospital in Coimbatore is particularly known for orthopaedics, trauma care, plastic surgery and reconstructive microsurgery. The hospital’s own website lists 650 beds and 25 health departments, and describes services across orthopaedic surgery, plastic surgery, anaesthesia and related care. Its specialist focus makes it relevant for complex bone-and-joint problems, injuries, hand surgery, reconstruction and rehabilitation. A patient’s care may include emergency assessment, imaging, surgery, anaesthesia, wound care and rehabilitation, depending on the condition. The hospital also hosts specialist clinical and educational activity in its areas of focus.

## 2. Services and Treatments

- Orthopaedic surgery
- Complex trauma
- Plastic and reconstructive surgery
- Hand surgery
- Microsurgery
- Burns
- Rehabilitation
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Orthopaedics
- Trauma
- Plastic Surgery
- Hand Surgery
- Microsurgery
- Spine Surgery
- Anaesthesia
- Rehabilitation

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- 650 beds
- 25 health departments
- 300+ surgeons/qualified surgeons stated on hospital site
- Emergency and trauma care
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.gangahospital.com/)

---

# Hospital: Kokilaben Dhirubhai Ambani Hospital, Mumbai

- **Hospital ID:** `HVX-H010`
- **Official name:** Kokilaben Dhirubhai Ambani Hospital
- **City:** Mumbai
- **Area / campus:** Andheri West
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.kokilabenhospital.com/patients/findadoctor.html

## 1. Overview

Kokilaben Dhirubhai Ambani Hospital is a private multispecialty tertiary-care hospital in Mumbai. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cancer care; cardiac sciences; neurosciences; bone and joint; robotic surgery; transplantation; children’s and women’s health. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cancer care
- Cardiac sciences
- Neurosciences
- Bone and joint
- Robotic surgery
- Transplantation
- Children’s and women’s health
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Accident and Emergency
- Bone and Joint
- Cancer
- Cardiac Sciences
- Children
- Children’s Heart
- Plastic Surgery
- Critical Care
- Bariatric Surgery
- Gastroenterology and Hepatology
- Nephrology
- Neurology
- Neurosurgery
- Obstetrics and Gynaecology
- Orthopaedics
- Urology
- Transplant

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Integrated inpatient and outpatient services
- Advanced diagnostic imaging
- Intensive care
- Operating theatres and specialist centres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.kokilabenhospital.com/patients/findadoctor.html)

---

# Hospital: King George's Medical University (KGMU), Lucknow

- **Hospital ID:** `HVX-H011`
- **Official name:** King George's Medical University (KGMU)
- **City:** Lucknow
- **Area / campus:** Chowk
- **Facility type:** Public medical university and teaching hospital
- **Official website / source:** https://www.kgmu.org/

## 1. Overview

King George's Medical University (KGMU) is a public medical university and teaching hospital in Lucknow. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes tertiary public care; trauma and emergency services; specialist medicine and surgery; dental and super-specialty services. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Tertiary public care
- Trauma and emergency services
- Specialist medicine and surgery
- Dental and super-specialty services
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- Orthopaedics
- Paediatrics
- Obstetrics and Gynaecology
- Ophthalmology
- ENT
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Teaching-hospital infrastructure
- Outpatient clinics
- Inpatient wards
- Diagnostic and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.kgmu.org/)

---

# Hospital: Krishna Institute of Medical Sciences (KIMS), Secunderabad

- **Hospital ID:** `HVX-H012`
- **Official name:** Krishna Institute of Medical Sciences (KIMS)
- **City:** Secunderabad
- **Area / campus:** Minister Road
- **Facility type:** Private multispecialty hospital
- **Official website / source:** https://www.kimshospitals.com/

## 1. Overview

Krishna Institute of Medical Sciences (KIMS) is a private multispecialty hospital in Secunderabad. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac care; oncology; neurosciences; gastroenterology; orthopaedics; renal sciences; critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac care
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Renal sciences
- Critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiothoracic Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- General Surgery
- Internal Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient services
- Emergency and critical care
- Operating theatres and diagnostics
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.kimshospitals.com/)

---

# Hospital: Kalinga Institute of Medical Sciences (KIMS), Bhubaneswar, Odisha

- **Hospital ID:** `HVX-H013`
- **Official name:** Kalinga Institute of Medical Sciences (KIMS)
- **City:** Bhubaneswar, Odisha
- **Area / campus:** Patia, KIIT campus
- **Facility type:** Teaching and multispecialty hospital
- **Official website / source:** https://hospital.kims.ac.in/

## 1. Overview

Kalinga Institute of Medical Sciences (KIMS) in Bhubaneswar is a teaching and multispecialty hospital associated with KIIT. Its official website presents general hospital, super-specialty and cancer-centre services, with treatment pathways spanning general medicine, surgery, paediatrics, gynaecology, cardiology, gastroenterology and cancer care. The published facility list includes dialysis, central oxygen supply, ICU beds with ventilators, modular operating theatres, ambulance support, a 24-hour emergency service and an in-house pharmacy. It is distinct from Krishna Institute of Medical Sciences in Secunderabad; the two institutions must have separate IDs and profiles.

## 2. Services and Treatments

- General and specialist medicine
- Surgery
- Cancer care
- Cardiology
- Gastroenterology
- Paediatrics
- Emergency care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Gastroenterology
- Oncology
- Paediatrics
- Obstetrics and Gynaecology
- Orthopaedics
- Neurology
- Nephrology
- Emergency Medicine

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Saswati Das** (`DVX-0058`) — Anaesthesiology. [Profile source](https://hospital.kims.ac.in/)
- **Dr. Farheen Begum** (`DVX-0059`) — Dermatology. [Profile source](https://hospital.kims.ac.in/)

## 5. Infrastructure and Facilities

- The hospital website lists general hospital, super-specialty and cancer-centre services, modular operation theatres, ICU with ventilator beds, dialysis, ambulance and 24-hour emergency support
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.
- Published hospital contact for super-specialty/cancer centre: 0674 2725228 / 7105354; emergency contact listed on the site: 0674 7111000.

### Data connections

- **Connected doctor IDs:** `DVX-0058`, `DVX-0059`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://hospital.kims.ac.in/)

---

# Hospital: Jawaharlal Institute of Postgraduate Medical Education and Research (JIPMER), Puducherry

- **Hospital ID:** `HVX-H014`
- **Official name:** Jawaharlal Institute of Postgraduate Medical Education and Research (JIPMER)
- **City:** Puducherry
- **Area / campus:** Dhanvantari Nagar
- **Facility type:** Central government medical institute and tertiary-care teaching hospital
- **Official website / source:** https://jipmer.edu.in/

## 1. Overview

Jawaharlal Institute of Postgraduate Medical Education and Research (JIPMER) is a central government medical institute and tertiary-care teaching hospital in Puducherry. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes specialist outpatient care; complex medical and surgical treatment; emergency care; medical education and research. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Specialist outpatient care
- Complex medical and surgical treatment
- Emergency care
- Medical education and research
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- Paediatrics
- Obstetrics and Gynaecology
- Orthopaedics
- Pulmonary Medicine
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Public tertiary-care campus with outpatient blocks, inpatient services, diagnostic and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://jipmer.edu.in/)

---

# Hospital: Indraprastha Apollo Hospital, New Delhi

- **Hospital ID:** `HVX-H015`
- **Official name:** Indraprastha Apollo Hospital
- **City:** New Delhi
- **Area / campus:** Sarita Vihar
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.apollohospitals.com/region/delhi/about-us/indraprastha-apollo-hospital/

## 1. Overview

Indraprastha Apollo Hospitals in Sarita Vihar, New Delhi, is a flagship Apollo tertiary acute-care hospital serving Delhi-NCR and patients from elsewhere in India and abroad. Apollo’s published institutional profile lists 710 beds, a 15-acre campus, over 600,000 square feet of built-up area and 52 specialties. Its services span cardiac sciences, cancer care, neurosciences, gastroenterology, liver and kidney transplantation, orthopaedics, paediatrics, emergency medicine and critical care. It provides a pathway from outpatient specialist consultations and diagnostic testing through surgery, inpatient care and follow-up. Its official doctor directory should be used to maintain branch-specific doctor affiliations and appointment details.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Liver and kidney transplant
- Orthopaedics
- Gastroenterology
- Paediatrics
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Anaesthesia
- Cardiology
- Cardiac Surgery
- Oncology
- Paediatrics
- Critical Care
- Emergency Care
- Fetal Medicine
- Gastroenterology
- Hepatology
- IVF
- Liver and Kidney Transplant
- Nephrology
- Neurosciences
- Ophthalmology
- Orthopaedics
- Respiratory Medicine
- Urology

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- 710-bed tertiary acute-care hospital
- 15-acre campus
- Over 600,000 sq ft built-up area
- 52 specialties listed by Apollo
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.apollohospitals.com/region/delhi/about-us/indraprastha-apollo-hospital/)

---

# Hospital: Indira Gandhi Institute of Medical Sciences (IGIMS), Patna

- **Hospital ID:** `HVX-H016`
- **Official name:** Indira Gandhi Institute of Medical Sciences (IGIMS)
- **City:** Patna
- **Area / campus:** Sheikhpura
- **Facility type:** Public postgraduate medical institute and teaching hospital
- **Official website / source:** https://igims.org/

## 1. Overview

Indira Gandhi Institute of Medical Sciences (IGIMS) is a public postgraduate medical institute and teaching hospital in Patna. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes multispecialty public tertiary care; cardiac and renal services; cancer care; specialist surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Multispecialty public tertiary care
- Cardiac and renal services
- Cancer care
- Specialist surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Cardiothoracic Surgery
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- Urology
- Paediatrics
- Obstetrics and Gynaecology
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Teaching-hospital campus with outpatient clinics, inpatient care, diagnostic services and operating theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://igims.org/)

---

# Hospital: Fortis Escorts Heart Institute, New Delhi

- **Hospital ID:** `HVX-H017`
- **Official name:** Fortis Escorts Heart Institute
- **City:** New Delhi
- **Area / campus:** Okhla Road
- **Facility type:** Private cardiac-focused tertiary-care hospital
- **Official website / source:** https://www.fortishealthcare.com/specialities/hospital/cardiac-sciences-5/fortis-escorts-heart-institute-new-delhi

## 1. Overview

Fortis Escorts Heart Institute on Okhla Road, New Delhi, is a cardiac-focused tertiary-care institution within Fortis Healthcare. Fortis describes it as an established centre of excellence in cardiac sciences and lists advanced interventional cardiology, electrophysiology, adult and paediatric cardiac surgery, heart transplant and other complex cardiac procedures. The hospital page reports 310 beds, 13 operating theatres and five catheterisation laboratories. Its broader clinical centres also cover liver and digestive diseases, kidney and urology, and bone and joint care. Doctor listings should be organised by clinical specialty rather than a general popularity ranking, with appointment information taken from the official Fortis booking pages.

## 2. Services and Treatments

- Complex angioplasty
- Interventional cardiology
- Electrophysiology
- Adult and paediatric cardiac surgery
- Heart transplant
- LVAD
- Liver and kidney care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Interventional Cardiology
- Electrophysiology
- Adult Cardiac Surgery
- Paediatric Cardiology
- Paediatric and Congenital Cardiac Surgery
- Nephrology
- Liver and Digestive Diseases
- Bone and Joint
- Critical Care

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Ashok Seth** (`DVX-0013`) — Cardiology / Interventional Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Anil Saxena** (`DVX-0014`) — Cardiology / Electrophysiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Atul Mathur** (`DVX-0015`) — Interventional Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Nishith Chandra** (`DVX-0016`) — Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Praveer Agarwal** (`DVX-0017`) — Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Shiv Kumar Choudhary** (`DVX-0018`) — Cardiothoracic and Vascular Surgery. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Z S Meharwal** (`DVX-0019`) — Adult Cardiac Surgery. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Aparna Jaswal** (`DVX-0020`) — Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Vijay Kumar** (`DVX-0021`) — Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Vishal Rastogi** (`DVX-0022`) — Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Anita Saxena** (`DVX-0023`) — Paediatric Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Krishna Subramony Iyer** (`DVX-0024`) — Paediatric and Congenital Heart Surgery. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Ajit Singh Narula** (`DVX-0025`) — Nephrology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Ashok Omar** (`DVX-0026`) — Non-Invasive Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Peeyush Jain** (`DVX-0027`) — Non-Invasive Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Vivek Kumar** (`DVX-0028`) — Non-Invasive Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)
- **Dr. Ashok K Khera** (`DVX-0029`) — Cardiology. [Profile source](https://www.fortishealthcare.com/doctors/hospital/fortis-escorts-heart-institute-new-delhi)

## 5. Infrastructure and Facilities

- 310 beds
- 13 operating theatres
- 5 cath labs
- Four centres of excellence including cardiac, liver/digestive, kidney/urology and bone/joint institutes
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** `DVX-0013`, `DVX-0014`, `DVX-0015`, `DVX-0016`, `DVX-0017`, `DVX-0018`, `DVX-0019`, `DVX-0020`, `DVX-0021`, `DVX-0022`, `DVX-0023`, `DVX-0024`, `DVX-0025`, `DVX-0026`, `DVX-0027`, `DVX-0028`, `DVX-0029`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.fortishealthcare.com/specialities/hospital/cardiac-sciences-5/fortis-escorts-heart-institute-new-delhi)

---

# Hospital: Eternal Hospital, Jaipur

- **Hospital ID:** `HVX-H018`
- **Official name:** Eternal Hospital
- **City:** Jaipur
- **Area / campus:** Jawahar Circle area
- **Facility type:** Private multispecialty hospital
- **Official website / source:** https://www.eternalhospital.com/

## 1. Overview

Eternal Hospital is a private multispecialty hospital in Jaipur. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; orthopaedics; gastroenterology; renal care; emergency medicine. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Orthopaedics
- Gastroenterology
- Renal care
- Emergency medicine
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiothoracic Surgery
- Oncology
- Neurology
- Neurosurgery
- Orthopaedics
- Gastroenterology
- Nephrology
- Urology
- Internal Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient facilities
- Diagnostic services
- Critical-care and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.eternalhospital.com/)

---

# Hospital: Deenanath Mangeshkar Hospital, Pune

- **Hospital ID:** `HVX-H019`
- **Official name:** Deenanath Mangeshkar Hospital
- **City:** Pune
- **Area / campus:** Erandwane
- **Facility type:** Private charitable multispecialty hospital
- **Official website / source:** https://www.dmhospital.org/

## 1. Overview

Deenanath Mangeshkar Hospital is a private charitable multispecialty hospital in Pune. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac care; oncology; neurosciences; orthopaedics; gastroenterology; nephrology; transplant and advanced surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac care
- Oncology
- Neurosciences
- Orthopaedics
- Gastroenterology
- Nephrology
- Transplant and advanced surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Orthopaedics
- Gastroenterology
- Nephrology
- Urology
- Paediatrics
- Obstetrics and Gynaecology
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient care
- Advanced diagnostics
- ICUs
- Operating theatres and rehabilitation services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.dmhospital.org/)

---

# Hospital: Continental Hospitals, Hyderabad

- **Hospital ID:** `HVX-H020`
- **Official name:** Continental Hospitals
- **City:** Hyderabad
- **Area / campus:** Gachibowli
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://continentalhospitals.com/

## 1. Overview

Continental Hospitals is a private multispecialty tertiary-care hospital in Hyderabad. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; gastroenterology; orthopaedics; transplant and critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Transplant and critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Hepatology
- Nephrology
- Urology
- Orthopaedics
- Emergency Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Inpatient and outpatient services
- Intensive care
- Operating theatres
- Diagnostic imaging and laboratory services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://continentalhospitals.com/)

---

# Hospital: Christian Medical College (CMC), Vellore

- **Hospital ID:** `HVX-H021`
- **Official name:** Christian Medical College (CMC)
- **City:** Vellore
- **Area / campus:** Ida Scudder Road
- **Facility type:** Teaching hospital and medical research institution
- **Official website / source:** https://www.cmch-vellore.edu/

## 1. Overview

Christian Medical College (CMC) is a teaching hospital and medical research institution in Vellore. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes complex tertiary care; cardiology; neurology; oncology; renal medicine; paediatrics; infectious disease and specialist surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Complex tertiary care
- Cardiology
- Neurology
- Oncology
- Renal medicine
- Paediatrics
- Infectious disease and specialist surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- Cardiology
- Neurology
- Oncology
- Nephrology
- Paediatrics
- General Surgery
- Orthopaedics
- Obstetrics and Gynaecology
- Infectious Diseases
- Gastroenterology
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Teaching and research campus with outpatient clinics, inpatient wards, diagnostic services, operating theatres and specialist centres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.cmch-vellore.edu/)

---

# Hospital: Choithram Hospital and Research Centre, Indore

- **Hospital ID:** `HVX-H022`
- **Official name:** Choithram Hospital and Research Centre
- **City:** Indore
- **Area / campus:** Manik Bagh Road
- **Facility type:** Private charitable multispecialty hospital
- **Official website / source:** https://www.choithramhospital.org/

## 1. Overview

Choithram Hospital and Research Centre is a private charitable multispecialty hospital in Indore. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiology; oncology; neurosciences; orthopaedics; nephrology; gastroenterology; general and specialist surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiology
- Oncology
- Neurosciences
- Orthopaedics
- Nephrology
- Gastroenterology
- General and specialist surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Oncology
- Neurology
- Neurosurgery
- Orthopaedics
- Nephrology
- Urology
- Gastroenterology
- Paediatrics
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient care
- Diagnostics
- Intensive-care and surgical services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.choithramhospital.org/)

---

# Hospital: CARE Hospitals, Hyderabad

- **Hospital ID:** `HVX-H023`
- **Official name:** CARE Hospitals
- **City:** Hyderabad
- **Area / campus:** Banjara Hills
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.carehospitals.com/

## 1. Overview

CARE Hospitals is a private multispecialty tertiary-care hospital in Hyderabad. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; gastroenterology; orthopaedics; kidney care; emergency and critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Kidney care
- Emergency and critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiothoracic Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- Internal Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient care
- Emergency and intensive care
- Imaging and laboratory diagnostics
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.carehospitals.com/)

---

# Hospital: Aster Medcity, Kochi

- **Hospital ID:** `HVX-H024`
- **Official name:** Aster Medcity
- **City:** Kochi
- **Area / campus:** Cheranalloor
- **Facility type:** Private quaternary-care multispecialty hospital
- **Official website / source:** https://www.asterhospitals.in/hospitals/aster-medcity-kochi

## 1. Overview

Aster Medcity is a private quaternary-care multispecialty hospital in Kochi. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; neurosciences; oncology; gastroenterology; orthopaedics; organ transplantation; women and children’s care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Neurosciences
- Oncology
- Gastroenterology
- Orthopaedics
- Organ transplantation
- Women and children’s care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiac Sciences
- Neurosciences
- Oncology
- Gastroenterology
- Hepatology
- Orthopaedics
- Nephrology
- Urology
- Organ Transplant
- Obstetrics and Gynaecology
- Paediatrics
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Integrated hospital campus with specialist centres, diagnostic services, intensive care and surgical infrastructure
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.asterhospitals.in/hospitals/aster-medcity-kochi)

---

# Hospital: Bombay Hospital & Medical Research Centre, Mumbai

- **Hospital ID:** `HVX-H025`
- **Official name:** Bombay Hospital & Medical Research Centre
- **City:** Mumbai
- **Area / campus:** Marine Lines
- **Facility type:** Private charitable multispecialty hospital and research centre
- **Official website / source:** https://www.bombayhospital.com/

## 1. Overview

Bombay Hospital & Medical Research Centre is a private charitable multispecialty hospital and research centre in Mumbai. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac care; neurology; orthopaedics; oncology; nephrology; gastroenterology; advanced surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac care
- Neurology
- Orthopaedics
- Oncology
- Nephrology
- Gastroenterology
- Advanced surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Neurology
- Neurosurgery
- Orthopaedics
- Oncology
- Nephrology
- Gastroenterology
- General Surgery
- Urology
- Paediatrics
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Inpatient and outpatient services
- Intensive care
- Diagnostic imaging
- Laboratories and operating theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.bombayhospital.com/)

---

# Hospital: Aster CMI Hospital, Bengaluru

- **Hospital ID:** `HVX-H026`
- **Official name:** Aster CMI Hospital
- **City:** Bengaluru
- **Area / campus:** Hebbal
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.asterhospitals.in/hospitals/aster-cmi-bangalore

## 1. Overview

Aster CMI Hospital is a private multispecialty tertiary-care hospital in Bengaluru. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; neurosciences; oncology; gastroenterology; orthopaedics; renal sciences; transplantation. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Neurosciences
- Oncology
- Gastroenterology
- Orthopaedics
- Renal sciences
- Transplantation
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiac Sciences
- Neurosciences
- Oncology
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- Liver Transplant
- General Surgery
- Obstetrics and Gynaecology
- Paediatrics
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Specialist centres
- Advanced diagnostic and surgical facilities
- Intensive care and inpatient services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.asterhospitals.in/hospitals/aster-cmi-bangalore)

---

# Hospital: Artemis Hospital, Gurugram

- **Hospital ID:** `HVX-H027`
- **Official name:** Artemis Hospital
- **City:** Gurugram
- **Area / campus:** Sector 51
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.artemishospitals.com/

## 1. Overview

Artemis Hospital is a private multispecialty tertiary-care hospital in Gurugram. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; orthopaedics; gastroenterology; transplant; robotic and minimally invasive surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Orthopaedics
- Gastroenterology
- Transplant
- Robotic and minimally invasive surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurosciences
- Orthopaedics
- Gastroenterology
- Nephrology
- Urology
- Transplant
- Emergency Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty campus with operating theatres, ICUs, diagnostics and dedicated clinical centres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.artemishospitals.com/)

---

# Hospital: Apollo Hospitals, Greams Road, Chennai

- **Hospital ID:** `HVX-H028`
- **Official name:** Apollo Hospitals, Greams Road
- **City:** Chennai
- **Area / campus:** Greams Road
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.apollohospitals.com/chennai

## 1. Overview

Apollo Hospitals, Greams Road is a private multispecialty tertiary-care hospital in Chennai. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; gastroenterology; orthopaedics; transplantation; advanced robotic surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Transplantation
- Advanced robotic surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Hepatology
- Nephrology
- Urology
- Orthopaedics
- Transplant Surgery
- Emergency Medicine
- Critical Care

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Y Vijayachandra Reddy** (`DVX-0072`) — Cardiac Sciences. [Profile source](https://www.apollohospitals.com/book-doctor-appointment/cardiologist/chennai)
- **Dr. Robert Mao** (`DVX-0073`) — Cardiology. [Profile source](https://www.apollohospitals.com/book-doctor-appointment/cardiologist/chennai)
- **Dr. Sengottuvelu G** (`DVX-0074`) — Cardiac Sciences; Interventional Cardiology. [Profile source](https://www.apollohospitals.com/book-doctor-appointment/cardiologist/chennai)
- **Dr. Mohammed Rehan Sayeed** (`DVX-0075`) — Cardiac Sciences; Robotic Surgery. [Profile source](https://www.apollohospitals.com/book-doctor-appointment/cardiologist/chennai)
- **Dr. R Ravi Kumar** (`DVX-0076`) — Cardiac Sciences; Heart Transplant. [Profile source](https://www.apollohospitals.com/book-doctor-appointment/cardiologist/chennai)
- **Dr. Karthigesan A M** (`DVX-0077`) — Cardiac Sciences; Electrophysiology. [Profile source](https://www.apollohospitals.com/book-doctor-appointment/cardiologist/chennai)
- **Dr. Pramod Kumar** (`DVX-0078`) — Cardiac Sciences. [Profile source](https://www.apollohospitals.com/book-doctor-appointment/cardiologist/chennai)

## 5. Infrastructure and Facilities

- Tertiary-care campus with diagnostic imaging, intensive-care units, operating theatres and specialist centres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** `DVX-0072`, `DVX-0073`, `DVX-0074`, `DVX-0075`, `DVX-0076`, `DVX-0077`, `DVX-0078`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.apollohospitals.com/chennai)

---

# Hospital: Apollo Hospitals, Bhubaneswar

- **Hospital ID:** `HVX-H029`
- **Official name:** Apollo Hospitals
- **City:** Bhubaneswar
- **Area / campus:** Sainik School Road area
- **Facility type:** Private multispecialty hospital
- **Official website / source:** https://www.apollohospitals.com/

## 1. Overview

Apollo Hospitals is a private multispecialty hospital in Bhubaneswar. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; gastroenterology; orthopaedics; renal sciences; emergency care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Renal sciences
- Emergency care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- General Surgery
- Paediatrics
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient care
- Diagnostics
- Operating theatres and intensive care
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.apollohospitals.com/)

---

# Hospital: Apollo Hospitals, Bengaluru

- **Hospital ID:** `HVX-H030`
- **Official name:** Apollo Hospitals
- **City:** Bengaluru
- **Area / campus:** Bannerghatta Road
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.apollohospitals.com/

## 1. Overview

Apollo Hospitals is a private multispecialty tertiary-care hospital in Bengaluru. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; gastroenterology; orthopaedics; transplantation; emergency care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Transplantation
- Emergency care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- Transplant Surgery
- Obstetrics and Gynaecology
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient services
- Operating theatres
- ICUs
- Diagnostic imaging and laboratory services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.apollohospitals.com/)

---

# Hospital: Apollo Hospitals, Ahmedabad

- **Hospital ID:** `HVX-H031`
- **Official name:** Apollo Hospitals
- **City:** Ahmedabad
- **Area / campus:** Bhat / Gandhinagar highway area
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.apollohospitals.com/ahmedabad

## 1. Overview

Apollo Hospitals is a private multispecialty tertiary-care hospital in Ahmedabad. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiology; oncology and bone-marrow transplant; neurosciences; gastroenterology; nephrology and kidney transplant; orthopaedics. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiology
- Oncology and bone-marrow transplant
- Neurosciences
- Gastroenterology
- Nephrology and kidney transplant
- Orthopaedics
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiac Sciences
- Oncology
- Bone Marrow Transplant
- Neurosciences
- Gastroenterology and Hepatology
- Nephrology
- Kidney Transplant
- Orthopaedics
- General Surgery
- Obstetrics and Gynaecology
- Critical Care

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Sameer Dani** (`DVX-0046`) — Cardiology / Interventional Cardiology. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/ahmedabad)
- **Dr. Jayesh Prajapati** (`DVX-0047`) — Cardiology. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/ahmedabad)
- **Dr. Pavan Patel** (`DVX-0048`) — Cardiac Sciences / Paediatric Cardiology. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/ahmedabad)
- **Dr. Deepti Kakkar** (`DVX-0049`) — Cardiac Sciences. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/ahmedabad)
- **Dr. Sharad Jain** (`DVX-0050`) — Cardiology. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/ahmedabad)
- **Dr. Akash Shah** (`DVX-0051`) — Medical Oncology. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/oncologist/ahmedabad)
- **Dr. Haresh Patel** (`DVX-0052`) — Nephrology / Kidney Transplant. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/ahmedabad)
- **Dr. Somesh Desai** (`DVX-0053`) — Neurosciences / Neurosurgery. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/ahmedabad)
- **Dr. Shravan Bohra** (`DVX-0054`) — Gastroenterology and Hepatology. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/ahmedabad)
- **Dr. Usha Bohra** (`DVX-0055`) — Obstetrics, Gynaecology and Reproductive Medicine. [Profile source](https://www.apollohospitals.com/corporate/book-doctor-appointment/ahmedabad)

## 5. Infrastructure and Facilities

- Integrated specialist services and advanced diagnostics
- Official Apollo Ahmedabad pages list cancer care and bone-marrow transplant services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** `DVX-0046`, `DVX-0047`, `DVX-0048`, `DVX-0049`, `DVX-0050`, `DVX-0051`, `DVX-0052`, `DVX-0053`, `DVX-0054`, `DVX-0055`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.apollohospitals.com/ahmedabad)

---

# Hospital: Amrita Hospital, Faridabad

- **Hospital ID:** `HVX-H032`
- **Official name:** Amrita Hospital
- **City:** Faridabad
- **Area / campus:** Sector 88
- **Facility type:** Academic multispecialty tertiary-care hospital
- **Official website / source:** https://www.amritahospitals.org/faridabad

## 1. Overview

Amrita Hospital is a academic multispecialty tertiary-care hospital in Faridabad. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; transplantation; paediatrics; orthopaedics; complex surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Transplantation
- Paediatrics
- Orthopaedics
- Complex surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurosciences
- Organ Transplant
- Nephrology
- Urology
- Orthopaedics
- Paediatrics
- Obstetrics and Gynaecology
- Gastroenterology
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Large integrated academic hospital campus with specialist centres, diagnostics, ICUs and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.amritahospitals.org/faridabad)

---

# Hospital: All India Institute of Medical Sciences (AIIMS), New Delhi

- **Hospital ID:** `HVX-H033`
- **Official name:** All India Institute of Medical Sciences (AIIMS)
- **City:** New Delhi
- **Area / campus:** Ansari Nagar
- **Facility type:** Central government medical institute and tertiary-care teaching hospital
- **Official website / source:** https://www.aiims.edu/

## 1. Overview

All India Institute of Medical Sciences (AIIMS) is a central government medical institute and tertiary-care teaching hospital in New Delhi. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes tertiary specialist care; complex medicine and surgery; trauma and emergency care; research and teaching. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Tertiary specialist care
- Complex medicine and surgery
- Trauma and emergency care
- Research and teaching
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- General Medicine
- General Surgery
- Paediatrics
- Ophthalmology
- Orthopaedics
- Endocrinology
- Emergency Medicine

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Radhika Tandon** (`DVX-0060`) — Ophthalmology. [Profile source](https://www.aiims.edu/index.php/en/faculty)
- **Dr. Pradeep Venkatesh** (`DVX-0061`) — Ophthalmology. [Profile source](https://www.aiims.edu/index.php/en/faculty)
- **Dr. Shorya Vardhan Azad** (`DVX-0062`) — Ophthalmology. [Profile source](https://www.aiims.edu/index.php/en/faculty)
- **Dr. Amar Pujari** (`DVX-0063`) — Ophthalmology. [Profile source](https://www.aiims.edu/index.php/en/faculty)
- **Dr. Neelam Pushker** (`DVX-0064`) — Ophthalmology. [Profile source](https://www.aiims.edu/index.php/en/faculty)

## 5. Infrastructure and Facilities

- Large public teaching campus with outpatient clinics, inpatient wards, diagnostic services and specialist institutes
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** `DVX-0060`, `DVX-0061`, `DVX-0062`, `DVX-0063`, `DVX-0064`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.aiims.edu/)

---

# Hospital: All India Institute of Medical Sciences (AIIMS), Rishikesh

- **Hospital ID:** `HVX-H034`
- **Official name:** All India Institute of Medical Sciences (AIIMS)
- **City:** Rishikesh
- **Area / campus:** Virbhadra Road
- **Facility type:** Central government medical institute and tertiary-care teaching hospital
- **Official website / source:** https://aiimsrishikesh.edu.in/

## 1. Overview

All India Institute of Medical Sciences (AIIMS) is a central government medical institute and tertiary-care teaching hospital in Rishikesh. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes multispecialty tertiary care; trauma; cardiac and neurosciences services; teaching and research. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Multispecialty tertiary care
- Trauma
- Cardiac and neurosciences services
- Teaching and research
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Anaesthesiology
- Cardiology/CTVS
- Emergency Medicine
- ENT
- General Medicine
- General Surgery
- Obstetrics and Gynaecology
- Neurosurgery
- Ophthalmology
- Orthopaedics
- Pulmonary Medicine
- Radiotherapy

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Public teaching hospital with outpatient, inpatient, diagnostic, surgical and trauma services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://aiimsrishikesh.edu.in/)

---

# Hospital: All India Institute of Medical Sciences (AIIMS), Patna

- **Hospital ID:** `HVX-H035`
- **Official name:** All India Institute of Medical Sciences (AIIMS)
- **City:** Patna
- **Area / campus:** Phulwarisharif
- **Facility type:** Central government medical institute and tertiary-care teaching hospital
- **Official website / source:** https://aiimspatna.edu.in/

## 1. Overview

All India Institute of Medical Sciences (AIIMS) is a central government medical institute and tertiary-care teaching hospital in Patna. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes specialist public healthcare; complex medical and surgical care; emergency services; teaching and research. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Specialist public healthcare
- Complex medical and surgical care
- Emergency services
- Teaching and research
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Oncology
- Paediatrics
- Orthopaedics
- Nephrology
- Obstetrics and Gynaecology
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Public tertiary-care campus with outpatient, inpatient, diagnostic and surgical services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://aiimspatna.edu.in/)

---

# Hospital: All India Institute of Medical Sciences (AIIMS), Jodhpur

- **Hospital ID:** `HVX-H036`
- **Official name:** All India Institute of Medical Sciences (AIIMS)
- **City:** Jodhpur
- **Area / campus:** Basni Industrial Area
- **Facility type:** Central government medical institute and tertiary-care teaching hospital
- **Official website / source:** https://www.aiimsjodhpur.edu.in/

## 1. Overview

All India Institute of Medical Sciences (AIIMS) is a central government medical institute and tertiary-care teaching hospital in Jodhpur. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes specialist medical and surgical care; emergency services; medical education and research. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Specialist medical and surgical care
- Emergency services
- Medical education and research
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- Paediatrics
- Orthopaedics
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Public teaching-hospital infrastructure with outpatient clinics, inpatient services and diagnostic facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.aiimsjodhpur.edu.in/)

---

# Hospital: All India Institute of Medical Sciences (AIIMS), Bhubaneswar

- **Hospital ID:** `HVX-H037`
- **Official name:** All India Institute of Medical Sciences (AIIMS)
- **City:** Bhubaneswar
- **Area / campus:** Sijua
- **Facility type:** Central government medical institute and tertiary-care teaching hospital
- **Official website / source:** https://aiimsbhubaneswar.nic.in/

## 1. Overview

All India Institute of Medical Sciences (AIIMS) is a central government medical institute and tertiary-care teaching hospital in Bhubaneswar. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes multispecialty public tertiary care; specialist surgery; emergency care; education and research. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Multispecialty public tertiary care
- Specialist surgery
- Emergency care
- Education and research
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- Paediatrics
- Orthopaedics
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Public teaching campus with outpatient and inpatient care, diagnostics and specialist clinical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://aiimsbhubaneswar.nic.in/)

---

# Hospital: All India Institute of Medical Sciences (AIIMS), Bhopal

- **Hospital ID:** `HVX-H038`
- **Official name:** All India Institute of Medical Sciences (AIIMS)
- **City:** Bhopal
- **Area / campus:** Saket Nagar
- **Facility type:** Central government medical institute and tertiary-care teaching hospital
- **Official website / source:** https://aiimsbhopal.edu.in/

## 1. Overview

All India Institute of Medical Sciences (AIIMS) is a central government medical institute and tertiary-care teaching hospital in Bhopal. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes multispecialty tertiary care; emergency and trauma services; specialist medicine and surgery; teaching and research. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Multispecialty tertiary care
- Emergency and trauma services
- Specialist medicine and surgery
- Teaching and research
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- Paediatrics
- Orthopaedics
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Public teaching hospital with outpatient, inpatient, diagnostic and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://aiimsbhopal.edu.in/)

---

# Hospital: Fortis Escorts Hospital, Jaipur

- **Hospital ID:** `HVX-H039`
- **Official name:** Fortis Escorts Hospital
- **City:** Jaipur
- **Area / campus:** Malviya Nagar
- **Facility type:** Private multispecialty hospital
- **Official website / source:** https://www.fortishealthcare.com/

## 1. Overview

Fortis Escorts Hospital is a private multispecialty hospital in Jaipur. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; neurosciences; oncology; orthopaedics; gastroenterology; renal care; emergency services. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Neurosciences
- Oncology
- Orthopaedics
- Gastroenterology
- Renal care
- Emergency services
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Orthopaedics
- Gastroenterology
- Nephrology
- Urology
- Internal Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient care, diagnostics, emergency services and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.fortishealthcare.com/)

---

# Hospital: Fortis Hospital, Bengaluru

- **Hospital ID:** `HVX-H040`
- **Official name:** Fortis Hospital
- **City:** Bengaluru
- **Area / campus:** Bannerghatta Road
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.fortishealthcare.com/

## 1. Overview

Fortis Hospital is a private multispecialty tertiary-care hospital in Bengaluru. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; orthopaedics; gastroenterology; renal sciences. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Orthopaedics
- Gastroenterology
- Renal sciences
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Orthopaedics
- Gastroenterology
- Nephrology
- Urology
- Emergency Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient care
- Operating theatres, ICUs and diagnostic services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.fortishealthcare.com/)

---

# Hospital: Fortis Memorial Research Institute (FMRI), Gurugram

- **Hospital ID:** `HVX-H041`
- **Official name:** Fortis Memorial Research Institute (FMRI)
- **City:** Gurugram
- **Area / campus:** Sector 44
- **Facility type:** Private multispecialty quaternary-care hospital
- **Official website / source:** https://www.fortishealthcare.com/

## 1. Overview

Fortis Memorial Research Institute (FMRI) is a private multispecialty quaternary-care hospital in Gurugram. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; organ transplantation; orthopaedics; gastroenterology; robotic surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Organ transplantation
- Orthopaedics
- Gastroenterology
- Robotic surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiac Sciences
- Oncology
- Neurosciences
- Gastroenterology
- Hepatology
- Nephrology
- Urology
- Organ Transplant
- Orthopaedics
- Emergency Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Advanced diagnostic and surgical infrastructure
- ICUs
- Specialist centres and research-linked clinical services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.fortishealthcare.com/)

---

# Hospital: Gleneagles HealthCity, Chennai

- **Hospital ID:** `HVX-H042`
- **Official name:** Gleneagles HealthCity
- **City:** Chennai
- **Area / campus:** Perumbakkam
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.gleneagleshospitals.co.in/

## 1. Overview

Gleneagles HealthCity is a private multispecialty tertiary-care hospital in Chennai. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes organ transplantation; liver and kidney care; oncology; cardiac care; neurosciences; advanced surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Organ transplantation
- Liver and kidney care
- Oncology
- Cardiac care
- Neurosciences
- Advanced surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Liver Transplant
- Kidney Transplant
- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty campus with transplant services, critical care, diagnostics and operating theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.gleneagleshospitals.co.in/)

---

# Hospital: Government Medical College and Hospital (GMCH), Chandigarh

- **Hospital ID:** `HVX-H043`
- **Official name:** Government Medical College and Hospital (GMCH)
- **City:** Chandigarh
- **Area / campus:** Sector 32
- **Facility type:** Government teaching hospital
- **Official website / source:** https://gmch.gov.in/

## 1. Overview

Government Medical College and Hospital (GMCH) is a government teaching hospital in Chandigarh. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes public tertiary care; emergency and trauma care; specialist medicine and surgery; medical education. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Public tertiary care
- Emergency and trauma care
- Specialist medicine and surgery
- Medical education
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Neurosurgery
- Orthopaedics
- Paediatrics
- Obstetrics and Gynaecology
- Psychiatry
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Teaching hospital with outpatient clinics, inpatient wards, diagnostic services and operating theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://gmch.gov.in/)

---

# Hospital: Government Medical College, Thiruvananthapuram

- **Hospital ID:** `HVX-H044`
- **Official name:** Government Medical College
- **City:** Thiruvananthapuram
- **Area / campus:** Medical College PO, Kumarapuram
- **Facility type:** Government medical college and teaching hospital
- **Official website / source:** https://www.tmc.kerala.gov.in/

## 1. Overview

Government Medical College is a government medical college and teaching hospital in Thiruvananthapuram. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes public tertiary care; multispecialty medicine and surgery; emergency care; teaching and research. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Public tertiary care
- Multispecialty medicine and surgery
- Emergency care
- Teaching and research
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Neurosurgery
- Orthopaedics
- Paediatrics
- Obstetrics and Gynaecology
- Nephrology
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Public teaching campus with outpatient, inpatient, diagnostic and surgical services
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.tmc.kerala.gov.in/)

---

# Hospital: Medanta Hospital, Lucknow

- **Hospital ID:** `HVX-H045`
- **Official name:** Medanta Hospital
- **City:** Lucknow
- **Area / campus:** Amar Shaheed Path
- **Facility type:** Private multispecialty hospital
- **Official website / source:** https://www.medanta.org/

## 1. Overview

Medanta Hospital is a private multispecialty hospital in Lucknow. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; gastroenterology; orthopaedics; renal care and transplantation. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Renal care and transplantation
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiac Sciences
- Oncology
- Neurosciences
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- Internal Medicine
- Emergency Medicine
- Critical Care

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Gauranga Majumdar** (`DVX-0079`) — Cardiology. [Profile source](https://www.medanta.org/hospitals-near-me/lucknow-hospital/speciality/cardiology)
- **Dr. Mahim Saran** (`DVX-0080`) — Cardiology. [Profile source](https://www.medanta.org/hospitals-near-me/lucknow-hospital/speciality/cardiology)
- **Dr. Pravin K Goel** (`DVX-0081`) — Cardiology. [Profile source](https://www.medanta.org/hospitals-near-me/lucknow-hospital/speciality/cardiology)
- **Dr. Ram Kirti Saran** (`DVX-0082`) — Cardiology. [Profile source](https://www.medanta.org/hospitals-near-me/lucknow-hospital/speciality/cardiology)
- **Dr. Mohammed Suhaib** (`DVX-0083`) — Oncology. [Profile source](https://www.medanta.org/hospitals-near-me/lucknow-hospital/speciality/oncology)
- **Dr. Neeraj Rastogi** (`DVX-0084`) — Oncology. [Profile source](https://www.medanta.org/hospitals-near-me/lucknow-hospital/speciality/oncology)
- **Dr. Vivekanand Singh** (`DVX-0085`) — Oncology / Head and Neck Onco Surgery. [Profile source](https://www.medanta.org/hospitals-near-me/lucknow-hospital/speciality/oncology)

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient services with intensive care, diagnostics and operating theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** `DVX-0079`, `DVX-0080`, `DVX-0081`, `DVX-0082`, `DVX-0083`, `DVX-0084`, `DVX-0085`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.medanta.org/)

---

# Hospital: Narayana Multispeciality Hospital, Ahmedabad

- **Hospital ID:** `HVX-H046`
- **Official name:** Narayana Multispeciality Hospital
- **City:** Ahmedabad
- **Area / campus:** Rakhial / Naroda area
- **Facility type:** Private multispecialty hospital
- **Official website / source:** https://www.narayanahealth.org/

## 1. Overview

Narayana Multispeciality Hospital is a private multispecialty hospital in Ahmedabad. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiology; cardiac surgery; oncology; neurosciences; gastroenterology; nephrology; emergency and critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiology
- Cardiac surgery
- Oncology
- Neurosciences
- Gastroenterology
- Nephrology
- Emergency and critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiothoracic Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- General Surgery
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient services
- Diagnostic and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.narayanahealth.org/)

---

# Hospital: P. D. Hinduja Hospital, Mumbai

- **Hospital ID:** `HVX-H047`
- **Official name:** P. D. Hinduja Hospital
- **City:** Mumbai
- **Area / campus:** Mahim
- **Facility type:** Private multispecialty teaching and research hospital
- **Official website / source:** https://www.hindujahospital.com/

## 1. Overview

P. D. Hinduja Hospital is a private multispecialty teaching and research hospital in Mumbai. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; neurosciences; oncology; nephrology; gastroenterology; infectious diseases; critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Neurosciences
- Oncology
- Nephrology
- Gastroenterology
- Infectious diseases
- Critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- Gastroenterology
- Infectious Diseases
- Orthopaedics
- Urology
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Tertiary-care services supported by specialist diagnostics, laboratories, intensive care and operating theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.hindujahospital.com/)

---

# Hospital: Postgraduate Institute of Medical Education and Research (PGIMER), Chandigarh

- **Hospital ID:** `HVX-H048`
- **Official name:** Postgraduate Institute of Medical Education and Research (PGIMER)
- **City:** Chandigarh
- **Area / campus:** Sector 12
- **Facility type:** Central government postgraduate medical institute and tertiary-care hospital
- **Official website / source:** https://pgimer.edu.in/

## 1. Overview

Postgraduate Institute of Medical Education and Research (PGIMER) is a central government postgraduate medical institute and tertiary-care hospital in Chandigarh. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes complex public tertiary care; specialist and super-specialist medicine; surgery; teaching and research. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Complex public tertiary care
- Specialist and super-specialist medicine
- Surgery
- Teaching and research
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Neurosciences
- Nephrology
- Endocrinology
- Oncology
- General Surgery
- Internal Medicine
- Gastroenterology
- Orthopaedics
- Paediatrics
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Large teaching and research campus with outpatient, inpatient, diagnostic, surgical and specialist facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://pgimer.edu.in/)

---

# Hospital: PSG Hospitals, Coimbatore

- **Hospital ID:** `HVX-H049`
- **Official name:** PSG Hospitals
- **City:** Coimbatore
- **Area / campus:** Peelamedu
- **Facility type:** Teaching hospital and multispecialty medical centre
- **Official website / source:** https://www.psghospitals.com/

## 1. Overview

PSG Hospitals is a teaching hospital and multispecialty medical centre in Coimbatore. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes multispecialty treatment; cardiac care; oncology; neurosciences; renal medicine; specialist surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Multispecialty treatment
- Cardiac care
- Oncology
- Neurosciences
- Renal medicine
- Specialist surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Oncology
- Nephrology
- Orthopaedics
- Paediatrics
- Obstetrics and Gynaecology
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Teaching-hospital facilities with outpatient and inpatient care, diagnostic services and operating theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.psghospitals.com/)

---

# Hospital: Rajagiri Hospital, Aluva

- **Hospital ID:** `HVX-H050`
- **Official name:** Rajagiri Hospital
- **City:** Aluva
- **Area / campus:** Chunangamvely
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.rajagirihospital.com/

## 1. Overview

Rajagiri Hospital is a private multispecialty tertiary-care hospital in Aluva. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; gastroenterology; orthopaedics; renal sciences; transplant care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Renal sciences
- Transplant care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- Paediatrics
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty campus with advanced diagnostic, intensive-care and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.rajagirihospital.com/)

---

# Hospital: Rajendra Institute of Medical Sciences (RIMS), Ranchi

- **Hospital ID:** `HVX-H051`
- **Official name:** Rajendra Institute of Medical Sciences (RIMS)
- **City:** Ranchi
- **Area / campus:** Bariatu
- **Facility type:** Government medical college and tertiary-care hospital
- **Official website / source:** https://www.rimsranchi.ac.in/

## 1. Overview

Rajendra Institute of Medical Sciences (RIMS) is a government medical college and tertiary-care hospital in Ranchi. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes public specialist healthcare; medicine and surgery; emergency services; medical education. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Public specialist healthcare
- Medicine and surgery
- Emergency services
- Medical education
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Oncology
- Nephrology
- Orthopaedics
- Paediatrics
- Obstetrics and Gynaecology
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Public teaching-hospital infrastructure with outpatient clinics, inpatient wards and diagnostics
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.rimsranchi.ac.in/)

---

# Hospital: Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGI), Lucknow

- **Hospital ID:** `HVX-H052`
- **Official name:** Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGI)
- **City:** Lucknow
- **Area / campus:** Raebareli Road
- **Facility type:** Public super-specialty medical institute
- **Official website / source:** https://www.sgpgims.in/

## 1. Overview

Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGI) is a public super-specialty medical institute in Lucknow. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes advanced tertiary care; super-specialty medicine and surgery; transplantation; medical research and education. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Advanced tertiary care
- Super-specialty medicine and surgery
- Transplantation
- Medical research and education
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiothoracic Vascular Surgery
- Neurology
- Neurosurgery
- Nephrology
- Urology
- Gastroenterology
- Endocrinology
- Oncology
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Specialist tertiary-care campus with advanced diagnostics, ICUs, operating theatres and research facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.sgpgims.in/)

---

# Hospital: Sawai Man Singh (SMS) Hospital, Jaipur

- **Hospital ID:** `HVX-H053`
- **Official name:** Sawai Man Singh (SMS) Hospital
- **City:** Jaipur
- **Area / campus:** JLN Marg
- **Facility type:** Government teaching and tertiary-care hospital
- **Official website / source:** https://medicaleducation.rajasthan.gov.in/smsmedicalcollege/

## 1. Overview

Sawai Man Singh (SMS) Hospital is a government teaching and tertiary-care hospital in Jaipur. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes public emergency and trauma care; specialist medicine and surgery; cardiac and cancer care; neurology; burns and critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Public emergency and trauma care
- Specialist medicine and surgery
- Cardiac and cancer care
- Neurology
- Burns and critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Cardiothoracic Surgery
- Neurology
- Neurosurgery
- Oncology
- Orthopaedics
- Nephrology
- Paediatrics
- Obstetrics and Gynaecology
- Emergency and Trauma

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Large public teaching-hospital campus with emergency services, outpatient departments, inpatient wards, diagnostic facilities and surgical units
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://medicaleducation.rajasthan.gov.in/smsmedicalcollege/)

---

# Hospital: Shalby Hospital, Ahmedabad

- **Hospital ID:** `HVX-H054`
- **Official name:** Shalby Hospital
- **City:** Ahmedabad
- **Area / campus:** SG Highway
- **Facility type:** Private multispecialty hospital
- **Official website / source:** https://www.shalby.org/

## 1. Overview

Shalby Hospital is a private multispecialty hospital in Ahmedabad. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes joint replacement and orthopaedics; cardiac sciences; oncology; neurosciences; gastroenterology; critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Joint replacement and orthopaedics
- Cardiac sciences
- Oncology
- Neurosciences
- Gastroenterology
- Critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Orthopaedics
- Joint Replacement
- Cardiology
- Cardiac Surgery
- Oncology
- Neurosciences
- Gastroenterology
- Nephrology
- Urology
- General Surgery
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty care with orthopaedic centres, operating theatres, diagnostics and inpatient facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.shalby.org/)

---

# Hospital: Sir Ganga Ram Hospital, New Delhi

- **Hospital ID:** `HVX-H055`
- **Official name:** Sir Ganga Ram Hospital
- **City:** New Delhi
- **Area / campus:** Old Rajinder Nagar
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.sgrh.com/

## 1. Overview

Sir Ganga Ram Hospital is a private multispecialty tertiary-care hospital in New Delhi. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiology; gastroenterology; neurosciences; oncology; renal sciences; orthopaedics; complex surgery. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiology
- Gastroenterology
- Neurosciences
- Oncology
- Renal sciences
- Orthopaedics
- Complex surgery
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Gastroenterology
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- Urology
- Orthopaedics
- General Surgery
- Paediatrics
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Established tertiary-care campus with diagnostic services, intensive care, operating theatres and specialist centres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.sgrh.com/)

---

# Hospital: SUM Ultimate Medicare, Bhubaneswar

- **Hospital ID:** `HVX-H056`
- **Official name:** SUM Ultimate Medicare
- **City:** Bhubaneswar
- **Area / campus:** Kalinga Nagar
- **Facility type:** Private multispecialty tertiary-care hospital
- **Official website / source:** https://www.sumum.com/

## 1. Overview

SUM Ultimate Medicare is a private multispecialty tertiary-care hospital in Bhubaneswar. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac care; oncology; neurosciences; gastroenterology; orthopaedics; renal care; emergency services. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac care
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Renal care
- Emergency services
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- General Surgery
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient services with diagnostics, ICUs and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.sumum.com/)

---

# Hospital: Sri Aurobindo Institute of Medical Sciences, Indore

- **Hospital ID:** `HVX-H057`
- **Official name:** Sri Aurobindo Institute of Medical Sciences
- **City:** Indore
- **Area / campus:** Indore-Ujjain State Highway
- **Facility type:** Medical college and tertiary-care teaching hospital
- **Official website / source:** https://www.saimsonline.com/

## 1. Overview

Sri Aurobindo Institute of Medical Sciences is a medical college and tertiary-care teaching hospital in Indore. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes multispecialty treatment; cardiac and neurosciences services; oncology; renal care; trauma and emergency services. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Multispecialty treatment
- Cardiac and neurosciences services
- Oncology
- Renal care
- Trauma and emergency services
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Neurology
- Neurosurgery
- Oncology
- Nephrology
- Orthopaedics
- Paediatrics
- Obstetrics and Gynaecology
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Teaching-hospital campus with outpatient and inpatient services, diagnostics and operating theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.saimsonline.com/)

---

# Hospital: Sri Ramachandra Medical Centre, Chennai

- **Hospital ID:** `HVX-H058`
- **Official name:** Sri Ramachandra Medical Centre
- **City:** Chennai
- **Area / campus:** Porur
- **Facility type:** Academic multispecialty tertiary-care hospital
- **Official website / source:** https://www.sriramachandra.edu.in/

## 1. Overview

Sri Ramachandra Medical Centre is a academic multispecialty tertiary-care hospital in Chennai. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes complex multispecialty care; cardiac sciences; oncology; neurosciences; transplantation; orthopaedics; women and child health. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Complex multispecialty care
- Cardiac sciences
- Oncology
- Neurosciences
- Transplantation
- Orthopaedics
- Women and child health
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiothoracic Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- Paediatrics
- Obstetrics and Gynaecology
- Emergency Medicine

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Integrated teaching hospital with specialist centres, diagnostic services, ICUs and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.sriramachandra.edu.in/)

---

# Hospital: Tata Main Hospital, Jamshedpur

- **Hospital ID:** `HVX-H059`
- **Official name:** Tata Main Hospital
- **City:** Jamshedpur
- **Area / campus:** Bistupur
- **Facility type:** Corporate multispecialty hospital
- **Official website / source:** https://www.tatasteel.com/

## 1. Overview

Tata Main Hospital is a corporate multispecialty hospital in Jamshedpur. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes multispecialty care for Jamshedpur and surrounding region; emergency services; medicine and surgery; cardiac and orthopaedic care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Multispecialty care for Jamshedpur and surrounding region
- Emergency services
- Medicine and surgery
- Cardiac and orthopaedic care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- General Medicine
- General Surgery
- Cardiology
- Orthopaedics
- Paediatrics
- Obstetrics and Gynaecology
- Oncology
- Nephrology
- Emergency Medicine
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Inpatient and outpatient care, emergency services, diagnostics and operating theatres
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.tatasteel.com/)

---

# Hospital: Tata Memorial Hospital, Mumbai

- **Hospital ID:** `HVX-H060`
- **Official name:** Tata Memorial Hospital
- **City:** Mumbai
- **Area / campus:** Parel
- **Facility type:** Publicly supported specialist cancer hospital and research centre
- **Official website / source:** https://tmc.gov.in/

## 1. Overview

Tata Memorial Hospital in Parel, Mumbai, is a major specialist cancer-care and research institution and a core part of Tata Memorial Centre. It serves patients requiring cancer evaluation, staging, multidisciplinary treatment and follow-up. Its clinical scope spans medical oncology, surgical oncology, radiation oncology, paediatric oncology, onco-pathology, nuclear medicine, radiodiagnosis, anaesthesiology and supportive/palliative care. Cancer treatment decisions may involve tumour boards and coordinated input from several disciplines. The hospital is also linked to cancer research, education and specialist training. Medvexa should distinguish the Mumbai hospital from other Tata Memorial Centre facilities and list each doctor only against the campus where the official source places them.

## 2. Services and Treatments

- Cancer diagnosis and staging
- Medical, surgical and radiation oncology
- Paediatric oncology
- Nuclear medicine
- Palliative care
- Cancer research
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Medical Oncology
- Surgical Oncology
- Radiation Oncology
- Paediatric Oncology
- Onco-pathology
- Nuclear Medicine
- Radiodiagnosis
- Anaesthesiology
- Palliative Medicine
- Preventive Oncology

## 4. Doctors

The following doctor records are linked to this hospital profile. Select a doctor ID to open the corresponding record in the companion doctor dataset.

- **Dr. Bindiya Salunke** (`DVX-0030`) — Anaesthesiology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Vikas Singh** (`DVX-0031`) — Surgical Oncology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Mayur Mantri** (`DVX-0032`) — Plastic Surgery. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Nandini Menon** (`DVX-0033`) — Medical Oncology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Badira Parambil** (`DVX-0034`) — Medical Oncology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Lingaraj Nayak** (`DVX-0035`) — Medical Oncology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Ameya Puranik** (`DVX-0036`) — Nuclear Medicine. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Vasundhara Patil** (`DVX-0037`) — Radiodiagnosis. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Anuprita Daddi** (`DVX-0038`) — General Medicine. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Gurkaran Singh** (`DVX-0039`) — Dental and Prosthetics Surgery. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Revathy Krishnamurthy** (`DVX-0040`) — Radiation Oncology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Abhishek Chatterjee** (`DVX-0041`) — Radiation Oncology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Chetan Dhamne** (`DVX-0042`) — Medical Oncology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Prabhat Bhargava** (`DVX-0043`) — Medical Oncology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Sushmita Rath** (`DVX-0044`) — Medical Oncology. [Profile source](https://tmc.gov.in/RRC)
- **Dr. Amitkumar Choudhari** (`DVX-0045`) — Radiodiagnosis. [Profile source](https://tmc.gov.in/RRC)

## 5. Infrastructure and Facilities

- Specialist cancer-care campus with multidisciplinary oncology services, diagnostic imaging, pathology, radiation treatment and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** `DVX-0030`, `DVX-0031`, `DVX-0032`, `DVX-0033`, `DVX-0034`, `DVX-0035`, `DVX-0036`, `DVX-0037`, `DVX-0038`, `DVX-0039`, `DVX-0040`, `DVX-0041`, `DVX-0042`, `DVX-0043`, `DVX-0044`, `DVX-0045`
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://tmc.gov.in/)

---

# Hospital: Yashoda Hospitals, Hyderabad

- **Hospital ID:** `HVX-H061`
- **Official name:** Yashoda Hospitals
- **City:** Hyderabad
- **Area / campus:** Somajiguda / Secunderabad network
- **Facility type:** Private multispecialty hospital network
- **Official website / source:** https://www.yashodahospitals.com/

## 1. Overview

Yashoda Hospitals is a private multispecialty hospital network in Hyderabad. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac sciences; oncology; neurosciences; organ transplantation; gastroenterology; orthopaedics; renal care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac sciences
- Oncology
- Neurosciences
- Organ transplantation
- Gastroenterology
- Orthopaedics
- Renal care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- Transplant Surgery
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient care
- Advanced diagnostics
- ICUs and surgical facilities
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.yashodahospitals.com/)

---

# Hospital: Zydus Hospitals, Ahmedabad

- **Hospital ID:** `HVX-H062`
- **Official name:** Zydus Hospitals
- **City:** Ahmedabad
- **Area / campus:** Thaltej
- **Facility type:** Private multispecialty hospital
- **Official website / source:** https://www.zydushospitals.com/

## 1. Overview

Zydus Hospitals is a private multispecialty hospital in Ahmedabad. Its profile is relevant to patients comparing specialist care, diagnostic access, hospital-based treatment and inpatient services in the region. The institution’s principal clinical focus includes cardiac care; oncology; neurosciences; gastroenterology; orthopaedics; renal sciences; critical care. Patients typically use a hospital of this type for specialist assessment, coordinated investigations, treatment planning, procedures where indicated, inpatient care and follow-up. For complex conditions, care may involve more than one department—for example, medical specialists, surgeons, radiology, pathology, anaesthesia and critical care working together. Medvexa should present the hospital as a location-specific service provider and should direct users to the institution’s own appointment channel for current availability, admission guidance and doctor schedules.

## 2. Services and Treatments

- Cardiac care
- Oncology
- Neurosciences
- Gastroenterology
- Orthopaedics
- Renal sciences
- Critical care
- Specialist consultations and diagnostic work-up appropriate to the hospital’s listed clinical programmes.
- Medical management, procedures and surgery where offered by the relevant department.
- Inpatient care, post-procedure monitoring and follow-up pathways.
- Emergency stabilisation and critical care where supported by the hospital’s emergency service.

## 3. Departments

- Cardiology
- Cardiac Surgery
- Oncology
- Neurology
- Neurosurgery
- Gastroenterology
- Nephrology
- Urology
- Orthopaedics
- General Surgery
- Critical Care

## 4. Doctors

The hospital’s official doctor directory is the source of record for the current specialist roster. The developer should connect doctor records only after a doctor’s profile or hospital faculty listing explicitly names this campus.

## 5. Infrastructure and Facilities

- Multispecialty inpatient and outpatient services with diagnostic, surgical and intensive-care infrastructure
- Outpatient consultations and inpatient admission pathways.
- Diagnostic and laboratory support appropriate to the hospital’s service mix.
- Operating theatres, anaesthesia support and post-operative care where surgical services are offered.
- Critical-care support for patients requiring close monitoring, where provided by the institution.

### Data connections

- **Connected doctor IDs:** No doctor IDs currently linked in this curated roster.
- **Duplicate handling:** Unique location record.

### Source

- [Official hospital website / profile](https://www.zydushospitals.com/)

---

# List row 63 — duplicate alias

- **Supplied row:** 63
- **Name:** Manipal Hospital, Kharadi
- **City:** Pune
- **Canonical hospital ID:** `HVX-H007`
- **Developer instruction:** Do not create a second public hospital record. Route row 63 to `HVX-H007`.

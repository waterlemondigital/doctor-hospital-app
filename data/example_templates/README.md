# Healthcare Directory Markdown Import Guide

This guide explains how to format your 4 markdown files so they can be parsed and automatically inserted into your Neon PostgreSQL database.

> [!NOTE]
> - **IDs are auto-generated**: You do NOT need to write an ID for any record. IDs and URLs will be created automatically in the database from the name.
> - **Images will be handled separately**: You do NOT need image links in the markdown files. You will provide a folder of images, which will be uploaded to cloud storage and linked to each record via a dedicated script.

---

## 📁 File Structure

When you are ready, provide these 4 files:

| File Name | Purpose | Relationships |
|-----------|---------|---------------|
| `hospitals.md` | Tertiary, multispeciality & public hospitals | Links to **Doctors** & **Laboratories** by Name |
| `doctors.md` | Specialist & consultant doctor profiles | Links to **Hospitals** (with days & timings) & **Laboratories** by Name |
| `laboratories.md` | Pathology labs & diagnostic imaging centers | Links to **Hospitals** & **Doctors** by Name |
| `wellness.md` | Yoga, Naturopathy & Holistic healing centers | **Independent** (no hospital/doctor links required) |

---

## 🔗 How Relationships Work

To link records together, simply refer to them by their **Name**:

### 1. Doctor ⇄ Hospital (With Consultation Schedules)
In `doctors.md`, specify the Hospital Name and visiting hours:
```markdown
#### Hospital Affiliations (Schedule)
- **Hospital**: Sahyadri Super Speciality Hospital
  - **Days**: Mon, Wed, Fri
  - **Timings**: 10:00 AM - 01:00 PM
  - **Note**: OPD Cabin 4, Prior appointment recommended
```
In `hospitals.md`, you can also list the doctors:
```markdown
#### Relations
- **Connected Doctors**: Dr. Charulata Bapaye, Dr. Sudhir Kothari
```

### 2. Doctor / Hospital ⇄ Laboratory
In `doctors.md`:
```markdown
#### Laboratory Affiliations
- **Connected Laboratories**: <Laboratory Name, e.g. Deenanath Mangeshkar Hospital — Pathology Laboratory>
```

In `laboratories.md`:
```markdown
#### Relations
- **Connected Hospitals**: <Hospital Name, e.g. Deenanath Mangeshkar Hospital & Research Center>
- **Connected Doctors**: <Doctor Name>
```

### 3. Wellness Centers (Standalone)
In `wellness.md`, wellness centers do not require any hospital or lab connections because they operate independently.

---

## ⚡ Next Steps
1. Copy each template file from `data/templates/*.template.md` to:
   - `data/hospitals.md`
   - `data/doctors.md`
   - `data/laboratories.md`
   - `data/wellness.md`
2. Fill in or paste your real data following the template structure.
3. Once you provide the files, the automated database importer will ingest all records and relational links into your Neon PostgreSQL database!

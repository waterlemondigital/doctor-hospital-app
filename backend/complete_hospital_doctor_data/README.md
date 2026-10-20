# Medvexa Developer-Ready Markdown Data Pack

This package provides individual Markdown records and full-dataset Markdown files for direct developer use.

## Contents
- `hospitals/`: one `.md` file per hospital record.
- `doctors/`: one `.md` file per doctor record.
- `hospital_database_full.md`: complete hospital database in Markdown.
- `doctor_database_full.md`: complete doctor database in Markdown.
- `HOSPITAL_INDEX.md`: hospital ID/name/file index.
- `DOCTOR_INDEX.md`: doctor ID/name/file index.
- `RELATIONSHIP_SCHEMA.md`: guidance for linking hospital and doctor pages.

## Counts from source files
- Hospital records: 62 (original 63-row list includes a duplicate Kharadi location, represented as an alias in the source dataset).
- Doctor records: 91.

## Relationship rule
Use the `Hospital ID` and `Doctor ID` values as canonical identifiers. Hospital records expose `Connected doctor IDs`; doctor records expose hospital affiliations. Do not create a second doctor profile merely because a doctor has more than one supported hospital affiliation.

## Data integrity note
This pack reformats and separates the existing Markdown content; it does not claim that the underlying research is now complete for every hospital. Continue expanding and validating doctor rosters and hospital-specific facts against official sources before production publication. The PDFs supplied earlier are not modified or included for replacement.

# Hospital–Doctor Relationship Schema

## Canonical IDs
- Hospital IDs: `HVX-H001` onward.
- Doctor IDs: `DVX-0001` onward.

## Linking requirements
1. On a hospital page, render every doctor in `Connected doctor IDs` as a link to the matching doctor record.
2. On a doctor page, render each listed hospital affiliation as a link to the matching hospital record.
3. Use one canonical doctor ID per person across all affiliations.
4. Do not infer affiliations from a city, specialty, search result snippet, or third-party aggregator; require a source that supports the specific institution/campus.
5. Treat consultation timings as time-sensitive and show them only when supported by a current official source.

## Suggested frontmatter pattern for future records
```yaml
---
record_type: hospital # or doctor
id: HVX-H001
name: Example Hospital
city: Bengaluru
source_urls:
  - https://official.example/
connected_doctor_ids:
  - DVX-0001
---
```
The existing records retain their original Markdown field format. This schema is guidance for the developer, not a claim that every record currently includes YAML frontmatter.

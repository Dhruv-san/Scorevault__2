# SCOREVAULT — DATA SOURCE REGISTRY & GOVERNANCE FOUNDATION

## Executive Summary
Scorevault is an Indian education discovery, review, rating, and comparison platform for schools, colleges, and universities. This document defines Scorevault’s Data Governance Framework, Data Source Registry standards, Provenance Tracking policies, and Legal Reuse Principles.

---

## 1. What Counts as an Authoritative Data Source?
Scorevault categorizes data sources into five distinct tiers:

1. **Government Open Data Portals (Tier 1)**:
   - `data.gov.in` (Open Government Data Platform - National Informatics Centre)
   - `NDAP` (National Data and Analytics Platform - NITI Aayog)
   - `MoSPI e-Sankhyiki` (Ministry of Statistics and Programme Implementation)
2. **Central Government Education Ministries & Surveys (Tier 1)**:
   - `UDISE+` (Unified District Information System for Education Plus)
   - `AISHE` (All India Survey on Higher Education)
   - `NIRF` (National Institutional Ranking Framework)
3. **National Examining Boards & Central Chains (Tier 2)**:
   - `CBSE SARAS` (Central Board of Secondary Education)
   - `CISCE` (Council for the Indian School Certificate Examinations)
   - `KVS` (Kendriya Vidyalaya Sangathan) / `NVS` (Navodaya Vidyalaya Samiti)
4. **Professional Regulatory Councils (Tier 3)**:
   - `UGC` (University Grants Commission)
   - `AICTE` (All India Council for Technical Education)
   - `NMC` (National Medical Commission)
   - `BCI` (Bar Council of India) / `PCI` (Pharmacy Council of India) / `CoA` / `NCTE`
5. **State Admission Cells & Higher Ed Portals (Tier 4)**:
   - `UP Higher Education Portal`
   - `Maharashtra CET Cell` (MHT-CET)
   - `Tamil Nadu TNEA Portal`

---

## 2. Source Verification & Status Transition Policy
A data source MUST NOT automatically be ingested. Transitioning a source status requires explicit human administrative audit:

| Status | Meaning & Governance Rule |
| :--- | :--- |
| `DISCOVERED` | Source identified during research; unverified credentials and reuse terms. |
| `UNDER_REVIEW` | Administrator investigating API availability, CAPTCHA restrictions, and legal terms. |
| `VERIFIED` | Source authority, official organization URL, and dataset coverage confirmed. |
| `READY_FOR_INGESTION` | **Explicit Admin Approval Required**: Licensing terms verified and ingestion jobs authorized. |
| `BLOCKED` | Source uses CAPTCHA, authentication walls, or restricts reuse. Automated scraping strictly prohibited. |
| `RETIRED` | Deprecated portal or inactive dataset. |

---

## 3. External Identifier Mapping & Permanent Scorevault ID
Scorevault maintains a permanent internal primary key: `scorevault_institution_id` (UUIDv4).

External identifiers from government registries are mapped as non-interchangeable foreign references via the `ExternalIdentifier` model:
- `UDISE_CODE` (School Education - UDISE+ 11-digit code)
- `AISHE_CODE` (Higher Education - AISHE Code e.g. C-24783)
- `UGC_ID` / `AICTE_ID` / `CBSE_ID` / `NMC_ID` / `BCI_ID` / `PCI_ID` / `COA_ID` / `NCTE_ID`

*Rule*: External IDs are references and MUST NEVER replace the permanent `scorevault_institution_id`.

---

## 4. Field-Level Provenance & Conflict Resolution
Every factual field (e.g. `official_website`, `established_year`, `address`) supports field-level source tracking via the `SourceRecord` model:

- `source_id`: Source reference
- `source_url`: Exact URL extracted from
- `raw_value`: Unmodified payload JSON
- `normalized_value`: Standardized value
- `confidence_score`: Score (0.0 to 1.0)
- `collection_date`: Timestamp of ingestion

### Conflict Resolution Hierarchy:
1. **Tier 1 Government Registries (UDISE+ / AISHE / UGC / NMC)** override Tier 3/4 sources for basic identity, affiliation, and establishment year.
2. **Approved Institution Representative Claims** override general directories for current phone, email, and admissions overview.
3. **AI or Unverified Web Scrapes** are treated as LOW confidence (0.5) and enter human review (`NEEDS_HUMAN_REVIEW`).

---

## 5. Detection of Stale Information & Change Tracking
- `last_checked_date` tracks freshness. Records older than 180 days trigger a freshness score decay.
- `DataChangeHistory` records every field-level mutation with `oldValue`, `newValue`, `changedBy`, and `createdAt`.

---

## 6. Human Review Queue for Uncertain Records
When candidate records have matching confidence below 0.85 or duplicate similarity scores between 0.70 and 0.95, they enter `DuplicateCandidate` and `IngestionRun` with `NEEDS_HUMAN_REVIEW` status. Administrators evaluate them in the Admin Dashboard before merging.

---

## 7. Legal & Access Governance Principles
1. **No Automatic Reuse Assumption**: A source MUST NOT be marked `OPEN_LICENSE` or `REUSE_ALLOWED` merely because it is publicly accessible.
2. **Recorded Legal Evidence**: `licensingEvidenceUrl` and `licensingCheckedDate` must be populated upon verification.
3. **Strict CAPTCHA Policy**: Scorevault DOES NOT bypass CAPTCHAs or session authentication walls. CAPTCHA-protected systems are marked `BLOCKED` or `MANUAL_REVIEW`.

---
*Scorevault Data Governance Framework - Fully Implemented.*

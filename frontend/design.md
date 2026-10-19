# HealthDiscover — System Design & UI/UX Specification (`design.md`)

> **Comprehensive Design System, Token Architecture, Component Anatomy, and Interaction Patterns for the HealthDiscover Pune Healthcare Directory.**

---

## 1. Executive Summary & Brand Philosophy

**HealthDiscover** is an ethical, factual, and verified healthcare discovery platform for hospitals and medical practitioners in Pune, Maharashtra.

### Core Principles
1. **Ethical & Impartial**: Zero commercial promotions, zero pay-to-win hospital rankings, and no fictitious star ratings. Quality of care and medical infrastructure are presented factually.
2. **Clinical Parity**: All summary cards (Hospital and Doctor cards) extract their information strictly from the verified profile source. No arbitrary external marketing claims or discordant attributes.
3. **Taxonomic Integrity**: Departments across hospitals and doctors share standardized slug identifiers (e.g., `cardiology`, `neurology`, `orthopedics`), enabling seamless bidirectional navigation.
4. **Instant Actionability**: Direct statutory emergency triage dispatch, accessible phone actions (e.g., `+91 - 1234567890`), one-click directions, and transparent statutory registry verification.

---

## 2. Color Palette & Token System

HealthDiscover utilizes a clinical, calm, and high-trust palette inspired by surgical steel, oceanic twilight, and crisp cyan accents.

### Primary Color Tokens

| Token Name | Hex Code | HSL / RGB | Intended Application |
|---|---|---|---|
| `--deep-twilight` | `#03045e` | `rgb(3, 4, 94)` | Brand wordmark, primary headlines, active navigation labels, primary card titles. |
| `--bright-teal-blue` | `#0077b6` | `rgb(0, 119, 182)` | Primary CTA buttons, interactive links, iconography highlights, focus rings. |
| `--turquoise-surf` | `#00b4d8` | `rgb(0, 180, 216)` | Secondary buttons, interactive hover transitions, badge accents. |
| `--frosted-blue` | `#90e0ef` | `rgb(144, 224, 239)` | Borders, divider lines, subtle card strokes, active input rings. |
| `--light-cyan` | `#caf0f8` | `rgb(202, 240, 248)` | Subtle tinted backgrounds, pill backgrounds, hero accent highlights. |

### Semantic & Neutral System

| Semantic Role | Variable / Value | Tailwind Class Equivalent | Purpose |
|---|---|---|---|
| **Background Canvas** | `#ffffff` | `bg-white` | Pristine clinical base background. |
| **Card Surface** | `#ffffff` | `bg-white` | Elevation surface with `#90e0ef` hairline border. |
| **Muted Canvas** | `#f8fafc` / `#f0f9fc` | `bg-slate-50` / `bg-[#f0f9fc]` | Secondary section backgrounds and hero glow. |
| **Text Primary** | `#03045e` / `#0f172a` | `text-[#03045e]` / `text-slate-900` | Headings, doctor names, hospital names. |
| **Text Secondary** | `#475569` | `text-slate-600` | Body copy, descriptions, qualifications, addresses. |
| **Text Tertiary / Muted** | `#64748b` / `#94a3b8` | `text-slate-500` / `text-slate-400` | Meta captions, timestamps, registration IDs. |
| **Destructive / Alert** | `#ef4444` | `text-red-500` / `bg-red-50` | Emergency banners, 108 ambulance dispatch, urgent warnings. |
| **Success / Verified** | `#059669` / `#10b981` | `text-emerald-600` / `bg-emerald-50` | Verification checks, NABH accreditations, statutory approvals. |

---

## 3. Typography Architecture

### Font Stack
- **Primary Display & Interface Face**: `'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace Face** (Used for Department Slugs & Registry IDs): `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### Typographic Scale & Hierarchy

| Level | Size / Line Height | Weight | Tracking | Usage |
|---|---|---|---|---|
| **Display 1 (Hero Title)** | `2.5rem - 3.75rem` (40px–60px) | `800` (ExtraBold) | `-0.025em` (Tight) | Homepage Hero statement |
| **H1 (Page Header)** | `1.875rem - 2.25rem` (30px–36px) | `700` (Bold) | `-0.02em` | Hospital / Doctor detail title |
| **H2 (Section Header)** | `1.5rem - 1.75rem` (24px–28px) | `700` (Bold) | `-0.015em` | Directory section headers |
| **H3 (Card Title)** | `1.125rem - 1.25rem` (18px–20px) | `700` (Bold) | `-0.01em` | Hospital names, Doctor names on cards |
| **Body Large** | `1.125rem` (18px) | `400` (Regular) / `500` (Medium) | Normal | Hero subtitle, lead descriptions |
| **Body Regular** | `0.875rem - 1.0rem` (14px–16px) | `400` (Regular) | Normal | Doctor bio summary, hospital description |
| **Caption / Meta** | `0.75rem` (12px) | `500` (Medium) / `600` (SemiBold) | `+0.01em` | Badges, address lines, department pills |
| **Micro Monospace** | `0.625rem - 0.75rem` (10px–12px) | `600` (SemiBold) | Monospace | Department slugs (`#cardiology`), License IDs |

---

## 4. Spacing, Elevation & Corner Radii

### Layout Grid & Spacing Units
- **Container Width**: Full-page fluid layout (`w-full`) edge-to-edge with responsive boundary padding (`px-4 sm:px-6 lg:px-8`), ensuring no unwanted empty space on the sides on desktop or widescreen displays.
- **Vertical Section Rhythm**: `py-8 sm:py-12 lg:py-16` for major section delineation.
- **Card Grid Layout**:
  - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-6`.
  - Filter sidebars: 1/4 column (`lg:col-span-1`) paired with 3/4 content column (`lg:col-span-3`).

### Elevation & Depth System
- **Hairline Border**: `border border-[#90e0ef]/70` ensures accessibility without heavy dark frames.
- **Elevation Levels**:
  - `shadow-2xs`: `0 1px 2px 0 rgb(0 0 0 / 0.05)` — Used on buttons, badges, and search inputs.
  - `shadow-sm`: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` — Default card resting state.
  - `shadow-md` with `group-hover:translate-y-[-2px]`: Used for card hover micro-interactions.
  - `shadow-xl`: Modals, dialogs, and navigation dropdown menus.

### Corner Radii
- **Input Fields & Buttons**: `rounded-lg` (`0.5rem` / 8px) or `rounded-xl` (`0.75rem` / 12px).
- **Cards & Containers**: `rounded-2xl` (`1rem` / 16px) with `overflow-hidden`.
- **Badges & Status Pills**: `rounded-full` (capsule format) or `rounded-md` (`6px`) for technical slugs.

---

## 5. Global Navigation & Header Anatomy

The sticky top header provides continuous orientation and accessibility.

```
+-------------------------------------------------------------------------------------------------------------+
| [HealthDiscover Logo]    [Home]  [Hospitals]  [Doctors]  [About]   | [Quick Search (Cmd+K)]  [Log In] [Sign Up] |
+-------------------------------------------------------------------------------------------------------------+
```

### 1. Brand Zone
- **Wordmark**: `HealthDiscover` rendered in `text-xl font-extrabold text-[#03045e]` paired with a pulse/stethoscope icon in `#0077b6`.
- **Direct Link**: Navigates back to the homepage (`/`).

### 2. Navigation Links
- Horizontal flex list on desktop: Home, Hospitals, Doctors, About & Verification.
- **Active State Indicator**: Bold `#0077b6` text with a subtle active background tint (`bg-[#caf0f8]/50`).
- **Hover State**: Smooth color transition to `#0077b6`.

### 3. Quick Action Utilities
- **Global Search Button**: Pill with magnifying glass icon, placeholder `"Search hospitals, doctors, specialities..."`, and shortcut indicator `⌘K`. Opens the `SearchDialog` modal.
- **Authentication Actions**:
  - **Log In Button**: Ghost/Outline button (`text-[#0077b6] hover:bg-[#caf0f8]/40 border border-[#90e0ef]`).
  - **Sign Up Button**: Solid primary action (`bg-[#0077b6] hover:bg-[#03045e] text-white shadow-2xs`).
  - **Authenticated State**: Displays user avatar with greeting (`Dr./Patient`), trigger dropdown for saved listings, profile, and logout.
- **Mobile Menu Trigger**: Hamburger toggle button opening a full-height sheet (`Sheet`) on viewports `< 768px`.

---

## 6. Homepage Hero & Discovery Zone

### 1. Direct Phone Action Banner
- Replaces generic promotional taglines with a high-trust direct telephone link:
  - Text: `+91 - 1234567890`
  - Icon: `Phone` (Lucide React)
  - Style: Rounded capsule with `bg-white/90`, border `border-[#90e0ef]`, text `text-[#0077b6]`, with `tel:+911234567890`.

### 2. Hero Headline & Factual Subtitle
- **Headline**: `"Find Verified Hospitals & Specialist Doctors in Pune"`
- **Subtitle**: Factual directory infrastructure without commercial bias.

### 3. Instant Search & Department Quick-Filters
- Prominent search input with instant autocomplete trigger.
- Quick filter category tags:
  - `Cardiology` (`#cardiology`)
  - `Neurology` (`#neurology`)
  - `Orthopedics` (`#orthopedics`)
  - `Pediatrics` (`#pediatrics`)
  - `Oncology` (`#oncology`)

---

## 7. Card Design Specifications

### 7.1 Hospital Card Anatomy (`HospitalCard.tsx`)
```
+-------------------------------------------------------+
| [ Aspect 16:9 Hospital Cover Image / Facility Graphic ]|
|   Badge: [Tertiary Multi-Speciality]                  |
+-------------------------------------------------------+
|  Hospital Name (Bold, 18px)                           |
|  [MapPin] Area, City                                  |
|  ---------------------------------------------------- |
|  Factual Department Chips:                            |
|  [Cardiology] [Neurology] [Emergency Care]            |
|  ---------------------------------------------------- |
|  Key Infrastructure (Bed count, ICU, NABH status)     |
|  ---------------------------------------------------- |
|  [Call Hospital Desk]         [View Full Hospital ->] |
+-------------------------------------------------------+
```
- **Image Ratio**: Strictly 16:9 (`aspect-16/9`) with graceful fallback to an architectural SVG if network images fail.
- **Facility Type Badge**: Positioned inside bottom-left of image (`bg-white/95 backdrop-blur-xs font-bold text-[#03045e]`).
- **Data Source**: Every attribute is derived directly from the hospital's verified record.

### 7.2 Doctor Card Anatomy (`DoctorCard.tsx`)
```
+-------------------------------------------------------+
| [Avatar (56x56)]  Doctor Name (Bold 16px)             |
|                   Speciality Name                     |
|                   Department Slug: [cardiology]       |
|                   Degrees & Qualifications            |
+-------------------------------------------------------+
| Professional Overview & Summary (Line-clamp 2)        |
+-------------------------------------------------------+
| Primary Hospital Affiliation & OPD Timings            |
+-------------------------------------------------------+
| [View Verified Profile ->]                            |
+-------------------------------------------------------+
```
- **Avatar**: `h-14 w-14` rounded avatar with initials fallback.
- **Department Slug Match**: Explicit slug chip matching hospital department taxonomy (`doctor.departmentSlug`).
- **Clean Aesthetic**: Free of external commercial clutter, legacy timestamps, or unverified star ratings.

---

## 8. Detail Pages Architectural Structure

### 8.1 Hospital Detail Page (`HospitalDetailPage.tsx`)
1. **Breadcrumb Trail**: `Home / Hospitals / [Hospital Name]`.
2. **Hero Header**:
   - Hospital name, accreditation badges (NABH, NABL), registration reference numbers.
   - Address with one-click Google Maps redirection.
   - Direct emergency desk call action.
3. **Infrastructure Matrix**:
   - Operational bed capacity, ICU beds, ventilator count, emergency trauma tier.
4. **Departments & Facilities**:
   - Interactive list where each department displays its standardized slug. Clicking a department filters consulting doctors in that hospital.
5. **Consulting Doctors Section**:
   - Grid of affiliated doctors actively consulting at this hospital.
6. **Statutory Notice & Disclaimers**:
   - Clear disclosure of data source and last audit timestamp.

### 8.2 Doctor Detail Page (`DoctorDetailPage.tsx`)
1. **Physician Profile Card**:
   - High-resolution verified photo, name, primary speciality, and department slug identifier.
   - Medical Council Registration Number (MCI / MMC) for statutory authenticity.
   - Educational qualifications (MBBS, MD, DM, DNB, Fellowships).
2. **Clinical Focus & Specializations**:
   - Granular procedures and clinical interest areas.
3. **Hospital Affiliations & OPD Schedule**:
   - Tabulated schedule showing which hospital branch the doctor consults at, days of the week, and timing slots.
4. **Inquiry & Consultation Dialogue**:
   - Direct modal trigger (`QueryDialog`) allowing users to submit inquiries.

---

## 9. Interactive Dialogs & Overlays

### 9.1 Authentication Dialog (`AuthDialog.tsx`)
- **Modes**: Tabbed switch between **Log In** and **Sign Up**.
- **Fields (Login)**: Email address, Password, Remember session checkbox.
- **Fields (Sign Up)**: Full name, Email, Password, User role selection (Patient / Healthcare Provider).
- **Styling**: `DialogContent` with `#03045e` heading, `#0077b6` primary button, accessible inputs with `#90e0ef` active focus ring.

### 9.2 Global Search Dialog (`SearchDialog.tsx`)
- **Trigger**: Hotkey `Cmd+K` or clicking search triggers in Header / Hero.
- **Features**: Live debounced querying across both hospital names, locations, doctor names, and clinical specialities.
- **Categorized Results**: Split sections for "Hospitals" and "Doctors" with distinct icons and quick jump links.

### 9.3 Correction & Audit Dialog (`CorrectionDialog.tsx`)
- Facilitates crowdsourced accuracy audits.
- Users can report outdated phone numbers, changed OPD timings, or altered facility infrastructure.

### 9.4 Emergency Dispatch Notice (`EmergencyNoticeCard.tsx`)
- Persistent medical emergency caution.
- Provides immediate 1-tap call access to India's national ambulance service (`108`) and Pune trauma control.

---

## 10. Design Guidelines & Anti-Pattern Checklist

| Permitted Design Pattern | Prohibited Anti-Pattern |
|---|---|
| **Factual Clinical Data**: Bed count, NABH certification, registration IDs. | **No Commercial Rankings**: Avoid "Top 10", "#1 Hospital in Pune", or "Sponsored" tags. |
| **Direct Profile Synchronization**: Cards show exact data present on the detail page. | **No Extraneous Card Data**: Do not display arbitrary third-party snippets not in the profile. |
| **Department Slug Parity**: `cardiology` in hospital matches `cardiology` in doctor. | **No Broken Taxonomic Links**: Department names must not diverge between listings. |
| **High Contrast & Accessible Focus**: `#0077b6` focus rings and minimum 4.5:1 text contrast. | **No Low-Contrast Greys**: Never use unreadable text on light cyan backgrounds. |
| **Responsive Grid & Mobile Touch Targets**: Minimum 44px touch targets on buttons. | **No Cramped Mobile Elements**: Avoid micro-sized buttons on touchscreens. |

---

## 11. Iconography System

Powered by **Lucide React** (`lucide-react`):
- `Building2`: Hospitals, healthcare institutions, clinics.
- `UserRound` / `User`: Physicians, doctors, medical consultants.
- `Stethoscope`: Clinical specialities and medical consultations.
- `Phone`: Verified direct telephone numbers and emergency lines.
- `MapPin`: Hospital geographic location and city zones.
- `Clock`: OPD consulting hours and schedule tables.
- `ShieldCheck`: Statutory medical registry verification and credentials.
- `Search`: Discovery search dialogs and query filters.
- `HeartPulse`: Emergency triage and urgent medical notice.

---

## 12. Responsive Breakpoint Strategy

- **Mobile Viewport (`< 640px`)**:
  - Single column card stack (`grid-cols-1`).
  - Sticky bottom contact bar (`ContactActionsBar`) for immediate call and directions.
  - Hamburger sheet navigation.
- **Tablet Viewport (`640px – 1024px`)**:
  - Two-column grid (`grid-cols-2`).
  - Search dialog triggered from top utility bar.
- **Desktop Viewport (`>= 1024px`)**:
  - Three-column grid (`grid-cols-3`).
  - Split sidebar filtering layout with sticky category selectors.
  - Full desktop navigation with authentication triggers.

---

*Document Version: 1.0.0*  
*Maintained by HealthDiscover Design & Engineering Team*  
*Pune, Maharashtra*

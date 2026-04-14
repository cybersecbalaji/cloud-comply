# CloudComply

An Australian cloud compliance mapping tool that helps organisations understand how AWS and Azure native services satisfy controls from the **Australian ISM** (Information Security Manual, March 2026) and **ISO 27001:2022**.

Static React SPA — no backend, no auth. All 780 control records live in `src/data/controls.json`.

---

## Features

### Dashboard (`/`)
- Summary stat cards: Total Controls, Covered, Partial Coverage, Gaps
- Donut chart: coverage breakdown
- Stacked bar chart: controls by ISM domain × coverage status
- Horizontal bar chart: controls by service category (click to filter Mapping Table)
- Implementation posture progress bar (links to Implementation Tracker)

### Mapping Table (`/mapping`)
- Full filterable/searchable table of all 780 ISM controls
- Framework toggle: **ISM** (780 rows) | **ISO 27001** (deduplicated to ~240 unique ISO controls) | **Both**
- Filters: Cloud, Coverage, Service Category, ISM Guideline, ISO Theme, individual Service, free-text Search
- Clickable control ID pills open the Control Detail Panel
- CSV export of the current filtered view
- Paginated (50 rows per page)

### Gap Analysis (`/gap-analysis`)
- Shows only Partial + Gap controls
- Summary cards per service category
- Grouped bar chart: Partial + Gap by category/domain
- Full gap table with notes and remediation guidance
- PDF export (landscape, full gap list via jsPDF + autoTable)

### Cross-Reference (`/cross-reference`)
- Side-by-side ISM ↔ ISO 27001:2022 view
- Same framework-aware filter set as Mapping Table (ISO mode deduplicates to unique ISO controls)
- Click any row to open the Control Detail Panel

### AI & Containers (`/ai-containers`)
- Tabbed view: **AI/ML Services** | **Container Services**
- Framework filter (ISM / ISO 27001 / Both) with deduplication in ISO mode
- Shared responsibility matrix per tab
- Compliance controls table with local filters (Coverage, ISM Guideline, Responsibility, Cloud)
- CSV export per tab; filters reset on tab switch

### Implementation Tracker (`/implementation`)
- Select compliance scope: Framework (ISM / ISO 27001 / Both), CSP (AWS / Azure / Both), and specific services
- Per-control status tracking: **Not Started** / **In Progress** / **Implemented** / **Accepted Risk**
- Inline notes per control
- All data persisted to `localStorage` — survives page refresh
- Posture bar on Dashboard shows live implementation progress
- Export as JSON (re-importable) or CSV
- ISO mode deduplicates to unique ISO controls; ISM mode shows all 780

### Control Detail Panel
- Slide-in right panel, opens from any page on row/ID click
- Full control fields: ISM ID, guideline, section, description, ISO 27001 mapping, services, coverage badge, notes, source URL
- Copy ID button; validated `https://` source link
- Close via ✕, Escape key, backdrop click, or swipe right (mobile)

### Feedback Widget
- Floating "Feedback" tab pinned to the right edge, visible on every page
- Slide-in panel with name, email (validated), and message fields
- Submits to Formspree; shows success/error state inline

---

## Stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` — no `tailwind.config.js`) |
| State | Zustand 5 |
| Routing | React Router DOM v7 |
| Charts | Recharts |
| PDF export | jsPDF + jspdf-autotable |
| Feedback | Formspree |
| Path alias | `@/` → `src/` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Commands

```bash
npm run dev      # Start Vite dev server with HMR at http://localhost:5173
npm run build    # Type-check (tsc -b) then bundle for production → dist/
npm run preview  # Serve the production build locally
npm run lint     # ESLint across all files
```

---

## Deployment

The output is a fully static SPA. Deploy the `dist/` folder to any static host — no server-side configuration required.

- **Netlify**: drag and drop `dist/` into Netlify Drop
- **Vercel**: `vercel --prod` (auto-detects Vite)
- **S3 / CloudFront**: upload `dist/` contents, set `index.html` as the error document

---

## Data Model

All compliance data lives in `src/data/controls.json` (780 records). Each record is one ISM control dual-mapped to ISO 27001:2022.

Key fields: `control_id`, `ism_guideline`, `ism_section`, `ism_description`, `iso_control_id`, `iso_control_name`, `iso_theme`, `service_category`, `aws_services[]`, `azure_services[]`, `responsibility`, `coverage_status`, `notes`, `source_url`.

Coverage statuses: `Covered` | `Partial` | `Gap`  
ISO themes: `Organisational` | `People` | `Physical` | `Technological`  
Responsibility: `Customer` | `Shared` | `Provider`

---

## Security Notes

- `source_url` validated to start with `https://` before rendering as a link (prevents `javascript:` / `data:` URI injection)
- CSV export uses formula injection prevention (strips leading `=`, `+`, `-`, `@`)
- CSP meta tag set in `index.html`
- No external data fetching at runtime (except Formspree on feedback submit)

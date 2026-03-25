# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Security

Always run `npm run lint` after making any code changes or adding a new file. Review lint output for security-relevant warnings before considering a change complete.

## Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Type-check (tsc -b) then bundle for production
npm run lint       # ESLint across all files
npm run preview    # Serve the production build locally
```

There are no tests in this project.

## Architecture

**CloudComply** is a static React SPA — an Australian ISM and ISO 27001:2022 compliance dashboard mapping controls to AWS and Azure cloud services. There is no backend; all data lives in `src/data/controls.json`.

### Stack

- React 19, TypeScript, Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.js`)
- Zustand 5 for global state
- React Router DOM v7 (nested routes under a shared `Layout`)
- Recharts for charts, jsPDF + jspdf-autotable for PDF export
- Path alias: `@/` → `src/`

### State: `src/store/useStore.ts`

Single Zustand store holds:
- `controls` — the full dataset loaded from `controls.json` at module initialisation
- `filters` — global filter state shared across Mapping Table and Cross-Reference pages
- `selectedControl` — the control currently open in the detail panel (null = panel closed)
- `darkMode` — persisted to `localStorage` under key `cloudcomply-dark`

`useFilteredControls()` is a selector exported from the store that applies all active filters. The `framework` filter (`ISM` / `ISO 27001`) **only re-sorts results — it never reduces row count**, because every control is dual-mapped to both frameworks.

`AWS_SERVICES` and `AZURE_SERVICES` are module-level constants derived once from the dataset and exported for use in service dropdowns.

### Data model: `src/types/index.ts`

The `Control` interface is the single source of truth for all data shapes. Fields include `control_id`, `ism_domain`, `iso_control_id`, `iso_theme`, `service_category`, `aws_services[]`, `azure_services[]`, `responsibility`, `coverage_status`, `notes`, `source_url`.

### Pages

| Route | Page | Purpose |
|---|---|---|
| `/` | Dashboard | Summary stats, Recharts donut/bar charts, quick-filter buttons that set store filters and navigate to `/mapping` |
| `/mapping` | MappingTable | Full filterable/searchable table of all controls; CSV export |
| `/gap-analysis` | GapAnalysis | Controls with `Gap` or `Partial` status; PDF export via jsPDF |
| `/cross-reference` | CrossReference | Side-by-side ISM ↔ ISO 27001 view using the same global filter state |
| `/ai-containers` | AIContainers | Tabbed view (AI/ML vs Containers) with local filter state independent of global store; shared responsibility matrix |

### Layout and shared UI

`Layout` (`src/components/layout/Layout.tsx`) wraps all pages via React Router's `<Outlet>`. It renders `Header`, `Sidebar`, and `ControlDetailPanel` globally. The detail panel is a fixed slide-in overlay triggered by setting `selectedControl` in the store — any page can open it by calling `setSelectedControl(control)`.

### Utilities: `src/lib/utils.ts`

Exports colour maps (`COVERAGE_COLOURS`, `SERVICE_COLOURS`, `ISO_THEME_COLOURS`, `RESPONSIBILITY_COLOURS`, `CHART_COLOURS`, `CATEGORY_CHART_COLOURS`), `SERVICE_TOOLTIPS` (used by `ServiceChip`), the `downloadCSV` helper (includes CSV formula injection prevention), and `cn()` (clsx wrapper).

Security note in `ControlDetailPanel`: `source_url` is validated to start with `https://` before rendering as a link, preventing `javascript:` or `data:` URI injection.

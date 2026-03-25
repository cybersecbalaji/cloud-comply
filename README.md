# CloudComply

An Australian cloud compliance mapping tool that helps organisations understand how AWS and Azure native services satisfy controls from the **Australian ISM** (Information Security Manual, December 2025) and **ISO 27001:2022**.

Static React SPA — no backend, no auth, all data lives in `src/data/controls.json`.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173` with hot module replacement.

### Production build

```bash
npm run build
```

Type-checks with `tsc` then bundles with Vite. Output goes to `dist/`.

### Preview production build

```bash
npm run preview
```

Serves the `dist/` folder locally to verify the production build.

### Lint

```bash
npm run lint
```

Runs ESLint across all files.

## Playwright MCP (Browser Automation)

This repo is configured with the [Playwright MCP](https://github.com/microsoft/playwright-mcp) server for use with Claude Code, enabling browser automation and UI testing directly from the AI assistant.

### Setup

Add the MCP server to your local Claude Code config (one-time):

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

### Verify it is running

```bash
claude mcp list
```

You should see:

```
playwright: npx @playwright/mcp@latest - Connected
```

### Usage

Once connected, Claude Code can control a browser — navigate pages, click elements, take screenshots, fill forms, and run end-to-end checks against the running dev server (`npm run dev`).

## Deployment

The app is a fully static SPA. Deploy the `dist/` folder to any static host (e.g. Netlify Drop, Vercel, S3). No build configuration is required on the host.

## Stack

- React 19, TypeScript, Vite 8
- Tailwind CSS v4
- Zustand 5
- React Router DOM v7
- Recharts, jsPDF + jspdf-autotable

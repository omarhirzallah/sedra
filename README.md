# Sedra · سدرة — Digital Menu

A responsive, mobile-first, bilingual (English / Arabic) QR-code menu for the **Sedra** café, plus a fully working in-browser owner dashboard. Built with **React + Vite**.

## Features

- **Customer menu** — categories, items with name/description/price/photo, tags (Popular, New), available / sold-out states, search, sticky category nav with scroll-spy.
- **Bilingual + RTL** — EN/AR toggle; the whole layout flips to right-to-left in Arabic. Every label, category, item, and description exists in both languages.
- **Table-aware QR links** — `?table=5` shows the table number in the header.
- **Owner dashboard** (`#admin`) — add / edit / delete / reorder categories and items, toggle availability, upload photos, edit AR+EN fields, and edit settings. Changes persist to `localStorage` and appear on the menu instantly.
  - Demo password: `sedra`

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs static site to dist/
npm run start    # serve the build locally (uses $PORT, default 3000)
```

## Deploy on Railway

This repo is Railway-ready (see `railway.json`):

1. **New Project → Deploy from GitHub repo** → select this repo.
2. Railway builds with `npm run build` and serves the static `dist/` via `npm run start` on its `$PORT`.

No environment variables or database required — menu data lives in the browser (`localStorage`), seeded from `src/data/menu.js`.

QR codes for tables should point at `https://<your-domain>/?table=<n>`.

---

The original design prototype exported from Claude Design is preserved under `project/`.

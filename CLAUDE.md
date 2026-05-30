# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Campus Cash Pro is a zero-dependency, single-file personal finance app for college students. The entire app — HTML, CSS, and JavaScript — lives in `CAMPUS-CASH-PRO.html`. There is no build system, no npm, no bundler. Open the file in a browser to run it.

A second file, `CAMPUS-CASH-PRO.local-no-ls.html`, is a variant that does not use `localStorage` (used for environments where local storage is unavailable).

## Running the App

Open `CAMPUS-CASH-PRO.html` directly in a browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). No server or install step needed. For the Netlify serverless function, use the Netlify CLI:

```
netlify dev
```

The Netlify function (`netlify/functions/validate-license.js`) requires the `LEMONSQUEEZY_API_KEY` environment variable to be set.

## Architecture

### Single-file structure (`CAMPUS-CASH-PRO.html`, ~6400 lines)

The file is divided into three logical sections:
1. **CSS** (lines ~1–886): inline styles using CSS custom properties for theming
2. **HTML** (lines ~886–2618): static markup for all pages and modals
3. **JavaScript** (lines ~2619–end): all app logic in vanilla JS, no framework

### State management

A single global `state` object (keyed `campuscash_v2` in `localStorage`) is the source of truth:

```js
const state = loadState(); // merges defaultState with stored JSON
saveState();               // serializes state back to localStorage
```

Monthly budget data is stored under `state.months` keyed as `'YYYY-M'` (e.g., `'2026-4'` for May 2026). A migration runs on boot to move any legacy flat `budgetInputs` into this structure.

### Page/module pattern

Each feature has a dedicated `render*()` function that reads from `state` and writes to the DOM:
- `renderDashboard()`, `renderTx()`, `renderFunds()`, `renderDebts()`, `renderSubs()`, `renderGoals()`, `renderGrowthAccounts()`, `renderGpaCoursesTable()`, `renderScholarships()`, `renderInternships()`, `renderMonthArchive()`

Navigation between pages is handled by `showPage(id, el)`, which toggles `.active` on `.page` divs.

### Pro license gate

Pages in `PRO_PAGES` (`debt`, `subscriptions`, `growth`, `scholarships`, `internships`, `gpa`) are gated behind `isProUnlocked()`. The unlock flow calls the Netlify function at `/.netlify/functions/validate-license`, which validates against the LemonSqueezy API. The result token is stored in `localStorage` under `ccp_pro_unlocked`.

### Theming

Eight color themes are implemented as `body.theme-*` CSS classes (e.g., `body.theme-sage`) that override `--accent`, `--accent2`, and `--accent-light` CSS variables. The theme is stored in `state.theme`.

### Fonts

- **Playfair Display** — headings and branding
- **Lato** — body text
- **JetBrains Mono** — numeric/data display

Loaded from Google Fonts; the app falls back to system fonts offline.

## Deployment

Hosted on Netlify. Configuration in `netlify.toml`:
- Publish directory: `.` (the root, serving the HTML files directly)
- Functions directory: `netlify/functions`
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`) applied globally

## Key localStorage Keys

| Key | Purpose |
|---|---|
| `campuscash_v2` | All user data (state object) |
| `ccp_pro_unlocked` | Pro license token |

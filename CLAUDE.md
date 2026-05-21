# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Campus Cash Pro** — a self-contained single-file college financial toolkit. There is no build step, no package manager, and no server. Each version is one `.html` file with all CSS, HTML, and JavaScript inlined.

**Active file:** `campus-cash-pro-v8_4.html` (~4 300 lines). The `v8_1`–`v8_3` files and `* copy.html` variants are historical snapshots; do not edit them unless the user asks.

## Running the app

Open `campus-cash-pro-v8_4.html` directly in a browser. No server required. To test changes: save the file and hard-refresh (`Cmd+Shift+R`).

## Architecture

### Single-file structure (top to bottom)

1. **`<style>`** — all CSS, organized with `/* ── SECTION ── */` banners
2. **`<body>`** — markup split into named pages (`id="pg-*"`) and modals
3. **`<script>`** — all JS at the bottom, also organized with `// ── SECTION ──` banners

### State / persistence

Everything lives in one flat object:

```js
const state = {
  name, school, year, major, income, theme, currency,
  currentMonth, currentYear,      // active month being viewed
  transactions, funds, debts, courses, goals, notes, subs, scholarships, internships,
  budgetInputs,                   // legacy field (kept for migration)
  months,                         // per-month budget DB: { 'YYYY-M': { budgetInputs: {} } }
  onboardingDone, walkthroughSeen
}
```

Persisted to `localStorage` under key `campuscash_v2` (see `SAVE_KEY`). Always call `persist()` after mutating `state` — it calls `saveState()` which snapshots budget inputs into the correct monthly bucket first.

Monthly budget data is keyed `'YYYY-M'` (e.g. `'2026-4'` for May 2026). Use `monthKey(m, y)`, `curKey()`, `getBucket(m, y)`, and `getCurBucket()` — never construct the key manually.

### Pages / navigation

Each tool is a `<div class="page" id="pg-*">`. Only one page is visible at a time (`.active`). Switch pages with `showPage(id, el)`. Pages:

| ID | Tool |
|----|------|
| `pg-dashboard` | Overview + heatmap |
| `pg-budget` | Monthly budget inputs |
| `pg-archive` | Month history + compare |
| `pg-spending` | Transaction log + CSV import |
| `pg-sinking` | Sinking funds |
| `pg-goals` | Financial goals |
| `pg-debt` | Debt tracker + payoff calc |
| `pg-subscriptions` | Subscription tracker |
| `pg-gpa` | GPA calculator |
| `pg-notes` | Money journal |
| `pg-scholarships` | Scholarships & financial aid |
| `pg-internships` | Internship tracker |
| `pg-tips` | Money tips |
| `pg-settings` | Settings + export/import/reset |

### Theming

Four themes (`sage`, `rust`, `gold`, `blue`) applied by `selectTheme(t, el)`, which sets CSS custom properties `--accent`, `--accent-light`, `--accent2` on `document.documentElement`. All theme-aware components reference `var(--accent, var(--sage))` as a fallback so they work before a theme is chosen.

### Key patterns

- **Render functions** — each page has a `render*()` function (e.g. `renderFunds()`, `renderTx()`) that rebuilds its DOM from `state`. Call the relevant render function after any state change.
- **`calcAll()`** — recalculates income totals, budget bars, and dashboard metrics. Call after any budget or transaction change.
- **Income IDs** — the seven income input element IDs are listed in `INCOME_IDS`; `getTotalIncome()` sums them.
- **Category constants** — `CAT_COLORS` and `CAT_LABELS` map the 8 spending categories (`food`, `rent`, `transport`, `school`, `fun`, `health`, `subscriptions`, `other`) plus `income`.
- **CSV import** — `parseImportCSV()` handles debit and credit card CSV formats, auto-categorizes via `IMP_CAT_KEYWORDS`, and deduplicates via `markDuplicates()`. The account type (`debit`/`credit`) flips sign logic.
- **Toast notifications** — `toast(msg)` for transient feedback; `persist(msg)` for save confirmations.

### Modals

- `#onboard-overlay` — first-run onboarding (multi-step; hidden after `launchApp()`)
- `#import-overlay` — bank CSV import (3-step: upload → preview → success)
- `#more-sheet` — mobile bottom sheet navigation
- `#init-loader` — splash screen, fades out on boot
- `.walkthrough-overlay` — guided feature walkthrough

# Campus Cash Pro — Debt Tracker Upgrade Codex

> **Apply to both files:**
> - `CAMPUS-CASH-PRO.html`
> - `CAMPUS-CASH-PRO_local-no-ls.html`
>
> Do not rely on exact line numbers — search for the anchor strings noted in each step.

---

## Overview of Changes

| # | Change | Impact |
|---|--------|--------|
| 1 | Repayment Stage Toggle | Changes entire debt UI context based on student's real situation |
| 2 | Live Interest Accrual Counter | Wake-up moment for in-school/grace students watching money tick away |
| 3 | Projected Balance at Graduation | Shows the number nobody tells them before they graduate |
| 4 | Payment Milestone Celebrations | Confetti + "you saved $X" flash on every logged payment |
| 5 | High-Rate Urgency Color Coding | Visual fire treatment on anything above 15% APR |

---

## STEP 1 — Add New CSS Classes

**Where:** Inside the `<style>` block, near the existing `.debt-item`, `.debt-header`, `.debt-amount` cluster. Search for `.debt-insight-bar` and add the following block directly after it.

```css
/* ── DEBT STAGE TOGGLE ── */
.debt-stage-toggle{display:flex;gap:0;border:1.5px solid var(--border2);border-radius:10px;overflow:hidden;margin-bottom:1.2rem;background:var(--cream2);}
.debt-stage-btn{flex:1;padding:9px 6px;font-size:12.5px;font-weight:700;font-family:'Lato',sans-serif;border:none;background:transparent;cursor:pointer;color:var(--ink3);letter-spacing:0.2px;transition:background .15s,color .15s;}
.debt-stage-btn.active{background:var(--ink);color:var(--cream);border-radius:8px;}
.debt-stage-label{font-size:11px;text-transform:uppercase;letter-spacing:0.6px;color:var(--ink4);margin-bottom:8px;font-weight:700;}

/* ── INTEREST ACCRUAL COUNTER ── */
.debt-accrual-banner{background:var(--rust-light);border:1.5px solid rgba(196,92,58,0.25);border-radius:var(--r-lg);padding:1.2rem 1.4rem;margin-bottom:1.2rem;display:none;}
.debt-accrual-banner.visible{display:block;}
.debt-accrual-headline{font-size:13px;color:var(--rust);font-weight:700;margin-bottom:4px;}
.debt-accrual-ticker{font-family:'JetBrains Mono',monospace;font-size:2rem;font-weight:600;color:var(--rust);line-height:1;}
.debt-accrual-sub{font-size:12px;color:var(--ink3);margin-top:6px;line-height:1.5;}

/* ── GRADUATION CALCULATOR ── */
.debt-grad-calc{background:var(--blue-light);border:1.5px solid rgba(58,96,128,0.2);border-radius:var(--r-lg);padding:1.2rem 1.4rem;margin-bottom:1.2rem;display:none;}
.debt-grad-calc.visible{display:block;}
.debt-grad-result{margin-top:1rem;padding:1rem;background:rgba(255,255,255,0.6);border-radius:var(--r);text-align:center;}
.debt-grad-result-val{font-family:'JetBrains Mono',monospace;font-size:1.8rem;font-weight:700;color:var(--blue);}
.debt-grad-result-lbl{font-size:12px;color:var(--ink3);margin-top:4px;}
.debt-grad-result-sub{font-size:11.5px;color:var(--ink4);margin-top:2px;}

/* ── URGENCY COLOR CODING ── */
.debt-item.urgency-critical{border-left:4px solid var(--rust);background:linear-gradient(to right,rgba(196,92,58,0.04),white 60%);}
.debt-item.urgency-high{border-left:4px solid var(--gold);background:linear-gradient(to right,rgba(191,140,48,0.04),white 60%);}
.debt-item.urgency-low{border-left:4px solid var(--sage);background:linear-gradient(to right,rgba(74,103,65,0.03),white 60%);}
.debt-urgency-badge{font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;}
.urgency-critical .debt-urgency-badge{background:rgba(196,92,58,0.12);color:var(--rust);}
.urgency-high .debt-urgency-badge{background:rgba(191,140,48,0.15);color:var(--gold);}

/* ── CONFETTI CELEBRATION ── */
@keyframes confetti-fall{
  0%{transform:translateY(-20px) rotate(0deg);opacity:1;}
  100%{transform:translateY(100vh) rotate(720deg);opacity:0;}
}
.confetti-piece{position:fixed;width:10px;height:10px;border-radius:2px;pointer-events:none;z-index:9999;animation:confetti-fall 1.8s ease-in forwards;}
.debt-payment-flash{position:fixed;top:80px;left:50%;transform:translateX(-50%);background:var(--sage);color:white;border-radius:var(--r-lg);padding:14px 22px;font-size:14px;font-weight:700;text-align:center;z-index:9998;box-shadow:var(--shadow-lg);animation:fadeUp .3s ease, flashFade 2.8s ease forwards;}
@keyframes flashFade{0%{opacity:1;transform:translateX(-50%) translateY(0);}70%{opacity:1;}100%{opacity:0;transform:translateX(-50%) translateY(-16px);}}
```

---

## STEP 2 — Add State Variables

**Where:** Find the block where `state` is defined — search for `state.debts` initialization (likely something like `debts: []` inside a state object, near the top of the `<script>` block).

Add these two properties alongside the existing debt-related state:

```js
// Inside the state object, near debts: []
debtStage: 'repayment',       // 'in-school' | 'grace' | 'repayment'
debtAccrualStart: null,       // timestamp when accrual counter started
totalPaymentsMade: 0,         // cumulative payments logged (for milestones)
```

---

## STEP 3 — Update the Debt Tracker HTML Page

**Where:** Find the Debt Tracker page section — search for `id="pg-debt"`. The changes below replace/extend the existing page header and cards inside that section.

### 3a — Replace the page header paragraph

Find the `<p>` tag directly inside the `pg-debt` page header (the one that says something like *"See exactly what you owe, how long payoff takes..."*).

**Replace that `<p>` with:**

```html
<p>Know where you stand. Track what you owe, watch your strategy, and never be surprised by your balance again.</p>
```

### 3b — Insert Stage Toggle + Accrual Banner + Grad Calculator

**After** the closing `</div>` of the `<div class="ph">` page header block, and **before** the summary strip (`id="debt-summary-row"`), insert the following block:

```html
<!-- Stage toggle -->
<div class="debt-stage-label">Where are you right now?</div>
<div class="debt-stage-toggle">
  <button class="debt-stage-btn" id="stage-btn-school" onclick="setDebtStage('in-school')">🎓 In School</button>
  <button class="debt-stage-btn" id="stage-btn-grace" onclick="setDebtStage('grace')">⏳ Grace Period</button>
  <button class="debt-stage-btn active" id="stage-btn-repayment" onclick="setDebtStage('repayment')">💳 In Repayment</button>
</div>

<!-- Live accrual counter (in-school + grace only) -->
<div class="debt-accrual-banner" id="debt-accrual-banner">
  <div class="debt-accrual-headline">🔥 Interest accruing on your unsubsidized loans right now</div>
  <div class="debt-accrual-ticker" id="debt-accrual-ticker">$0.00</div>
  <div class="debt-accrual-sub">
    This counter started when you loaded this page. Unsubsidized loans accrue interest from day one — before you graduate, before you make a single payment. <strong id="debt-accrual-daily">$0.00/day</strong> adding up silently.
  </div>
</div>

<!-- Graduation balance calculator (in-school only) -->
<div class="debt-grad-calc" id="debt-grad-calc">
  <div class="card-label" style="color:var(--blue)">🎓 Projected balance at graduation</div>
  <p style="font-size:13px;color:var(--ink3);margin-bottom:1rem;line-height:1.55">The number nobody tells you. Based on your current balances and rates, here's what you'll actually owe when you walk across that stage.</p>
  <div class="field-row">
    <div class="field">
      <label>Expected graduation month</label>
      <select id="d-grad-month">
        <option value="4">May</option><option value="7">August</option>
        <option value="11">December</option><option value="3">April</option>
      </select>
    </div>
    <div class="field">
      <label>Graduation year</label>
      <input type="number" id="d-grad-year" placeholder="e.g. 2027" min="2025" max="2035">
    </div>
  </div>
  <div class="debt-grad-result" id="debt-grad-result" style="display:none">
    <div class="debt-grad-result-val" id="debt-grad-val">—</div>
    <div class="debt-grad-result-lbl">Projected balance at graduation</div>
    <div class="debt-grad-result-sub" id="debt-grad-sub">That's <span id="debt-grad-added">$0</span> in interest added before you even start repaying.</div>
  </div>
  <button class="btn btn-primary" style="margin-top:1rem" onclick="calcGradProjection()">Calculate</button>
</div>
```

### 3c — Update the "Add a debt" form

**Find** the existing `<div class="field">` for "Min payment ($/mo)" inside the add-debt card.

**Wrap it** in a conditional div so it only shows during repayment mode:

```html
<div id="d-min-field" class="field">
  <label>Min payment ($/mo) <span id="d-min-hint" style="font-size:11px;color:var(--ink4);font-weight:400"></span></label>
  <input type="number" id="d-min" placeholder="0">
</div>
```

**Also add** a loan subtype selector directly after the existing "Type" dropdown (still inside the field-row). This lets the app know if it's unsubsidized:

```html
<div class="field" id="d-subtype-field" style="display:none">
  <label>Loan subtype</label>
  <select id="d-subtype">
    <option value="unsubsidized">Unsubsidized (interest accrues now)</option>
    <option value="subsidized">Subsidized (no interest while in school)</option>
  </select>
</div>
```

Add a small `onchange` to the existing Type dropdown to show/hide this subtype field:

```html
<!-- Find the existing <select id="d-type"> and add onchange: -->
<select id="d-type" onchange="toggleSubtypeField()">
```

---

## STEP 4 — Add New JavaScript Functions

**Where:** Find the `function addDebt()` block in the `<script>` section. Add all of the following functions **directly before** `function addDebt()`.

```js
// ── DEBT STAGE TOGGLE ──────────────────────────────────────────
function setDebtStage(stage) {
  state.debtStage = stage;
  ['school','grace','repayment'].forEach(s => {
    const btn = document.getElementById('stage-btn-' + s);
    if (btn) btn.classList.toggle('active', s === stage.replace('in-',''));
  });
  // Fix: map 'in-school' -> 'school' for the button id
  const btnId = 'stage-btn-' + (stage === 'in-school' ? 'school' : stage);
  document.querySelectorAll('.debt-stage-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(btnId);
  if (activeBtn) activeBtn.classList.add('active');

  const accrualBanner = document.getElementById('debt-accrual-banner');
  const gradCalc = document.getElementById('debt-grad-calc');
  const minHint = document.getElementById('d-min-hint');
  const subtypeField = document.getElementById('d-subtype-field');

  if (stage === 'in-school') {
    if (accrualBanner) accrualBanner.classList.add('visible');
    if (gradCalc) gradCalc.classList.add('visible');
    if (minHint) minHint.textContent = '(optional — loans likely deferred)';
    if (subtypeField) subtypeField.style.display = 'block';
    startAccrualCounter();
  } else if (stage === 'grace') {
    if (accrualBanner) accrualBanner.classList.add('visible');
    if (gradCalc) gradCalc.classList.remove('visible');
    if (minHint) minHint.textContent = '(optional — grace period, not yet due)';
    if (subtypeField) subtypeField.style.display = 'block';
    startAccrualCounter();
  } else {
    if (accrualBanner) accrualBanner.classList.remove('visible');
    if (gradCalc) gradCalc.classList.remove('visible');
    if (minHint) minHint.textContent = '';
    if (subtypeField) subtypeField.style.display = 'none';
    stopAccrualCounter();
  }

  persist();
  renderDebts(); // re-render to apply any stage-dependent UI changes
}

function toggleSubtypeField() {
  const type = document.getElementById('d-type')?.value;
  const field = document.getElementById('d-subtype-field');
  if (field) field.style.display = (type === 'Student loan') ? 'block' : 'none';
}

// ── ACCRUAL COUNTER ────────────────────────────────────────────
let _accrualInterval = null;
let _accrualStartTime = null;
let _dailyAccrualRate = 0;

function startAccrualCounter() {
  stopAccrualCounter();
  _accrualStartTime = Date.now();
  _dailyAccrualRate = state.debts.reduce((sum, d) => {
    // Only count unsubsidized loans (type === 'Student loan' and subtype marked, or all student loans as conservative estimate)
    if (d.type === 'Student loan' && d.subtype !== 'subsidized') {
      return sum + (d.bal * (d.rate / 100) / 365);
    }
    return sum;
  }, 0);

  const dailyEl = document.getElementById('debt-accrual-daily');
  if (dailyEl) dailyEl.textContent = '$' + _dailyAccrualRate.toFixed(2) + '/day';

  if (_dailyAccrualRate <= 0 && state.debts.length === 0) {
    // No debts yet — show estimated message
    const ticker = document.getElementById('debt-accrual-ticker');
    if (ticker) ticker.textContent = 'Add your loans above to see live accrual';
    return;
  }

  _accrualInterval = setInterval(() => {
    const elapsed = (Date.now() - _accrualStartTime) / 1000; // seconds
    const accrued = (_dailyAccrualRate / 86400) * elapsed;
    const ticker = document.getElementById('debt-accrual-ticker');
    if (ticker) ticker.textContent = '$' + accrued.toFixed(4);
  }, 100);
}

function stopAccrualCounter() {
  if (_accrualInterval) { clearInterval(_accrualInterval); _accrualInterval = null; }
}

// ── GRADUATION PROJECTION ──────────────────────────────────────
function calcGradProjection() {
  const monthEl = document.getElementById('d-grad-month');
  const yearEl = document.getElementById('d-grad-year');
  if (!monthEl || !yearEl || !yearEl.value) { toast('Enter your graduation year'); return; }

  const gradYear = parseInt(yearEl.value);
  const gradMonth = parseInt(monthEl.value);
  const now = new Date();
  const gradDate = new Date(gradYear, gradMonth, 1);
  const monthsUntilGrad = Math.max(0, (gradDate.getFullYear() - now.getFullYear()) * 12 + (gradDate.getMonth() - now.getMonth()));

  if (monthsUntilGrad === 0) { toast('Graduation date must be in the future'); return; }

  let projectedTotal = 0;
  let currentTotal = 0;
  state.debts.forEach(d => {
    currentTotal += d.bal;
    if (d.type === 'Student loan' && d.subtype !== 'subsidized') {
      // Compound monthly for unsubsidized
      const r = d.rate / 100 / 12;
      projectedTotal += d.bal * Math.pow(1 + r, monthsUntilGrad);
    } else {
      // Subsidized or non-student loans: no change pre-graduation
      projectedTotal += d.bal;
    }
  });

  const added = projectedTotal - currentTotal;
  const resultEl = document.getElementById('debt-grad-result');
  const valEl = document.getElementById('debt-grad-val');
  const subEl = document.getElementById('debt-grad-sub');
  const addedEl = document.getElementById('debt-grad-added');

  if (resultEl) resultEl.style.display = 'block';
  if (valEl) valEl.textContent = state.currency + Math.round(projectedTotal).toLocaleString('en-US');
  if (addedEl) addedEl.textContent = state.currency + Math.round(added).toLocaleString('en-US');
  if (subEl) {
    const yr = Math.floor(monthsUntilGrad / 12);
    const mo = monthsUntilGrad % 12;
    const timeStr = yr > 0 ? `${yr} year${yr>1?'s':''} ${mo > 0 ? mo + ' months' : ''}` : `${mo} months`;
    subEl.innerHTML = `That's <strong id="debt-grad-added">${state.currency}${Math.round(added).toLocaleString('en-US')}</strong> added silently over ${timeStr.trim()} — before you make a single payment.`;
  }
}

// ── CONFETTI CELEBRATION ───────────────────────────────────────
function fireConfetti() {
  const colors = ['#4A6741','#BF8C30','#C45C3A','#3A6080','#6B9362'];
  for (let i = 0; i < 38; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left:${Math.random()*100}vw;
      top:-10px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${6+Math.random()*8}px;
      height:${6+Math.random()*8}px;
      border-radius:${Math.random()>0.5?'50%':'2px'};
      animation-delay:${Math.random()*0.6}s;
      animation-duration:${1.4+Math.random()*1}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
}

function showPaymentFlash(debtName, savedInterest, newBalance) {
  const existing = document.querySelector('.debt-payment-flash');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'debt-payment-flash';
  const savedLine = savedInterest > 0.5
    ? `<div style="font-size:12px;font-weight:400;margin-top:4px;opacity:0.9">You just saved ~${state.currency}${savedInterest.toFixed(2)} in future interest 💚</div>`
    : '';
  const remainLine = newBalance > 0
    ? `<div style="font-size:12px;font-weight:400;margin-top:2px;opacity:0.85">${state.currency}${Math.round(newBalance).toLocaleString('en-US')} still remaining on ${debtName}</div>`
    : `<div style="font-size:12px;font-weight:400;margin-top:2px;opacity:0.85">🎉 ${debtName} is fully paid off!</div>`;
  el.innerHTML = `✅ Payment logged!${savedLine}${remainLine}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
```

---

## STEP 5 — Modify `addDebt()` to Store Subtype

**Find** the existing `function addDebt()`. Inside it, find where the new debt object is pushed to `state.debts`. Add the `subtype` field alongside the existing properties:

```js
// Add this line inside the state.debts.push({...}) object in addDebt():
subtype: document.getElementById('d-subtype')?.value || 'unsubsidized',
```

Also, after `renderDebts()` is called inside `addDebt()`, add:

```js
// After renderDebts() call in addDebt():
if (state.debtStage === 'in-school' || state.debtStage === 'grace') {
  startAccrualCounter(); // refresh accrual rate with new debt included
}
```

---

## STEP 6 — Modify `logPayment()` to Trigger Celebrations

**Find** the existing `function logPayment(i)`. Replace the entire function with this updated version:

```js
function logPayment(i) {
  const input = document.getElementById('debt-pay-amt-'+i);
  const amt = +input.value;
  if (!amt || amt <= 0) { toast('Enter a payment amount'); return; }
  const d = state.debts[i];

  // Calculate interest that would have accrued on this amount over next month
  const interestSaved = amt * (d.rate / 100 / 12);

  const prevBal = d.bal;
  if (amt >= d.bal) {
    d.bal = 0;
  } else {
    d.bal = Math.round((d.bal - amt) * 100) / 100;
  }

  state.totalPaymentsMade = (state.totalPaymentsMade || 0) + amt;
  input.value = '';

  // Fire celebration
  fireConfetti();
  showPaymentFlash(d.name, interestSaved, d.bal);

  renderDebts();
  persist();
}
```

---

## STEP 7 — Modify `renderDebts()` to Apply Urgency Styling

**Find** the `function renderDebts()`. Inside it, find where each debt card template string is generated — look for the line that starts: `` return `<div class="debt-item`` ``

**Replace** that opening class line with the following logic. Add this block just before the template literal starts:

```js
// Add this before the .map() template literal in renderDebts():
// Determine urgency class per debt
function debtUrgencyClass(rate) {
  if (rate >= 20) return 'urgency-critical';
  if (rate >= 15) return 'urgency-high';
  if (rate <= 7)  return 'urgency-low';
  return '';
}
function debtUrgencyBadge(rate) {
  if (rate >= 20) return `<span class="debt-urgency-badge">🔥 High priority</span>`;
  if (rate >= 15) return `<span class="debt-urgency-badge">⚠️ Watch this</span>`;
  return '';
}
```

Then in the template literal itself, change the opening div from:

```js
// BEFORE (find this pattern):
return `<div class="debt-item${isPaidOff?' debt-paid':''}">
```

**To:**

```js
// AFTER:
const urgencyClass = isPaidOff ? '' : debtUrgencyClass(d.rate);
const urgencyBadge = isPaidOff ? '' : debtUrgencyBadge(d.rate);
return `<div class="debt-item ${urgencyClass}${isPaidOff?' debt-paid':''}">
```

Then find the section that renders the `debt-rate-badge` span (shows APR %) and add the urgency badge right after it:

```js
// BEFORE:
<span class="debt-rate-badge">${d.rate}% APR</span>

// AFTER:
<span class="debt-rate-badge">${d.rate}% APR</span>${urgencyBadge}
```

---

## STEP 8 — Restore Stage on Load

**Where:** Find the section where app state is restored from localStorage/sessionStorage (search for `renderDebts()` calls that happen on page init — likely inside a `loadState()`, `init()`, or similar startup function).

After `renderDebts()` is called on load, add:

```js
// After renderDebts() on initial load:
if (state.debtStage && state.debtStage !== 'repayment') {
  setDebtStage(state.debtStage);
} else {
  setDebtStage('repayment'); // default
}
```

---

## STEP 9 — Update the Empty State Message

**Find** the `renderDebts()` function. Inside it, find the `empty-text` string that says something like:

> *"No debts yet. Add your first one above to see your payoff timeline."*

**Replace it with:**

```js
c.innerHTML = `<div class="empty">
  <div class="empty-icon">📉</div>
  <div class="empty-text">The average college student graduates with <strong>$37,000 in debt</strong>. Add your first loan above — know your number before it surprises you.</div>
</div>`;
```

---

## Quick Reference — New Element IDs

| ID | Purpose |
|----|---------|
| `stage-btn-school` | In School toggle button |
| `stage-btn-grace` | Grace Period toggle button |
| `stage-btn-repayment` | In Repayment toggle button |
| `debt-accrual-banner` | Live interest counter container |
| `debt-accrual-ticker` | Ticking dollar counter display |
| `debt-accrual-daily` | Daily rate label |
| `debt-grad-calc` | Graduation projection card |
| `d-grad-month` | Grad month select |
| `d-grad-year` | Grad year input |
| `debt-grad-result` | Projection output container |
| `debt-grad-val` | Projected balance value |
| `debt-grad-sub` | Projection subtitle/context |
| `d-subtype-field` | Subsidized/unsubsidized selector wrapper |
| `d-subtype` | Subsidized/unsubsidized select |
| `d-min-hint` | Contextual hint next to min payment |

## New `state` Properties

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `debtStage` | string | `'repayment'` | Persisted to storage |
| `debtAccrualStart` | number\|null | `null` | Session-only, reset on load |
| `totalPaymentsMade` | number | `0` | Cumulative for future milestone logic |

Each debt object in `state.debts[]` gains one new property:

| Property | Type | Default |
|----------|------|---------|
| `subtype` | string | `'unsubsidized'` |

---

## Notes & Edge Cases

- **Accrual counter resets on page reload** — this is intentional and desirable. The drama of watching it tick from `$0.00` is the point.
- **`calcGradProjection()` only compounds unsubsidized loans** — subsidized loans are correctly held flat since the government covers interest while in school.
- **Confetti uses no external library** — pure CSS animation. Safe for both HTML files.
- **`debtUrgencyClass` and `debtUrgencyBadge` are defined inside `renderDebts()`** — if you prefer, hoist them out as standalone functions before `renderDebts()`.
- **The `d-subtype-field` only shows when Type = "Student loan"** — controlled by `toggleSubtypeField()` on the Type dropdown's `onchange`.
- **Both HTML files are structurally identical in the debt section** — all changes apply 1:1. The only difference is the local file has no localStorage calls, so ensure `persist()` calls in new functions are already handled by that file's existing pattern.

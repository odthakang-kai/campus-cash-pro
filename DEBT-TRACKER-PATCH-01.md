# Debt Tracker — Quick Patch 01

Apply to both files: `CAMPUS-CASH-PRO.html` and `CAMPUS-CASH-PRO_local-no-ls.html`

---

## 1 — Remove Emojis from Stage Toggle Buttons

**Where:** Search for `id="stage-btn-school"` in the Debt Tracker page section.

Find the three stage toggle buttons and remove only the emojis from the label text:

```html
<!-- BEFORE -->
<button class="debt-stage-btn" id="stage-btn-school" onclick="setDebtStage('in-school')">🎓 In School</button>
<button class="debt-stage-btn" id="stage-btn-grace" onclick="setDebtStage('grace')">⏳ Grace Period</button>
<button class="debt-stage-btn active" id="stage-btn-repayment" onclick="setDebtStage('repayment')">💳 In Repayment</button>

<!-- AFTER -->
<button class="debt-stage-btn" id="stage-btn-school" onclick="setDebtStage('in-school')">In School</button>
<button class="debt-stage-btn" id="stage-btn-grace" onclick="setDebtStage('grace')">Grace Period</button>
<button class="debt-stage-btn active" id="stage-btn-repayment" onclick="setDebtStage('repayment')">In Repayment</button>
```

---

## 2 — Double the Payment Flash Display Time

Two touches in the same area — one in CSS, one in JS.

**CSS:** Search for `.debt-payment-flash` in the `<style>` block. Change the `flashFade` animation duration and update the hold keyframe:

```css
/* BEFORE */
animation: fadeUp .3s ease, flashFade 2.8s ease forwards;
@keyframes flashFade { 0%{opacity:1;...} 70%{opacity:1;} 100%{opacity:0;...} }

/* AFTER */
animation: fadeUp .3s ease, flashFade 5.6s ease forwards;
@keyframes flashFade { 0%{opacity:1;...} 80%{opacity:1;} 100%{opacity:0;...} }
```

**JS:** Search for `showPaymentFlash` in the `<script>` block. Change the `setTimeout` that removes the element:

```js
// BEFORE
setTimeout(() => el.remove(), 3200);

// AFTER
setTimeout(() => el.remove(), 6400);
```

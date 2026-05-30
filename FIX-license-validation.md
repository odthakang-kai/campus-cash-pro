# FIX: License Key Validation — Campus Cash Pro
**Run these changes exactly as written. Do not paraphrase or reinterpret.**

---

## Fix 1 — Create the Netlify function at the correct path

The file `validate-license.js` currently sits at the project root. Netlify will never find it there. You must create the correct folder and file.

**Action:** Create the file `netlify/functions/validate-license.js` with the following content (create the `netlify/functions/` directory if it doesn't exist):

```js
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let key;
  try {
    const body = JSON.parse(event.body);
    key = (body.key || '').trim();
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'Bad request' })
    };
  }

  if (!key) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'No key provided' })
    };
  }

  if (!process.env.LEMONSQUEEZY_API_KEY) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'Validation service unavailable' })
    };
  }

  try {
    // Step 1: Try to activate the license (first-time use).
    // If already activated on this instance, this will fail — that's fine, we then validate instead.
    const activateRes = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`
      },
      body: JSON.stringify({
        license_key: key,
        instance_name: 'Campus Cash Pro Web'
      })
    });

    const activateData = await activateRes.json();

    // LS returns activated:true on fresh activation
    if (activateRes.ok && activateData?.activated === true) {
      const token = Buffer.from(JSON.stringify({
        key: key.slice(-8),
        ts: Date.now(),
        v: 1
      })).toString('base64');

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid: true, token })
      };
    }

    // Step 2: Activation failed (already activated or invalid).
    // Fall through to validate to confirm the key is legitimately already active.
    const validateRes = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`
      },
      body: JSON.stringify({
        license_key: key,
        instance_name: 'Campus Cash Pro Web'
      })
    });

    const validateData = await validateRes.json();
    const valid = validateRes.ok && validateData?.valid === true;

    if (!valid) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid: false, error: 'Invalid or expired license key' })
      };
    }

    const token = Buffer.from(JSON.stringify({
      key: key.slice(-8),
      ts: Date.now(),
      v: 1
    })).toString('base64');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: true, token })
    };

  } catch (e) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'Validation service unavailable' })
    };
  }
};
```

**Also delete** the old `validate-license.js` at the project root — it is no longer needed and will cause confusion.

---

## Fix 2 — Update the key input placeholder in `CAMPUS-CASH-PRO.html`

**Find this exact string:**
```
placeholder="CCP-XXXX-YYYY-ZZZZ"
```

**Replace with:**
```
placeholder="Paste your license key"
```

---

## Fix 3 — Update the helper text below the key input in `CAMPUS-CASH-PRO.html`

**Find this exact string:**
```
Your key was emailed to you after purchase. Check your spam folder if you don't see it.
```

**Replace with:**
```
Your license key was emailed after purchase. It's a long string of letters and numbers — paste it exactly as received. Check spam if you don't see it.
```

---

## Fix 4 — Update `netlify.toml` to add a CORS header for the function

**Find this exact block:**
```toml
[build]
  publish = "."
  functions = "netlify/functions"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

**Replace with:**
```toml
[build]
  publish = "."
  functions = "netlify/functions"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "POST, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type"
```

---

## Verification Checklist

After making all changes, run these checks:

- [ ] `netlify/functions/validate-license.js` exists and contains the `activate` → `validate` fallback logic
- [ ] `validate-license.js` at project root has been deleted
- [ ] `grep "CCP-XXXX" CAMPUS-CASH-PRO.html` returns no results
- [ ] `grep "Paste your license key" CAMPUS-CASH-PRO.html` returns 1 result
- [ ] `netlify.toml` contains the `/.netlify/functions/*` headers block
- [ ] `LEMONSQUEEZY_API_KEY` is set in Netlify dashboard → Site configuration → Environment variables

---

## After Deploying

1. Push all changes to your repo — Netlify auto-deploys
2. Go to your live Netlify URL
3. Click "Unlock Pro" and paste your real Lemon Squeezy license key
4. It should activate and unlock immediately
5. If it still fails, open browser DevTools → Network tab → look at the `/validate-license` response body for the specific error message

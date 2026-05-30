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

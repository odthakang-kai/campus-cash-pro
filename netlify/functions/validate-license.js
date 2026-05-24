exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let key;
  try {
    const body = JSON.parse(event.body);
    key = (body.key || '').trim().toUpperCase();
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'Bad request' })
    };
  }

  if (!/^CCP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'Invalid key format' })
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
    const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`
      },
      body: JSON.stringify({
        license_key: key,
        instance_name: 'Campus Cash Pro'
      })
    });

    const data = await response.json();
    const valid = response.ok && data?.activated === true;
    const token = Buffer.from(JSON.stringify({
      key: key.slice(-4),
      ts: Date.now(),
      v: 1
    })).toString('base64');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid, token: valid ? token : null })
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'Validation service unavailable' })
    };
  }
};

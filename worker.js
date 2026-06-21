export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers });
    }

    const PI_API = 'https://api.minepi.com/v2';
    const KEY = env.PI_API_KEY;

    if (url.pathname.endsWith('/approve') && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!body.paymentId) {
          return new Response(JSON.stringify({ error: 'paymentId required' }), { status: 400, headers });
        }
        const res = await fetch(PI_API + '/payments/' + body.paymentId + '/approve', {
          method: 'POST',
          headers: { 'Authorization': 'Key ' + KEY, 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return new Response(JSON.stringify({ success: true, data: data }), { status: 200, headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }

    if (url.pathname.endsWith('/complete') && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!body.paymentId || !body.txid) {
          return new Response(JSON.stringify({ error: 'paymentId and txid required' }), { status: 400, headers });
        }
        const res = await fetch(PI_API + '/payments/' + body.paymentId + '/complete', {
          method: 'POST',
          headers: { 'Authorization': 'Key ' + KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ txid: body.txid })
        });
        const data = await res.json();
        return new Response(JSON.stringify({ success: true, data: data }), { status: 200, headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  }
};

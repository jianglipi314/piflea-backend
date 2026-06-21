export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors });
    }

    const KEY = env.PI_API_KEY;
    const SB_URL = env.SUPABASE_URL || 'https://xiuzymzcjkbhkzffojiw.supabase.co';
    const SB_KEY = env.SUPABASE_KEY || 'sb_publishable_6Ep5bW6y4ttuyLrd9PLObw_Q7fpvFmS';

    // Helper: call Supabase REST API
    async function supabase(method, table, body, params) {
      const path = '/rest/v1/' + table + (params ? '?' + params : '');
      const opts = {
        method: method,
        headers: {
          'apikey': SB_KEY,
          'Authorization': 'Bearer ' + SB_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(SB_URL + path, opts);
      const text = await res.text();
      try { return { ok: res.ok, data: JSON.parse(text) }; }
      catch(e) { return { ok: res.ok, data: text }; }
    }

    // === PI APPROVE ===
    if (url.pathname.endsWith('/approve') && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!body.paymentId) return new Response(JSON.stringify({ error: 'paymentId required' }), { status: 400, headers: cors });
        const res = await fetch('https://api.minepi.com/v2/payments/' + body.paymentId + '/approve', {
          method: 'POST', headers: { 'Authorization': 'Key ' + KEY, 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return new Response(JSON.stringify({ success: true, data: data }), { status: 200, headers: cors });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
      }
    }

    // === PI COMPLETE ===
    if (url.pathname.endsWith('/complete') && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!body.paymentId || !body.txid) return new Response(JSON.stringify({ error: 'paymentId and txid required' }), { status: 400, headers: cors });
        const res = await fetch('https://api.minepi.com/v2/payments/' + body.paymentId + '/complete', {
          method: 'POST', headers: { 'Authorization': 'Key ' + KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ txid: body.txid })
        });
        const data = await res.json();
        return new Response(JSON.stringify({ success: true, data: data }), { status: 200, headers: cors });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
      }
    }

    // === CREATE ORDER (called after successful payment) ===
    if (url.pathname.endsWith('/create-order') && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!body.payment_id || !body.buyer_id || !body.seller_id) {
          return new Response(JSON.stringify({ error: 'payment_id, buyer_id, seller_id required' }), { status: 400, headers: cors });
        }
        const result = await supabase('POST', 'orders', {
          payment_id: body.payment_id,
          txid: body.txid || '',
          amount: body.amount || 0,
          buyer_id: body.buyer_id,
          seller_id: body.seller_id,
          item_id: body.item_id || 0,
          item_title: body.item_title || '',
          item_price: body.item_price || 0,
          memo: body.memo || '',
          uid: body.buyer_id,
          status: 'paid'
        });
        if (!result.ok) return new Response(JSON.stringify({ error: 'Failed to create order', detail: result.data }), { status: 500, headers: cors });
        return new Response(JSON.stringify({ success: true, data: result.data }), { status: 200, headers: cors });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
      }
    }

    // === COMPLETE ORDER (confirm receipt) ===
    if (url.pathname.endsWith('/complete-order') && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!body.order_id || !body.buyer_id) {
          return new Response(JSON.stringify({ error: 'order_id and buyer_id required' }), { status: 400, headers: cors });
        }
        // Get the order first
        const order = await supabase('GET', 'orders', null, 'id=eq.' + body.order_id + '&select=*');
        if (!order.ok || !order.data || order.data.length === 0) {
          return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: cors });
        }
        const o = order.data[0];
        if (o.buyer_id !== body.buyer_id) {
          return new Response(JSON.stringify({ error: 'Unauthorized: not the buyer' }), { status: 403, headers: cors });
        }
        if (o.status !== 'shipped') {
          return new Response(JSON.stringify({ error: 'Order cannot be completed in current status: ' + o.status }), { status: 400, headers: cors });
        }
        // Update to completed
        const update = await supabase('PATCH', 'orders', { status: 'completed', updated_at: new Date().toISOString() }, 'id=eq.' + body.order_id);
        if (!update.ok) return new Response(JSON.stringify({ error: 'Failed to update order' }), { status: 500, headers: cors });
        return new Response(JSON.stringify({ success: true, data: update.data }), { status: 200, headers: cors });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
      }
    }

    // === MARK AS SHIPPED (seller) ===
    if (url.pathname.endsWith('/mark-shipped') && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!body.order_id || !body.seller_id) {
          return new Response(JSON.stringify({ error: 'order_id and seller_id required' }), { status: 400, headers: cors });
        }
        const order = await supabase('GET', 'orders', null, 'id=eq.' + body.order_id + '&select=*');
        if (!order.ok || !order.data || order.data.length === 0) {
          return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: cors });
        }
        const o = order.data[0];
        if (o.seller_id !== body.seller_id) {
          return new Response(JSON.stringify({ error: 'Unauthorized: not the seller' }), { status: 403, headers: cors });
        }
        if (o.status !== 'paid') {
          return new Response(JSON.stringify({ error: 'Order must be paid first' }), { status: 400, headers: cors });
        }
        const update = await supabase('PATCH', 'orders', { status: 'shipped', updated_at: new Date().toISOString() }, 'id=eq.' + body.order_id);
        return new Response(JSON.stringify({ success: true, data: update.data }), { status: 200, headers: cors });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
      }
    }

    // === GET MY ORDERS (buyer or seller) ===
    if (url.pathname.endsWith('/my-orders') && request.method === 'GET') {
      try {
        const uid = url.searchParams.get('uid');
        const role = url.searchParams.get('role') || 'buyer'; // 'buyer' or 'seller'
        if (!uid) return new Response(JSON.stringify({ error: 'uid required' }), { status: 400, headers: cors });
        const filter = role === 'seller' ? 'seller_id=eq.' + uid : 'buyer_id=eq.' + uid;
        const result = await supabase('GET', 'orders', null, filter + '&order=created_at.desc');
        return new Response(JSON.stringify({ success: true, data: result.data || [] }), { status: 200, headers: cors });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: cors });
  }
};

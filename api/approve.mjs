export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  if (req.method === "OPTIONS") { return res.status(200).end(); }
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({error:"paymentId required"});
  try {
    const key = process.env.PI_API_KEY;
    if (!key) return res.status(500).json({error:"key missing"});
    const r = await globalThis.fetch("https://api.minepi.com/v2/payments/"+paymentId+"/approve", {
      method: "POST", headers: { "Authorization": "Key "+key, "Content-Type": "application/json" }
    });
    const d = await r.json();
    return res.status(200).json({ success: true, data: d });
  } catch(e) { return res.status(500).json({ error: e.message }); }
}
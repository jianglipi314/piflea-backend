module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin","*");
  if (req.method === "OPTIONS") { res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS"); res.setHeader("Access-Control-Allow-Headers","Content-Type"); return res.status(200).end(); }
  const { paymentId, txid } = req.body || {};
  if (!paymentId || !txid) return res.status(400).json({error:"paymentId and txid required"});
  try {
    const key = process.env.PI_API_KEY;
    if (!key) return res.status(500).json({error:"PI_API_KEY not set"});
    const r = await fetch("https://api.minepi.com/v2/payments/"+paymentId+"/complete", {
      method: "POST", headers: { "Authorization": "Key "+key, "Content-Type": "application/json" },
      body: JSON.stringify({ txid })
    });
    const data = await r.json();
    return res.status(r.ok?200:500).json({ success: r.ok, data });
  } catch(e) { return res.status(500).json({ success: false, error: e.message }); }
};
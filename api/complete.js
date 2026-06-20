const PI_API = "https://api.minepi.com/v2";
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin","*");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers","Content-Type");
    return res.status(200).end();
  }
  const { paymentId, txid } = req.body || {};
  if (!paymentId || !txid) return res.status(400).json({error:"paymentId and txid required"});
  try {
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) return res.status(500).json({error:"PI_API_KEY not set"});
    const resp = await fetch(PI_API+"/payments/"+paymentId+"/complete", {
      method: "POST", headers: { "Authorization": "Key "+apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ txid })
    });
    const data = await resp.json().catch(()=>({}));
    return res.status(resp.ok?200:500).json({ success: resp.ok, data });
  } catch(e) { return res.status(500).json({ success:false, error: e.message }); }
};
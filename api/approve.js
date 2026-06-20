const https = require("https");
function callPi(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body||{});
    const opts = { hostname: "api.minepi.com", port: 443, path: "/v2/"+path, method: "POST",
      headers: { "Authorization": "Key "+process.env.PI_API_KEY, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } };
    const req = https.request(opts, (res) => { let b=""; res.on("data",c=>b+=c); res.on("end",()=>{ try { resolve({ok:res.statusCode<400, data: JSON.parse(b) }); } catch(e) { resolve({ok:res.statusCode<400, data: b }); } }); });
    req.on("error",reject); req.write(data); req.end();
  });
}
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin","*");
  if (req.method === "OPTIONS") { return res.status(200).end(); }
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({error:"paymentId required"});
  try {
    if (!process.env.PI_API_KEY) return res.status(500).json({error:"PI_API_KEY not set"});
    const result = await callPi("payments/"+paymentId+"/approve", {});
    return res.status(result.ok?200:500).json({ success: result.ok, data: result.data });
  } catch(e) { return res.status(500).json({ success:false, error: e.message }); }
};
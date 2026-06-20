const https = require("https");
module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin","*");
  if (req.method === "OPTIONS") { return res.status(200).end(); }
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({error:"paymentId required"});
  try {
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) return res.json({error:"no key"});
    const u = new URL("https://api.minepi.com/v2/payments/"+paymentId+"/approve");
    https.get(u.href, { headers: { "Authorization": "Key "+apiKey } }, (resp) => {
      let d=""; resp.on("data",c=>d+=c); resp.on("end",()=>res.json({code:resp.statusCode, body:d}));
    }).on("error",e=>res.json({error:e.message}));
  } catch(e) { res.json({error:e.message}); }
};
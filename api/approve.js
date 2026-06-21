const { execSync } = require('child_process');
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  if (req.method === 'OPTIONS') { return res.status(200).end(); }
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({error:'paymentId required'});
  const key = process.env.PI_API_KEY;
  if (!key) return res.status(500).json({error:'no key'});
  try {
    const out = execSync('curl -s -X POST https://api.minepi.com/v2/payments/' + paymentId + '/approve -H "Authorization: Key ' + key + '" -H "Content-Type: application/json"', { timeout: 10000 });
    return res.status(200).json({ success: true, data: JSON.parse(out) });
  } catch(e) { return res.status(500).json({ error: e.message }); }
};
const axios = require('axios');
const PI_API_BASE = 'https://api.minepi.com/v2';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    return res.status(200).end();
  }
  const { paymentId, txid } = req.body || {};
  if (!paymentId || !txid) return res.status(400).json({error:'paymentId and txid required'});
  try {
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) return res.status(500).json({error:'PI_API_KEY not configured'});
    const url = PI_API_BASE + '/payments/' + paymentId + '/complete';
    const response = await axios.post(url, { txid }, {
      headers: { 'Authorization': 'Key ' + apiKey, 'Content-Type': 'application/json' },
      timeout: 10000
    });
    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Unknown' });
  }
};
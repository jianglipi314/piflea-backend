const axios = require('axios');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    return res.status(200).end();
  }
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({error:'paymentId required'});
  try {
    const response = await axios.post('https://api.minepi.com/v2/payments/'+paymentId+'/approve', {}, {
      headers: { 'Authorization': 'Key '+process.env.PI_API_KEY, 'Content-Type': 'application/json' },
      timeout: 10000
    });
    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || 'Pi API error' });
  }
};
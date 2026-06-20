const { approvePayment } = require('../lib/pi');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({error:'paymentId is required'});
  try { return res.status(200).json({ success: true, data: await approvePayment(paymentId) }); }
  catch (error) { return res.status(500).json({ success: false, error: error.message || 'Pi API error' }); }
};
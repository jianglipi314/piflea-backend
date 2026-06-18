const { completePayment } = require('../lib/pi');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, txid } = req.body || {};

  if (!paymentId || !txid) {
    return res.status(400).json({ error: 'paymentId and txid are required' });
  }

  try {
    const result = await completePayment(paymentId, txid);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Complete payment error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};

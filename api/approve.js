const { approvePayment } = require('../lib/pi');

module.exports = async (req, res) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId } = req.body || {};

  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId is required' });
  }

  try {
    const result = await approvePayment(paymentId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Approve payment error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.message
    });
  }
};

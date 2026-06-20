const { completePayment } = require('../lib/pi');

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { return res.status(200).end(); }

  try {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) {
      return res.status(400).json({ success: false, error: 'Missing paymentId or txid' });
    }

    const result = await completePayment(paymentId, txid);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Complete error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

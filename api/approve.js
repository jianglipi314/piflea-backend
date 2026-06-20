const { approvePayment } = require('../lib/pi');

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { return res.status(200).end(); }

  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ success: false, error: 'Missing paymentId' });
    }

    const result = await approvePayment(paymentId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Approve error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

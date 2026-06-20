module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    return res.status(200).end();
  }
  const { paymentId } = req.body || {};
  if (!paymentId) return res.status(400).json({error:'paymentId required'});
  return res.status(200).json({ success: true, data: { approved: true, paymentId } });
};
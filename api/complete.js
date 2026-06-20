const { completePayment } = require(../lib/pi);
let supabase = null;
try { supabase = require(../lib/supabase); } catch(e) { console.error(Supabase init error:, e.message); }

module.exports = async (req, res) => {
  res.setHeader(Access-Control-Allow-Origin,*);
  if (req.method === OPTIONS) {
    res.setHeader(Access-Control-Allow-Methods,POST, OPTIONS);
    res.setHeader(Access-Control-Allow-Headers,Content-Type);
    return res.status(200).end();
  }
  if (req.method !== POST) return res.status(405).json({error:Method not allowed});
  
  const { paymentId, txid, uid, amount, memo } = req.body || {};
  if (!paymentId || !txid) return res.status(400).json({error:paymentId and txid required});

  try {
    // Call Pi API with a timeout
    const result = await Promise.race([
      completePayment(paymentId, txid),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Pi API timeout')), 8000))
    ]);
    
    if (supabase) {
      try {
        const { error: dbError } = await supabase.from(orders).insert({
          payment_id: paymentId, txid, amount: amount||0, memo: memo||, uid: uid||, status: completed
        });
        if (dbError) console.error(Supabase insert error:, dbError);
      } catch(e) { console.error(Supabase insert threw:, e.message); }
    }
    
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(Complete error:, error.message || error);
    return res.status(500).json({ success: false, error: error.message || Unknown error });
  }
};
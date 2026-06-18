const axios = require('axios');

const PI_API_BASE = 'https://api.minepi.com/v2';

async function approvePayment(paymentId) {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    throw new Error('PI_API_KEY not configured');
  }

  const url = `${PI_API_BASE}/payments/${paymentId}/approve`;
  const response = await axios.post(url, {}, {
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

async function completePayment(paymentId, txid) {
  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    throw new Error('PI_API_KEY not configured');
  }

  const url = `${PI_API_BASE}/payments/${paymentId}/complete`;
  const response = await axios.post(url, { txid }, {
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

module.exports = { approvePayment, completePayment };

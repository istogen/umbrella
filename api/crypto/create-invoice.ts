const CRYPTO_BOT_API = 'https://pay.crypt.bot/api/createInvoice';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const token = process.env.CRYPTO_BOT_TOKEN || '583847:AA5LkNKQIkjT03P4pERt2hoNyfkjcJNGE2O';
  if (!token) {
    res.status(500).json({ ok: false, error: 'CRYPTO_BOT_TOKEN is not configured' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const response = await fetch(CRYPTO_BOT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Crypto-Pay-API-Token': token,
      },
      body: JSON.stringify({
        asset: 'USDT',
        amount: String(body.amount),
        description: body.description || 'Umbrella Crack - Lifetime',
        hidden_message: body.hidden_message || 'Спасибо за покупку Umbrella Crack!',
        paid_btn_name: body.paid_btn_name || 'callback',
        paid_btn_url: body.paid_btn_url,
        payload: body.payload,
        allow_comments: false,
        allow_anonymous: false,
      }),
    });

    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Failed to create invoice' });
  }
}
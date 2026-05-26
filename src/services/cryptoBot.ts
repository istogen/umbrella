// CryptoBot Payment API — @CryptoBot / @CryptoPayBot
// Docs: https://help.crypt.bot/crypto-pay-api
const TOKEN = '584360:AA2rYaHMbs4iUjPDo9YFoiKs6bvWZVVpaCK';
const API = 'https://pay.crypt.bot/api';

export type CryptoAsset = 'USDT' | 'BTC' | 'ETH' | 'TON';

export interface CryptoInvoice {
  invoice_id: number;
  status: 'active' | 'paid' | 'expired';
  hash: string;
  asset: string;
  amount: string;
  pay_url: string;
  bot_invoice_url?: string;
  mini_app_invoice_url?: string;
  description?: string;
}

export const CRYPTO_OPTIONS: { asset: CryptoAsset; label: string; icon: string; network: string }[] = [
  { asset: 'USDT', label: 'Tether', icon: '💲', network: 'TRC-20 / TON' },
  { asset: 'BTC',  label: 'Bitcoin', icon: '₿', network: 'BTC Network' },
  { asset: 'ETH',  label: 'Ethereum', icon: 'Ξ', network: 'ERC-20' },
  { asset: 'TON',  label: 'Toncoin', icon: '💎', network: 'TON Network' },
];

export const CryptoBotService = {
  async createInvoice(
    asset: CryptoAsset,
    amount: number,
    description: string
  ): Promise<CryptoInvoice | null> {
    try {
      const res = await fetch(`${API}/createInvoice`, {
        method: 'POST',
        headers: {
          'Crypto-Pay-API-Token': TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset,
          amount: amount.toFixed(asset === 'BTC' ? 8 : 2),
          description,
          hidden_message: 'Спасибо за покупку Umbrella Crack! Ключ будет выдан после проверки.',
          paid_btn_name: 'callback',
          paid_btn_url: window.location.origin,
          allow_comments: false,
          allow_anonymous: true,
        }),
      });

      const data = await res.json();
      if (data.ok && data.result) {
        return data.result as CryptoInvoice;
      }
      console.error('CryptoBot API error:', data);
      return null;
    } catch (err) {
      console.error('CryptoBot fetch failed:', err);
      return null;
    }
  },

  async checkInvoice(invoiceId: number): Promise<string> {
    try {
      const res = await fetch(`${API}/getInvoices`, {
        method: 'POST',
        headers: {
          'Crypto-Pay-API-Token': TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_ids: invoiceId.toString() }),
      });
      const data = await res.json();
      return data?.ok ? data.result?.items?.[0]?.status ?? 'unknown' : 'unknown';
    } catch {
      return 'unknown';
    }
  },
};

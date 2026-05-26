import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Product, User } from '../data/mockData';
import { CryptoBotService, CRYPTO_OPTIONS, CryptoAsset } from '../services/cryptoBot';
import { Check, Clock, Copy, ExternalLink, MessageCircle, ShieldCheck, X, Loader2 } from 'lucide-react';

interface Props {
  product: Product | null;
  currentUser: User | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onSuccessPurchase: (key: string) => void;
}

type Step = 'method' | 'crypto-select' | 'invoice' | 'checking' | 'pending';

export const PurchaseModal: React.FC<Props> = ({ product, currentUser, onClose, onOpenAuth }) => {
  const [step, setStep] = useState<Step>('method');
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>('USDT');
  const [loading, setLoading] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step !== 'invoice') return;
    setTimeLeft(900);
    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  if (!product) return null;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Handlers ──

  const goTelegram = () => {
    window.open('https://t.me/godlike_supp', '_blank');
    onClose();
  };

  const goCrypto = () => {
    if (!currentUser) { onClose(); onOpenAuth(); return; }
    setStep('crypto-select');
  };

  const createInvoice = async () => {
    setLoading(true);
    setError('');

    const invoice = await CryptoBotService.createInvoice(
      selectedAsset,
      product.priceUsdt,
      `Umbrella Crack Lifetime — ${currentUser?.username}`
    );

    setLoading(false);

    if (!invoice) {
      setError('Не удалось создать счёт. Попробуйте позже.');
      return;
    }

    setInvoiceUrl(invoice.pay_url);
    setInvoiceId(invoice.invoice_id);
    setStep('invoice');
  };

  const checkPayment = async () => {
    if (!invoiceId) return;
    setStep('checking');

    const status = await CryptoBotService.checkInvoice(invoiceId);

    if (status === 'paid') {
      setStep('pending');
    } else {
      setError(status === 'expired' ? 'Счёт истёк. Создайте новый.' : 'Оплата ещё не поступила. Подождите и попробуйте снова.');
      setStep('invoice');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(invoiceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render ──

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 18 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="glass-strong relative w-full max-w-xl overflow-hidden rounded-[28px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-white/[0.035] blur-[90px]" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative p-6 sm:p-8">
            {/* ━━━ STEP 1: Choose method ━━━ */}
            {step === 'method' && (
              <>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                  Оформление доступа
                </div>
                <h3 className="font-display text-3xl font-bold text-white">Umbrella Crack</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  Выберите способ оплаты
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {/* RUB card */}
                  <button
                    onClick={goTelegram}
                    className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 text-left transition hover:border-white/[0.2] hover:bg-white/[0.06]"
                  >
                    <MessageCircle className="mb-3 h-6 w-6 text-white/40 transition group-hover:text-white" />
                    <div className="font-display text-2xl font-bold text-white">{product.priceRub}₽</div>
                    <div className="mt-2 text-xs text-white/35">Оплата через Telegram</div>
                    <div className="mt-1 text-[10px] text-white/25">@godlike_supp</div>
                  </button>

                  {/* Crypto card */}
                  <button
                    onClick={goCrypto}
                    className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 text-left transition hover:border-white/[0.2] hover:bg-white/[0.06]"
                  >
                    <span className="mb-3 block text-2xl">💎</span>
                    <div className="font-display text-2xl font-bold text-white">${product.priceUsdt}</div>
                    <div className="mt-2 text-xs text-white/35">Криптовалюта</div>
                    <div className="mt-1 text-[10px] text-white/25">USDT · BTC · ETH · TON</div>
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white/60">
                    <ShieldCheck className="h-4 w-4" />
                    Гарантия
                  </div>
                  <p className="text-xs leading-relaxed text-white/30">
                    Ключ выдаётся только после подтверждения оплаты. Подписка не создаётся автоматически.
                  </p>
                </div>
              </>
            )}

            {/* ━━━ STEP 2: Choose crypto asset ━━━ */}
            {step === 'crypto-select' && (
              <>
                <button onClick={() => setStep('method')} className="mb-4 text-sm text-white/40 transition hover:text-white">
                  ← Назад
                </button>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                  Выберите валюту
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Оплата ${product.priceUsdt}
                </h3>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {CRYPTO_OPTIONS.map((opt) => (
                    <button
                      key={opt.asset}
                      onClick={() => setSelectedAsset(opt.asset)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedAsset === opt.asset
                          ? 'border-white/[0.25] bg-white/[0.08]'
                          : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="mb-1 text-2xl">{opt.icon}</div>
                      <div className="text-sm font-semibold text-white">{opt.asset}</div>
                      <div className="text-[10px] text-white/30">{opt.network}</div>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  onClick={createInvoice}
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.07] py-4 text-base font-medium text-white transition hover:border-white/[0.22] hover:bg-white/[0.12] disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" />Создаём счёт...</>
                  ) : (
                    `Создать счёт в ${selectedAsset}`
                  )}
                </button>
              </>
            )}

            {/* ━━━ STEP 3: Invoice with QR ━━━ */}
            {step === 'invoice' && (
              <>
                <button onClick={() => setStep('crypto-select')} className="mb-4 text-sm text-white/40 transition hover:text-white">
                  ← Другая валюта
                </button>

                <div className="mb-4 text-center">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                    CryptoBot · {selectedAsset}
                  </div>
                  <h3 className="font-display text-3xl font-bold text-white">
                    {product.priceUsdt} {selectedAsset === 'USDT' ? 'USDT' : selectedAsset}
                  </h3>
                  {invoiceId && (
                    <p className="mt-1 text-xs text-white/30">Invoice #{invoiceId}</p>
                  )}
                </div>

                {/* Timer */}
                <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
                  <Clock className="h-4 w-4 text-white/40" />
                  <span className="font-mono text-sm text-white/50">{fmt(timeLeft)}</span>
                </div>

                {/* QR — real image from API */}
                <div className="mb-5 flex justify-center">
                  <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(invoiceUrl)}&size=200x200&color=000000&bgcolor=ffffff`}
                      alt="QR"
                      width={200}
                      height={200}
                      className="block"
                    />
                  </div>
                </div>

                {/* Link */}
                <div className="mb-5">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/30">
                    Ссылка на оплату
                  </div>
                  <div className="glass flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                    <code className="break-all font-mono text-xs text-white/60">{invoiceUrl}</code>
                    <button
                      onClick={copyUrl}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Open in CryptoBot */}
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.08] py-3 text-sm font-medium text-white transition hover:border-white/[0.2] hover:bg-white/[0.12]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Открыть в CryptoBot
                </a>

                {error && (
                  <div className="mb-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">
                    {error}
                  </div>
                )}

                <button
                  onClick={checkPayment}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.07] py-4 text-sm font-medium text-white transition hover:border-white/[0.22] hover:bg-white/[0.12]"
                >
                  Я оплатил — проверить
                </button>
              </>
            )}

            {/* ━━━ STEP 3.5: Checking... ━━━ */}
            {step === 'checking' && (
              <div className="py-10 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-white/40" />
                <p className="mt-4 text-sm text-white/50">Проверяем оплату...</p>
              </div>
            )}

            {/* ━━━ STEP 4: Pending ━━━ */}
            {step === 'pending' && (
              <div className="py-5 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Оплата получена!</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  Ключ будет выдан после финальной проверки администратором.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 w-full rounded-xl border border-white/[0.1] bg-white/[0.07] py-3 text-sm font-medium text-white transition hover:border-white/[0.22] hover:bg-white/[0.12]"
                >
                  Понятно
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

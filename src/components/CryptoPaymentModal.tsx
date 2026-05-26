import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Copy, Check, Clock } from 'lucide-react';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  asset: string;
  address: string;
  onPaymentConfirmed: () => void;
}

// Simple QR code using canvas (no external lib needed for demo)
const QRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 160 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple visual QR-like pattern (in production use qrcode library)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';

    // Generate deterministic pattern from value
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i);
      hash = hash & hash;
    }

    const cellSize = size / 21;
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 16807 + 0) % 2147483647;
        return s / 2147483647;
      };
    };
    const rand = rng(Math.abs(hash));

    // Draw finder patterns (corners)
    const drawFinder = (ox: number, oy: number) => {
      ctx.fillRect(ox, oy, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + cellSize, oy + cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(ox + 2 * cellSize, oy + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    ctx.fillStyle = '#000000';
    drawFinder((21 - 7) * cellSize, 0);
    ctx.fillStyle = '#000000';
    drawFinder(0, (21 - 7) * cellSize);

    // Fill data cells
    ctx.fillStyle = '#000000';
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 21; x++) {
        // Skip finder patterns
        if ((x < 8 && y < 8) || (x >= 13 && y < 8) || (x < 8 && y >= 13)) continue;
        if (rand() > 0.5) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-xl" />;
};

export const CryptoPaymentModal: React.FC<CryptoPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  asset,
  address,
  onPaymentConfirmed,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="glass-strong glow-subtle relative w-full max-w-md overflow-hidden rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">
                Оплата криптовалютой
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                {amount} {asset}
              </h3>
              <p className="mt-1 text-sm text-white/40">Umbrella Crack — Lifetime</p>
            </div>

            {/* Timer */}
            <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2.5">
              <Clock className="h-4 w-4 text-white/40" />
              <span className="font-mono text-sm text-white/60">
                {timeLeft > 0 ? `Счёт действителен: ${formatTime(timeLeft)}` : 'Счёт истёк'}
              </span>
            </div>

            {/* QR Code */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-2xl border border-white/[0.08] bg-white p-4">
                <QRCode value={address} size={180} />
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-white/30">Адрес кошелька</div>
              <div className="glass flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                <code className="break-all text-xs font-mono text-white/70">{address}</code>
                <button
                  onClick={copyAddress}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/40 transition hover:bg-white/10 hover:text-white"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-200/80 leading-relaxed">
              Отправьте ровно <strong>{amount} {asset}</strong> на указанный адрес. После подтверждения транзакции ключ будет выдан автоматически.
            </div>

            {/* Confirm button (demo) */}
            <button
              onClick={onPaymentConfirmed}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-4 text-sm font-medium text-white transition hover:border-white/[0.2] hover:bg-white/[0.1]"
            >
              Я оплатил — проверить платёж
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

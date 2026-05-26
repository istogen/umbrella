import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Product, User } from '../data/mockData';
import { Key, Check } from 'lucide-react';
import { useUserCounter } from '../hooks/useUserCounter';

interface LandingProps {
  products: Product[];
  currentUser: User | null;
  onSelectProduct: (product: Product) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onGoDashboard: () => void;
}

const SpotlightButton = ({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-sm font-medium text-white/80 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white active:scale-[0.98] ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: hovered
            ? `radial-gradient(300px circle at ${mouse.x}% ${mouse.y}%, rgba(255,255,255,0.12), transparent 60%)`
            : 'none',
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};

export const Landing: React.FC<LandingProps> = ({
  products,
  currentUser,
  onSelectProduct,
  onOpenAuth,
  onGoDashboard,
}) => {
  const product = products[0];
  const userCount = useUserCounter();

  const handleBuyClick = () => {
    if (!currentUser) {
      onOpenAuth('register');
      return;
    }
    if (product) onSelectProduct(product);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

      {/* Ambient orbs */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[10%] top-[20%] h-[520px] w-[520px] rounded-full bg-white/[0.015] blur-[140px]"
      />
      <motion.div
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-[10%] right-[10%] h-[480px] w-[480px] rounded-full bg-white/[0.012] blur-[160px]"
      />

      {/* ─── Hero ─── */}
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-32 text-center sm:px-6">
        {/* UNDETECTED badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="glass inline-flex items-center gap-3 rounded-full px-5 py-2.5">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/60 opacity-75" />
              <span className="relative inline-flex h-full w-full rounded-full bg-red-400" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.28em] text-white/60 uppercase">
              Undetected
            </span>
          </div>
        </motion.div>

        {/* Animated title — bold, Minecraft-like */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="space-y-1"
        >
          <h1 className="font-display animate-gradient-x bg-gradient-to-r from-white via-red-200/70 to-white bg-[length:200%_auto] bg-clip-text text-7xl font-black tracking-tight text-transparent sm:text-8xl md:text-9xl lg:text-[150px] lg:leading-[0.85]">
            Umbrella
          </h1>
          <h2 className="font-display animate-gradient-x bg-gradient-to-r from-white via-red-200/70 to-white bg-[length:200%_auto] bg-clip-text text-6xl font-black tracking-[0.05em] text-transparent sm:text-7xl md:text-8xl lg:text-[120px]">
            crack
          </h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-6 max-w-md px-4 text-sm leading-relaxed text-white/35 sm:mt-8 sm:max-w-lg sm:text-base"
        >
          Кряк на лучший клиент под Dota 2. Быстрые ключи, мгновенная активация, привязка HWID.
        </motion.p>

        {/* Only "Войти в аккаунт" — no buy button under subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-8 sm:mt-10"
        >
          <button
            onClick={() => (currentUser ? onGoDashboard() : onOpenAuth('login'))}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-8 py-3.5 text-sm text-white/60 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white active:scale-[0.98] sm:py-4"
          >
            {currentUser ? 'Личный кабинет' : 'Войти в аккаунт'}
          </button>
        </motion.div>
      </section>

      {/* ─── Product section ─── */}
      {product && (
        <section className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9 }}
            className="glass-strong glow-subtle overflow-hidden rounded-2xl sm:rounded-[28px]"
          >
            <div className="grid lg:grid-cols-[1fr_380px]">
              {/* ── Left side ── */}
              <div className="p-6 sm:p-8 md:p-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 sm:px-4 sm:py-2">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/50 opacity-75" />
                    <span className="relative inline-flex h-full w-full rounded-full bg-red-400" />
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.22em] text-white/50 uppercase sm:text-[10px]">
                    Undetected
                  </span>
                </div>

                <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                  Umbrella Crack
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/35 sm:mt-4">
                  Кряк на лучший клиент под Dota 2. Быстрые ключи, мгновенная активация, привязка HWID.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-2.5 sm:mt-8 sm:grid-cols-2 sm:gap-3">
                  {[
                    'Мгновенная выдача ключа',
                    'Привязка к оборудованию (HWID)',
                    'Личный кабинет с подписками',
                    'Авто-обновления',
                  ].map((feat) => (
                    <div
                      key={feat}
                      className="glass flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] sm:rounded-2xl sm:px-5 sm:py-4"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] sm:h-8 sm:w-8">
                        <Check className="h-3.5 w-3.5 text-white/50" />
                      </div>
                      <span className="text-[12px] leading-snug text-white/60 sm:text-[13px]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right side — pricing ── */}
              <div className="flex flex-col justify-between border-t border-white/[0.06] p-6 sm:p-8 md:p-10 lg:border-l lg:border-t-0">
                <div>
                  <div className="mb-1 text-[9px] font-bold tracking-[0.22em] text-white/30 uppercase sm:text-[10px]">
                    Тарифный план
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">
                    Навсегда (Lifetime)
                  </h3>

                  <div className="mt-5 flex items-baseline gap-2 sm:mt-6 sm:gap-3">
                    <span className="font-display text-4xl font-bold leading-none text-white sm:text-[52px]">
                      {product.priceRub}₽
                    </span>
                    <span className="text-lg text-white/20 line-through sm:text-xl">
                      {product.priceRubOld}₽
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 sm:mt-4 sm:px-5 sm:py-3">
                    <span className="text-xs text-white/30 sm:text-sm">Крипто-эквивалент:</span>
                    <span className="font-mono text-xs font-medium text-white/70 sm:text-sm">
                      ~{product.priceUsdt} USDT
                    </span>
                  </div>
                </div>

                <SpotlightButton onClick={handleBuyClick} className="mt-6 w-full sm:mt-8">
                  <Key className="h-4 w-4 text-white/40 transition-colors group-hover:text-white/70" />
                  {currentUser ? 'Приобрести доступ' : 'Зарегистрироваться'}
                </SpotlightButton>

                {!currentUser && (
                  <p className="mt-3 text-center text-[11px] text-white/30">
                    Для покупки необходимо создать аккаунт
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* ─── Stats bar ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-4 grid grid-cols-3 gap-3 sm:mt-6 sm:gap-4"
          >
            {[
              { value: userCount.toLocaleString('ru-RU'), label: 'Пользователей' },
              { value: '99.8%', label: 'Uptime' },
              { value: '10-20с', label: 'Время выдачи' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass flex flex-col items-center rounded-xl py-4 text-center sm:rounded-2xl sm:py-5"
              >
                <motion.span
                  key={stat.value}
                  initial={{ scale: 1.1, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="font-display text-base font-bold text-white/80 sm:text-xl"
                >
                  {stat.value}
                </motion.span>
                <span className="mt-0.5 text-[10px] text-white/30 sm:mt-1 sm:text-[11px]">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* ─── FAQ / Trust section ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-3 grid gap-3 sm:mt-6 sm:grid-cols-3 sm:gap-4"
          >
            {[
              {
                q: 'Что я получу?',
                a: 'Лицензионный ключ для активации в личном кабинете. Доступ навсегда.',
              },
              {
                q: 'Как оплатить?',
                a: 'USDT — моментально на сайте. Рубли — через Telegram.',
              },
              {
                q: 'Безопасно?',
                a: 'Проверено на VirusTotal — 0/72 детектов. Никаких вирусов, майнеров или сторонних процессов. Hypervisor Ring-0 защита.',
              },
            ].map((item) => (
              <div key={item.q} className="glass rounded-xl p-5 sm:rounded-2xl sm:p-6">
                <h4 className="mb-1.5 text-sm font-semibold text-white/80">{item.q}</h4>
                <p className="text-xs leading-relaxed text-white/35">{item.a}</p>
              </div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
};

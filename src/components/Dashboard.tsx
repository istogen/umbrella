import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Subscription, User } from '../data/mockData';
import { StoreService } from '../services/store';
import {
  Check, Copy, Download, Eye, EyeOff, KeyRound,
  Monitor, RefreshCw, ShoppingCart, User as UserIcon,
  CreditCard, Shield, MessageCircle
} from 'lucide-react';

interface DashboardProps {
  currentUser: User | null;
  products: Product[];
  subscriptions: Subscription[];
  onUpdateUser: (user: User) => void;
  onRefreshSubs: () => void;
}

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  badge?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all duration-300 sm:px-6 ${
      active ? 'text-white' : 'text-white/30 hover:text-white/60'
    }`}
  >
    <Icon className={`h-4 w-4 transition-colors ${active ? 'text-white/70' : 'text-white/40'}`} />
    <span>{label}</span>
    {badge && (
      <span className="ml-1 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
    )}
    {active && (
      <motion.div
        layoutId="dashboard-tab"
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  products,
  subscriptions,
  onUpdateUser,
  onRefreshSubs,
}) => {
  const [keyValue, setKeyValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'keys' | 'hwid' | 'buy'>('overview');
  const [showHwid, setShowHwid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [purchasePending, setPurchasePending] = useState(false);
  const [currency, setCurrency] = useState<'usdt' | 'rub'>('usdt');

  if (!currentUser) return null;

  const product = products[0];
  const productById = (id: string) => products.find((p) => p.id === id);
  const activeSub = subscriptions.some(
    (sub) => !sub.isFrozen && (!sub.expiresAt || new Date(sub.expiresAt).getTime() > Date.now())
  );

  useEffect(() => {
    if (activeSub && tab === 'buy') {
      setTab('overview');
    }
  }, [activeSub, tab]);

  const activate = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const result = StoreService.activateKey(keyValue.trim(), currentUser.id);
      setMessage(result.message);
      if (result.success) {
        setKeyValue('');
        onRefreshSubs();
        setTab('overview');
      }
    }, 600);
  };

  const requestReset = () => {
    const result = StoreService.requestHwidReset(currentUser.id);
    setMessage(result.message);
    const updated = StoreService.getCurrentUser();
    if (updated) onUpdateUser(updated);
  };

  const handleBuy = () => {
    if (!product) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPurchasePending(true);
    }, 1000);
  };

  const openTelegram = () => {
    const message = encodeURIComponent(
      'Привет, хотел бы купить кряк за 1999р, удобно сейчас?'
    );
    window.open(`https://t.me/godlike_supp?text=${message}`, '_blank');
  };

  const maskedHwid = currentUser.hwid
    ? showHwid
      ? currentUser.hwid
      : `••••••••••••${currentUser.hwid.slice(-4)}`
    : 'Не привязан';

  return (
    <div className="relative min-h-screen pb-24 pt-24">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-0 top-1/4 h-[500px] w-[500px] rounded-full bg-white/[0.015] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  <UserIcon className="h-4 w-4 text-white/60" />
                </div>
                <span className="text-xs font-medium tracking-[0.2em] text-white/40 uppercase">
                  Personal Cabinet
                </span>
              </div>
              <h1 className="font-display text-5xl font-bold tracking-tight text-white lg:text-6xl">
                {currentUser.username}
              </h1>
              <p className="mt-2 text-sm text-white/40">{currentUser.email}</p>
            </div>

            <div className="flex items-center gap-3">
              {!activeSub && (
                <button
                  onClick={() => setTab('buy')}
                  className="rounded-full border border-white/[0.1] bg-white/[0.05] px-6 py-3 text-sm font-medium text-white transition hover:border-white/[0.2] hover:bg-white/[0.08] active:scale-[0.98]"
                >
                  <ShoppingCart className="mr-2 inline h-4 w-4" />
                  Купить
                </button>
              )}
              <button
                disabled={!activeSub}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm text-white/50 transition hover:border-white/[0.15] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Download className="mr-2 inline h-4 w-4" />
                Скачать
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-white/[0.06]">
          <div className="flex flex-wrap gap-1">
            <TabButton
              active={tab === 'overview'}
              onClick={() => setTab('overview')}
              icon={Shield}
              label="Подписки"
              badge={activeSub}
            />
            {!activeSub && (
              <TabButton
                active={tab === 'buy'}
                onClick={() => setTab('buy')}
                icon={CreditCard}
                label="Покупка"
                badge={!activeSub}
              />
            )}
            <TabButton active={tab === 'keys'} onClick={() => setTab('keys')} icon={KeyRound} label="Активация" />
            <TabButton active={tab === 'hwid'} onClick={() => setTab('hwid')} icon={Monitor} label="HWID" />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {subscriptions.length === 0 ? (
                <div className="glass flex flex-col items-center justify-center rounded-3xl py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                    <Shield className="h-8 w-8 text-white/30" />
                  </div>
                  <p className="text-lg font-light text-white/40">Нет активных подписок</p>
                  <button
                    onClick={() => setTab('buy')}
                    className="mt-6 rounded-full border border-white/[0.1] bg-white/[0.05] px-8 py-3 text-sm font-medium text-white transition hover:border-white/[0.2] hover:bg-white/[0.08]"
                  >
                    Приобрести доступ
                  </button>
                </div>
              ) : (
                subscriptions.map((sub) => {
                  const p = productById(sub.productId);
                  if (!p) return null;
                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass hover-lift relative overflow-hidden rounded-2xl p-6"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 transition-opacity hover:opacity-100" />
                      <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                            <Shield className="h-6 w-6 text-white/40" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-display text-lg font-semibold text-white">{p.name}</h3>
                              <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50">
                                {p.status}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-white/30">{p.version}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-wider text-white/30">Действует до</div>
                            <div className="font-mono text-sm text-white/70">
                              {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('ru-RU') : 'Lifetime'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40 opacity-75"></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                            </span>
                            <span className="text-xs font-medium text-white/70">Active</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {tab === 'buy' && (
            <motion.div
              key="buy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg"
            >
              {!purchasePending ? (
                <div className="glass-strong glow-subtle relative overflow-hidden rounded-3xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                  <div className="relative p-8">
                    <div className="mb-1 text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Lifetime Access</div>
                    <h3 className="font-display text-3xl font-bold text-white">{product?.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/40">{product?.description}</p>

                    {/* Currency Selector */}
                    <div className="mt-6 flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
                      <button
                        onClick={() => setCurrency('usdt')}
                        className={`currency-btn flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                          currency === 'usdt' ? 'active text-white' : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        USDT (Crypto)
                      </button>
                      <button
                        onClick={() => setCurrency('rub')}
                        className={`currency-btn flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
                          currency === 'rub' ? 'active text-white' : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        Рубли (RUB)
                      </button>
                    </div>

                    {/* Price */}
                    <div className="my-8">
                      {currency === 'usdt' ? (
                        <div className="flex items-baseline gap-4">
                          <span className="text-2xl font-light text-white/20 line-through">${(product!.priceRubOld / 100).toFixed(2)}</span>
                          <span className="font-display text-6xl font-bold text-white">${product?.priceUsdt}</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-4">
                          <span className="text-2xl font-light text-white/20 line-through">{product?.priceRubOld}₽</span>
                          <span className="font-display text-6xl font-bold text-white">{product?.priceRub}₽</span>
                        </div>
                      )}
                    </div>

                    <ul className="mb-8 space-y-3">
                      {product?.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-white/50">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5">
                            <Check className="h-3 w-3" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {currency === 'usdt' ? (
                      <button
                        onClick={handleBuy}
                        disabled={loading}
                        className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-4 text-base font-medium text-white transition hover:border-white/[0.2] hover:bg-white/[0.1] disabled:opacity-50"
                      >
                        {loading ? 'Создание заявки...' : 'Оставить заявку на проверку'}
                      </button>
                    ) : (
                      <button
                        onClick={openTelegram}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.06] py-4 text-base font-medium text-white transition hover:border-white/[0.2] hover:bg-white/[0.1]"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Написать в Telegram
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="glass glow-subtle rounded-3xl p-8 text-center"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                    <Check className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">Заявка создана</h3>
                  <p className="mt-2 text-sm text-white/40">
                    Оплата должна пройти ручную проверку. После подтверждения администратор выдаст ключ.
                  </p>

                  <button
                    onClick={() => {
                      setTab('overview');
                    }}
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.06] py-3 text-sm font-medium text-white transition hover:border-white/[0.2] hover:bg-white/[0.1]"
                  >
                    Вернуться к подпискам
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {tab === 'keys' && (
            <motion.div
              key="keys"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-md"
            >
              <div className="glass rounded-3xl p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    <KeyRound className="h-5 w-5 text-white/50" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">Активация ключа</h3>
                    <p className="text-xs text-white/40">Введите ваш лицензионный ключ</p>
                  </div>
                </div>
                <form onSubmit={activate} className="space-y-4">
                  <div className="relative">
                    <input
                      value={keyValue}
                      onChange={(e) => setKeyValue(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="input-field h-14 w-full rounded-xl px-5 font-mono text-sm"
                    />
                    <KeyRound className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/20" />
                  </div>
                  <button
                    disabled={loading}
                    className="h-14 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] text-sm font-medium text-white transition hover:border-white/[0.2] hover:bg-white/[0.08] disabled:opacity-50"
                  >
                    {loading ? 'Проверка...' : 'Активировать ключ'}
                  </button>
                </form>
                {message && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`mt-4 rounded-xl p-4 text-sm ${
                      message.includes('успешно') ? 'bg-white/5 text-white/70' : 'bg-white/[0.03] text-white/50'
                    }`}
                  >
                    {message}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'hwid' && (
            <motion.div
              key="hwid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl"
            >
              <div className="glass rounded-3xl p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                    <Monitor className="h-5 w-5 text-white/50" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">Управление HWID</h3>
                    <p className="text-xs text-white/40">Привязка к оборудованию</p>
                  </div>
                </div>
                <div className="glass mb-6 rounded-xl p-5">
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-white/30">Текущий HWID</div>
                  <div className="flex items-center justify-between gap-4">
                    <code className="break-all font-mono text-lg tracking-wider text-white/70">{maskedHwid}</code>
                    {currentUser.hwid && (
                      <button
                        onClick={() => setShowHwid(!showHwid)}
                        className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white"
                      >
                        {showHwid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={requestReset}
                    disabled={!currentUser.hwid || currentUser.hwidResetRequested}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm text-white/70 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Запросить сброс
                  </button>
                  <button
                    onClick={() => currentUser.hwid && navigator.clipboard.writeText(currentUser.hwid)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm text-white/70 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                    Копировать
                  </button>
                </div>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white/60"
                  >
                    <Check className="h-4 w-4" />
                    {message}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

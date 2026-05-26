import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { User } from '../data/mockData';
import { StoreService } from '../services/store';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User) => void;
  switchMode: (mode: 'login' | 'register') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSuccess,
  switchMode,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const result =
        mode === 'login'
          ? StoreService.login(username, password)
          : StoreService.register(username, email, password);

      setLoading(false);

      if (result.success && result.user) {
        onSuccess(result.user);
        setUsername('');
        setEmail('');
        setPassword('');
        onClose();
      } else {
        setError(result.message);
      }
    }, 600);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="glass-strong glow-subtle relative w-full max-w-md overflow-hidden rounded-2xl p-6 sm:rounded-3xl sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-white/30 transition hover:bg-white/5 hover:text-white sm:right-4 sm:top-4 sm:h-10 sm:w-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="mb-2 text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase sm:text-xs">
              {mode === 'login' ? 'С возвращением' : 'Регистрация'}
            </div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {mode === 'login' ? 'Вход в аккаунт' : 'Создать аккаунт'}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Имя пользователя"
                className="input-field h-12 w-full rounded-xl pl-12 pr-4 text-sm sm:h-14"
                required
              />
            </div>

            {mode === 'register' && (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="input-field h-12 w-full rounded-xl pl-12 pr-4 text-sm sm:h-14"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/20" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="input-field h-12 w-full rounded-xl pl-12 pr-4 text-sm sm:h-14"
                required
              />
            </div>

            {mode === 'register' && (
              <p className="text-xs text-white/30">
                Минимум 6 символов, включая одну заглавную букву
              </p>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-white/[0.05] p-3.5 text-sm text-white/60 sm:p-4"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] text-sm font-medium text-white transition hover:border-white/[0.2] hover:bg-white/[0.1] disabled:opacity-50 sm:h-14"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Загрузка...
                </span>
              ) : mode === 'login' ? (
                'Войти'
              ) : (
                'Создать аккаунт'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-5 text-center sm:mt-6">
            <button
              onClick={() => {
                switchMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-sm text-white/40 transition hover:text-white"
            >
              {mode === 'login'
                ? 'Нет аккаунта? Зарегистрироваться'
                : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

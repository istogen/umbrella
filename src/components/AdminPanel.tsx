import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StoreService } from '../services/store';
import { User, Product, LicenseKey, ProductStatus } from '../data/mockData';
import { AlertTriangle, Download, Copy, Search, Shield, Users, Key, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  currentUser: User | null;
  products: Product[];
  users: User[];
  onRefreshAll: () => void;
}

const StatusBadge = ({ status }: { status: ProductStatus }) => {
  const colors = {
    UNDETECTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    DETECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
    MAINTENANCE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    FROZEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUser, 
  products, 
  users, 
  onRefreshAll 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genCount, setGenCount] = useState<number>(5);
  const [generatedKeys, setGeneratedKeys] = useState<LicenseKey[]>([]);
  const [copiedKeys, setCopiedKeys] = useState(false);
  const [autoFreeze, setAutoFreeze] = useState(true);

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <div className="text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">Доступ запрещён</h2>
          <p className="mt-2 text-sm text-white/40">Только для администраторов</p>
        </div>
      </div>
    );
  }

  const handleToggleStatus = (productId: string, status: ProductStatus) => {
    StoreService.updateProductStatus(productId, status, autoFreeze);
    onRefreshAll();
  };

  const handleGenerateKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (!products[0]) return;
    const result = StoreService.generateKeys(products[0].id, 9999, genCount);
    setGeneratedKeys(result);
    onRefreshAll();
  };

  const handleExport = () => {
    if (generatedKeys.length === 0) return;
    const text = generatedKeys.map(k => k.key).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `umbrella_keys_${genCount}x.txt`;
    link.click();
  };

  const handleCopy = () => {
    if (generatedKeys.length === 0) return;
    navigator.clipboard.writeText(generatedKeys.map(k => k.key).join('\n'));
    setCopiedKeys(true);
    setTimeout(() => setCopiedKeys(false), 2000);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24 pt-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="glass-red flex h-12 w-12 items-center justify-center rounded-xl">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <div className="text-xs font-medium tracking-[0.2em] text-red-400/60 uppercase">
                Admin Panel
              </div>
              <h1 className="font-display text-4xl font-bold text-white">Управление</h1>
            </div>
          </div>
        </motion.div>

        {/* Product Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass mb-6 rounded-3xl p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">Статус продукта</h2>
            <label className="flex items-center gap-2 text-sm text-white/40">
              <input
                type="checkbox"
                checked={autoFreeze}
                onChange={(e) => setAutoFreeze(e.target.checked)}
                className="rounded border-white/10 bg-white/5"
              />
              Авто-заморозка
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map(product => (
              <div key={product.id} className="glass-red rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-white/80">{product.name}</span>
                  <StatusBadge status={product.status} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['UNDETECTED', 'MAINTENANCE', 'DETECTED', 'FROZEN'] as ProductStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleToggleStatus(product.id, status)}
                      className={`rounded-lg py-2 text-xs font-medium transition ${
                        product.status === status
                          ? 'bg-red-400/20 text-white'
                          : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Key Generator */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass mb-6 rounded-3xl p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <Key className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="font-display text-lg font-semibold text-white">Генератор ключей</h2>
          </div>

          <form onSubmit={handleGenerateKeys} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-2 block text-xs text-white/40">Количество</label>
              <input
                type="number"
                min={1}
                max={100}
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                className="input-field h-12 w-28 rounded-xl px-4 text-center"
              />
            </div>
            <button
              type="submit"
              className="btn-red h-12 rounded-xl px-6 text-sm"
            >
              Сгенерировать
            </button>
          </form>

          {generatedKeys.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 glass-red rounded-2xl p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-white/60">
                  Сгенерировано {generatedKeys.length} ключей
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="btn-secondary flex items-center gap-2 rounded-lg px-4 py-2 text-xs"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedKeys ? 'Скопировано' : 'Копировать'}
                  </button>
                  <button
                    onClick={handleExport}
                    className="btn-secondary flex items-center gap-2 rounded-lg px-4 py-2 text-xs"
                  >
                    <Download className="h-3 w-3" />
                    .txt
                  </button>
                </div>
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto font-mono text-sm text-white/50">
                {generatedKeys.map((key) => (
                  <div key={key.id} className="rounded-lg bg-white/[0.02] px-3 py-2">
                    {key.key}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Users List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-3xl p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <Users className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="font-display text-lg font-semibold text-white">
                Пользователи ({users.length})
              </h2>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск..."
                className="input-field h-11 w-64 rounded-xl pl-10 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-white/30">
                  <th className="pb-4 font-medium">Пользователь</th>
                  <th className="pb-4 font-medium">Роль</th>
                  <th className="pb-4 font-medium">HWID</th>
                  <th className="pb-4 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="text-sm">
                    <td className="py-4">
                      <div className="font-medium text-white/80">{user.username}</div>
                      <div className="text-xs text-white/30">{user.email}</div>
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      {user.hwidResetRequested ? (
                        <span className="flex items-center gap-1 text-red-400">
                          <RefreshCw className="h-3 w-3" />
                          Запрос сброса
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-white/30">
                          {user.hwid ? 'Привязан' : '—'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {user.hwidResetRequested ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              StoreService.approveHwidReset(user.id);
                              onRefreshAll();
                            }}
                            className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-500/20"
                          >
                            Одобрить
                          </button>
                          <button
                            onClick={() => {
                              StoreService.rejectHwidReset(user.id);
                              onRefreshAll();
                            }}
                            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 transition hover:bg-white/10"
                          >
                            Отклонить
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            StoreService.approveHwidReset(user.id);
                            onRefreshAll();
                          }}
                          disabled={!user.hwid}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 transition hover:bg-white/10 disabled:opacity-30"
                        >
                          Сбросить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

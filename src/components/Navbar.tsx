import React from 'react';
import { User } from '../data/mockData';
import { LogIn, LogOut } from 'lucide-react';
import { UmbrellaLogo } from './UmbrellaLogo';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'landing' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'landing' | 'dashboard' | 'admin') => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
}) => {
  const navLinks = [
    { id: 'landing', label: 'Главная' },
    ...(currentUser ? [{ id: 'dashboard', label: 'Кабинет' }] : []),
    ...(currentUser?.role === 'ADMIN' ? [{ id: 'admin', label: 'Admin' }] : []),
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-4 mt-4">
        <div className="glass-strong mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl px-6">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('landing')}
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="umbrella-pulse-hover flex h-10 w-10 items-center justify-center">
              <UmbrellaLogo size={36} animated />
            </div>
            <span className="font-display hidden text-lg font-bold tracking-tight text-white sm:block">
              Umbrella
            </span>
          </button>

          {/* Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id as any)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === link.id ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {link.label}
                {activeTab === link.id && (
                  <span className="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 rounded-full bg-white/40" />
                )}
              </button>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="hidden text-sm text-white/40 lg:block">{currentUser.username}</span>
                <button
                  onClick={onLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/50 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="btn-secondary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

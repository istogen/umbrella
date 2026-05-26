import React, { useEffect, useState } from 'react';
import { StoreService } from './services/store';
import { initStore, User, Product } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { PurchaseModal } from './components/PurchaseModal';
import { LoaderScreen } from './components/LoaderScreen';
import { CursorGlow } from './components/CursorGlow';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'admin'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const refreshAllData = () => {
    setCurrentUser(StoreService.getCurrentUser());
    setProducts(StoreService.getProducts());
    setUsers(StoreService.getUsers());
  };

  useEffect(() => {
    initStore();
    refreshAllData();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    StoreService.setCurrentUser(null);
    setCurrentUser(null);
    if (activeTab === 'dashboard' || activeTab === 'admin') {
      setActiveTab('landing');
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSuccessPurchase = (key: string) => {
    refreshAllData();
    if (currentUser) {
      StoreService.activateKey(key, currentUser.id);
      refreshAllData();
      setActiveTab('dashboard');
    }
  };

  if (loading) {
    return <LoaderScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#030305] text-white antialiased">
      <CursorGlow />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-white/[0.015] blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[800px] w-[800px] rounded-full bg-white/[0.01] blur-[200px]" />
      </div>

      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <main className="relative z-10">
        {activeTab === 'landing' && (
          <Landing
            products={products}
            currentUser={currentUser}
            onSelectProduct={handleSelectProduct}
            onOpenAuth={handleOpenAuth}
            onGoDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dashboard' && currentUser && (
          <Dashboard
            currentUser={currentUser}
            products={products}
            subscriptions={StoreService.getUserSubscriptions(currentUser.id)}
            onUpdateUser={(u: User) => {
              setCurrentUser(u);
              refreshAllData();
            }}
            onRefreshSubs={refreshAllData}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'ADMIN' && (
          <AdminPanel
            currentUser={currentUser}
            products={products}
            users={users}
            onRefreshAll={refreshAllData}
          />
        )}
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-[#030305]/80 py-8 backdrop-blur-xl sm:py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:gap-6 md:px-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-bold tracking-tight sm:text-lg">Umbrella</span>
            <span className="text-red-400/60">|</span>
            <span className="text-xs text-white/40 sm:text-sm">Private Dota 2 Client</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30 sm:gap-8 sm:text-sm">
            <span>Lifetime Keys</span>
            <span>HWID Protection</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(u: User) => {
          setCurrentUser(u);
          refreshAllData();
          if (activeTab === 'landing') setActiveTab('dashboard');
        }}
        switchMode={(mode) => setAuthMode(mode)}
      />

      <PurchaseModal
        product={selectedProduct}
        currentUser={currentUser}
        onClose={() => setSelectedProduct(null)}
        onOpenAuth={() => handleOpenAuth('login')}
        onSuccessPurchase={handleSuccessPurchase}
      />
    </div>
  );
};

export default App;

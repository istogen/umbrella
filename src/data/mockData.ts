export type Role = 'USER' | 'RESELLER' | 'ADMIN';
export type ProductStatus = 'UNDETECTED' | 'DETECTED' | 'MAINTENANCE' | 'FROZEN';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: Role;
  hwid: string | null;
  hwidUpdatedAt: string | null;
  createdAt: string;
  lastLogin: string;
  hwidResetRequested?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  version: string;
  status: ProductStatus;
  imageUrl: string;
  priceRub: number;        // actual price in RUB (1999)
  priceRubOld: number;      // crossed out old price (2499)
  priceUsdt: number;        // USDT equivalent (~19.27)
  features: string[];
  game: string;
}

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  expiresAt: string | null;
  isFrozen: boolean;
  createdAt: string;
}

export interface LicenseKey {
  id: string;
  key: string;
  productId: string;
  durationDays: number;
  isUsed: boolean;
  usedByUserId: string | null;
  createdAt: string;
  activatedAt: string | null;
}

export interface LoaderAuthRequest {
  username: string;
  token: string;
  hwid: string;
  productId: string;
}

export interface LoaderAuthResponse {
  success: boolean;
  message: string;
  user?: { username: string; role: Role };
  subscription?: { active: boolean; expiresAt: string | null; isFrozen: boolean };
  productStatus?: ProductStatus;
  hmacSignature?: string;
}

// Simple password hash simulation (for localStorage demo – in production use bcrypt/argon2 on server)
const simpleHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'umbrella_' + Math.abs(hash).toString(36);
};

export const validatePassword = (pw: string): string | null => {
  if (pw.length < 6) return 'Пароль должен содержать минимум 6 символов.';
  if (!/[A-ZА-Я]/.test(pw)) return 'Пароль должен содержать хотя бы одну заглавную букву.';
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Введите корректный email адрес.';
  return null;
};

export { simpleHash };

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Umbrella Crack',
    game: 'Dota 2 Client',
    description: 'Кряк на лучший клиент под Dota 2. Быстрые ключи, мгновенная активация, привязка HWID.',
    version: 'build 2.1.0',
    status: 'UNDETECTED',
    imageUrl: '',
    priceRub: 1999,
    priceRubOld: 2499,
    priceUsdt: 19.27,
    features: ['Мгновенная выдача ключа', 'Привязка к оборудованию (HWID)', 'Личный кабинет с подписками', 'Авто-обновления']
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    username: 'umbrella_admin',
    email: 'admin@umbrella.local',
    passwordHash: simpleHash('Admin12'),
    role: 'ADMIN',
    hwid: 'HWID-9F8E-7A6B-5C4D-3E2F-1A0B',
    hwidUpdatedAt: '2026-01-15T10:30:00.000Z',
    createdAt: '2025-06-01T00:00:00.000Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'user-1',
    username: 'umbrella_user',
    email: 'user@umbrella.local',
    passwordHash: simpleHash('User123'),
    role: 'USER',
    hwid: 'HWID-1A2B-3C4D-5E6F-7A8B-9C0D',
    hwidUpdatedAt: '2026-02-10T14:20:00.000Z',
    createdAt: '2025-11-12T08:15:00.000Z',
    lastLogin: new Date(Date.now() - 3600000).toISOString()
  }
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    userId: 'user-admin',
    productId: 'prod-1',
    expiresAt: null,
    isFrozen: false,
    createdAt: '2025-06-01T00:00:00.000Z'
  },
  {
    id: 'sub-2',
    userId: 'user-1',
    productId: 'prod-1',
    expiresAt: new Date(Date.now() + 18 * 86400000).toISOString(),
    isFrozen: false,
    createdAt: '2026-02-10T00:00:00.000Z'
  }
];

const INITIAL_KEYS: LicenseKey[] = [
  {
    id: 'key-1',
    key: 'K7QA-9MFD-2XPL-8VRC',
    productId: 'prod-1',
    durationDays: 9999,
    isUsed: false,
    usedByUserId: null,
    createdAt: '2026-02-20T00:00:00.000Z',
    activatedAt: null
  },
  {
    id: 'key-2',
    key: 'R8HN-4VZT-Q6CB-W2LA',
    productId: 'prod-1',
    durationDays: 9999,
    isUsed: false,
    usedByUserId: null,
    createdAt: '2026-02-20T00:00:00.000Z',
    activatedAt: null
  }
];

export const getStoredData = <T>(key: string, initialData: T): T => {
  try {
    const item = localStorage.getItem(`umbrella_${key}`);
    return item ? JSON.parse(item) : initialData;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return initialData;
  }
};

export const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`umbrella_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

export const initStore = () => {
  const brandVersion = 'umbrella-v5-four-part-keys-crypto-invoices';
  if (localStorage.getItem('umbrella_brand_version') !== brandVersion) {
    setStoredData('products', INITIAL_PRODUCTS);
    setStoredData('users', INITIAL_USERS);
    setStoredData('subscriptions', INITIAL_SUBSCRIPTIONS);
    setStoredData('keys', INITIAL_KEYS);
    setStoredData('current_user', null); // No auto-login, user must authenticate
    localStorage.setItem('umbrella_brand_version', brandVersion);
    return;
  }

  if (!localStorage.getItem('umbrella_products')) setStoredData('products', INITIAL_PRODUCTS);
  if (!localStorage.getItem('umbrella_users')) setStoredData('users', INITIAL_USERS);
  if (!localStorage.getItem('umbrella_subscriptions')) setStoredData('subscriptions', INITIAL_SUBSCRIPTIONS);
  if (!localStorage.getItem('umbrella_keys')) setStoredData('keys', INITIAL_KEYS);
  if (!localStorage.getItem('umbrella_current_user')) setStoredData('current_user', null);
};

import { 
  getStoredData, 
  setStoredData, 
  User, 
  Product, 
  Subscription, 
  LicenseKey, 
  ProductStatus, 
  simpleHash,
  validatePassword,
  validateEmail
} from '../data/mockData';

export const StoreService = {
  getProducts(): Product[] {
    return getStoredData<Product[]>('products', []);
  },

  updateProductStatus(productId: string, newStatus: ProductStatus, freezeSubs: boolean): void {
    const products = this.getProducts();
    const updated = products.map(p => p.id === productId ? { ...p, status: newStatus } : p);
    setStoredData('products', updated);

    if (freezeSubs && (newStatus === 'MAINTENANCE' || newStatus === 'FROZEN')) {
      const subs = this.getAllSubscriptions();
      const updatedSubs = subs.map(s => s.productId === productId ? { ...s, isFrozen: true } : s);
      setStoredData('subscriptions', updatedSubs);
    } else if (newStatus === 'UNDETECTED') {
      const subs = this.getAllSubscriptions();
      const updatedSubs = subs.map(s => s.productId === productId ? { ...s, isFrozen: false } : s);
      setStoredData('subscriptions', updatedSubs);
    }
  },

  getUsers(): User[] {
    return getStoredData<User[]>('users', []);
  },

  getCurrentUser(): User | null {
    return getStoredData<User | null>('current_user', null);
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      const users = this.getUsers();
      const updated = users.map(u => u.id === user.id ? { ...user, lastLogin: new Date().toISOString() } : u);
      setStoredData('users', updated);
      setStoredData('current_user', { ...user, lastLogin: new Date().toISOString() });
    } else {
      setStoredData('current_user', null);
    }
  },

  login(username: string, password: string): { success: boolean; message: string; user?: User } {
    if (!username.trim()) return { success: false, message: 'Введите имя пользователя.' };
    if (!password) return { success: false, message: 'Введите пароль.' };

    const users = this.getUsers();
    const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!found) {
      return { success: false, message: 'Пользователь не найден. Проверьте логин или зарегистрируйтесь.' };
    }

    const hash = simpleHash(password);
    if (found.passwordHash !== hash) {
      return { success: false, message: 'Неверный пароль.' };
    }

    this.setCurrentUser(found);
    return { success: true, message: `Добро пожаловать, ${found.username}!`, user: found };
  },

  register(username: string, email: string, password: string): { success: boolean; message: string; user?: User } {
    // Validate inputs
    if (!username.trim() || username.trim().length < 2) 
      return { success: false, message: 'Имя пользователя должно содержать минимум 2 символа.' };
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) 
      return { success: false, message: 'Имя пользователя может содержать только латинские буквы, цифры и _. ' };

    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, message: emailErr };

    const passErr = validatePassword(password);
    if (passErr) return { success: false, message: passErr };

    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return { success: false, message: 'Имя пользователя уже занято.' };
    }
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, message: 'Email уже зарегистрирован.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      email: email.trim(),
      passwordHash: simpleHash(password),
      role: 'USER',
      hwid: null,
      hwidUpdatedAt: null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    setStoredData('users', users);
    this.setCurrentUser(newUser);

    return { success: true, message: 'Регистрация успешно завершена!', user: newUser };
  },

  getAllSubscriptions(): Subscription[] {
    return getStoredData<Subscription[]>('subscriptions', []);
  },

  getUserSubscriptions(userId: string): Subscription[] {
    return this.getAllSubscriptions().filter(s => s.userId === userId);
  },

  getAllKeys(): LicenseKey[] {
    return getStoredData<LicenseKey[]>('keys', []);
  },

  activateKey(keyString: string, userId: string): { success: boolean; message: string; subscription?: Subscription } {
    const keys = this.getAllKeys();
    const keyIndex = keys.findIndex(k => k.key.toUpperCase() === keyString.toUpperCase());

    if (keyIndex === -1) {
      return { success: false, message: 'Неверный лицензионный ключ.' };
    }

    const key = keys[keyIndex];
    if (key.isUsed) {
      return { success: false, message: 'Этот ключ уже был активирован ранее.' };
    }

    keys[keyIndex] = {
      ...key,
      isUsed: true,
      usedByUserId: userId,
      activatedAt: new Date().toISOString()
    };
    setStoredData('keys', keys);

    const subs = this.getAllSubscriptions();
    const existingSubIndex = subs.findIndex(s => s.userId === userId && s.productId === key.productId);

    let newSub: Subscription;

    if (existingSubIndex !== -1) {
      const existing = subs[existingSubIndex];
      // Lifetime always wins
      const newExpires = (key.durationDays === 9999 || existing.expiresAt === null) ? null : existing.expiresAt;

      newSub = {
        ...existing,
        expiresAt: newExpires,
        isFrozen: false
      };
      subs[existingSubIndex] = newSub;
    } else {
      newSub = {
        id: `sub-${Date.now()}`,
        userId,
        productId: key.productId,
        expiresAt: key.durationDays === 9999 ? null : new Date(Date.now() + key.durationDays * 86400000).toISOString(),
        isFrozen: false,
        createdAt: new Date().toISOString()
      };
      subs.push(newSub);
    }

    setStoredData('subscriptions', subs);
    return { success: true, message: 'Ключ успешно активирован! Подписка добавлена в личный кабинет.', subscription: newSub };
  },

  generateKeys(productId: string, durationDays: number, count: number): LicenseKey[] {
    const keys = this.getAllKeys();
    const newKeys: LicenseKey[] = [];

    const randomPart = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let value = '';
      for (let i = 0; i < 4; i++) {
        value += chars[Math.floor(Math.random() * chars.length)];
      }
      return value;
    };

    for (let i = 0; i < count; i++) {
      let keyString = `${randomPart()}-${randomPart()}-${randomPart()}-${randomPart()}`;
      while (keys.some((key) => key.key === keyString)) {
        keyString = `${randomPart()}-${randomPart()}-${randomPart()}-${randomPart()}`;
      }

      const newKey: LicenseKey = {
        id: `key-${Date.now()}-${i}`,
        key: keyString,
        productId,
        durationDays,
        isUsed: false,
        usedByUserId: null,
        createdAt: new Date().toISOString(),
        activatedAt: null
      };

      newKeys.push(newKey);
      keys.push(newKey);
    }

    setStoredData('keys', keys);
    return newKeys;
  },

  requestHwidReset(userId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return { success: false, message: 'Пользователь не найден.' };

    const user = users[userIndex];
    if (user.hwidResetRequested) {
      return { success: false, message: 'Заявка на сброс HWID уже находится на рассмотрении у администратора.' };
    }

    if (user.hwidUpdatedAt) {
      const daysSinceUpdate = (Date.now() - new Date(user.hwidUpdatedAt).getTime()) / (1000 * 3600 * 24);
      if (daysSinceUpdate < 3) {
        return { success: false, message: `Сброс HWID возможен не чаще 1 раза в 3 дня. Прошло: ${daysSinceUpdate.toFixed(1)} дней.` };
      }
    }

    users[userIndex] = { ...user, hwidResetRequested: true };
    setStoredData('users', users);

    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId) {
      this.setCurrentUser(users[userIndex]);
    }

    return { success: true, message: 'Заявка на сброс HWID успешно отправлена администратору.' };
  },

  approveHwidReset(userId: string): void {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { 
        ...users[userIndex], 
        hwid: null, 
        hwidUpdatedAt: new Date().toISOString(),
        hwidResetRequested: false 
      };
      setStoredData('users', users);

      const currentUser = this.getCurrentUser();
      if (currentUser?.id === userId) {
        this.setCurrentUser(users[userIndex]);
      }
    }
  },

  rejectHwidReset(userId: string): void {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { 
        ...users[userIndex], 
        hwidResetRequested: false 
      };
      setStoredData('users', users);

      const currentUser = this.getCurrentUser();
      if (currentUser?.id === userId) {
        this.setCurrentUser(users[userIndex]);
      }
    }
  },
};

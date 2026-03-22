/**
 * Persistent User Storage - Stores user data separately from site cache
 * Uses localStorage with a separate namespace to survive cache clearing
 */

export interface OfflineUser {
  id: string;
  email: string;
  password: string; // Should be hashed in production
  name: string;
  role: 'admin' | 'manager' | 'waiter' | 'chef';
  createdAt: string;
  lastLogin?: string;
}

class PersistentUserStorage {
  private namespace = '__RESTAURANT_USERS__';
  private lockNamespace = '__RESTAURANT_LOCK__';
  private tablesNamespace = '__RESTAURANT_TABLES__';
  private setupNamespace = '__RESTAURANT_SETUP__';

  /**
   * Check if system needs activation code
   */
  isLocked(): boolean {
    const lockData = this.getLockData();
    if (!lockData) return false;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastUnlockDate = new Date(lockData.lastUnlockDate);

    return lastUnlockDate < thisMonthStart;
  }

  /**
   * Get days remaining in subscription (before next month lock)
   */
  getDaysRemaining(): number {
    const lockData = this.getLockData();
    if (!lockData) return 0;

    const now = new Date();
    const lastUnlockDate = new Date(lockData.lastUnlockDate);

    // Calculate when next month starts (expiry date)
    const nextMonthStart = new Date(
      lastUnlockDate.getFullYear(),
      lastUnlockDate.getMonth() + 1,
      1
    );

    const daysRemaining = Math.ceil(
      (nextMonthStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, daysRemaining);
  }

  /**
   * Check if subscription renewal notice should be shown (within 3 days of expiry)
   */
  shouldShowRenewalNotice(): boolean {
    const daysRemaining = this.getDaysRemaining();
    return daysRemaining <= 3 && daysRemaining > 0;
  }

  /**
   * Unlock system with secret code
   */
  unlockSystem(code: string): boolean {
    if (code === 'NEXUS2026SHAURYA') {
      const lockData = {
        lastUnlockDate: new Date().toISOString(),
        codeAttempts: 0,
      };
      localStorage.setItem(this.lockNamespace, JSON.stringify(lockData));
      return true;
    }
    return false;
  }

  /**
   * Initialize lock on first setup
   */
  initializeLock(): void {
    const lockData = {
      lastUnlockDate: new Date().toISOString(),
      codeAttempts: 0,
    };
    localStorage.setItem(this.lockNamespace, JSON.stringify(lockData));
  }

  private getLockData(): any {
    try {
      const data = localStorage.getItem(this.lockNamespace);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save user account
   */
  saveUser(user: OfflineUser): void {
    try {
      const users = this.getAllUsers();
      const existingIndex = users.findIndex((u) => u.email === user.email);

      if (existingIndex > -1) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }

      localStorage.setItem(this.namespace, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  /**
   * Get all saved users
   */
  getAllUsers(): OfflineUser[] {
    try {
      const data = localStorage.getItem(this.namespace);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Login user - verify credentials
   */
  loginUser(email: string, password: string): OfflineUser | null {
    const users = this.getAllUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      user.lastLogin = new Date().toISOString();
      this.saveUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  }

  /**
   * Get current logged-in user
   */
  getCurrentUser(): OfflineUser | null {
    try {
      const data = localStorage.getItem('currentUser');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('currentUser');
  }

  /**
   * Check if user exists
   */
  userExists(email: string): boolean {
    const users = this.getAllUsers();
    return users.some((u) => u.email === email);
  }

  /**
   * Save setup data (tables count, etc.)
   */
  saveSetup(data: any): void {
    try {
      localStorage.setItem(this.setupNamespace, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving setup:', error);
    }
  }

  /**
   * Get setup data
   */
  getSetup(): any {
    try {
      const data = localStorage.getItem(this.setupNamespace);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if setup is complete
   */
  isSetupComplete(): boolean {
    const setup = this.getSetup();
    return setup && setup.tablesCount > 0;
  }

  /**
   * Save tables to local storage
   */
  saveTables(tables: any[]): void {
    try {
      localStorage.setItem(this.tablesNamespace, JSON.stringify(tables));
    } catch (error) {
      console.error('Error saving tables:', error);
    }
  }

  /**
   * Get tables from local storage
   */
  getTables(): any[] {
    try {
      const data = localStorage.getItem(this.tablesNamespace);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear all data (admin function)
   */
  clearAllData(): void {
    localStorage.removeItem(this.namespace);
    localStorage.removeItem(this.lockNamespace);
    localStorage.removeItem(this.tablesNamespace);
    localStorage.removeItem(this.setupNamespace);
    localStorage.removeItem('currentUser');
  }
}

export const persistentUserStorage = new PersistentUserStorage();

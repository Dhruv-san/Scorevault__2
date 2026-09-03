import { CURRENT_USER } from '../data/seedData';
import { User } from '../types';

const AUTH_STORAGE_KEY = 'scorevault_auth_user_v1';
const TOKEN_STORAGE_KEY = 'scorevault_jwt_token_v1';

type AuthListener = (user: User | null) => void;

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.loadUser();
  }

  private async loadUser() {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        this.token = storedToken;
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            this.currentUser = json.data;
            this.notify();
            return;
          }
        }
      }

      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      } else {
        this.currentUser = { ...CURRENT_USER };
      }
    } catch {
      this.currentUser = { ...CURRENT_USER };
    }
    this.notify();
  }

  public getToken(): string | null {
    return this.token || localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.currentUser);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentUser));
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public async loginWithEmail(email: string, password?: string): Promise<User> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'password123' })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        this.token = json.data.token;
        this.currentUser = json.data.user;
        localStorage.setItem(TOKEN_STORAGE_KEY, json.data.token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
        this.notify();
        return this.currentUser!;
      }
    } catch (e) {
      console.warn('Backend login request failed, falling back to client session', e);
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      role: 'student',
      city: 'Delhi NCR',
      isVerified: true,
      joinedDate: new Date().toISOString().split('T')[0],
      savedInstitutionIds: []
    };
    this.currentUser = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  public async signup(details: { name: string; email: string; password?: string; role: User['role']; city: string; institutionName?: string }): Promise<User> {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          password: details.password || 'password123',
          role: details.role,
          city: details.city,
          institutionName: details.institutionName
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        this.token = json.data.token;
        this.currentUser = json.data.user;
        localStorage.setItem(TOKEN_STORAGE_KEY, json.data.token);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
        this.notify();
        return this.currentUser!;
      }
    } catch (e) {
      console.warn('Backend signup request failed, falling back to local session', e);
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name: details.name,
      email: details.email,
      role: details.role,
      city: details.city,
      institutionName: details.institutionName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(details.name)}`,
      isVerified: true,
      joinedDate: new Date().toISOString().split('T')[0],
      savedInstitutionIds: []
    };
    this.currentUser = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  public async loginWithGoogle(): Promise<User> {
    return this.loginWithEmail('priyanka.sharma@gmail.com');
  }

  public async loginWithPhone(phoneNumber: string): Promise<User> {
    return this.loginWithEmail(`user_${phoneNumber.slice(-4)}@scorevault.in`);
  }

  public switchRole(role: User['role']) {
    if (this.currentUser) {
      this.currentUser.role = role;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      this.notify();
    }
  }

  public logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.notify();
  }
}

export const authService = new AuthService();

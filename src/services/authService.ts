import { CURRENT_USER } from '../data/seedData';
import { User } from '../types';

const AUTH_STORAGE_KEY = 'scorevault_auth_user_v1';

type AuthListener = (user: User | null) => void;

class AuthService {
  private currentUser: User | null = null;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.loadUser();
  }

  private loadUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Default to logged-in student Dhruv Verma for smooth prototype testing
        this.currentUser = { ...CURRENT_USER };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      }
    } catch {
      this.currentUser = { ...CURRENT_USER };
    }
  }

  private persistUser() {
    try {
      if (this.currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist user session', e);
    }
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

  public async loginWithEmail(email: string): Promise<User> {
    // Simulated authentication
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
    this.persistUser();
    this.notify();
    return user;
  }

  public async loginWithGoogle(): Promise<User> {
    const user: User = {
      id: `google-${Date.now()}`,
      name: 'Priyanka Sharma',
      email: 'priyanka.sharma@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      role: 'parent',
      city: 'Mumbai',
      isVerified: true,
      joinedDate: new Date().toISOString().split('T')[0],
      savedInstitutionIds: []
    };
    this.currentUser = user;
    this.persistUser();
    this.notify();
    return user;
  }

  public async loginWithPhone(phoneNumber: string): Promise<User> {
    const user: User = {
      id: `phone-${Date.now()}`,
      name: `User +91 ${phoneNumber.slice(-4)}`,
      email: `user_${phoneNumber.slice(-4)}@scorevault.in`,
      phone: phoneNumber,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phoneNumber}`,
      role: 'student',
      city: 'Bangalore',
      isVerified: true,
      joinedDate: new Date().toISOString().split('T')[0],
      savedInstitutionIds: []
    };
    this.currentUser = user;
    this.persistUser();
    this.notify();
    return user;
  }

  public async signup(details: { name: string; email: string; role: User['role']; city: string; institutionName?: string }): Promise<User> {
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
    this.persistUser();
    this.notify();
    return user;
  }

  public switchRole(role: User['role']) {
    if (this.currentUser) {
      this.currentUser.role = role;
      this.persistUser();
      this.notify();
    }
  }

  public logout() {
    this.currentUser = null;
    this.persistUser();
    this.notify();
  }
}

export const authService = new AuthService();

import { create } from 'zustand';
import { authApi, type SessionUser } from '@/lib/auth-api';

interface AuthState {
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    initials: string;
    cedula: string;
  } | null;
  token: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'primecore_auth_token';

const mapUser = (input?: SessionUser | null) => {
  if (!input) return null;
  const first = input.name?.first || '';
  const last = input.name?.last || '';
  const fullName = `${first} ${last}`.trim() || input.email;
  const initials = `${first[0] || ''}${last[0] || ''}`.toUpperCase() || input.email.slice(0, 2).toUpperCase();

  return {
    id: input.id,
    name: fullName,
    email: input.email,
    phone: '',
    avatar: '',
    initials,
    cedula: '',
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  isBootstrapping: false,
  isAuthenticated: false,
  user: null,
  token: null,
  bootstrap: async () => {
    set({ isBootstrapping: true });
    const token = window.localStorage.getItem(TOKEN_KEY);

    try {
      const session = await authApi.session(token || undefined);
      const nextToken = token || null;
      if (nextToken) {
        window.localStorage.setItem(TOKEN_KEY, nextToken);
      }

      set({
        isAuthenticated: Boolean(session.active ?? true),
        user: mapUser(session.user),
        token: nextToken,
      });
    } catch (error) {
      window.localStorage.removeItem(TOKEN_KEY);
      set({ isAuthenticated: false, user: null, token: null });
    } finally {
      set({ isBootstrapping: false });
    }
  },
  login: async (email: string, password: string) => {
    const payload = await authApi.login(email, password);
    const token = payload.token || null;

    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    set({
      isAuthenticated: true,
      user: mapUser(payload.user),
      token,
    });
  },
  logout: async () => {
    const token = window.localStorage.getItem(TOKEN_KEY) || undefined;
    try {
      await authApi.logout(token);
    } catch (error) {
      // No-op: force local logout even when backend fails.
    }

    window.localStorage.removeItem(TOKEN_KEY);
    set({ isAuthenticated: false, user: null, token: null });
  },
}));

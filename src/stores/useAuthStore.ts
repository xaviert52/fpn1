import { create } from 'zustand';

interface AuthState {
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
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: () =>
    set({
      isAuthenticated: true,
      user: {
        id: 'usr-001',
        name: 'Gerald Moreno',
        email: 'gerald.moreno@correo.com',
        phone: '+593 99 876 5432',
        avatar: '',
        initials: 'GM',
        cedula: '1712345678',
      },
    }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));

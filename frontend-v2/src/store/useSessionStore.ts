/**
 * NLIP — Session store (Zustand)
 * Keeps authenticated user + in-memory access token.
 * Role-based nav and consent portal derive their view from `user.role`.
 */

import { create } from 'zustand';
import { setAccessToken, clearAccessToken } from '@/lib/auth';
import type { User } from '@/types';

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  /** Call after a successful login/register/refresh */
  login: (user: User, accessToken: string) => void;
  /** Clears in-memory token and resets store */
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,

  login(user, accessToken) {
    setAccessToken(accessToken);
    set({ user, isAuthenticated: true });
  },

  logout() {
    clearAccessToken();
    set({ user: null, isAuthenticated: false });
  },
}));

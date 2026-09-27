import { create } from "zustand";
import type { AuthTokens, User } from "../types/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (auth: AuthTokens) => void;
  setAccessToken: (accessToken: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  setAuth: ({ accessToken, refreshToken, user }) =>
    set({ accessToken, refreshToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  logout: () => set({ accessToken: null, refreshToken: null, user: null }),
}));

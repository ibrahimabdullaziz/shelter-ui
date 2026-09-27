import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthTokens } from "../types/api";

export type AuthStatus =
  | "initializing"
  | "authenticated"
  | "unauthenticated"
  | "error";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  authStatus: AuthStatus;
  setAuth: (auth: AuthTokens) => void;
  setAccessToken: (accessToken: string | null) => void;
  logout: () => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setAuthStatus: (authStatus: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      authStatus: "initializing",
      hasHydrated: false,

      setAuth: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken, authStatus: "initializing" }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          authStatus: "unauthenticated",
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setAuthStatus: (authStatus) => set({ authStatus }),
    }),
    {
      name: "shelter-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ refreshToken: state.refreshToken }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export async function hydrateAuthStore(): Promise<void> {
  try {
    await useAuthStore.persist.rehydrate();
  } finally {
    useAuthStore.getState().setHasHydrated(true);
  }
}

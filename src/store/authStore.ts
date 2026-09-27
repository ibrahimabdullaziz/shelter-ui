import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthTokens } from "../types/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (auth: AuthTokens) => void;
  setAccessToken: (accessToken: string | null) => void;
  logout: () => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,

      setAuth: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ accessToken: null, refreshToken: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
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

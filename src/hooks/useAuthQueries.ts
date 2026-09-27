import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, register, getCurrentUser } from "../api/auth";
import type { LoginPayload, RegisterPayload } from "../types/api";
import { useAuthStore } from "../store/authStore";

export const authQueryKeys = {
  all: ["auth"] as const,
  currentUser: ["auth", "currentUser"] as const,
};

export function useCurrentUserQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: getCurrentUser,
    enabled: hasHydrated && Boolean(accessToken || refreshToken),
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.currentUser,
      });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.currentUser,
      });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      useAuthStore.getState().logout();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });
    },
  });
}

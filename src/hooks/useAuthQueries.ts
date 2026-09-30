import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, register, getCurrentUser } from "../api/auth";
import type { LoginPayload, RegisterPayload } from "../types/api";
import { useAuthStore } from "../store/authStore";
import { clearAuthSession } from "../lib/clearAuthSession";
import { authQueryKeys } from "../queries/authKeys";

export { authQueryKeys } from "../queries/authKeys";

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
    mutationKey: authQueryKeys.login,
    mutationFn: (payload: LoginPayload) => login(payload),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: authQueryKeys.currentUser,
      });
      queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });
    },
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
    mutationKey: authQueryKeys.register,
    mutationFn: (payload: RegisterPayload) => register(payload),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: authQueryKeys.currentUser,
      });
      queryClient.removeQueries({ queryKey: authQueryKeys.currentUser });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.currentUser,
      });
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationKey: authQueryKeys.logout,
    mutationFn: async () => clearAuthSession({ redirect: true }),
  });
}
